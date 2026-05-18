# Attach Estimate PO Tool - Quick Start Guide

## Overview

This MCP tool has been created to enable n8n OpenAI agents (and other MCP clients) to automatically validate estimates and attach purchase orders to projects in the Aura project management system.

## What's Been Created

### 1. MCP Tool Class
**File**: [`app/Mcp/Tools/AttachEstimatePOTool.php`](app/Mcp/Tools/AttachEstimatePOTool.php)

This is the core implementation that:
- Accepts estimate ID and PO number
- Validates that the estimate has valid amounts
- Checks that the estimate is linked to a project
- Attaches the PO to the project (permanent or provisional)
- Returns detailed success/error responses

### 2. Configuration Registration
**File**: [`config/mcp.php`](config/mcp.php)

The tool has been registered in the MCP configuration file.

### 3. Server Registration
**File**: [`app/Mcp/Servers/AuraAIServer.php`](app/Mcp/Servers/AuraAIServer.php)

The tool has been added to the AuraAI MCP server's tools array, making it available via the `/mcp/auraai` endpoint.

### 4. Documentation
**File**: [`ATTACH_ESTIMATE_PO_TOOL.md`](ATTACH_ESTIMATE_PO_TOOL.md)

Complete documentation including:
- Tool parameters and responses
- Error handling scenarios
- n8n integration examples
- Security considerations
- Testing instructions

### 5. n8n Workflow Template
**File**: [`n8n-attach-estimate-po-workflow.json`](n8n-attach-estimate-po-workflow.json)

Ready-to-import n8n workflow that demonstrates:
- Webhook trigger for PO attachment requests
- OpenAI agent with function calling
- MCP tool invocation
- Success/error response handling

### 6. Test Script
**File**: [`test-attach-estimate-po.php`](test-attach-estimate-po.php)

Standalone PHP script to test the tool functionality without n8n.

## Quick Start

### Step 1: Verify Installation

Check that the tool is available in your MCP server:

```bash
curl -X POST https://your-domain.com/mcp/auraai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

You should see `attach_estimate_po` in the list of available tools.

**Note**: If the tool doesn't appear in the list but was just added, you may need to restart PHP-FPM:
```bash
sudo systemctl restart php8.3-fpm
```

The tool will still be callable even if it doesn't appear in the list immediately.

### Step 2: Test the Tool

Run the test script to verify functionality:

```bash
php test-attach-estimate-po.php
```

This will create test data and verify the tool works correctly.

### Step 3: Set Up n8n Integration

1. **Import the workflow**:
   - Open n8n
   - Go to Workflows → Import from File
   - Select `n8n-attach-estimate-po-workflow.json`

2. **Configure environment variables**:
   ```bash
   # In your n8n environment
   AURA_MCP_URL=https://your-aura-domain.com
   OPENAI_API_KEY=your-openai-key
   ```

3. **Activate the workflow**:
   - The workflow will be accessible via webhook
   - Test it by sending a POST request:

```bash
curl -X POST https://your-n8n-domain.com/webhook/estimate-po-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "estimate_id": 123,
    "po_number": "PO-2026-001",
    "provisional": false
  }'
```

### Step 4: Use in Your Application

The tool can be called directly via the MCP API using JSON-RPC 2.0 format:

```bash
curl -X POST https://your-domain.com/mcp/auraai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "attach_estimate_po",
      "arguments": {
        "estimate_id": 123,
        "po_number": "PO-2026-001",
        "provisional": false
      }
    },
    "id": 1
  }'
```

**Response format:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":true,\"message\":\"PO successfully attached to project\",...}"
      }
    ],
    "isError": false
  }
}
```

## Tool Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `estimate_id` | integer | Yes | The ID of the estimate to check |
| `po_number` | string | Yes | The purchase order number to attach |
| `po_document` | string | No | Path or URL to the PO document file |
| `provisional` | boolean | No | Whether this is a provisional PO (default: false) |

## Common Use Cases

### 1. Permanent PO Attachment
When you have a confirmed purchase order:

```json
{
  "estimate_id": 123,
  "po_number": "PO-2026-001",
  "po_document": "/storage/po_documents/po-2026-001.pdf"
}
```

This will:
- Set `project.po_number` to "PO-2026-001"
- Set `project.is_locked_by_po` to true
- Store the document path

### 2. Provisional PO
When you have a temporary/provisional PO:

```json
{
  "estimate_id": 123,
  "po_number": "PROV-PO-2026-001",
  "provisional": true
}
```

This will:
- Set `project.provisional_po_number` to "PROV-PO-2026-001"
- Set `project.provisional_po_expires_at` to 30 days from now
- Keep `project.is_locked_by_po` as false

### 3. AI Agent Workflow
Use with an OpenAI agent to automate the process:

**Agent Prompt**:
```
When you receive an email or notification about a new purchase order:
1. Extract the estimate ID and PO number
2. Use the attach_estimate_po tool to validate and attach
3. If successful, send a confirmation email
4. If there are errors, notify the finance team
```

## Validation Checks

The tool performs the following validations:

1. ✅ **Estimate exists**: Checks if the estimate_id is valid
2. ✅ **Has amount**: Verifies estimate has `total`, `amount`, or `subtotal` > 0
3. ✅ **Linked to project**: Ensures estimate is associated with a project
4. ✅ **PO document valid**: If provided, verifies the file exists or URL is valid

## Error Handling

The tool returns structured error responses:

```json
{
  "success": false,
  "error": "Estimate does not have a valid amount",
  "estimate_id": 123,
  "estimate_title": "Website Development",
  "amount": null
}
```

Common errors:
- `Estimate not found`
- `Estimate does not have a valid amount`
- `Estimate is not linked to a project`
- `PO document path is invalid or file does not exist`

## Database Impact

When a PO is attached, the following fields are updated in the `projects` table:

**Permanent PO**:
- `po_number` → The PO number
- `is_locked_by_po` → true
- `po_document` → Document path (if provided)

**Provisional PO**:
- `provisional_po_number` → The PO number
- `provisional_po_expires_at` → 30 days from now
- `po_document` → Document path (if provided)

## Security Notes

- ⚠️ Ensure MCP authentication is enabled in production
- ⚠️ Validate user permissions before allowing PO attachments
- ⚠️ Log all PO attachments for audit trail
- ⚠️ Implement rate limiting to prevent abuse

## Troubleshooting

### Tool Not Found
If the tool doesn't appear in the MCP server:
1. Clear Laravel cache: `php artisan cache:clear`
2. Restart the application
3. Check `app/Mcp/Servers/AuraAIServer.php` includes the tool

### Validation Errors
If you get validation errors:
1. Ensure the estimate has a valid amount
2. Verify the estimate is linked to a project
3. Check that the PO document path is correct

### Permission Issues
If you get authorization errors:
1. Check MCP authentication settings in `.env`
2. Verify API tokens are valid
3. Ensure the user has appropriate permissions

## Next Steps

1. **Production Deployment**:
   - Enable MCP authentication
   - Set up monitoring and logging
   - Configure rate limiting
   - Add webhook notifications

2. **Enhanced Features**:
   - Auto-generate PO numbers
   - Email notifications on PO attachment
   - Integration with accounting systems (Xero)
   - Batch processing of multiple estimates

3. **Custom Workflows**:
   - Create additional n8n workflows for specific use cases
   - Integrate with email parsing for automatic PO extraction
   - Add approval workflows before PO attachment

## Support

For questions or issues:
1. Check the detailed documentation: [`ATTACH_ESTIMATE_PO_TOOL.md`](ATTACH_ESTIMATE_PO_TOOL.md)
2. Review the test script: [`test-attach-estimate-po.php`](test-attach-estimate-po.php)
3. Examine the n8n workflow: [`n8n-attach-estimate-po-workflow.json`](n8n-attach-estimate-po-workflow.json)

## Summary

You now have a complete MCP tool that can:
- ✅ Validate estimates have proper amounts
- ✅ Check estimates are linked to projects
- ✅ Attach permanent or provisional POs
- ✅ Be used by n8n OpenAI agents
- ✅ Return detailed success/error responses
- ✅ Handle PO documents
- ✅ Support automated workflows

The tool is ready to use with any MCP-compatible client, including n8n, LangChain, and other AI agent platforms.
