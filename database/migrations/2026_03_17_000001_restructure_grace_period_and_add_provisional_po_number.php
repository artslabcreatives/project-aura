<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Phase 1: drop old columns / FK if they still exist from a prior partial run
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'grace_period_approved_by')) {
                // Check whether the FK constraint still exists via raw query
                $fkExists = DB::selectOne(
                    "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
                     WHERE TABLE_SCHEMA = DATABASE()
                       AND TABLE_NAME    = 'projects'
                       AND CONSTRAINT_NAME = 'projects_grace_period_approved_by_foreign'
                       AND CONSTRAINT_TYPE = 'FOREIGN KEY'"
                );
                if ($fkExists) {
                    $table->dropForeign(['grace_period_approved_by']);
                }
                $table->dropColumn('grace_period_approved_by');
            }
            if (Schema::hasColumn('projects', 'grace_period_days')) {
                $table->dropColumn('grace_period_days');
            }
            if (Schema::hasColumn('projects', 'grace_period_started_at')) {
                $table->dropColumn('grace_period_started_at');
            }
        });

        // Phase 2: add new columns that may not exist yet
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'grace_period_expires_at')) {
                $table->date('grace_period_expires_at')->nullable()->after('is_locked_by_po');
            }
            if (!Schema::hasColumn('projects', 'grace_period_notes')) {
                $table->text('grace_period_notes')->nullable()->after('grace_period_expires_at');
            }
            if (!Schema::hasColumn('projects', 'grace_period_approved_by')) {
                $table->foreignId('grace_period_approved_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete()
                    ->after('grace_period_notes');
            } else {
                // Column exists from partial run — just add the FK constraint
                $table->foreign('grace_period_approved_by')
                    ->references('id')->on('users')
                    ->nullOnDelete();
            }
            if (!Schema::hasColumn('projects', 'provisional_po_number')) {
                $table->string('provisional_po_number')->nullable()->after('grace_period_approved_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['grace_period_approved_by']);
            $table->dropColumn([
                'grace_period_expires_at',
                'grace_period_notes',
                'grace_period_approved_by',
                'provisional_po_number',
            ]);

            $table->unsignedInteger('grace_period_days')->nullable();
            $table->timestamp('grace_period_started_at')->nullable();
            $table->foreignId('grace_period_approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
        });
    }
};
