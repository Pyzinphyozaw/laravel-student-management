<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    public function definition(): array
    {
        return [
            'name' => 'Class ' . $this->faker->unique()->numberBetween(1, 9999),
        ];
    }
}