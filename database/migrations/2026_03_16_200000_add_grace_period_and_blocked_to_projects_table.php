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
            // Grace period system (Task 6)
            $table->unsignedInteger('grace_period_days')->nullable()->after('is_locked_by_po');
            $table->timestamp('grace_period_started_at')->nullable()->after('grace_period_days');
            $table->foreignId('grace_period_approved_by')->nullable()->constrained('users')->nullOnDelete()->after('grace_period_started_at');

            // Provisional PO expiry (Task 7)
            $table->date('provisional_po_expires_at')->nullable()->after('grace_period_approved_by');

            // Manual blocking (Task 9)
            $table->boolean('is_manually_blocked')->default(false)->after('provisional_po_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['grace_period_approved_by']);
            $table->dropColumn([
                'grace_period_days',
                'grace_period_started_at',
                'grace_period_approved_by',
                'provisional_po_expires_at',
                'is_manually_blocked',
            ]);
        });
    }
};
