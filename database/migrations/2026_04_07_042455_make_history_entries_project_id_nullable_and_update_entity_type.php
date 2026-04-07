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
        Schema::table('history_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->change();
            $table->string('entity_type')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->change(); // Might need to ensure data is clean
            $table->enum('entity_type', ['task', 'stage', 'project'])->change();
        });
    }
};
