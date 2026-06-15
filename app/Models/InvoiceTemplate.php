<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'pdf_path',
        'mappings',
        'is_default',
    ];

    protected $casts = [
        'mappings'   => 'array',
        'is_default' => 'boolean',
    ];

    /**
     * Get the full storage path to the PDF template file.
     */
    public function getAbsolutePdfPathAttribute(): string
    {
        return storage_path('app/' . $this->pdf_path);
    }

    /**
     * Get the default template, or the first one available.
     */
    public static function getDefault(): ?self
    {
        return static::where('is_default', true)->first()
            ?? static::first();
    }

    /**
     * Returns the list of all available template variables with their descriptions.
     */
    public static function availableVariables(): array
    {
        return [
            // Header
            ['key' => 'invoice_date',       'label' => 'Date of Invoice',          'group' => 'Header'],
            ['key' => 'invoice_number',     'label' => 'Tax Invoice No.',          'group' => 'Header'],

            // Supplier (your company)
            ['key' => 'supplier_tin',       'label' => "Supplier's TIN",           'group' => 'Supplier'],
            ['key' => 'supplier_name',      'label' => "Supplier's Name",          'group' => 'Supplier'],
            ['key' => 'supplier_address',   'label' => "Supplier's Address",       'group' => 'Supplier'],
            ['key' => 'supplier_phone',     'label' => "Supplier's Telephone No.", 'group' => 'Supplier'],

            // Purchaser (client)
            ['key' => 'purchaser_tin',      'label' => "Purchaser's TIN",          'group' => 'Purchaser'],
            ['key' => 'purchaser_name',     'label' => "Purchaser's Name",         'group' => 'Purchaser'],
            ['key' => 'purchaser_address',  'label' => "Purchaser's Address",      'group' => 'Purchaser'],
            ['key' => 'purchaser_phone',    'label' => "Purchaser's Telephone No.",'group' => 'Purchaser'],

            // Details
            ['key' => 'delivery_date',      'label' => 'Date of Delivery',         'group' => 'Details'],
            ['key' => 'place_of_supply',    'label' => 'Place of Supply',          'group' => 'Details'],
            ['key' => 'additional_info',    'label' => 'Additional Information',   'group' => 'Details'],

            // Line Items (dynamic rows)
            ['key' => 'item_1_ref',         'label' => 'Item 1 — Reference',       'group' => 'Line Items'],
            ['key' => 'item_1_description', 'label' => 'Item 1 — Description',     'group' => 'Line Items'],
            ['key' => 'item_1_quantity',    'label' => 'Item 1 — Quantity',         'group' => 'Line Items'],
            ['key' => 'item_1_unit_price',  'label' => 'Item 1 — Unit Price',      'group' => 'Line Items'],
            ['key' => 'item_1_amount',      'label' => 'Item 1 — Amount',          'group' => 'Line Items'],

            ['key' => 'item_2_ref',         'label' => 'Item 2 — Reference',       'group' => 'Line Items'],
            ['key' => 'item_2_description', 'label' => 'Item 2 — Description',     'group' => 'Line Items'],
            ['key' => 'item_2_quantity',    'label' => 'Item 2 — Quantity',         'group' => 'Line Items'],
            ['key' => 'item_2_unit_price',  'label' => 'Item 2 — Unit Price',      'group' => 'Line Items'],
            ['key' => 'item_2_amount',      'label' => 'Item 2 — Amount',          'group' => 'Line Items'],

            ['key' => 'item_3_ref',         'label' => 'Item 3 — Reference',       'group' => 'Line Items'],
            ['key' => 'item_3_description', 'label' => 'Item 3 — Description',     'group' => 'Line Items'],
            ['key' => 'item_3_quantity',    'label' => 'Item 3 — Quantity',         'group' => 'Line Items'],
            ['key' => 'item_3_unit_price',  'label' => 'Item 3 — Unit Price',      'group' => 'Line Items'],
            ['key' => 'item_3_amount',      'label' => 'Item 3 — Amount',          'group' => 'Line Items'],

            ['key' => 'item_4_ref',         'label' => 'Item 4 — Reference',       'group' => 'Line Items'],
            ['key' => 'item_4_description', 'label' => 'Item 4 — Description',     'group' => 'Line Items'],
            ['key' => 'item_4_quantity',    'label' => 'Item 4 — Quantity',         'group' => 'Line Items'],
            ['key' => 'item_4_unit_price',  'label' => 'Item 4 — Unit Price',      'group' => 'Line Items'],
            ['key' => 'item_4_amount',      'label' => 'Item 4 — Amount',          'group' => 'Line Items'],

            ['key' => 'item_5_ref',         'label' => 'Item 5 — Reference',       'group' => 'Line Items'],
            ['key' => 'item_5_description', 'label' => 'Item 5 — Description',     'group' => 'Line Items'],
            ['key' => 'item_5_quantity',    'label' => 'Item 5 — Quantity',         'group' => 'Line Items'],
            ['key' => 'item_5_unit_price',  'label' => 'Item 5 — Unit Price',      'group' => 'Line Items'],
            ['key' => 'item_5_amount',      'label' => 'Item 5 — Amount',          'group' => 'Line Items'],

            // Totals
            ['key' => 'subtotal',           'label' => 'Total Value of Supply (excl. VAT)', 'group' => 'Totals'],
            ['key' => 'vat_rate',           'label' => 'VAT Rate (%)',              'group' => 'Totals'],
            ['key' => 'vat_amount',         'label' => 'VAT Amount',                'group' => 'Totals'],
            ['key' => 'total_with_vat',     'label' => 'Total (incl. VAT)',         'group' => 'Totals'],
            ['key' => 'total_in_words',     'label' => 'Total Amount in Words',     'group' => 'Totals'],

            // Footer
            ['key' => 'payment_mode',       'label' => 'Mode of Payment',           'group' => 'Footer'],
        ];
    }
}
