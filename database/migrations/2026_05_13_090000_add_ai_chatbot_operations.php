<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_chatbot_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('ai_chatbot_sessions', 'mode')) {
                $table->string('mode')->default('operations')->after('status');
            }

            if (!Schema::hasColumn('ai_chatbot_sessions', 'memory_summary')) {
                $table->longText('memory_summary')->nullable()->after('context_snapshot');
            }
        });

        Schema::create('ai_chatbot_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('ai_chatbot_sessions')->cascadeOnDelete();
            $table->foreignId('message_id')->nullable()->constrained('ai_chatbot_messages')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('disk')->default('local');
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->longText('extracted_text')->nullable();
            $table->json('ai_payload')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_chatbot_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('ai_chatbot_sessions')->cascadeOnDelete();
            $table->foreignId('message_id')->nullable()->constrained('ai_chatbot_messages')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type');
            $table->string('status')->default('pending');
            $table->json('request_payload')->nullable();
            $table->json('result_payload')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_chatbot_followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('mattermost_channel_id')->nullable();
            $table->string('mattermost_post_id')->nullable();
            $table->string('status')->default('sent');
            $table->text('summary')->nullable();
            $table->timestamp('last_prompted_at')->nullable();
            $table->timestamp('last_response_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chatbot_followups');
        Schema::dropIfExists('ai_chatbot_actions');
        Schema::dropIfExists('ai_chatbot_attachments');

        Schema::table('ai_chatbot_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('ai_chatbot_sessions', 'memory_summary')) {
                $table->dropColumn('memory_summary');
            }

            if (Schema::hasColumn('ai_chatbot_sessions', 'mode')) {
                $table->dropColumn('mode');
            }
        });
    }
};
