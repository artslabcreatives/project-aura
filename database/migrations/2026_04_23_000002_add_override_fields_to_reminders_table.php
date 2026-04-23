<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            $table->boolean('is_overridden')->default(false)->after('is_read');
            $table->foreignId('overridden_by')->nullable()->constrained('users')->nullOnDelete()->after('is_overridden');
            $table->timestamp('overridden_at')->nullable()->after('overridden_by');
            $table->integer('reminder_frequency_days')->nullable()->after('overridden_at');
        });
    }

    public function down(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            $table->dropForeign(['overridden_by']);
            $table->dropColumn(['is_overridden', 'overridden_by', 'overridden_at', 'reminder_frequency_days']);
        });
    }
};
