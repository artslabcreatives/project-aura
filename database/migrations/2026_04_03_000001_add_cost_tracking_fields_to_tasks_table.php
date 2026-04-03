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
        Schema::table('tasks', function (Blueprint $table) {
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('estimated_hours');
            $table->decimal('actual_hours_worked', 10, 2)->default(0)->after('hourly_rate');
            $table->decimal('task_cost', 15, 2)->nullable()->after('actual_hours_worked');
            // Note: completed_at already exists in tasks table, no need to add it again
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'hourly_rate',
                'actual_hours_worked',
                'task_cost',
            ]);
        });
    }
};
