<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_chatbot_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->enum('status', ['active', 'completed', 'archived'])->default('active');
            $table->json('context_snapshot')->nullable();
            $table->json('discovered_scenarios')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('ai_chatbot_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('ai_chatbot_sessions')->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant', 'system']);
            $table->longText('content');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_scenario_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->nullable()->constrained('ai_chatbot_sessions')->nullOnDelete();
            $table->string('scenario_key')->unique();
            $table->string('scenario_title');
            $table->text('scenario_description')->nullable();
            $table->json('conditions')->nullable();
            $table->json('boundaries')->nullable();
            $table->json('notifications')->nullable();
            $table->json('reactions')->nullable();
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_scenario_policies');
        Schema::dropIfExists('ai_chatbot_messages');
        Schema::dropIfExists('ai_chatbot_sessions');
    }
};
