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
        Schema::create('stages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('color')->default('bg-gray-500');
            $table->integer('order')->default(0);
            $table->enum('type', ['user', 'project'])->default('project');
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('main_responsible_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('backup_responsible_id_1')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('backup_responsible_id_2')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_review_stage')->default(false);
            $table->foreignId('linked_review_stage_id')->nullable()->constrained('stages')->nullOnDelete();
            $table->foreignId('approved_target_stage_id')->nullable()->constrained('stages')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stages');
    }
};
