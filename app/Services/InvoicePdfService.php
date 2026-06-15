<?php

namespace App\Services;

use App\Models\InvoiceTemplate;
use App\Models\SystemSetting;
use setasign\Fpdi\Fpdi;

class InvoicePdfService
{
    /**
     * Decompress PDF version 1.5+ using node/pdf-lib or qpdf if available.
     */
    public static function decompressPdfIfNeeded(string $filePath): string
    {
        if (!function_exists('exec')) {
            return $filePath;
        }

        $handle = @fopen($filePath, 'r');
        if (!$handle) {
            return $filePath;
        }
        $header = fread($handle, 1024);
        fclose($handle);

        // If PDF version is 1.4 or lower, FPDI can read it directly
        if (preg_match('/%PDF-1\.[0-4]/', $header)) {
            return $filePath;
        }

        $decryptedPath = $filePath . '.decrypted.pdf';

        // 1. Try node.js conversion with pdf-lib (highly reliable and project-packaged)
        $nodeScript = base_path('scratch/convert_pdf_cli.cjs');
        if (file_exists($nodeScript)) {
            $cmd = "node " . escapeshellarg($nodeScript) . " " . escapeshellarg($filePath) . " " . escapeshellarg($decryptedPath) . " 2>&1";
            $output = [];
            $returnCode = -1;
            @\exec($cmd, $output, $returnCode);
            if ($returnCode === 0 && file_exists($decryptedPath)) {
                return $decryptedPath;
            }
        }

        // 2. Fallback to system qpdf if available
        $hasQpdf = trim(@\shell_exec('which qpdf 2>/dev/null') ?? '');
        if (!empty($hasQpdf)) {
            $cmd = "qpdf --decrypt " . escapeshellarg($filePath) . " " . escapeshellarg($decryptedPath) . " 2>&1";
            $output = [];
            $returnCode = -1;
            @\exec($cmd, $output, $returnCode);
            if ($returnCode === 0 && file_exists($decryptedPath)) {
                return $decryptedPath;
            }
        }

        \Illuminate\Support\Facades\Log::warning("Could not decompress PDF template. FPDI may fail.");
        return $filePath;
    }

    /**
     * Generate a filled PDF from a template and data array.
     *
     * @param  InvoiceTemplate  $template   The template with mappings
     * @param  array            $data       Key-value pairs matching variable names
     * @return string           Raw PDF content
     */
    public function generate(InvoiceTemplate $template, array $data): string
    {
        $pdf = new Fpdi();

        $originalPath = $template->absolute_pdf_path;
        $workPath = self::decompressPdfIfNeeded($originalPath);

        try {
            // Import the template page
            $pdf->setSourceFile($workPath);
            $templatePage = $pdf->importPage(1);
            $size = $pdf->getTemplateSize($templatePage);

            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($templatePage);
        } finally {
            // Clean up temporary decrypted file if it was created
            if ($workPath !== $originalPath && file_exists($workPath)) {
                @unlink($workPath);
            }
        }

        // Set default font
        $pdf->SetTextColor(0, 0, 0);

        // Iterate over mappings and place text
        foreach ($template->mappings ?? [] as $mapping) {
            $variable = $mapping['variable'] ?? '';
            $value    = $data[$variable] ?? '';

            if ($value === '' || $value === null) {
                continue;
            }

            $x         = (float) ($mapping['x'] ?? 0);
            $y         = (float) ($mapping['y'] ?? 0);
            $width     = (float) ($mapping['width'] ?? 60);
            $fontSize  = (int) ($mapping['font_size'] ?? 9);
            $alignment = $mapping['alignment'] ?? 'L';
            $maxHeight = (float) ($mapping['max_height'] ?? 5);

            $pdf->SetFont('Helvetica', '', $fontSize);
            $pdf->SetXY($x, $y);
            $pdf->MultiCell($width, $maxHeight, $value, 0, $alignment);
        }

        return $pdf->Output('S');
    }

    /**
     * Build the data array from Xero invoice details + system settings.
     *
     * @param  array  $xeroInvoice    Full Xero invoice (with Contact + LineItems)
     * @param  array  $overrides      Manual overrides (delivery_date, place_of_supply, etc.)
     * @return array  Key-value pairs for all available template variables
     */
    public function buildDataFromXeroInvoice(array $xeroInvoice, array $overrides = []): array
    {
        $contact   = $xeroInvoice['Contact'] ?? [];
        $lineItems = $xeroInvoice['LineItems'] ?? [];

        $subtotal  = (float) ($xeroInvoice['SubTotal'] ?? 0);
        $taxAmount = (float) ($xeroInvoice['TotalTax'] ?? 0);
        $total     = (float) ($xeroInvoice['Total'] ?? 0);
        $vatRate   = $subtotal > 0 ? round($taxAmount / $subtotal * 100, 0) : 18;

        $data = [
            // Header
            'invoice_date'   => $this->formatXeroDate($xeroInvoice['DateString'] ?? $xeroInvoice['Date'] ?? null),
            'invoice_number' => $xeroInvoice['InvoiceNumber'] ?? '',

            // Supplier (from system settings)
            'supplier_tin'     => SystemSetting::get('company_tin', ''),
            'supplier_name'    => SystemSetting::get('company_name', ''),
            'supplier_address' => SystemSetting::get('company_address', ''),
            'supplier_phone'   => SystemSetting::get('company_phone', ''),

            // Purchaser (from Xero Contact)
            'purchaser_tin'     => $contact['TaxNumber'] ?? '',
            'purchaser_name'    => $contact['Name'] ?? '',
            'purchaser_address' => $this->formatXeroAddress($contact['Addresses'] ?? []),
            'purchaser_phone'   => $this->formatXeroPhone($contact['Phones'] ?? []),

            // Details
            'delivery_date'   => $overrides['delivery_date'] ?? $this->formatXeroDate($xeroInvoice['DateString'] ?? null),
            'place_of_supply' => $overrides['place_of_supply'] ?? '',
            'additional_info' => $overrides['additional_info'] ?? '',

            // Totals
            'subtotal'       => number_format($subtotal, 2),
            'vat_rate'       => $vatRate . '%',
            'vat_amount'     => number_format($taxAmount, 2),
            'total_with_vat' => number_format($total, 2),
            'total_in_words' => $this->numberToWords($total),

            // Footer
            'payment_mode' => $overrides['payment_mode'] ?? '',
        ];

        // Line items (up to 5)
        for ($i = 0; $i < 5; $i++) {
            $n = $i + 1;
            if (isset($lineItems[$i])) {
                $item     = $lineItems[$i];
                $qty      = (float) ($item['Quantity'] ?? 0);
                $price    = (float) ($item['UnitAmount'] ?? 0);
                $lineAmt  = (float) ($item['LineAmount'] ?? ($qty * $price));

                $data["item_{$n}_ref"]         = (string) $n;
                $data["item_{$n}_description"] = $item['Description'] ?? '';
                $data["item_{$n}_quantity"]    = number_format($qty, 0);
                $data["item_{$n}_unit_price"]  = number_format($price, 2);
                $data["item_{$n}_amount"]      = number_format($lineAmt, 2);
            } else {
                $data["item_{$n}_ref"]         = '';
                $data["item_{$n}_description"] = '';
                $data["item_{$n}_quantity"]    = '';
                $data["item_{$n}_unit_price"]  = '';
                $data["item_{$n}_amount"]      = '';
            }
        }

        return $data;
    }

    /**
     * Build data array from a local Invoice model (for invoices not from Xero).
     */
    public function buildDataFromLocalInvoice(\App\Models\Invoice $invoice, array $overrides = []): array
    {
        $client = $invoice->client;

        return [
            'invoice_date'   => $invoice->issued_at?->format('Y-m-d') ?? '',
            'invoice_number' => $invoice->invoice_number ?? '',

            'supplier_tin'     => SystemSetting::get('company_tin', ''),
            'supplier_name'    => SystemSetting::get('company_name', ''),
            'supplier_address' => SystemSetting::get('company_address', ''),
            'supplier_phone'   => SystemSetting::get('company_phone', ''),

            'purchaser_tin'     => $overrides['purchaser_tin'] ?? '',
            'purchaser_name'    => $client?->company_name ?? '',
            'purchaser_address' => $client?->address ?? '',
            'purchaser_phone'   => $client?->phone ?? '',

            'delivery_date'   => $overrides['delivery_date'] ?? '',
            'place_of_supply' => $overrides['place_of_supply'] ?? '',
            'additional_info' => $overrides['additional_info'] ?? '',

            'subtotal'       => number_format((float) $invoice->amount, 2),
            'vat_rate'       => ($overrides['vat_rate'] ?? '18') . '%',
            'vat_amount'     => $overrides['vat_amount'] ?? '',
            'total_with_vat' => $overrides['total_with_vat'] ?? number_format((float) $invoice->amount, 2),
            'total_in_words' => $this->numberToWords((float) $invoice->amount),

            'payment_mode' => $overrides['payment_mode'] ?? '',
        ];
    }

    /**
     * Build data array from a local Estimate model.
     */
    public function buildDataFromLocalEstimate(\App\Models\Estimate $estimate, array $overrides = []): array
    {
        $client = $estimate->client;
        $items = $estimate->items()->get();

        $subtotal  = (float) ($estimate->subtotal ?? 0);
        $taxAmount = (float) ($estimate->tax_amount ?? 0);
        $total     = (float) ($estimate->total ?? 0);
        $vatRate   = $estimate->tax_rate ?? 0;

        $data = [
            // Header
            'invoice_date'   => $estimate->issue_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
            'invoice_number' => $estimate->estimate_number ?? '',

            // Supplier (from system settings)
            'supplier_tin'     => SystemSetting::get('company_tin', ''),
            'supplier_name'    => SystemSetting::get('company_name', ''),
            'supplier_address' => SystemSetting::get('company_address', ''),
            'supplier_phone'   => SystemSetting::get('company_phone', ''),

            // Purchaser (from Client model)
            'purchaser_tin'     => $overrides['purchaser_tin'] ?? '',
            'purchaser_name'    => $client?->company_name ?? '',
            'purchaser_address' => $client?->address ?? '',
            'purchaser_phone'   => $client?->phone ?? '',

            // Details
            'delivery_date'   => $overrides['delivery_date'] ?? ($estimate->valid_until?->format('Y-m-d') ?? ''),
            'place_of_supply' => $overrides['place_of_supply'] ?? '',
            'additional_info' => $overrides['additional_info'] ?? '',

            // Totals
            'subtotal'       => number_format($subtotal, 2),
            'vat_rate'       => $vatRate . '%',
            'vat_amount'     => number_format($taxAmount, 2),
            'total_with_vat' => number_format($total, 2),
            'total_in_words' => $this->numberToWords($total),

            // Footer
            'payment_mode' => $overrides['payment_mode'] ?? '',
        ];

        // Line items (up to 5)
        for ($i = 0; $i < 5; $i++) {
            $n = $i + 1;
            if (isset($items[$i])) {
                $item     = $items[$i];
                $qty      = (float) ($item->quantity ?? 0);
                $price    = (float) ($item->unit_price ?? 0);
                $lineAmt  = (float) ($item->total ?? ($qty * $price));

                $data["item_{$n}_ref"]         = (string) $n;
                $data["item_{$n}_description"] = $item->description ?? '';
                $data["item_{$n}_quantity"]    = number_format($qty, 0);
                $data["item_{$n}_unit_price"]  = number_format($price, 2);
                $data["item_{$n}_amount"]      = number_format($lineAmt, 2);
            } else {
                $data["item_{$n}_ref"]         = '';
                $data["item_{$n}_description"] = '';
                $data["item_{$n}_quantity"]    = '';
                $data["item_{$n}_unit_price"]  = '';
                $data["item_{$n}_amount"]      = '';
            }
        }

        return $data;
    }

    /**
     * Format a Xero date string into Y-m-d.
     */
    private function formatXeroDate(?string $dateString): string
    {
        if (!$dateString) {
            return '';
        }
        try {
            return \Carbon\Carbon::parse($dateString)->format('Y-m-d');
        } catch (\Throwable) {
            return $dateString;
        }
    }

    /**
     * Extract the best address from a Xero Addresses array.
     */
    private function formatXeroAddress(array $addresses): string
    {
        // Prefer STREET type, fallback to POBOX or first
        $address = collect($addresses)->firstWhere('AddressType', 'STREET')
            ?? collect($addresses)->firstWhere('AddressType', 'POBOX')
            ?? ($addresses[0] ?? []);

        $parts = array_filter([
            $address['AddressLine1'] ?? '',
            $address['AddressLine2'] ?? '',
            $address['City'] ?? '',
            $address['Region'] ?? '',
            $address['PostalCode'] ?? '',
            $address['Country'] ?? '',
        ]);

        return implode(', ', $parts);
    }

    /**
     * Extract phone number from Xero Phones array.
     */
    private function formatXeroPhone(array $phones): string
    {
        $phone = collect($phones)->firstWhere('PhoneType', 'DEFAULT')
            ?? ($phones[0] ?? []);

        $parts = array_filter([
            $phone['PhoneCountryCode'] ?? '',
            $phone['PhoneAreaCode'] ?? '',
            $phone['PhoneNumber'] ?? '',
        ]);

        return implode(' ', $parts);
    }

    /**
     * Convert a number to words (simple implementation).
     */
    private function numberToWords(float $number): string
    {
        $ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen',
        ];
        $tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if ($number == 0) {
            return 'Zero';
        }

        $whole    = (int) floor($number);
        $fraction = round(($number - $whole) * 100);

        $result = $this->convertWholeNumber($whole, $ones, $tens);

        if ($fraction > 0) {
            $result .= ' and ' . $this->convertWholeNumber((int) $fraction, $ones, $tens) . ' Cents';
        }

        return trim($result) . ' Only';
    }

    private function convertWholeNumber(int $number, array $ones, array $tens): string
    {
        if ($number == 0) {
            return '';
        }
        if ($number < 20) {
            return $ones[$number];
        }
        if ($number < 100) {
            return $tens[(int) ($number / 10)] . ($number % 10 ? ' ' . $ones[$number % 10] : '');
        }
        if ($number < 1000) {
            return $ones[(int) ($number / 100)] . ' Hundred' .
                ($number % 100 ? ' and ' . $this->convertWholeNumber($number % 100, $ones, $tens) : '');
        }
        if ($number < 100000) {
            return $this->convertWholeNumber((int) ($number / 1000), $ones, $tens) . ' Thousand' .
                ($number % 1000 ? ' ' . $this->convertWholeNumber($number % 1000, $ones, $tens) : '');
        }
        if ($number < 10000000) {
            return $this->convertWholeNumber((int) ($number / 100000), $ones, $tens) . ' Lakh' .
                ($number % 100000 ? ' ' . $this->convertWholeNumber($number % 100000, $ones, $tens) : '');
        }
        if ($number < 1000000000) {
            return $this->convertWholeNumber((int) ($number / 10000000), $ones, $tens) . ' Crore' .
                ($number % 10000000 ? ' ' . $this->convertWholeNumber($number % 10000000, $ones, $tens) : '');
        }

        return (string) $number;
    }
}
