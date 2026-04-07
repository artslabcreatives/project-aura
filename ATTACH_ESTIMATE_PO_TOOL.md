# Attach Estimate PO MCP Tool

## Overview

The `attach_estimate_po` MCP tool enables automated checking and attachment of Purchase Orders (POs) to projects based on estimate data. This tool is designed to be used by AI agents (such as n8n OpenAI agents) to validate that estimates have proper amounts and then attach PO information to the associated project.

## Purpose

This tool automates the workflow of:
1. Validating that an estimate has valid amounts (total, amount, or subtotal)
2. Checking that a PO number is provided
3. Verifying the estimate is linked to a project
4. Attaching the PO to the project (either as permanent or provisional)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `estimate_id` | integer | Yes | The ID of the estimate to check |
| `po_number` | string | Yes | The purchase order number to attach |
| `po_document` | string | No | Path or URL to the PO document file |
| `provisional` | boolean | No | Whether this is a provisional PO (defaults to false) |

## Response Structure

### Success Response

```json
{
  "success": true,
  "message": "PO successfully attached to project",
  "estimate": {
    "id": 123,
    "title": "Website Development Estimate",
    "amount": 15000.00,
    "status": "accepted",
    "client": "Acme Corporation"
  },
  "project": {
    "id": 456,
    "name": "Acme Website Project",
    "po_number": "PO-2026-001",
    "provisional_po_number": null,
    "po_document": "/storage/po_documents/po-2026-001.pdf",
    "is_locked_by_po": true
  },
  "po_type": "permanent"
}
```

### Error Responses

#### No Amount in Estimate
```json
{
  "success": false,
  "error": "Estimate does not have a valid amount",
  "estimate_id": 123,
  "estimate_title": "Website Development Estimate",
  "amount": null
}
```

#### Estimate Not Linked to Project
```json
{
  "success": false,
  "error": "Estimate is not linked to a project",
  "estimate_id": 123,
  "estimate_title": "Website Development Estimate",
  "amount": 15000.00,
  "po_number": "PO-2026-001"
}
```

#### Invalid PO Document
```json
{
  "success": false,
  "error": "PO document path is invalid or file does not exist",
  "estimate_id": 123,
  "project_id": 456,
  "po_number": "PO-2026-001"
}
```

## Usage Examples

### Basic Usage (Permanent PO)

```json
{
  "estimate_id": 123,
  "po_number": "PO-2026-001"
}
```

### With PO Document

```json
{
  "estimate_id": 123,
  "po_number": "PO-2026-001",
  "po_document": "/storage/po_documents/po-2026-001.pdf"
}
```

### Provisional PO

```json
{
  "estimate_id": 123,
  "po_number": "PROV-PO-2026-001",
  "provisional": true
}
```

## n8n Integration

### Setup in n8n

1. **Add HTTP Request Node** or **OpenAI Function Calling Node**
2. Configure the tool definition:

```json
{
  "type": "function",
  "function": {
    "name": "attach_estimate_po",
    "description": "Check if an estimate has amounts and PO number, then attach the PO to the associated project",
    "parameters": {
      "type": "object",
      "properties": {
        "estimate_id": {
          "type": "integer",
          "description": "The ID of the estimate to check"
        },
        "po_number": {
          "type": "string",
          "description": "The purchase order number to attach"
        },
        "po_document": {
          "type": "string",
          "description": "Optional: Path or URL to the PO document file"
        },
        "provisional": {
          "type": "boolean",
          "description": "Optional: Whether this is a provisional PO (defaults to false)"
        }
      },
      "required": ["estimate_id", "po_number"]
    }
  }
}
```

3. **Configure the API Endpoint**:
   - Method: POST
   - URL: `https://your-domain.com/mcp/auraai`
   - Headers:
     - `Content-Type: application/json`
   - Body (JSON-RPC 2.0 format):
     ```json
     {
       "jsonrpc": "2.0",
       "method": "tools/call",
       "params": {
         "name": "attach_estimate_po",
         "arguments": {
           "estimate_id": "{{ $json.estimate_id }}",
           "po_number": "{{ $json.po_number }}",
           "provisional": false
         }
       },
       "id": 1
     }
     ```

### Example n8n Workflow

```
[Trigger: Webhook/Email/Form] 
    → [Extract Estimate ID] 
    → [OpenAI Agent with attach_estimate_po tool] 
    → [Conditional: Check Success] 
    → [Send Notification/Update System]
```

### Sample OpenAI Prompt for n8n Agent

```
You are an assistant that helps attach purchase orders to projects.

When you receive an estimate ID and PO number, use the attach_estimate_po tool to:
1. Verify the estimate has valid amounts
2. Check the estimate is linked to a project
3. Attach the PO to the project

If successful, confirm the attachment and provide the project details.
If there are errors, explain what's missing and suggest next steps.
```

## Workflow Logic

1. **Validate Input**: Checks that estimate_id exists and po_number is provided
2. **Fetch Estimate**: Retrieves the estimate with related project and client
3. **Amount Validation**: Checks for valid amount in order of priority:
   - `total` field (preferred)
   - `amount` field
   - `subtotal` field
4. **Project Link Validation**: Ensures estimate is linked to a project
5. **PO Attachment**: Updates project with:
   - **Permanent PO** (default):
     - `po_number`: The PO number
     - `is_locked_by_po`: Set to true
     - `po_document`: Optional document path
   - **Provisional PO** (if `provisional: true`):
     - `provisional_po_number`: The PO number
     - `provisional_po_expires_at`: 30 days from now (if not already set)
     - `po_document`: Optional document path

## Security Considerations

- Ensure MCP authentication is enabled in production
- Validate PO document paths to prevent directory traversal
- Consider role-based access control for who can attach POs
- Log all PO attachments for audit trail

## Database Changes

When a PO is attached, the following project fields are updated:

**Permanent PO**:
- `po_number`: string
- `po_document`: string (nullable)
- `is_locked_by_po`: boolean (set to true)

**Provisional PO**:
- `provisional_po_number`: string
- `provisional_po_expires_at`: date
- `po_document`: string (nullable)

## Related Models

- **Estimate** (`app/Models/Estimate.php`): Contains estimate data with amounts
- **Project** (`app/Models/Project.php`): Contains PO fields and project data
- **Client** (`app/Models/Client.php`): Referenced by estimates

## Error Handling

The tool provides detailed error messages for:
- Estimate not found
- Missing or invalid amounts
- Missing project link
- Invalid PO document paths

All errors return a structured JSON response with `success: false` and descriptive error messages.

## Testing

To test the tool manually via curl:

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

Or use the provided test script:
```bash
./test-attach-po-api.sh [ESTIMATE_ID] [PO_NUMBER]
```

## Future Enhancements

Potential improvements for this tool:
- Auto-generate PO numbers based on patterns
- Support for multiple currencies
- Automatic email notifications when POs are attached
- Integration with accounting systems (Xero, QuickBooks)
- Batch processing of multiple estimates
- PO approval workflow integration
