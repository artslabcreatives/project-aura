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
        Schema::table('estimates', function (Blueprint $table) {
            $table->date('issue_date')->nullable()->after('notes');
            $table->date('valid_until')->nullable()->after('issue_date');
            $table->string('currency', 3)->default('USD')->after('valid_until');
            $table->decimal('tax_rate', 5, 2)->default(0)->after('currency');
            $table->decimal('subtotal', 12, 2)->default(0)->after('tax_rate');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('subtotal');
            $table->decimal('total', 12, 2)->default(0)->after('tax_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estimates', function (Blueprint $table) {
            $table->dropColumn(['issue_date', 'valid_until', 'currency', 'tax_rate', 'subtotal', 'tax_amount', 'total']);
        });
    }
};
