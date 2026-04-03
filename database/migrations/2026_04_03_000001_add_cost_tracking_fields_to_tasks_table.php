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
            if (!Schema::hasColumn('tasks', 'hourly_rate')) {
                $table->decimal('hourly_rate', 10, 2)->nullable()->after('estimated_hours');
            }
            if (!Schema::hasColumn('tasks', 'actual_hours_worked')) {
                $table->decimal('actual_hours_worked', 10, 2)->default(0)->after('hourly_rate');
            }
            if (!Schema::hasColumn('tasks', 'task_cost')) {
                $table->decimal('task_cost', 15, 2)->nullable()->after('actual_hours_worked');
            }
            // Note: completed_at and started_at already exist in tasks table
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('tasks', 'hourly_rate')) {
                $columns[] = 'hourly_rate';
            }
            if (Schema::hasColumn('tasks', 'actual_hours_worked')) {
                $columns[] = 'actual_hours_worked';
            }
            if (Schema::hasColumn('tasks', 'task_cost')) {
                $columns[] = 'task_cost';
            }
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
