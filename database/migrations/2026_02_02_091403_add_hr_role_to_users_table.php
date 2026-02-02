<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Using raw SQL to update the enum definition 
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'team-lead', 'admin', 'account-manager', 'hr') DEFAULT 'user'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert ensuring we don't leave invalid data
        DB::statement("UPDATE users SET role = 'user' WHERE role = 'hr'");
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'team-lead', 'admin', 'account-manager') DEFAULT 'user'");
    }
};
