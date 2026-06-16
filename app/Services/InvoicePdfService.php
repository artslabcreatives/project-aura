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
        // Clean all string values in $data to prevent UTF-8 characters from breaking FPDF
        $data = array_map(function ($val) {
            return is_string($val) ? $this->cleanPdfString($val) : $val;
        }, $data);

        // Intercept and handle the Gazette Tax Invoice format dynamically to avoid overlaps
        if (str_contains(strtolower($template->name), 'tax vat') || str_contains(strtolower($template->pdf_path), 'tax vat')) {
            return $this->generateDynamicGazettePdf($template, $data);
        }

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
     * Generate the Sri Lankan Gazette Tax Invoice PDF dynamically to avoid overlaps.
     */
    public function generateDynamicGazettePdf(InvoiceTemplate $template, array $data): string
    {
        $pdf = new Fpdi();
        
        $originalPath = $template->absolute_pdf_path;
        $workPath = self::decompressPdfIfNeeded($originalPath);
        
        try {
            // Import the template page to get the Gazette header with Sinhala text
            $pdf->setSourceFile($workPath);
            $templatePage = $pdf->importPage(1);
            $size = $pdf->getTemplateSize($templatePage);

            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($templatePage);
        } finally {
            if ($workPath !== $originalPath && file_exists($workPath)) {
                @unlink($workPath);
            }
        }

        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetDrawColor(0, 0, 0);
        $pdf->SetLineWidth(0.2);

        // Draw a solid white rectangle to cover the entire template page (hiding the Gazette header)
        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect(0, 0, 210, 297, 'F');

        // Draw Artslab logo at top right
        $logoPath = public_path('logo-artslab.png');
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, 150, 12, 45);
        }

        // Center Tax Invoice title box (Shifted up by 10mm, font size 12)
        $pdf->SetXY(80, 34);
        $pdf->SetFont('Helvetica', 'B', 12);
        $pdf->Cell(50, 8, 'Tax Invoice', 1, 0, 'C');

        // Row 1: Date of Invoice & Tax Invoice No (Shifted up by 10mm)
        $pdf->Rect(15, 46, 90, 8);
        $pdf->SetXY(17, 46);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(28, 8, 'Date of Invoice:', 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(60, 8, $data['invoice_date'] ?? '', 0, 0, 'L');

        $pdf->Rect(105, 46, 90, 8);
        $pdf->SetXY(107, 46);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(28, 8, 'Tax Invoice No.:', 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(60, 8, $data['invoice_number'] ?? '', 0, 0, 'L');

        // Row 2: Supplier & Purchaser details (Shifted up by 10mm)
        $pdf->Rect(15, 56, 90, 38);
        $pdf->Rect(105, 56, 90, 38);

        // Supplier details inside box
        $pdf->SetXY(17, 58);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(24, 4, "Supplier's TIN:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(62, 4, $data['supplier_tin'] ?? '', 0, 1, 'L');

        $pdf->SetX(17);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(24, 4, "Supplier's Name:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(62, 4, $data['supplier_name'] ?? '', 0, 1, 'L');

        $pdf->SetX(17);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(15, 4, "Address:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $addrY = $pdf->GetY();
        $pdf->SetXY(32, $addrY);
        $pdf->MultiCell(71, 4, $data['supplier_address'] ?? '', 0, 'L');

        $pdf->SetXY(17, 88);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(24, 4, "Telephone No:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(62, 4, $data['supplier_phone'] ?? '', 0, 1, 'L');

        // Purchaser details inside box
        $pdf->SetXY(107, 58);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(26, 4, "Purchaser's TIN:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(60, 4, $data['purchaser_tin'] ?? '', 0, 1, 'L');

        $pdf->SetX(107);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(26, 4, "Purchaser's Name:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(60, 4, $data['purchaser_name'] ?? '', 0, 1, 'L');

        $pdf->SetX(107);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(15, 4, "Address:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $addrY = $pdf->GetY();
        $pdf->SetXY(122, $addrY);
        $pdf->MultiCell(71, 4, $data['purchaser_address'] ?? '', 0, 'L');

        $pdf->SetXY(107, 88);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(26, 4, "Telephone No:", 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(60, 4, $data['purchaser_phone'] ?? '', 0, 1, 'L');

        // Row 3: Date of Delivery & Place of Supply (Shifted up by 10mm)
        $pdf->Rect(15, 96, 90, 8);
        $pdf->SetXY(17, 96);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(28, 8, 'Date of Delivery:', 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(60, 8, $data['delivery_date'] ?? '', 0, 0, 'L');

        $pdf->Rect(105, 96, 90, 8);
        $pdf->SetXY(107, 96);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(28, 8, 'Place of Supply:', 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(60, 8, $data['place_of_supply'] ?? '', 0, 0, 'L');

        // Row 4: Additional Information if any (Conditional)
        $infoText = trim($data['additional_info'] ?? '');
        if ($infoText !== '') {
            $fullLabel = 'Additional Information if any: ';
            $fullInfoText = $fullLabel . $infoText;
            $pdf->SetFont('Helvetica', '', 8);
            $infoLines = $this->calculateNbLines($pdf, 178, $fullInfoText);
            $infoHeight = max(($infoLines * 4) + 4, 16);

            $pdf->Rect(15, 106, 180, $infoHeight);

            $pdf->SetLeftMargin(17);
            $pdf->SetRightMargin(17);
            $pdf->SetXY(17, 108);

            $pdf->SetFont('Helvetica', 'B', 8);
            $pdf->Write(4, $fullLabel);
            $pdf->SetFont('Helvetica', '', 8);
            $pdf->Write(4, $infoText);

            $pdf->SetLeftMargin(10);
            $pdf->SetRightMargin(10);

            // Table Start Y
            $tableY = 106 + $infoHeight + 2; // Dynamic offset + 2mm gap
        } else {
            // Table Start Y if no Additional Information
            $tableY = 106;
        }
        $pdf->SetXY(15, $tableY);

        // Draw header boxes
        $pdf->Rect(15, $tableY, 20, 12);
        $pdf->Rect(35, $tableY, 90, 12);
        $pdf->Rect(125, $tableY, 20, 12);
        $pdf->Rect(145, $tableY, 20, 12);
        $pdf->Rect(165, $tableY, 30, 12);

        // Header Text
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->SetXY(15, $tableY + 4);
        $pdf->Cell(20, 4, 'Reference', 0, 0, 'C');
        $pdf->SetXY(35, $tableY + 4);
        $pdf->Cell(90, 4, 'Description of Goods or Services', 0, 0, 'C');
        $pdf->SetXY(125, $tableY + 4);
        $pdf->Cell(20, 4, 'Quantity', 0, 0, 'C');
        $pdf->SetXY(145, $tableY + 4);
        $pdf->Cell(20, 4, 'Unit Price', 0, 0, 'C');
        $pdf->SetXY(165, $tableY + 1);
        $pdf->MultiCell(30, 3.3, "Amount\nExcluding VAT\n(Rs.)", 0, 'C');

        // Loop over line items
        $currentY = $tableY + 12;
        $pdf->SetFont('Helvetica', '', 8);

        $lineHeight = 4.5;
        $minRowHeight = 8;
        $pageLimitY = 250; // Page break threshold

        // Build list of items (ensure at least 5 rows exist)
        $items = [];
        for ($i = 1; $i <= 5; $i++) {
            $ref = $data["item_{$i}_ref"] ?? '';
            $desc = $data["item_{$i}_description"] ?? '';
            $qty = $data["item_{$i}_quantity"] ?? '';
            $price = $data["item_{$i}_unit_price"] ?? '';
            $amount = $data["item_{$i}_amount"] ?? '';

            $items[] = [
                'ref' => $ref,
                'desc' => $desc,
                'qty' => $qty,
                'price' => $price,
                'amount' => $amount
            ];
        }

        foreach ($items as $item) {
            $isEmpty = empty($item['ref']) && empty($item['desc']) && empty($item['qty']) && empty($item['price']) && empty($item['amount']);

            if ($isEmpty) {
                continue; // Skip empty rows completely
            }

            // Calculate lines of description
            $nbLines = $this->calculateNbLines($pdf, 88, $item['desc']);
            $rowHeight = max(($nbLines * $lineHeight) + 4, $minRowHeight);

            // Check page break
            if ($currentY + $rowHeight > $pageLimitY) {
                // Add page break
                $pdf->AddPage('P', 'A4');
                $currentY = 20;

                // Redraw table headers on new page
                $pdf->Rect(15, $currentY, 20, 12);
                $pdf->Rect(35, $currentY, 90, 12);
                $pdf->Rect(125, $currentY, 20, 12);
                $pdf->Rect(145, $currentY, 20, 12);
                $pdf->Rect(165, $currentY, 30, 12);

                $pdf->SetFont('Helvetica', 'B', 8);
                $pdf->SetXY(15, $currentY + 4);
                $pdf->Cell(20, 4, 'Reference', 0, 0, 'C');
                $pdf->SetXY(35, $currentY + 4);
                $pdf->Cell(90, 4, 'Description of Goods or Services', 0, 0, 'C');
                $pdf->SetXY(125, $currentY + 4);
                $pdf->Cell(20, 4, 'Quantity', 0, 0, 'C');
                $pdf->SetXY(145, $currentY + 4);
                $pdf->Cell(20, 4, 'Unit Price', 0, 0, 'C');
                $pdf->SetXY(165, $currentY + 1);
                $pdf->MultiCell(30, 3.3, "Amount\nExcluding VAT\n(Rs.)", 0, 'C');

                $currentY += 12;
                $pdf->SetFont('Helvetica', '', 8);
            }

            // Draw row borders
            $pdf->Rect(15, $currentY, 20, $rowHeight);
            $pdf->Rect(35, $currentY, 90, $rowHeight);
            $pdf->Rect(125, $currentY, 20, $rowHeight);
            $pdf->Rect(145, $currentY, 20, $rowHeight);
            $pdf->Rect(165, $currentY, 30, $rowHeight);

            // Draw content
            if (!$isEmpty) {
                // Reference (centered)
                $pdf->SetXY(15, $currentY + ($rowHeight - 4) / 2);
                $pdf->Cell(20, 4, $item['ref'], 0, 0, 'C');

                // Description (left-aligned, multi-line)
                $pdf->SetXY(36, $currentY + 2);
                $pdf->MultiCell(88, $lineHeight, $item['desc'], 0, 'L');

                // Quantity (centered)
                $pdf->SetXY(125, $currentY + ($rowHeight - 4) / 2);
                $pdf->Cell(20, 4, $item['qty'], 0, 0, 'C');

                // Unit Price (right-aligned)
                $pdf->SetXY(145, $currentY + ($rowHeight - 4) / 2);
                $pdf->Cell(18, 4, $item['price'], 0, 0, 'R');

                // Amount (right-aligned)
                $pdf->SetXY(165, $currentY + ($rowHeight - 4) / 2);
                $pdf->Cell(28, 4, $item['amount'], 0, 0, 'R');
            }

            $currentY += $rowHeight;
        }

        // Always force 18% VAT calculation for Gazette invoice format
        $subtotalStr = $data['subtotal'] ?? '0.00';
        $subtotalVal = (float) str_replace(',', '', $subtotalStr);
        $vatVal = $subtotalVal * 0.18;
        $totalVal = $subtotalVal + $vatVal;

        $vatRateText = '18%';
        $vatAmountText = number_format($vatVal, 2);
        $totalWithVatText = number_format($totalVal, 2);
        $totalInWordsText = $this->numberToWords($totalVal);

        // Totals Rows (Subtotal, VAT, Grand Total)
        $pdf->SetFont('Helvetica', 'B', 8);

        // Total Value of Supply
        $pdf->Rect(15, $currentY, 150, 8);
        $pdf->SetXY(17, $currentY);
        $pdf->Cell(148, 8, 'Total Value of Supply:', 0, 0, 'L');

        $pdf->Rect(165, $currentY, 30, 8);
        $pdf->SetXY(165, $currentY);
        $pdf->Cell(28, 8, $subtotalStr, 0, 0, 'R');

        $currentY += 8;

        // VAT Amount
        $pdf->Rect(15, $currentY, 150, 8);
        $pdf->SetXY(17, $currentY);
        $pdf->Cell(148, 8, "VAT Amount (Total Value of Supply @ {$vatRateText}):", 0, 0, 'L');

        $pdf->Rect(165, $currentY, 30, 8);
        $pdf->SetXY(165, $currentY);
        $pdf->Cell(28, 8, $vatAmountText, 0, 0, 'R');

        $currentY += 8;

        // Total Amount including VAT
        $pdf->Rect(15, $currentY, 150, 8);
        $pdf->SetXY(17, $currentY);
        $pdf->Cell(148, 8, 'Total Amount including VAT:', 0, 0, 'L');

        $pdf->Rect(165, $currentY, 30, 8);
        $pdf->SetXY(165, $currentY);
        $pdf->Cell(28, 8, $totalWithVatText, 0, 0, 'R');

        $currentY += 8;

        // Bottom Boxes: Word Amount & Payment Mode
        $currentY += 4; // 4mm space

        // Total Amount in words
        $pdf->Rect(15, $currentY, 180, 8);
        $pdf->SetXY(17, $currentY);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(32, 8, 'Total Amount in words:', 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(144, 8, $totalInWordsText, 0, 0, 'L');

        $currentY += 8;

        // Mode of Payment
        $pdf->Rect(15, $currentY, 180, 8);
        $pdf->SetXY(17, $currentY);
        $pdf->SetFont('Helvetica', 'B', 8);
        $pdf->Cell(28, 8, 'Mode of Payment:', 0, 0, 'L');
        $pdf->SetFont('Helvetica', '', 8);
        $pdf->Cell(148, 8, $data['payment_mode'] ?? '', 0, 0, 'L');

        $currentY += 8;

        // Calculate due date (delivery date + 15 working days)
        $dueDateText = '';
        $deliveryDateStr = $data['delivery_date'] ?? '';
        $deliveryDate = null;
        if (!empty($deliveryDateStr)) {
            try {
                // Try to parse 'm/d/Y' format first
                $deliveryDate = \Carbon\Carbon::createFromFormat('m/d/Y', $deliveryDateStr);
            } catch (\Exception $e) {
                try {
                    $deliveryDate = \Carbon\Carbon::parse($deliveryDateStr);
                } catch (\Exception $ex) {
                    $deliveryDate = null;
                }
            }
        }

        if (!$deliveryDate && !empty($data['invoice_date'])) {
            try {
                $deliveryDate = \Carbon\Carbon::createFromFormat('m/d/Y', $data['invoice_date']);
            } catch (\Exception $e) {
                try {
                    $deliveryDate = \Carbon\Carbon::parse($data['invoice_date']);
                } catch (\Exception $ex) {
                    $deliveryDate = null;
                }
            }
        }

        if (!$deliveryDate) {
            $deliveryDate = \Carbon\Carbon::now();
        }

        // Add 15 weekdays (working/business days)
        $dueDate = $deliveryDate->copy()->addWeekdays(15);
        $dueDateText = $dueDate->format('d M Y');

        $blockHeight = 55;
        if ($currentY + $blockHeight > 280) {
            $pdf->AddPage('P', 'A4');
            $currentY = 20;
        } else {
            $currentY += 10;
        }

        // Paragraph 1: Due Date & settlement terms
        $pdf->SetXY(15, $currentY);
        $pdf->SetFont('Helvetica', 'B', 10);
        $pdf->Cell(180, 5, 'Due Date: ' . $dueDateText, 0, 1, 'L');
        $pdf->SetX(15);
        $pdf->SetFont('Helvetica', '', 8.5);
        $pdf->Cell(180, 4, 'Payments need to be settled within 15 business days from the invoice date.', 0, 1, 'L');

        $currentY = $pdf->GetY() + 4;

        // Paragraph 2: Bank Details
        $pdf->SetXY(15, $currentY);
        $pdf->SetFont('Helvetica', '', 8.5);
        $pdf->Cell(180, 4, 'White Star Web Solutions (Pvt) Ltd', 0, 1, 'L');
        $pdf->SetX(15);
        $pdf->Cell(180, 4, '103414008857', 0, 1, 'L');
        $pdf->SetX(15);
        $pdf->Cell(180, 4, 'Sampath Bank', 0, 1, 'L');
        $pdf->SetX(15);
        $pdf->Cell(180, 4, 'Thimbirigasyaya Branch', 0, 1, 'L');
        $pdf->SetX(15);
        $pdf->Cell(180, 4, 'SWIFT Code : BSAMLKLX', 0, 1, 'L');

        $currentY = $pdf->GetY() + 4;

        // Paragraph 3: Cheques
        $pdf->SetXY(15, $currentY);
        $pdf->Cell(180, 4, 'All cheques to be drawn in favour of White Star Web Solutions (Pvt) Ltd.', 0, 1, 'L');

        $currentY = $pdf->GetY() + 4;

        // Paragraph 4: Invoice ref in description
        $pdf->SetXY(15, $currentY);
        $pdf->Cell(180, 4, "Please use your invoice number in the transaction description so we can see when you've paid.", 0, 1, 'L');

        $currentY = $pdf->GetY() + 4;

        // Paragraph 5: Computer generated warning
        $pdf->SetXY(15, $currentY);
        $pdf->Cell(180, 4, 'This document is computer generated. No signature is required.', 0, 1, 'L');

        return $pdf->Output('S');
    }

    /**
     * Compute number of wrapped lines for a given text.
     */
    private function calculateNbLines($pdf, float $w, string $txt): int
    {
        $txt = str_replace("\r\n", "\n", $txt);
        $txt = str_replace("\r", "\n", $txt);
        $cMargin = isset($pdf->cMargin) ? $pdf->cMargin : 1.0;
        $wmax = $w - 2 * $cMargin; // Subtract cell margins on both sides
        $lines = 0;
        $paragraphs = explode("\n", $txt);
        foreach ($paragraphs as $para) {
            if ($para === '') {
                $lines++;
                continue;
            }
            $words = explode(' ', $para);
            $currentLine = '';
            foreach ($words as $word) {
                $testLine = $currentLine === '' ? $word : $currentLine . ' ' . $word;
                if ($pdf->GetStringWidth($testLine) > $wmax) {
                    $lines++;
                    $currentLine = $word;
                } else {
                    $currentLine = $testLine;
                }
            }
            if ($currentLine !== '') {
                $lines++;
            }
        }
        return max($lines, 1);
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
            'invoice_date'   => $this->formatXeroDate($xeroInvoice['DateString'] ?? $xeroInvoice['Date'] ?? null),
            'invoice_number' => $this->formatInvoiceSerialNumber(
                $xeroInvoice['InvoiceNumber'] ?? '',
                $xeroInvoice['DateString'] ?? $xeroInvoice['Date'] ?? null
            ),

            // Supplier (from system settings)
            'supplier_tin'     => SystemSetting::get('company_tin', '103262879'),
            'supplier_name'    => SystemSetting::get('company_name', 'WHITE STAR WEB SOLUTIONS PVT LTD'),
            'supplier_address' => SystemSetting::get('company_address', '110-3/1, Havelock Road, Colombo 05'),
            'supplier_phone'   => SystemSetting::get('company_phone', '0776273901'),

            // Purchaser (from Xero Contact)
            'purchaser_tin'     => $contact['TaxNumber'] ?? '',
            'purchaser_name'    => $contact['Name'] ?? '',
            'purchaser_address' => $this->formatXeroAddress($contact['Addresses'] ?? []),
            'purchaser_phone'   => $this->formatXeroPhone($contact['Phones'] ?? []),

            // Details
            'delivery_date'   => !empty($overrides['delivery_date']) ? $overrides['delivery_date'] : $this->formatXeroDate($xeroInvoice['DateString'] ?? null),
            'place_of_supply' => $overrides['place_of_supply'] ?? '110-3/1, Havelock Road, Colombo 05',
            'additional_info' => $overrides['additional_info'] ?? ($xeroInvoice['Reference'] ?? ''),

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

                $desc = $item['Description'] ?? '';
                $origTotal = $qty * $price;
                if ($origTotal > 0 && $lineAmt < $origTotal) {
                    $pct = round((1 - ($lineAmt / $origTotal)) * 100);
                    $desc .= " ({$pct}% discount)";
                }

                $data["item_{$n}_ref"]         = (string) $n;
                $data["item_{$n}_description"] = $desc;
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
            'invoice_date'   => $invoice->issued_at?->format('m/d/Y') ?? '',
            'invoice_number' => $this->formatInvoiceSerialNumber(
                $invoice->invoice_number ?? '',
                $invoice->issued_at?->toDateString()
            ),

            'supplier_tin'     => SystemSetting::get('company_tin', '103262879'),
            'supplier_name'    => SystemSetting::get('company_name', 'WHITE STAR WEB SOLUTIONS PVT LTD'),
            'supplier_address' => SystemSetting::get('company_address', '110-3/1, Havelock Road, Colombo 05'),
            'supplier_phone'   => SystemSetting::get('company_phone', '0776273901'),

            'purchaser_tin'     => $overrides['purchaser_tin'] ?? '',
            'purchaser_name'    => $client?->company_name ?? '',
            'purchaser_address' => $client?->address ?? '',
            'purchaser_phone'   => $client?->phone ?? '',

            'delivery_date'   => !empty($overrides['delivery_date']) ? $overrides['delivery_date'] : ($invoice->issued_at?->format('m/d/Y') ?? ''),
            'place_of_supply' => $overrides['place_of_supply'] ?? '110-3/1, Havelock Road, Colombo 05',
            'additional_info' => $overrides['additional_info'] ?? ($invoice->description ?? ''),

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
            'invoice_date'   => $estimate->issue_date?->format('m/d/Y') ?? now()->format('m/d/Y'),
            'invoice_number' => $this->formatInvoiceSerialNumber(
                $estimate->estimate_number ?? '',
                $estimate->issue_date?->toDateString()
            ),

            // Supplier (from system settings)
            'supplier_tin'     => SystemSetting::get('company_tin', '103262879'),
            'supplier_name'    => SystemSetting::get('company_name', 'WHITE STAR WEB SOLUTIONS PVT LTD'),
            'supplier_address' => SystemSetting::get('company_address', '110-3/1, Havelock Road, Colombo 05'),
            'supplier_phone'   => SystemSetting::get('company_phone', '0776273901'),

            // Purchaser (from Client model)
            'purchaser_tin'     => $overrides['purchaser_tin'] ?? '',
            'purchaser_name'    => $client?->company_name ?? '',
            'purchaser_address' => $client?->address ?? '',
            'purchaser_phone'   => $client?->phone ?? '',

            // Details
            'delivery_date'   => !empty($overrides['delivery_date']) ? $overrides['delivery_date'] : ($estimate->issue_date?->format('m/d/Y') ?? now()->format('m/d/Y')),
            'place_of_supply' => $overrides['place_of_supply'] ?? '110-3/1, Havelock Road, Colombo 05',
            'additional_info' => $overrides['additional_info'] ?? ($estimate->reference ?? ''),

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

                $desc = $item->description ?? '';
                $origTotal = $qty * $price;
                if ($origTotal > 0 && $lineAmt < $origTotal) {
                    $pct = round((1 - ($lineAmt / $origTotal)) * 100);
                    $desc .= " ({$pct}% discount)";
                }

                $data["item_{$n}_ref"]         = (string) $n;
                $data["item_{$n}_description"] = $desc;
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
            return \Carbon\Carbon::parse($dateString)->format('m/d/Y');
        } catch (\Throwable) {
            return $dateString;
        }
    }

    /**
     * Format the Invoice Serial Number to YYMMM_QQQQ_XXXXX format.
     */
    public function formatInvoiceSerialNumber(?string $rawNumber, ?string $dateStr): string
    {
        if (empty($rawNumber)) {
            return '';
        }

        // If it is already in the target format (e.g. 26MAY_MAIN_01769), return it as is
        if (preg_match('/^\d{2}[A-Z]{3}_[A-Z0-9]{4}_\d{5}$/', $rawNumber)) {
            return $rawNumber;
        }

        // Extract the numeric part
        preg_match('/\d+/', $rawNumber, $matches);
        $numPart = $matches[0] ?? '00000';
        $paddedNum = str_pad($numPart, 5, '0', STR_PAD_LEFT);

        // Get the date
        $date = null;
        if ($dateStr) {
            try {
                $date = \Carbon\Carbon::parse($dateStr);
            } catch (\Throwable) {
                // Ignore parsing errors
            }
        }
        if (!$date) {
            $date = now();
        }

        $yy = $date->format('y');
        $mmm = strtoupper($date->format('M'));
        $qqqq = 'MAIN';

        return "{$yy}{$mmm}_{$qqqq}_{$paddedNum}";
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
        if ($number < 1000000) {
            return $this->convertWholeNumber((int) ($number / 1000), $ones, $tens) . ' Thousand' .
                ($number % 1000 ? ' ' . $this->convertWholeNumber($number % 1000, $ones, $tens) : '');
        }
        if ($number < 1000000000) {
            return $this->convertWholeNumber((int) ($number / 1000000), $ones, $tens) . ' Million' .
                ($number % 1000000 ? ' ' . $this->convertWholeNumber($number % 1000000, $ones, $tens) : '');
        }
        if ($number < 1000000000000) {
            return $this->convertWholeNumber((int) ($number / 1000000000), $ones, $tens) . ' Billion' .
                ($number % 1000000000 ? ' ' . $this->convertWholeNumber($number % 1000000000, $ones, $tens) : '');
        }

        return (string) $number;
    }

    /**
     * Clean and convert a UTF-8 string to Windows-1252 for FPDF compatibility.
     */
    private function cleanPdfString(?string $str): string
    {
        if ($str === null || $str === '') {
            return '';
        }

        // Map common UTF-8 punctuation to ASCII equivalents
        $replacements = [
            "\xE2\x80\x93" => '-',     // en-dash (UTF-8)
            "\xE2\x80\x94" => '-',     // em-dash (UTF-8)
            "\xE2\x80\x98" => "'",     // smart left single quote (UTF-8)
            "\xE2\x80\x99" => "'",     // smart right single quote (UTF-8)
            "\xE2\x80\x9C" => '"',     // smart left double quote (UTF-8)
            "\xE2\x80\x9D" => '"',     // smart right double quote (UTF-8)
            "\xE2\x80\xA2" => '*',     // bullet point (UTF-8)
            "\xC2\xA0"     => ' ',     // non-breaking space (UTF-8)
        ];

        $str = str_replace(array_keys($replacements), array_values($replacements), $str);

        // Convert the rest from UTF-8 to Windows-1252 (transliterating or ignoring unsupported chars)
        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'windows-1252//TRANSLIT//IGNORE', $str);
            if ($converted !== false) {
                return $converted;
            }
        }

        return mb_convert_encoding($str, 'Windows-1252', 'UTF-8');
    }
}
