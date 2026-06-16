<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\InvoiceTemplate;
use App\Services\InvoicePdfService;
use App\Models\Estimate;

$template = InvoiceTemplate::getDefault();
if (!$template) {
    echo "No default template found.\n";
    exit(1);
}

// Perfectly calibrated coordinates to prevent overlapping label words and align columns
$mappings = [
    // Header
    ['variable' => 'invoice_date', 'x' => 45.0, 'y' => 62.0, 'width' => 60, 'font_size' => 9, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'invoice_number', 'x' => 135.0, 'y' => 62.0, 'width' => 50, 'font_size' => 9, 'alignment' => 'L', 'max_height' => 4],

    // Supplier
    ['variable' => 'supplier_tin', 'x' => 42.0, 'y' => 71.0, 'width' => 65, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'supplier_name', 'x' => 45.0, 'y' => 77.0, 'width' => 62, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'supplier_address', 'x' => 32.0, 'y' => 83.0, 'width' => 75, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'supplier_phone', 'x' => 42.0, 'y' => 101.5, 'width' => 65, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],

    // Purchaser
    ['variable' => 'purchaser_tin', 'x' => 142.0, 'y' => 71.0, 'width' => 62, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'purchaser_name', 'x' => 145.0, 'y' => 77.0, 'width' => 60, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'purchaser_address', 'x' => 132.0, 'y' => 83.0, 'width' => 75, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'purchaser_phone', 'x' => 142.0, 'y' => 101.5, 'width' => 65, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],

    // Details
    ['variable' => 'delivery_date', 'x' => 44.0, 'y' => 114.5, 'width' => 60, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'place_of_supply', 'x' => 142.0, 'y' => 114.5, 'width' => 60, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'additional_info', 'x' => 62.0, 'y' => 127.0, 'width' => 140, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],

    // Line Items (Item 1)
    ['variable' => 'item_1_ref', 'x' => 10.0, 'y' => 156.5, 'width' => 20.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_1_description', 'x' => 32.0, 'y' => 156.5, 'width' => 90.0, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'item_1_quantity', 'x' => 125.0, 'y' => 156.5, 'width' => 13.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_1_unit_price', 'x' => 138.0, 'y' => 156.5, 'width' => 25.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'item_1_amount', 'x' => 165.0, 'y' => 156.5, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],

    // Line Items (Item 2)
    ['variable' => 'item_2_ref', 'x' => 10.0, 'y' => 164.7, 'width' => 20.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_2_description', 'x' => 32.0, 'y' => 164.7, 'width' => 90.0, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'item_2_quantity', 'x' => 125.0, 'y' => 164.7, 'width' => 13.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_2_unit_price', 'x' => 138.0, 'y' => 164.7, 'width' => 25.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'item_2_amount', 'x' => 165.0, 'y' => 164.7, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],

    // Line Items (Item 3)
    ['variable' => 'item_3_ref', 'x' => 10.0, 'y' => 172.9, 'width' => 20.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_3_description', 'x' => 32.0, 'y' => 172.9, 'width' => 90.0, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'item_3_quantity', 'x' => 125.0, 'y' => 172.9, 'width' => 13.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_3_unit_price', 'x' => 138.0, 'y' => 172.9, 'width' => 25.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'item_3_amount', 'x' => 165.0, 'y' => 172.9, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],

    // Line Items (Item 4)
    ['variable' => 'item_4_ref', 'x' => 10.0, 'y' => 181.1, 'width' => 20.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_4_description', 'x' => 32.0, 'y' => 181.1, 'width' => 90.0, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'item_4_quantity', 'x' => 125.0, 'y' => 181.1, 'width' => 13.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_4_unit_price', 'x' => 138.0, 'y' => 181.1, 'width' => 25.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'item_4_amount', 'x' => 165.0, 'y' => 181.1, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],

    // Line Items (Item 5)
    ['variable' => 'item_5_ref', 'x' => 10.0, 'y' => 189.3, 'width' => 20.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_5_description', 'x' => 32.0, 'y' => 189.3, 'width' => 90.0, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'item_5_quantity', 'x' => 125.0, 'y' => 189.3, 'width' => 13.0, 'font_size' => 8, 'alignment' => 'C', 'max_height' => 4],
    ['variable' => 'item_5_unit_price', 'x' => 138.0, 'y' => 189.3, 'width' => 25.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'item_5_amount', 'x' => 165.0, 'y' => 189.3, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],

    // Totals
    ['variable' => 'subtotal', 'x' => 165.0, 'y' => 197.2, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'vat_amount', 'x' => 165.0, 'y' => 205.2, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'total_with_vat', 'x' => 165.0, 'y' => 213.5, 'width' => 30.0, 'font_size' => 8, 'alignment' => 'R', 'max_height' => 4],
    ['variable' => 'total_in_words', 'x' => 55.0, 'y' => 231.0, 'width' => 140.0, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
    ['variable' => 'payment_mode', 'x' => 49.0, 'y' => 239.0, 'width' => 145, 'font_size' => 8, 'alignment' => 'L', 'max_height' => 4],
];

$template->mappings = $mappings;
$template->save();
echo "Mappings updated successfully!\n";

// Generate sample PDF using updated mappings
$estimate = Estimate::first();
if (!$estimate) {
    echo "No estimate found to generate preview.\n";
    exit(1);
}

$pdfService = app(InvoicePdfService::class);
$data = $pdfService->buildDataFromLocalEstimate($estimate);

// Force sample data values to match user screenshot values for easy checking
$data['supplier_tin'] = '123456789-7000';
$data['supplier_name'] = 'Sample Company (Pvt) Ltd';
$data['supplier_address'] = "No. 10, Main Street, Colombo 03";
$data['supplier_phone'] = "+94 11 234 5678";

$data['purchaser_tin'] = '987654321-7000';
$data['purchaser_name'] = 'Sample Client Ltd';
$data['purchaser_address'] = "No. 5, Galle Road, Colombo 04";
$data['purchaser_phone'] = "+94 11 987 6543";

$data['invoice_date'] = '2026-06-15';
$data['invoice_number'] = 'TI-0001';
$data['delivery_date'] = '2026-06-15';
$data['place_of_supply'] = 'Colombo';
// Use long text from user's screenshot to test dynamic height and table shifting
$data['additional_info'] = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to sheets...";

$data['subtotal'] = '300,000.00';
$data['vat_amount'] = '54,000.00';
$data['total_with_vat'] = '354,000.00';

$data['item_1_ref'] = '1';
$data['item_1_description'] = 'Web Design & Development';
$data['item_1_quantity'] = '1';
$data['item_1_unit_price'] = '250,000.00';
$data['item_1_amount'] = '250,000.00';

$data['item_2_ref'] = '2';
$data['item_2_description'] = "SEO Optimization Package - High Quality Keywords Research and Analysis.\n- Off-page Link Building Campaign\n- On-page Content Optimization for 25 target pages\n- Weekly progress reports and monthly strategy consultation calls\n- Integration with Google Search Console & Analytics dashboard";
$data['item_2_quantity'] = '1';
$data['item_2_unit_price'] = '50,000.00';
$data['item_2_amount'] = '50,000.00';

$data['total_in_words'] = 'Three Hundred and Fifty Four Thousand Only';
$data['payment_mode'] = 'Bank Transfer';

$pdfContent = $pdfService->generate($template, $data);
$outputPath = __DIR__ . '/../public/test_invoice.pdf';
file_put_contents($outputPath, $pdfContent);
echo "Preview PDF generated at: {$outputPath}\n";
