<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Xero Quote ID and last-synced timestamp on the estimates table
        Schema::table('estimates', function (Blueprint $table) {
            $table->string('xero_estimate_id')->nullable()->unique()->after('id');
            $table->string('estimate_number')->nullable()->after('xero_estimate_id');
            $table->timestamp('xero_last_synced_at')->nullable()->after('updated_at');
        });

        // Single-row table to persist the Xero OAuth2 tokens for this organisation
        Schema::create('xero_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('tenant_name')->nullable();
            $table->text('access_token');
            $table->text('refresh_token');
            $table->timestamp('token_expires_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('estimates', function (Blueprint $table) {
            $table->dropColumn(['xero_estimate_id', 'estimate_number', 'xero_last_synced_at']);
        });

        Schema::dropIfExists('xero_tokens');
    }
};
