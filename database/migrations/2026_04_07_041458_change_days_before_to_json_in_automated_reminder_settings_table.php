<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('automated_reminder_settings', function (Blueprint $table) {
            $table->json('days_before')->change()->nullable();
        });

        // Set default to [7, 3, 1]
        DB::table('automated_reminder_settings')->where('type', 'grace_period_expiry')->update([
            'days_before' => json_encode([7, 3, 1])
        ]);

        Schema::table('projects', function (Blueprint $table) {
            $table->json('manual_reminder_days')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('automated_reminder_settings', function (Blueprint $table) {
            $table->integer('days_before')->change()->default(7);
        });
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('manual_reminder_days');
        });
    }
};
