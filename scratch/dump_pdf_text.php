<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use setasign\Fpdi\Fpdi;

$filePath = __DIR__ . '/../public/Tax VAT invoice format.pdf';

echo "File size: " . filesize($filePath) . " bytes\n";

// Let's read the first 10000 bytes to see if we can find any plain text
$content = file_get_contents($filePath);
$clean = preg_replace('/[^a-zA-Z0-9\s\p{P}]/u', ' ', $content);
echo "Snippet of PDF text:\n";
echo substr($clean, 0, 2000) . "\n";
