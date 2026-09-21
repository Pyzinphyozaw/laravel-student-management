<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('students', function (Blueprint $table) {
        $table->id();
        $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
        $table->string('name');
        $table->string('email')->unique();
        $table->string('phone')->nullable();
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('students');
}
};
