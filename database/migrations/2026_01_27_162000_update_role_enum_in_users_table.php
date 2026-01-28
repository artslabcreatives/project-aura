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
        // Using raw SQL to update the enum definition as doctrine/dbal might not be effective for enums
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'team-lead', 'admin', 'account-manager') DEFAULT 'user'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting the enum to the previous state
        // Note: Any rows with 'account-manager' would be problematic here if we strictly revert. 
        // Typically we might map them back to 'user' or just leave it as is if data loss is a concern.
        // For strict reversal:
        DB::statement("UPDATE users SET role = 'user' WHERE role = 'account-manager'");
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'team-lead', 'admin') DEFAULT 'user'");
    }
};
