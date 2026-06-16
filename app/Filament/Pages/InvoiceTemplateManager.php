<?php

namespace App\Filament\Pages;

use App\Models\InvoiceTemplate;
use App\Models\SystemSetting;
use App\Services\InvoicePdfService;
use App\Services\XeroService;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class InvoiceTemplateManager extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationLabel = 'Invoice Templates';

    protected static ?string $title = 'Invoice Template Manager';

    protected static string $view = 'filament.pages.invoice-template-manager';

    protected static ?int $navigationSort = 11;

    // Form state
    public ?array $templateData = [];
    public ?array $generateData = [];

    // Active template
    public ?int $activeTemplateId = null;

    public function mount(): void
    {
        $template = InvoiceTemplate::getDefault();

        if ($template) {
            $this->activeTemplateId = $template->id;
            $this->templateForm->fill([
                'name'     => $template->name,
                'mappings' => $template->mappings ?? [],
            ]);
        } else {
            $this->templateForm->fill([
                'name'     => '',
                'mappings' => [],
            ]);
        }

        $this->generateForm->fill([
            'xero_invoice_id' => '',
            'delivery_date'   => '',
            'reference'       => '',
            'place_of_supply' => '110-3/1, Havelock Road, Colombo 05',
            'additional_info' => '',
            'payment_mode'    => 'Bank Transfer',
        ]);
    }

    /**
     * Template configuration form (upload + mapping editor).
     */
    protected function getForms(): array
    {
        return [
            'templateForm',
            'generateForm',
        ];
    }

    public function templateForm(Form $form): Form
    {
        $variableOptions = collect(InvoiceTemplate::availableVariables())
            ->mapWithKeys(fn ($v) => [$v['key'] => "[{$v['group']}] {$v['label']}"])
            ->toArray();

        return $form
            ->schema([
                Section::make('Template Setup')
                    ->description('Upload a PDF invoice template and configure field mappings.')
                    ->schema([
                        TextInput::make('name')
                            ->label('Template Name')
                            ->required()
                            ->placeholder('e.g. Tax VAT Invoice - Sri Lanka')
                            ->maxLength(255),

                        FileUpload::make('pdf_upload')
                            ->label('PDF Template File')
                            ->acceptedFileTypes(['application/pdf'])
                            ->disk('local')
                            ->directory('invoice-templates')
                            ->maxSize(5120)
                            ->helperText('Upload the PDF template. Note: Must be PDF 1.4 or lower (uncompressed) for FPDI parsing compatibility. Max 5MB.'),
                    ])
                    ->columns(2),

                Section::make('Field Mappings')
                    ->description('Define where each variable should appear on the PDF. Coordinates are in mm from the top-left corner of the page.')
                    ->schema([
                        Repeater::make('mappings')
                            ->label('')
                            ->schema([
                                Select::make('variable')
                                    ->label('Variable')
                                    ->options($variableOptions)
                                    ->searchable()
                                    ->required()
                                    ->columnSpan(2),

                                TextInput::make('x')
                                    ->label('X (mm)')
                                    ->numeric()
                                    ->required()
                                    ->step(0.5)
                                    ->default(10)
                                    ->helperText('From left'),

                                TextInput::make('y')
                                    ->label('Y (mm)')
                                    ->numeric()
                                    ->required()
                                    ->step(0.5)
                                    ->default(10)
                                    ->helperText('From top'),

                                TextInput::make('width')
                                    ->label('Width (mm)')
                                    ->numeric()
                                    ->default(60)
                                    ->step(0.5),

                                TextInput::make('font_size')
                                    ->label('Font Size')
                                    ->numeric()
                                    ->default(9)
                                    ->minValue(5)
                                    ->maxValue(24),

                                TextInput::make('max_height')
                                    ->label('Line Height (mm)')
                                    ->numeric()
                                    ->default(4)
                                    ->step(0.5)
                                    ->helperText('For multi-line text'),

                                Select::make('alignment')
                                    ->label('Align')
                                    ->options([
                                        'L' => 'Left',
                                        'C' => 'Center',
                                        'R' => 'Right',
                                    ])
                                    ->default('L'),
                            ])
                            ->columns(8)
                            ->reorderable()
                            ->collapsible()
                            ->cloneable()
                            ->addActionLabel('Add Field Mapping')
                            ->itemLabel(function (array $state): ?string {
                                $vars = collect(InvoiceTemplate::availableVariables())
                                    ->pluck('label', 'key')
                                    ->toArray();
                                return $vars[$state['variable'] ?? ''] ?? ($state['variable'] ?? 'New Mapping');
                            }),
                    ]),
            ])
            ->statePath('templateData');
    }

    public function generateForm(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Generate Invoice PDF')
                    ->description('Select a Xero invoice and fill in any additional details, then generate the filled PDF.')
                    ->schema([
                        Select::make('data_source')
                            ->label('Data Source')
                            ->options([
                                'xero'   => 'Xero Invoice',
                                'manual' => 'Manual Entry',
                            ])
                            ->default('xero')
                            ->reactive()
                            ->required(),

                        Select::make('xero_invoice_id')
                            ->label('Xero Invoice')
                            ->options(function () {
                                try {
                                    $xero = app(XeroService::class);
                                    $invoices = $xero->listInvoicesForDropdown();
                                    return collect($invoices)->mapWithKeys(fn ($inv) => [
                                        $inv['id'] => "{$inv['number']} — {$inv['contact']} — Rs. {$inv['total']} ({$inv['status']})",
                                    ])->toArray();
                                } catch (\Throwable $e) {
                                    Log::warning('Failed to load Xero invoices for dropdown', ['error' => $e->getMessage()]);
                                    return [];
                                }
                            })
                            ->searchable()
                            ->visible(fn (callable $get) => $get('data_source') === 'xero')
                            ->helperText('Select the Xero invoice to pull data from.'),

                        // Manual entry fields (shown when data_source = 'manual')
                        Grid::make(2)
                            ->schema([
                                TextInput::make('manual_invoice_number')
                                    ->label('Invoice Number'),
                                TextInput::make('manual_invoice_date')
                                    ->label('Invoice Date')
                                    ->placeholder('YYYY-MM-DD'),
                                TextInput::make('manual_purchaser_name')
                                    ->label('Purchaser Name'),
                                TextInput::make('manual_purchaser_tin')
                                    ->label('Purchaser TIN'),
                                TextInput::make('manual_purchaser_address')
                                    ->label('Purchaser Address'),
                                TextInput::make('manual_purchaser_phone')
                                    ->label('Purchaser Phone'),
                                TextInput::make('manual_subtotal')
                                    ->label('Subtotal')
                                    ->numeric(),
                                TextInput::make('manual_vat_amount')
                                    ->label('VAT Amount')
                                    ->numeric(),
                                TextInput::make('manual_total')
                                    ->label('Total')
                                    ->numeric(),
                            ])
                            ->visible(fn (callable $get) => $get('data_source') === 'manual'),

                        // Always-visible override fields
                        Grid::make(3)
                            ->schema([
                                TextInput::make('delivery_date')
                                    ->label('Date of Delivery')
                                    ->placeholder('YYYY-MM-DD'),
                                TextInput::make('reference')
                                    ->label('Reference / PO No.'),
                                TextInput::make('place_of_supply')
                                    ->label('Place of Supply')
                                    ->placeholder('e.g. Colombo'),
                            ]),

                        Textarea::make('additional_info')
                            ->label('Additional Information')
                            ->rows(2),

                        Select::make('payment_mode')
                            ->label('Mode of Payment')
                            ->options([
                                'Cheque' => 'Cheque',
                                'Bank Transfer' => 'Bank Transfer',
                            ])
                            ->placeholder('Select payment mode')
                            ->default('Bank Transfer'),
                    ])
                    ->columns(1),
            ])
            ->statePath('generateData');
    }

    /**
     * Save the template configuration.
     */
    public function saveTemplate(): void
    {
        $data = $this->templateForm->getState();

        $templateData = [
            'name'     => $data['name'],
            'mappings' => $data['mappings'] ?? [],
        ];

        // Handle PDF upload
        if (!empty($data['pdf_upload'])) {
            $templateData['pdf_path'] = $data['pdf_upload'];
        }

        if ($this->activeTemplateId) {
            $template = InvoiceTemplate::find($this->activeTemplateId);
            if ($template) {
                $template->update($templateData);
            }
        } else {
            // For new templates, pdf_path is required
            if (empty($templateData['pdf_path'])) {
                Notification::make()
                    ->title('Please upload a PDF template file.')
                    ->danger()
                    ->send();
                return;
            }
            $templateData['is_default'] = true;
            $template = InvoiceTemplate::create($templateData);
            $this->activeTemplateId = $template->id;
        }

        Notification::make()
            ->title('Template saved successfully.')
            ->success()
            ->send();
    }

    /**
     * Generate and download the filled PDF.
     */
    public function generatePdf()
    {
        $this->saveTemplate();

        $genData = $this->generateForm->getState();

        $template = InvoiceTemplate::find($this->activeTemplateId);
        if (!$template) {
            Notification::make()
                ->title('No template configured. Please save a template first.')
                ->danger()
                ->send();
            return;
        }

        if (!$template->pdf_path || !file_exists($template->absolute_pdf_path)) {
            Notification::make()
                ->title('Template PDF file not found. Please re-upload the template.')
                ->danger()
                ->send();
            return;
        }

        $pdfService = app(InvoicePdfService::class);

        $overrides = [
            'delivery_date'   => $genData['delivery_date'] ?? '',
            'reference'       => $genData['reference'] ?? '',
            'place_of_supply' => $genData['place_of_supply'] ?? '110-3/1, Havelock Road, Colombo 05',
            'additional_info' => $genData['additional_info'] ?? '',
            'payment_mode'    => $genData['payment_mode'] ?? '',
        ];

        try {
            if (($genData['data_source'] ?? 'xero') === 'xero') {
                // Xero-based generation
                $xeroInvoiceId = $genData['xero_invoice_id'] ?? '';
                if (empty($xeroInvoiceId)) {
                    Notification::make()
                        ->title('Please select a Xero invoice.')
                        ->warning()
                        ->send();
                    return;
                }

                $xero = app(XeroService::class);
                $invoiceDetail = $xero->getInvoiceDetail($xeroInvoiceId);
                $data = $pdfService->buildDataFromXeroInvoice($invoiceDetail, $overrides);
            } else {
                // Manual entry
                $data = [
                    'invoice_date'     => !empty($genData['manual_invoice_date'])
                        ? (preg_match('/^\d{4}-\d{2}-\d{2}$/', $genData['manual_invoice_date'])
                            ? \Carbon\Carbon::parse($genData['manual_invoice_date'])->format('m/d/Y')
                            : $genData['manual_invoice_date'])
                        : '',
                    'invoice_number'   => $pdfService->formatInvoiceSerialNumber(
                        $genData['manual_invoice_number'] ?? '',
                        $genData['manual_invoice_date'] ?? null
                    ),
                    'reference'        => $overrides['reference'],
                    'supplier_tin'     => SystemSetting::get('company_tin', '103262879'),
                    'supplier_name'    => SystemSetting::get('company_name', 'WHITE STAR WEB SOLUTIONS PVT LTD'),
                    'supplier_address' => SystemSetting::get('company_address', '110-3/1, Havelock Road, Colombo 05'),
                    'supplier_phone'   => SystemSetting::get('company_phone', '0776273901'),
                    'purchaser_tin'    => $genData['manual_purchaser_tin'] ?? '',
                    'purchaser_name'   => $genData['manual_purchaser_name'] ?? '',
                    'purchaser_address'=> $genData['manual_purchaser_address'] ?? '',
                    'purchaser_phone'  => $genData['manual_purchaser_phone'] ?? '',
                    'delivery_date'    => !empty($overrides['delivery_date']) ? $overrides['delivery_date'] : (!empty($genData['manual_invoice_date']) ? (preg_match('/^\d{4}-\d{2}-\d{2}$/', $genData['manual_invoice_date']) ? \Carbon\Carbon::parse($genData['manual_invoice_date'])->format('m/d/Y') : $genData['manual_invoice_date']) : ''),
                    'place_of_supply'  => $overrides['place_of_supply'],
                    'additional_info'  => $overrides['additional_info'],
                    'subtotal'         => number_format((float) ($genData['manual_subtotal'] ?? 0), 2),
                    'vat_rate'         => '18%',
                    'vat_amount'       => number_format((float) ($genData['manual_vat_amount'] ?? 0), 2),
                    'total_with_vat'   => number_format((float) ($genData['manual_total'] ?? 0), 2),
                    'total_in_words'   => '',
                    'payment_mode'     => $overrides['payment_mode'],
                ];
            }

            $pdfContent = $pdfService->generate($template, $data);
            $filename   = 'Tax_Invoice_' . ($data['invoice_number'] ?? 'draft') . '_' . now()->format('Ymd_His') . '.pdf';

            return response()->streamDownload(function () use ($pdfContent) {
                echo $pdfContent;
            }, $filename, [
                'Content-Type' => 'application/pdf',
            ]);

        } catch (\Throwable $e) {
            Log::error('Invoice PDF generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            Notification::make()
                ->title('PDF generation failed: ' . $e->getMessage())
                ->danger()
                ->send();
        }
    }

    /**
     * Generate a preview with sample data.
     */
    public function previewPdf()
    {
        $this->saveTemplate();

        $template = InvoiceTemplate::find($this->activeTemplateId);
        if (!$template) {
            Notification::make()
                ->title('No template configured. Please save a template first.')
                ->danger()
                ->send();
            return;
        }

        if (!$template->pdf_path || !file_exists($template->absolute_pdf_path)) {
            Notification::make()
                ->title('Template PDF file not found. Please re-upload.')
                ->danger()
                ->send();
            return;
        }

        $pdfService = app(InvoicePdfService::class);

        // Sample data for preview
        $sampleData = [
            'invoice_date'     => now()->format('m/d/Y'),
            'reference'        => 'PO 4562379790',
            'invoice_number'   => $pdfService->formatInvoiceSerialNumber('TI-0001', now()->toDateString()),
            'supplier_tin'     => SystemSetting::get('company_tin', '103262879'),
            'supplier_name'    => SystemSetting::get('company_name', 'WHITE STAR WEB SOLUTIONS PVT LTD'),
            'supplier_address' => SystemSetting::get('company_address', '110-3/1, Havelock Road, Colombo 05'),
            'supplier_phone'   => SystemSetting::get('company_phone', '0776273901'),
            'purchaser_tin'    => '987654321-7000',
            'purchaser_name'   => 'Sample Client Ltd',
            'purchaser_address'=> 'No. 5, Galle Road, Colombo 04',
            'purchaser_phone'  => '+94 11 987 6543',
            'delivery_date'    => now()->format('m/d/Y'),
            'place_of_supply'  => '110-3/1, Havelock Road, Colombo 05',
            'additional_info'  => 'Sample preview — not a real invoice',
            'item_1_ref'       => '1',
            'item_1_description' => 'Web Design & Development',
            'item_1_quantity'  => '1',
            'item_1_unit_price'=> '250,000.00',
            'item_1_amount'    => '250,000.00',
            'item_2_ref'       => '2',
            'item_2_description' => 'SEO Optimization Package',
            'item_2_quantity'  => '1',
            'item_2_unit_price'=> '50,000.00',
            'item_2_amount'    => '50,000.00',
            'subtotal'         => '300,000.00',
            'vat_rate'         => '18%',
            'vat_amount'       => '54,000.00',
            'total_with_vat'   => '354,000.00',
            'total_in_words'   => 'Three Hundred and Fifty Four Thousand Only',
            'payment_mode'     => 'Bank Transfer',
        ];

        try {
            $pdfContent = $pdfService->generate($template, $sampleData);
            $filename   = 'Invoice_Preview_' . now()->format('Ymd_His') . '.pdf';

            return response()->streamDownload(function () use ($pdfContent) {
                echo $pdfContent;
            }, $filename, [
                'Content-Type' => 'application/pdf',
            ]);

        } catch (\Throwable $e) {
            Log::error('Invoice PDF preview failed', ['error' => $e->getMessage()]);
            Notification::make()
                ->title('Preview failed: ' . $e->getMessage())
                ->danger()
                ->send();
        }
    }

    /**
     * Delete the current template.
     */
    public function deleteTemplate(): void
    {
        if ($this->activeTemplateId) {
            $template = InvoiceTemplate::find($this->activeTemplateId);
            if ($template) {
                // Delete the uploaded PDF file
                if ($template->pdf_path) {
                    Storage::disk('local')->delete($template->pdf_path);
                }
                $template->delete();
            }
            $this->activeTemplateId = null;
            $this->templateForm->fill(['name' => '', 'mappings' => []]);

            Notification::make()
                ->title('Template deleted.')
                ->success()
                ->send();
        }
    }

    /**
     * List available templates for switching.
     */
    public function getTemplatesProperty(): \Illuminate\Database\Eloquent\Collection
    {
        return InvoiceTemplate::orderBy('is_default', 'desc')->orderBy('name')->get();
    }

    /**
     * Switch to a different template.
     */
    public function switchTemplate(int $templateId): void
    {
        $template = InvoiceTemplate::findOrFail($templateId);
        $this->activeTemplateId = $template->id;
        $this->templateForm->fill([
            'name'     => $template->name,
            'mappings' => $template->mappings ?? [],
        ]);

        Notification::make()
            ->title("Switched to: {$template->name}")
            ->info()
            ->send();
    }

    /**
     * Create a new blank template.
     */
    public function newTemplate(): void
    {
        $this->activeTemplateId = null;
        $this->templateForm->fill(['name' => '', 'mappings' => []]);
    }

    /**
     * Get the active template PDF URL.
     */
    public function getActivePdfUrlProperty(): ?string
    {
        if (!$this->activeTemplateId) {
            return null;
        }
        $template = InvoiceTemplate::find($this->activeTemplateId);
        if (!$template || !$template->pdf_path || !file_exists($template->absolute_pdf_path)) {
            return null;
        }
        return route('admin.invoice-templates.pdf', ['invoiceTemplate' => $this->activeTemplateId]);
    }

    /**
     * Add a field mapping row via coordinate click.
     */
    public function addMappingAtCoordinates(float $x, float $y, string $variable): void
    {
        $mappings = $this->templateData['mappings'] ?? [];
        
        // Check if variable already exists in mappings, if so, update coordinates
        $updated = false;
        foreach ($mappings as &$mapping) {
            if (($mapping['variable'] ?? '') === $variable) {
                $mapping['x'] = round($x, 1);
                $mapping['y'] = round($y, 1);
                $updated = true;
                break;
            }
        }

        if (!$updated) {
            $mappings[] = [
                'variable' => $variable,
                'x' => round($x, 1),
                'y' => round($y, 1),
                'width' => 60,
                'font_size' => 9,
                'max_height' => 4,
                'alignment' => 'L',
            ];
        }

        $this->templateData['mappings'] = $mappings;

        // Re-fill the form with the new data
        $this->templateForm->fill($this->templateData);

        // Persist immediately to the database
        if ($this->activeTemplateId) {
            $template = InvoiceTemplate::find($this->activeTemplateId);
            if ($template) {
                $template->update([
                    'mappings' => $mappings,
                ]);
            }
        }

        $message = $updated 
            ? "Updated variable '{$variable}' coordinates to X: {$x}mm, Y: {$y}mm"
            : "Placed variable '{$variable}' at X: {$x}mm, Y: {$y}mm";

        Notification::make()
            ->title($message)
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('new_template')
                ->label('New Template')
                ->icon('heroicon-o-plus')
                ->action(fn () => $this->newTemplate())
                ->color('gray'),
        ];
    }
}
