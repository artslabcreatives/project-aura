<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('type', ['receipt', 'expense', 'invoice']);
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->text('description')->nullable();
            $table->date('expense_date');

            // Receipt / document upload
            $table->string('receipt_file_path')->nullable();

            // Approval workflow
            // pending   = submitted, awaiting team-lead / admin approval
            // approved  = visible in finance interface
            // rejected  = declined with a reason
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            // Reimbursement flags
            $table->boolean('is_reimbursable')->default(false);  // employee paid personally
            $table->boolean('reimbursement_noted')->default(false); // user acknowledged Jothika entry

            // Xero reference (read-only tracking, no writes to Xero)
            $table->string('xero_expense_id')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_expenses');
    }
};
