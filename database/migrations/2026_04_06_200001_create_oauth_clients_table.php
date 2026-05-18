<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oauth_clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('client_id', 80)->unique();
            $table->text('client_secret')->nullable(); // null = public client (PKCE only), stored encrypted
            $table->json('redirect_uris');
            $table->json('allowed_scopes')->nullable(); // null = all scopes allowed
            $table->boolean('is_active')->default(true);
            $table->boolean('is_confidential')->default(true); // false = public client
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('homepage_url')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oauth_clients');
    }
};
