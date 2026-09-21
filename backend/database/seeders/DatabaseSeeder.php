<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run()
{
    \App\Models\SchoolClass::factory(5)->create()->each(function ($class) {
        \App\Models\Student::factory(10)->create(['class_id' => $class->id]);
    });
}
}
