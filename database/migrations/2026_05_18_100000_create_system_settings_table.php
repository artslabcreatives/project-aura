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
        if (!Schema::hasTable('system_settings')) {
            Schema::create('system_settings', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->text('value')->nullable();
                $table->timestamps();
            });
        }

        // Seed the default system settings
        $settings = [
            [
                'key' => 'enable_chatbot',
                'value' => 'true',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'enable_ai_scenarios',
                'value' => 'true',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            $exists = DB::table('system_settings')->where('key', $setting['key'])->exists();
            if (!$exists) {
                DB::table('system_settings')->insert($setting);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
