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
            $table->decimal('total_revenue', 15, 2)->nullable()->after('currency');
            $table->decimal('total_cost', 15, 2)->nullable()->after('total_revenue');
            $table->decimal('actual_profit', 15, 2)->nullable()->after('total_cost');
            $table->decimal('profit_margin_percentage', 5, 2)->nullable()->after('actual_profit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'total_revenue',
                'total_cost',
                'actual_profit',
                'profit_margin_percentage',
            ]);
        });
    }
};
