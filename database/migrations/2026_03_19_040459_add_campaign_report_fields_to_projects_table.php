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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('campaign_report_document')->nullable();
            $table->string('campaign_report_status')->default('pending');
            $table->unsignedBigInteger('campaign_report_approved_by')->nullable();
            $table->timestamp('campaign_report_approved_at')->nullable();

            $table->foreign('campaign_report_approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['campaign_report_approved_by']);
            $table->dropColumn([
                'campaign_report_document',
                'campaign_report_status',
                'campaign_report_approved_by',
                'campaign_report_approved_at',
            ]);
        });
    }
};
