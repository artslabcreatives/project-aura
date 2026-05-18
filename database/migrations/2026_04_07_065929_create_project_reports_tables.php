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
        Schema::create('project_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_url')->nullable();
            $table->enum('status', ['draft', 'submitted', 'tl_approved', 'approved', 'rejected'])->default('draft');
            $table->timestamp('tl_approved_at')->nullable();
            $table->timestamp('hr_approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignId('tl_user_id')->nullable()->constrained('users');
            $table->foreignId('hr_user_id')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('report_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('project_reports')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('activity_type'); // comment, status_change
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_activities');
        Schema::dropIfExists('project_reports');
    }
};
