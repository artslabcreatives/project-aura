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
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_interval')->nullable(); // daily, weekly, monthly, custom, on_completion
            $table->json('recurrence_custom_days')->nullable(); // e.g. [1,3,5]
            $table->timestamp('next_recurrence_at')->nullable();
            $table->timestamp('recurrence_end_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'is_recurring',
                'recurrence_interval',
                'recurrence_custom_days',
                'next_recurrence_at',
                'recurrence_end_at',
            ]);
        });
    }
};
