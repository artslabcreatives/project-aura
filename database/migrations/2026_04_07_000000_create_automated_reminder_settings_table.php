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
        Schema::create('automated_reminder_settings', function (Blueprint $table) {
            $table->id();
            $table->string('type')->unique(); // e.g., 'grace_period_expiry'
            $table->string('label'); // Human readable name
            $table->integer('days_before')->default(7);
            $table->integer('frequency_days')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default setting for grace period expiry
        DB::table('automated_reminder_settings')->insert([
            'type' => 'grace_period_expiry',
            'label' => 'Grace Period Expiry Reminder',
            'days_before' => 7,
            'frequency_days' => 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Add override columns to projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->date('manual_reminder_date')->nullable();
            $table->integer('manual_reminder_frequency_days')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['manual_reminder_date', 'manual_reminder_frequency_days']);
        });
        Schema::dropIfExists('automated_reminder_settings');
    }
};
