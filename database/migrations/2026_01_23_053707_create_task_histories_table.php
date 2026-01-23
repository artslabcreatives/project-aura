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
        Schema::create('task_histories', function (Blueprint $table) {
            $table->id();

			//create move revert update archive complete
			$table->string('action');

			$table->text('details')->nullable();

			$table->json('previous_details')->nullable();

			//incoming user
			$table->foreignId('incoming_user_id')->nullable()->constrained('users')->onDelete('set null');
			//outgoing user
			$table->foreignId('outgoing_user_id')->nullable()->constrained('users')->onDelete('set null');

			//incoming stage
			$table->foreignId('incoming_stage_id')->nullable()->constrained('stages')->onDelete('set null');
			//outgoing stage
			$table->foreignId('outgoing_stage_id')->nullable()->constrained('stages')->onDelete('set null');

			$table->foreignId('task_id')->constrained()->onDelete('cascade');
			$table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_histories');
    }
};
