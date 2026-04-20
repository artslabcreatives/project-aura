<?php

/**
 * Direct test of SearchEstimatesTool
 */

require __dir__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Mcp\Tools\SearchEstimatesTool;
use Laravel\Mcp\Request;

echo "=== Testing SearchEstimatesTool ===" . PHP_EOL . PHP_EOL;

try {
    $tool = new SearchEstimatesTool();
    echo "✓ Tool instantiated" . PHP_EOL;
    echo "  Name: {$tool->name()}" . PHP_EOL;
    echo "  Description: {$tool->description()}" . PHP_EOL . PHP_EOL;
    
    // Create a mock request
    echo "Testing with search query 'Test'..." . PHP_EOL;
    
    // Create request with proper arguments array
    $params = [
        'search_query' => 'Test',
        'search_by' => 'all',
        'has_project' => true,
        'has_amount' => true,
        'limit' => 5,
    ];
    
    $request = new Request($params);
    
    try {
        $response = $tool->handle($request);
        
        $responseText = '';
        foreach ($response->content() as $content) {
            $responseText .= $content->text ?? '';
        }
        
        echo "Raw response: " . substr($responseText, 0, 200) . "..." . PHP_EOL . PHP_EOL;
        
        $result = json_decode($responseText, true);
        
        if ($result && isset($result['success']) && $result['success']) {
            echo "✓ Search successful" . PHP_EOL;
            echo "  Found: {$result['count']} estimate(s)" . PHP_EOL . PHP_EOL;
            
            foreach ($result['results'] as $i => $est) {
                echo "Estimate #" . ($i + 1) . ":" . PHP_EOL;
                echo "  ID: {$est['id']}" . PHP_EOL;
                echo "  Title: {$est['title']}" . PHP_EOL;
                echo "  Amount: \${$est['amount']} {$est['currency']}" . PHP_EOL;
                echo "  Project: " . ($est['project']['name'] ?? 'None') . PHP_EOL;
                echo "  Client: " . ($est['client']['name'] ?? 'None') . PHP_EOL;
                echo "  Has PO: " . ($est['project']['has_po'] ? 'Yes (' . $est['project']['po_number'] . ')' : 'No') . PHP_EOL;
                echo PHP_EOL;
            }
        } else {
            echo "✗ Search failed" . PHP_EOL;
            echo "  Error: " . ($result['error'] ?? 'Unknown error') . PHP_EOL;
            if (isset($result)) {
                echo "  Full response: " . json_encode($result, JSON_PRETTY_PRINT) . PHP_EOL;
            }
        }
    } catch (Exception $handleError) {
        echo "✗ Exception during handle(): " . $handleError->getMessage() . PHP_EOL;
        echo $handleError->getTraceAsString() . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}

echo "=== Test Complete ===" . PHP_EOL;
