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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('xero_invoice_id')->nullable()->after('invoice_number');
            $table->decimal('invoice_total', 15, 2)->nullable()->after('xero_invoice_id');
            $table->string('invoice_status')->nullable()->after('invoice_total');
            $table->date('invoice_date')->nullable()->after('invoice_status');
            $table->date('invoice_due_date')->nullable()->after('invoice_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['xero_invoice_id', 'invoice_total', 'invoice_status', 'invoice_date', 'invoice_due_date']);
        });
    }
};
