<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('invoice_document')->nullable()->after('invoice_number');
            $table->boolean('is_physical_invoice')->default(false)->after('invoice_document');
            $table->string('courier_tracking_number')->nullable()->after('is_physical_invoice');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['invoice_document', 'is_physical_invoice', 'courier_tracking_number']);
        });
    }
};
