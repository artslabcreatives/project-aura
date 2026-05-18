<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFilePathToProjectAttachmentsTable extends Migration
{
    public function up()
    {
        Schema::table('project_attachments', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('url');
        });
    }

    public function down()
    {
        Schema::table('project_attachments', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
    }
}
