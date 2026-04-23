<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->enum('source', ['manual', 'xero'])->default('manual')->index();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('invoice_number')->nullable();
            $table->string('status')->nullable()->index();
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('currency', 10)->default('USD');
            $table->timestamp('issued_at')->nullable();
            $table->date('due_date')->nullable();
            $table->string('xero_invoice_id')->nullable()->unique();
            $table->string('xero_status')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Tag existing xero invoice references from projects table into the invoices table
        // Projects that have an invoice_number are treated as manual invoices
        $projects = DB::table('projects')
            ->whereNotNull('invoice_number')
            ->select('id', 'invoice_number', 'client_id', 'currency')
            ->get();

        foreach ($projects as $project) {
            DB::table('invoices')->insert([
                'source' => 'manual',
                'project_id' => $project->id,
                'client_id' => $project->client_id,
                'invoice_number' => $project->invoice_number,
                'currency' => $project->currency ?? 'USD',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
