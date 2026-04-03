<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Recalculate hours_logged using fractional seconds so that sub-hour
     * sessions (previously truncated to 0 by diffInHours) are counted correctly.
     */
    public function up(): void
    {
        DB::statement(
            'UPDATE task_time_logs
             SET hours_logged = TIMESTAMPDIFF(SECOND, started_at, ended_at) / 3600
             WHERE started_at IS NOT NULL
               AND ended_at IS NOT NULL'
        );
    }

    /**
     * There is no meaningful rollback for this data fix.
     */
    public function down(): void
    {
        //
    }
};
