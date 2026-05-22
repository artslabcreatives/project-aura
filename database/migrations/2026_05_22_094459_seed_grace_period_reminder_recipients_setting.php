<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Seed the default grace period reminder recipients into system_settings.
     *
     * Uses the AUTOMATED_REMINDER_RECIPIENT_EMAIL / AUTOMATED_REMINDER_RECIPIENT_NAME
     * env variables as the initial value so existing deployments get a sensible default.
     * The admin can replace these via Admin → System Settings at any time.
     */
    public function up(): void
    {
        $key = 'grace_period_reminder_recipients';

        // Only insert if not already configured (idempotent migration)
        if (DB::table('system_settings')->where('key', $key)->exists()) {
            return;
        }

        $defaultEmail = env('AUTOMATED_REMINDER_RECIPIENT_EMAIL', 'admin@artslabcreatives.com');
        $defaultName  = env('AUTOMATED_REMINDER_RECIPIENT_NAME', 'Admin');

        DB::table('system_settings')->insert([
            'key'        => $key,
            'value'      => json_encode([
                ['email' => $defaultEmail, 'name' => $defaultName],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Remove the seeded setting on rollback.
     */
    public function down(): void
    {
        DB::table('system_settings')
            ->where('key', 'grace_period_reminder_recipients')
            ->delete();
    }
};
