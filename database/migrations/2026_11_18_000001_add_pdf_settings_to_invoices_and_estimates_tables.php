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
            $table->string('pdf_payment_mode')->nullable()->after('description');
            $table->unsignedInteger('pdf_due_days')->nullable()->after('pdf_payment_mode');
            $table->string('pdf_reference')->nullable()->after('pdf_due_days');
            $table->string('pdf_discount_type', 20)->nullable()->after('pdf_reference');
            $table->decimal('pdf_discount_value', 12, 2)->nullable()->after('pdf_discount_type');
            $table->text('pdf_additional_info')->nullable()->after('pdf_discount_value');
        });

        Schema::table('estimates', function (Blueprint $table) {
            $table->string('pdf_payment_mode')->nullable()->after('notes');
            $table->unsignedInteger('pdf_due_days')->nullable()->after('pdf_payment_mode');
            $table->string('pdf_reference')->nullable()->after('pdf_due_days');
            $table->string('pdf_discount_type', 20)->nullable()->after('pdf_reference');
            $table->decimal('pdf_discount_value', 12, 2)->nullable()->after('pdf_discount_type');
            $table->text('pdf_additional_info')->nullable()->after('pdf_discount_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'pdf_payment_mode',
                'pdf_due_days',
                'pdf_reference',
                'pdf_discount_type',
                'pdf_discount_value',
                'pdf_additional_info',
            ]);
        });

        Schema::table('estimates', function (Blueprint $table) {
            $table->dropColumn([
                'pdf_payment_mode',
                'pdf_due_days',
                'pdf_reference',
                'pdf_discount_type',
                'pdf_discount_value',
                'pdf_additional_info',
            ]);
        });
    }
};
