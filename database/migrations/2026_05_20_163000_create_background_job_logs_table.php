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
        Schema::create('background_job_logs', function (Blueprint $table) {
            $table->id();
            $table->string('command');
            $table->string('runner'); // 'automatic' or 'manual'
            $table->string('status'); // 'success' or 'failed'
            $table->longText('output')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('background_job_logs');
    }
};
