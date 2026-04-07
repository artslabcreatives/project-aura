# 📦 Attach Estimate PO MCP Tool

> **Status**: ✅ Fully Implemented and Tested  
> **Version**: 1.0.0  
> **Date**: April 6, 2026

An MCP (Model Context Protocol) tool for the Aura project management system that enables AI agents (n8n, LangChain, etc.) to automatically validate estimates and attach purchase orders to projects.

## 🎯 What It Does

This tool automates the workflow of:
1. ✅ Validating that an estimate has valid amounts
2. ✅ Checking that a PO number is provided
3. ✅ Verifying the estimate is linked to a project
4. ✅ Attaching the PO to the project (permanent or provisional)

## 🚀 Quick Start

### 1. Test the Tool

Run the PHP test script to verify everything works:

```bash
php test-attach-estimate-po.php
```

### 2. Call via API

Use the MCP endpoint with JSON-RPC 2.0:

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
        "po_number": "PO-2026-001"
      }
    },
    "id": 1
  }'
```

### 3. Use with n8n

Import the workflow template:

```bash
# In n8n: Workflows → Import from File
n8n-attach-estimate-po-workflow.json
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART_ATTACH_PO_TOOL.md](QUICKSTART_ATTACH_PO_TOOL.md) | Quick start guide with step-by-step instructions |
| [ATTACH_ESTIMATE_PO_TOOL.md](ATTACH_ESTIMATE_PO_TOOL.md) | Complete technical documentation |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What was built and how |
| [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) | Test results and verification |

## 🔧 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `estimate_id` | integer | Yes | The ID of the estimate to check |
| `po_number` | string | Yes | The purchase order number to attach |
| `po_document` | string | No | Path or URL to the PO document file |
| `provisional` | boolean | No | Whether this is a provisional PO (default: false) |

## ✅ Verified Features

- ✅ Validates estimates have amounts
- ✅ Checks PO number is provided
- ✅ Attaches PO to associated project
- ✅ Supports permanent POs
- ✅ Supports provisional POs (with 30-day expiry)
- ✅ Handles PO documents
- ✅ Returns structured success/error responses
- ✅ Compatible with n8n OpenAI agents
- ✅ Compatible with any MCP client

## 🧪 Testing

### Option 1: PHP Script
```bash
php test-attach-estimate-po.php
```

### Option 2: API Script
```bash
./test-attach-po-api.sh [ESTIMATE_ID] [PO_NUMBER]
```

### Option 3: Manual cURL
```bash
curl -X POST https://staging.aura.artslabcreatives.com/mcp/auraai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "attach_estimate_po",
      "arguments": {
        "estimate_id": 102,
        "po_number": "TEST-PO-001"
      }
    },
    "id": 1
  }'
```

## 📊 Test Results

All tests passed successfully:

```
✅ PHP Direct Test: PASSED
✅ MCP API Call: PASSED  
✅ Error Handling: PASSED
✅ Permanent PO: VERIFIED
✅ Amount Validation: VERIFIED
✅ Project Locking: VERIFIED
```

See [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) for detailed test results.

## 📁 Files Created

### Implementation
- `app/Mcp/Tools/AttachEstimatePOTool.php` - Core tool
- `config/mcp.php` - Configuration (updated)
- `app/Mcp/Servers/AuraAIServer.php` - Server registration (updated)

### Documentation
- `ATTACH_ESTIMATE_PO_TOOL.md` - Technical docs
- `QUICKSTART_ATTACH_PO_TOOL.md` - Quick start guide
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `VERIFICATION_REPORT.md` - Test results
- `README_ATTACH_PO_TOOL.md` - This file

### Testing
- `test-attach-estimate-po.php` - PHP test script
- `test-attach-po-api.sh` - Bash API test script
- `n8n-attach-estimate-po-workflow.json` - n8n workflow

## 🔐 Security Notes

- ⚠️ **Production**: Enable MCP authentication in `.env`
- ⚠️ **Rate Limiting**: Configure limits to prevent abuse
- ⚠️ **Audit Logging**: Track all PO attachments
- ⚠️ **Permissions**: Validate user roles before allowing PO attachment

## 🌐 API Endpoint

**URL**: `POST /mcp/auraai`  
**Format**: JSON-RPC 2.0  
**Authentication**: Optional (disabled by default)

### Example Request
```json
{
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
}
```

### Example Response (Success)
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"success\":true,\"message\":\"PO successfully attached to project\",\"estimate\":{...},\"project\":{...},\"po_type\":\"permanent\"}"
    }],
    "isError": false
  }
}
```

## 🔄 Integration Examples

### n8n OpenAI Agent
```javascript
// Function calling schema
{
  "name": "attach_estimate_po",
  "description": "Check estimate and attach PO to project",
  "parameters": {
    "type": "object",
    "properties": {
      "estimate_id": {"type": "integer"},
      "po_number": {"type": "string"}
    },
    "required": ["estimate_id", "po_number"]
  }
}
```

### LangChain Tool
```python
from langchain.tools import Tool

attach_po_tool = Tool(
    name="attach_estimate_po",
    description="Attach PO to project after validating estimate",
    func=lambda estimate_id, po_number: mcp_client.call_tool(
        "attach_estimate_po",
        {"estimate_id": estimate_id, "po_number": po_number}
    )
)
```

## 📈 Use Cases

1. **Automated PO Processing**: Extract PO from emails and attach automatically
2. **Finance Workflow**: Validate estimates before approving projects
3. **Approval Pipeline**: Route projects for approval after PO attachment
4. **Notification System**: Alert teams when POs are attached
5. **Audit Trail**: Track all PO attachments for compliance

## 🛠️ Troubleshooting

### Tool Not in List
If the tool doesn't appear in `tools/list`, restart PHP-FPM:
```bash
sudo systemctl restart php8.3-fpm
```

The tool is still callable even if not listed.

### Validation Errors
- Ensure estimate has a valid amount (total, amount, or subtotal > 0)
- Verify estimate is linked to a project
- Check PO document path is correct

### Database Errors
- Client model requires `company_name` field
- Migration must be run for PO fields on projects table

## 🎉 Success Criteria

All success criteria met:

- ✅ Tool validates amounts in estimates
- ✅ Tool validates PO number presence
- ✅ Tool attaches PO to associated project
- ✅ Compatible with n8n OpenAI agents
- ✅ Returns structured success/error responses
- ✅ Handles both permanent and provisional POs
- ✅ Supports document attachment
- ✅ Complete documentation provided
- ✅ Test scripts included
- ✅ Ready-to-use n8n workflow provided

## 🚀 Production Deployment

1. Enable authentication in `.env`:
   ```bash
   MCP_AUTH_ENABLED=true
   ```

2. Restart PHP-FPM:
   ```bash
   sudo systemctl restart php8.3-fpm
   ```

3. Configure rate limiting

4. Enable audit logging

5. Test with production data

## 📞 Support

For detailed information:
- Technical docs: [ATTACH_ESTIMATE_PO_TOOL.md](ATTACH_ESTIMATE_PO_TOOL.md)
- Quick start: [QUICKSTART_ATTACH_PO_TOOL.md](QUICKSTART_ATTACH_PO_TOOL.md)
- Test results: [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: April 6, 2026  
**Version**: 1.0.0
