<?php

use App\Models\SchoolClass;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('lists classes', function () {
    SchoolClass::factory()->count(3)->create();

    $response = $this->getJson('/api/classes');

    $response->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure(['data' => [['id', 'name']]]);
});

it('creates a class', function () {
    $response = $this->postJson('/api/classes', ['name' => 'Computer Science']);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Computer Science');

    $this->assertDatabaseHas('classes', ['name' => 'Computer Science']);
});

it('validates class name is required', function () {
    $this->postJson('/api/classes', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('validates class name max length', function () {
    $this->postJson('/api/classes', ['name' => str_repeat('a', 256)])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});