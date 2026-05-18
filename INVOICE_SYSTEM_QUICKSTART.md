# Invoice System - Quick Start Guide

## For Developers

### Displaying Invoices in a Page

Add the `InvoiceList` component to any page:

```typescript
import { InvoiceList } from '@/components/InvoiceList';

// In your component
function ProjectDetailPage({ projectId }: { projectId: number }) {
    return (
        <div className="space-y-6">
            <h1>Project Details</h1>
            
            {/* Show all invoices for this project */}
            <InvoiceList 
                projectId={projectId}
                showFilters={true}
                onInvoiceClick={(invoice) => {
                    // Handle invoice click - could open a modal, navigate, etc.
                    console.log('Selected invoice:', invoice);
                }}
            />
        </div>
    );
}
```

### Creating Manual Invoices

The existing `InvoiceUploadDialog` now automatically creates unified Invoice records:

```typescript
import { InvoiceUploadDialog } from '@/components/InvoiceUploadDialog';

function ProjectActions({ project, onUpdate }: Props) {
    const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

    return (
        <>
            <Button onClick={() => setShowInvoiceDialog(true)}>
                Upload Invoice
            </Button>

            <InvoiceUploadDialog
                open={showInvoiceDialog}
                onOpenChange={setShowInvoiceDialog}
                project={project}
                onSuccess={(updatedProject) => {
                    // Invoice record is automatically created in background
                    onUpdate(updatedProject);
                }}
            />
        </>
    );
}
```

### Programmatic Invoice Access

```typescript
import { invoiceService } from '@/services/invoiceService';

// Get all invoices
const { data: invoices, total } = await invoiceService.getAll();

// Get invoices for a project
const projectInvoices = await invoiceService.getByProject(123);

// Get only Xero invoices
const { data: xeroInvoices } = await invoiceService.getAll({
    source: 'xero',
});

// Get pending invoices for a client
const { data: pendingInvoices } = await invoiceService.getAll({
    clientId: 456,
    status: 'pending',
});

// Create a manual invoice
const newInvoice = await invoiceService.create({
    source: 'manual',
    projectId: 123,
    clientId: 456,
    invoiceNumber: 'INV-2024-001',
    amount: 5000.00,
    currency: 'USD',
    status: 'sent',
    issuedAt: '2024-04-24',
    dueDate: '2024-05-24',
    description: 'Q1 2024 Services',
});

// Update invoice status
await invoiceService.update(newInvoice.id, {
    status: 'paid',
});
```

## For Backend Developers

### Accessing Invoices via Eloquent

```php
use App\Models\Project;
use App\Models\Invoice;

// Get all invoices for a project
$project = Project::with('invoices')->find($projectId);
foreach ($project->invoices as $invoice) {
    echo $invoice->invoice_number;
    echo $invoice->source; // 'manual' or 'xero'
}

// Query invoices directly
$manualInvoices = Invoice::where('source', 'manual')->get();
$xeroInvoices = Invoice::where('source', 'xero')->get();

// Get invoices for a client
$clientInvoices = Invoice::where('client_id', $clientId)
    ->with(['project', 'client'])
    ->orderBy('issued_at', 'desc')
    ->get();

// Get outstanding invoices
$outstanding = Invoice::where('status', '!=', 'paid')
    ->sum('amount');
```

### Syncing Xero Invoices

```php
use App\Services\XeroService;

$xeroService = app(XeroService::class);

// Sync all invoices from Xero
$result = $xeroService->syncInvoices();
// Returns: ['synced' => 10, 'skipped' => 2]

// Access synced invoices
$xeroInvoices = Invoice::where('source', 'xero')->get();
```

### Creating Invoices Programmatically

```php
use App\Models\Invoice;

// Create manual invoice
$invoice = Invoice::create([
    'source' => 'manual',
    'project_id' => $project->id,
    'client_id' => $project->client_id,
    'invoice_number' => 'INV-' . date('Y-m-d-His'),
    'status' => 'pending',
    'amount' => 5000.00,
    'currency' => 'USD',
    'issued_at' => now(),
    'due_date' => now()->addDays(30),
    'description' => 'Services rendered',
]);

// Xero invoices are created automatically by XeroService
// Don't manually create Xero invoices - use syncInvoices() instead
```

## For System Administrators

### Running Xero Invoice Sync

```bash
# Via Artisan command (if implemented)
php artisan xero:sync-invoices

# Via API endpoint
curl -X POST https://your-domain.com/api/xero/sync-invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Queries

```sql
-- Get all invoices by source
SELECT source, COUNT(*) as count, SUM(amount) as total
FROM invoices
GROUP BY source;

-- Find invoices without projects
SELECT * FROM invoices WHERE project_id IS NULL;

-- Outstanding invoices
SELECT * FROM invoices 
WHERE status NOT IN ('paid', 'cancelled')
ORDER BY due_date ASC;

-- Revenue by month
SELECT 
    DATE_FORMAT(issued_at, '%Y-%m') as month,
    source,
    SUM(amount) as revenue
FROM invoices
WHERE issued_at IS NOT NULL
GROUP BY month, source
ORDER BY month DESC;
```

## Integration Examples

### Adding to Project Detail Page

```typescript
// In your ProjectDetail component
import { InvoiceList } from '@/components/InvoiceList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ProjectDetail({ project }: Props) {
    return (
        <Tabs defaultValue="overview">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="invoices">
                <InvoiceList projectId={project.id} />
            </TabsContent>
        </Tabs>
    );
}
```

### Adding to Client Dashboard

```typescript
import { InvoiceList } from '@/components/InvoiceList';

function ClientDashboard({ clientId }: Props) {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Client Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <InvoiceList 
                        clientId={clientId}
                        showFilters={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
```

### Custom Invoice Display

```typescript
import { useEffect, useState } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { Invoice } from '@/types/financial';

function CustomInvoiceDisplay({ projectId }: { projectId: number }) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        invoiceService.getByProject(projectId)
            .then(setInvoices)
            .catch(console.error);
    }, [projectId]);

    return (
        <div>
            {invoices.map(invoice => (
                <div key={invoice.id}>
                    <h3>{invoice.invoiceNumber}</h3>
                    <p>Amount: {invoice.amount} {invoice.currency}</p>
                    <p>Source: {invoice.source}</p>
                    <p>Status: {invoice.status}</p>
                </div>
            ))}
        </div>
    );
}
```

## Common Tasks

### Filter Invoices in UI

The `InvoiceList` component includes built-in filtering:

```typescript
<InvoiceList 
    projectId={projectId}
    showFilters={true}  // Enables source filter dropdown
/>
```

Users can filter by:
- All Sources
- Manual Only
- Xero Only

### Check Invoice Source

```typescript
const invoice = await invoiceService.getById(123);

if (invoice.source === 'xero') {
    console.log('This is a Xero invoice');
    console.log('Xero ID:', invoice.xeroInvoiceId);
} else {
    console.log('This is a manual invoice');
}
```

### Update Invoice Status

```typescript
// Mark invoice as paid
await invoiceService.update(invoiceId, {
    status: 'paid',
});

// Update Xero status (synced from Xero)
await invoiceService.update(invoiceId, {
    xeroStatus: 'PAID',
});
```

## Troubleshooting

### Invoices not showing up?

1. Check the database: `SELECT * FROM invoices WHERE project_id = YOUR_PROJECT_ID`
2. Verify API endpoint: `GET /api/invoices?project_id=YOUR_PROJECT_ID`
3. Check browser console for errors
4. Ensure invoiceService is imported correctly

### Xero invoices not syncing?

1. Check Xero authentication: Visit `/api/xero/status`
2. Manually trigger sync: `POST /api/xero/sync-invoices`
3. Check logs: `tail -f storage/logs/laravel.log`
4. Verify Xero token hasn't expired

### TypeScript errors?

1. Run: `npm run build` to check for type errors
2. Ensure all imports use the correct paths
3. Check that `Invoice` type is exported from `@/types/financial`

## Support

For issues or questions:
1. Check [INVOICE_UNIFICATION_COMPLETE.md](INVOICE_UNIFICATION_COMPLETE.md) for full documentation
2. Review test files in `tests/Feature/InvoiceModuleTest.php`
3. Consult the API documentation at `/api/documentation`
