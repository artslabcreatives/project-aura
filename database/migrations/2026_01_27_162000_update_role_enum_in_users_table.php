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
        $driver = DB::getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB support ALTER TABLE … MODIFY COLUMN for enum changes
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'team-lead', 'admin', 'account-manager') DEFAULT 'user'");
        }
        // SQLite does not support MODIFY COLUMN; the initial migration already
        // includes the 'account-manager' value or we rely on string type – no
        // structural change needed for testing purposes.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            // Reverting the enum to the previous state
            // Note: Any rows with 'account-manager' would be problematic here if we strictly revert.
            // Typically we might map them back to 'user' or just leave it as is if data loss is a concern.
            // For strict reversal:
            DB::statement("UPDATE users SET role = 'user' WHERE role = 'account-manager'");
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'team-lead', 'admin') DEFAULT 'user'");
        }
    }
};

