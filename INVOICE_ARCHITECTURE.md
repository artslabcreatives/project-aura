# Invoice System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     UNIFIED INVOICE SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Manual Invoice  │         │  Xero Invoice    │
│   Upload (UI)    │         │   Sync (API)     │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │  Creates                   │  Syncs
         ▼                            ▼
    ┌────────────────────────────────────────┐
    │         INVOICES TABLE                 │
    │  ┌──────────────────────────────────┐  │
    │  │ id, source, project_id,          │  │
    │  │ client_id, invoice_number,       │  │
    │  │ status, amount, currency,        │  │
    │  │ issued_at, due_date,             │  │
    │  │ xero_invoice_id, xero_status     │  │
    │  └──────────────────────────────────┘  │
    └────────────────────────────────────────┘
         │                            │
         │  Relationships             │
         ▼                            ▼
    ┌─────────┐                  ┌─────────┐
    │ Project │                  │ Client  │
    └─────────┘                  └─────────┘
```

## Data Flow

### Manual Invoice Creation

```
User Action (Frontend)
    │
    ├─► InvoiceUploadDialog
    │      │
    │      ├─► projectService.update()
    │      │      └─► Updates project.invoice_number (legacy)
    │      │
    │      └─► invoiceService.create()
    │             └─► POST /api/invoices
    │                    └─► InvoiceController@store
    │                           └─► Creates Invoice record
    │                                  ├─► source: 'manual'
    │                                  ├─► project_id: linked
    │                                  └─► client_id: linked
    │
    └─► InvoiceList updates automatically
```

### Xero Invoice Sync

```
Xero System
    │
    ├─► Xero API (Invoices endpoint)
    │      │
    │      └─► GET /Invoices?Status=AUTHORISED
    │
    ▼
Backend Sync
    │
    ├─► XeroService@syncInvoices()
    │      │
    │      ├─► Fetches invoices from Xero
    │      │
    │      └─► For each invoice:
    │             │
    │             ├─► Check if exists (by xero_invoice_id)
    │             │
    │             ├─► Match to project (by invoice_number or reference)
    │             │
    │             ├─► Resolve client (from Xero Contact)
    │             │
    │             └─► Invoice::updateOrCreate()
    │                    ├─► source: 'xero'
    │                    ├─► xero_invoice_id: unique ID
    │                    ├─► xero_status: AUTHORISED/PAID/etc
    │                    └─► Maps all Xero fields
    │
    └─► Returns sync summary: { synced: 10, skipped: 2 }
```

### Invoice Retrieval

```
Frontend Component (InvoiceList)
    │
    ├─► invoiceService.getAll(filters)
    │      │
    │      └─► GET /api/invoices?source=manual&project_id=123
    │             │
    │             └─► InvoiceController@index
    │                    │
    │                    ├─► Applies filters (source, project, client, status)
    │                    │
    │                    ├─► Eager loads relationships (project, client)
    │                    │
    │                    └─► Returns paginated results
    │
    └─► Renders unified list with:
           ├─► Source badges (Manual/Xero)
           ├─► Status badges
           ├─► Amount with currency
           └─► Project/Client info
```

## Database Relationships

```
┌──────────────┐
│   clients    │
│──────────────│
│ id           │◄─────────┐
│ company_name │          │
└──────────────┘          │
                          │
                          │ client_id
                          │
┌──────────────┐     ┌────┴─────────┐
│   projects   │     │   invoices   │
│──────────────│     │──────────────│
│ id           │◄────│ id           │
│ name         │     │ source       │ ◄─── 'manual' or 'xero'
│ client_id    │     │ project_id   │
│ invoice_number│    │ client_id    │
│ (legacy)     │     │ invoice_number│
└──────────────┘     │ status       │
                     │ amount       │
                     │ currency     │
                     │ issued_at    │
                     │ due_date     │
                     │ xero_invoice_id│
                     │ xero_status  │
                     └──────────────┘
```

## Component Architecture

### Frontend Components

```
InvoiceList (Unified Display)
    │
    ├─► Uses invoiceService
    │
    ├─► Displays:
    │      ├─► Manual invoices
    │      └─► Xero invoices
    │
    ├─► Features:
    │      ├─► Source filtering
    │      ├─► Status badges
    │      ├─► Currency formatting
    │      └─► Click handlers
    │
    └─► State management:
           ├─► Loading states
           ├─► Error handling
           └─► Refresh on demand

InvoiceUploadDialog (Manual Creation)
    │
    ├─► Form validation
    │
    ├─► File upload (invoice document)
    │
    ├─► Physical invoice tracking
    │
    └─► Creates Invoice record:
           ├─► source: 'manual'
           ├─► Links to project
           └─► Links to client
```

### Backend Services

```
InvoiceController (API)
    │
    ├─► index()    - List with filters
    ├─► store()    - Create invoice
    ├─► show()     - Get single invoice
    ├─► update()   - Update invoice
    └─► destroy()  - Delete invoice

XeroService (Integration)
    │
    ├─► syncInvoices()
    │      └─► Fetches from Xero API
    │      └─► Creates/updates Invoice records
    │
    └─► syncInvoiceToProject()
           └─► Maps Xero data to Invoice model
```

## Source Tagging Logic

```
Invoice Source Determination:

┌─────────────────────────────────────────┐
│  How is invoice.source determined?     │
└─────────────────────────────────────────┘

Manual Invoice:
    ├─► User uploads via InvoiceUploadDialog
    ├─► invoiceService.create({ source: 'manual', ... })
    └─► Database: source = 'manual'

Xero Invoice:
    ├─► XeroService.syncInvoices()
    ├─► Fetches from Xero API
    ├─► Invoice::create(['source' => 'xero', ...])
    └─► Database: source = 'xero'

Filtering by Source:
    ├─► Frontend: InvoiceList source filter dropdown
    ├─► API: ?source=manual or ?source=xero
    └─► Database: WHERE source = 'manual' (indexed)
```

## Migration Path

```
OLD SYSTEM (Before Unification)
┌─────────────────────────────────────────┐
│  Projects Table                         │
│  ├─► invoice_number (manual)            │
│  ├─► invoice_document (manual)          │
│  ├─► xero_invoice_id (Xero)             │
│  ├─► invoice_total (Xero)               │
│  ├─► invoice_status (Xero)              │
│  └─► invoice_date (Xero)                │
└─────────────────────────────────────────┘
         │
         │ Migration
         ▼
NEW SYSTEM (Unified)
┌─────────────────────────────────────────┐
│  Invoices Table                         │
│  ├─► source ('manual' or 'xero')        │
│  ├─► project_id (links to project)      │
│  ├─► invoice_number (unified)           │
│  ├─► xero_invoice_id (Xero only)        │
│  ├─► amount (unified)                   │
│  └─► All other unified fields           │
└─────────────────────────────────────────┘
         │
         │ Backward Compatible
         ▼
┌─────────────────────────────────────────┐
│  Projects Table (Still has old fields) │
│  ├─► invoice_number (deprecated)        │
│  └─► Can be removed in future           │
└─────────────────────────────────────────┘
```

## API Request/Response Flow

### Creating Manual Invoice

```
Request:
POST /api/invoices
{
    "source": "manual",
    "project_id": 123,
    "client_id": 456,
    "invoice_number": "INV-2024-001",
    "amount": 5000.00,
    "currency": "USD",
    "status": "pending"
}

Response:
{
    "id": 789,
    "source": "manual",
    "projectId": 123,
    "clientId": 456,
    "invoiceNumber": "INV-2024-001",
    "amount": 5000.00,
    "currency": "USD",
    "status": "pending",
    "project": {
        "id": 123,
        "name": "Website Redesign"
    },
    "client": {
        "id": 456,
        "companyName": "Acme Corp"
    }
}
```

### Querying Invoices

```
Request:
GET /api/invoices?source=xero&client_id=456&status=paid

Response:
{
    "data": [
        {
            "id": 101,
            "source": "xero",
            "xeroInvoiceId": "XERO-ABC-123",
            "projectId": 124,
            "clientId": 456,
            "invoiceNumber": "INV-XERO-001",
            "amount": 7500.00,
            "currency": "USD",
            "status": "paid",
            "xeroStatus": "PAID",
            "project": {...},
            "client": {...}
        }
    ],
    "total": 1
}
```

## Security & Validation

```
Validation Rules:

Invoice Creation:
    ├─► source: required, in:manual,xero
    ├─► project_id: nullable, exists:projects
    ├─► client_id: nullable, exists:clients
    ├─► invoice_number: nullable, string, max:255
    ├─► amount: nullable, numeric, min:0
    ├─► currency: nullable, string, max:10
    └─► xero_invoice_id: nullable, unique (for Xero)

Authentication:
    ├─► All routes protected with auth:sanctum
    └─► User must be authenticated

Authorization:
    ├─► InvoiceController uses Laravel policies
    └─► Users can only access invoices for their projects/clients
```

## Performance Considerations

```
Database Indexes:
    ├─► source (enum) - Fast filtering by invoice type
    ├─► status - Fast status queries
    ├─► xero_invoice_id (unique) - Fast Xero lookup
    ├─► project_id - Fast project invoice lookup
    └─► client_id - Fast client invoice lookup

Query Optimization:
    ├─► Eager loading: with(['project', 'client'])
    ├─► Pagination: 20 invoices per page default
    └─► Index usage: WHERE clauses use indexed columns

Frontend Optimization:
    ├─► Lazy loading: InvoiceList only loads when needed
    ├─► Debounced filtering: Reduces API calls
    └─► Cached responses: TanStack Query (if used)
```

## Extension Points

```
Future Sources:
    ├─► Add 'quickbooks' to source enum
    ├─► Add 'stripe' to source enum
    └─► Implement source-specific sync services

Custom Fields:
    ├─► Add migration: $table->json('metadata')
    ├─► Store source-specific data as JSON
    └─► Access via $invoice->metadata

Webhooks:
    ├─► Listen to Xero webhooks
    ├─► Auto-sync on Xero invoice creation/update
    └─► Real-time invoice status updates
```
