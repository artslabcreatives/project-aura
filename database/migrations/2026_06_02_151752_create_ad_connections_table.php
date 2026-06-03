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
        Schema::create('ad_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_profile_id')->constrained()->cascadeOnDelete();
            $table->string('platform'); // 'google', 'linkedin', 'tiktok', 'semrush'
            $table->string('account_id')->nullable(); // External API account ID
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_connections');
    }
};
