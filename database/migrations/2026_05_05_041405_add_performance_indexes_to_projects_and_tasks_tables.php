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
            $table->index('deadline');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->index('is_in_specific_stage');
            $table->index('completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['deadline']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['is_in_specific_stage']);
            $table->dropIndex(['completed_at']);
        });
    }
};
