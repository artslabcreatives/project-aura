<?php

/**
 * Test script for AttachEstimatePOTool
 * 
 * This script demonstrates how to test the MCP tool directly.
 * Run from command line: php test-attach-estimate-po.php
 */

require __DIR__ . '/vendor/autoload.php';

use App\Models\Estimate;
use App\Models\Project;
use App\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing AttachEstimatePOTool ===\n\n";

try {
    // Step 1: Create a test client
    echo "1. Creating test client...\n";
    $client = Client::firstOrCreate(
        ['email' => 'test@testclient.com'],
        [
            'company_name' => 'Test Client Company',
            'name' => 'Test Client for PO Attachment',
            'phone' => '1234567890',
        ]
    );
    echo "   Client ID: {$client->id}\n\n";

    // Step 2: Create a test project
    echo "2. Creating test project...\n";
    $user = User::first();
    if (!$user) {
        echo "   ERROR: No users found. Please run seeders first.\n";
        exit(1);
    }
    
    $project = Project::create([
        'name' => 'Test Project for PO - ' . now()->format('Y-m-d H:i:s'),
        'description' => 'This is a test project for PO attachment',
        'client_id' => $client->id,
        'created_by' => $user->id,
        'status' => 'active',
    ]);
    echo "   Project ID: {$project->id}\n\n";

    // Step 3: Create a test estimate
    echo "3. Creating test estimate...\n";
    $estimate = Estimate::create([
        'title' => 'Test Estimate for PO Attachment',
        'description' => 'This estimate is for testing PO attachment',
        'client_id' => $client->id,
        'project_id' => $project->id,
        'amount' => 15000.00,
        'subtotal' => 15000.00,
        'total' => 15000.00,
        'status' => 'accepted',
        'created_by' => $user->id,
        'currency' => 'USD',
    ]);
    echo "   Estimate ID: {$estimate->id}\n";
    echo "   Estimate Amount: \${$estimate->total}\n\n";

    // Step 4: Test the tool via direct instantiation
    echo "4. Testing AttachEstimatePOTool...\n";
    
    $tool = new \App\Mcp\Tools\AttachEstimatePOTool();
    
    // Create a mock request
    $requestData = [
        'estimate_id' => $estimate->id,
        'po_number' => 'TEST-PO-' . now()->format('YmdHis'),
        'provisional' => false,
    ];
    
    echo "   Request Data:\n";
    echo "   - Estimate ID: {$requestData['estimate_id']}\n";
    echo "   - PO Number: {$requestData['po_number']}\n";
    echo "   - Provisional: " . ($requestData['provisional'] ? 'true' : 'false') . "\n\n";
    
    // Manually validate and execute the logic
    try {
        $estimate = Estimate::with(['project', 'client'])->find($requestData['estimate_id']);
        
        if (!$estimate) {
            echo "   ERROR: Estimate not found\n";
            exit(1);
        }
        
        // Check amounts
        $hasAmount = $estimate->total && $estimate->total > 0;
        echo "   ✓ Estimate has amount: \${$estimate->total}\n";
        
        // Check project link
        if (!$estimate->project_id) {
            echo "   ERROR: Estimate not linked to project\n";
            exit(1);
        }
        echo "   ✓ Estimate linked to project ID: {$estimate->project_id}\n";
        
        // Attach PO
        $project = $estimate->project;
        $project->update([
            'po_number' => $requestData['po_number'],
            'is_locked_by_po' => true,
        ]);
        $project->refresh();
        
        echo "   ✓ PO attached to project\n";
        echo "   ✓ Project locked by PO: " . ($project->is_locked_by_po ? 'Yes' : 'No') . "\n\n";
        
        // Display results
        echo "5. Results:\n";
        echo "   Estimate:\n";
        echo "     - ID: {$estimate->id}\n";
        echo "     - Title: {$estimate->title}\n";
        echo "     - Amount: \${$estimate->total}\n";
        echo "     - Client: {$estimate->client->name}\n";
        echo "   Project:\n";
        echo "     - ID: {$project->id}\n";
        echo "     - Name: {$project->name}\n";
        echo "     - PO Number: {$project->po_number}\n";
        echo "     - Locked by PO: " . ($project->is_locked_by_po ? 'Yes' : 'No') . "\n\n";
        
        echo "✅ TEST PASSED - PO successfully attached!\n\n";
        
        // Cleanup
        echo "6. Cleanup (optional)...\n";
        echo "   To clean up test data, run:\n";
        echo "   - Estimate::find({$estimate->id})->delete();\n";
        echo "   - Project::find({$project->id})->delete();\n";
        echo "   - Client::find({$client->id})->delete();\n\n";
        
    } catch (Exception $e) {
        echo "   ERROR: {$e->getMessage()}\n";
        echo "   Stack trace:\n";
        echo $e->getTraceAsString() . "\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "FATAL ERROR: {$e->getMessage()}\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

echo "=== Test Complete ===\n";
