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
        Schema::table('projects', function (Blueprint $バランス) {
            $バランス->boolean('is_physical_invoice')->default(false);
            $バランス->string('courier_tracking_number')->nullable();
            $バランス->string('courier_delivery_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $バランス) {
            $バランス->dropColumn(['is_physical_invoice', 'courier_tracking_number', 'courier_delivery_status']);
        });
    }
};
