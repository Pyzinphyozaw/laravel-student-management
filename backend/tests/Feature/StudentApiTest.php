<?php

use App\Models\SchoolClass;
use App\Models\Student;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('lists students with pagination', function () {
    SchoolClass::factory()->count(2)->create();
    Student::factory()->count(15)->create();

    $response = $this->getJson('/api/students');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'class_id', 'name', 'email', 'phone', 'class'],
            ],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ])
        ->assertJsonPath('meta.total', 15);
});

it('shows a single student with class', function () {
    $student = Student::factory()->create();

    $response = $this->getJson("/api/students/{$student->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $student->id)
        ->assertJsonPath('data.email', $student->email)
        ->assertJsonStructure(['data' => ['class' => ['id', 'name']]]);
});

it('returns 404 for missing student', function () {
    $this->getJson('/api/students/99999')->assertNotFound();
});

it('creates a student', function () {
    $class = SchoolClass::factory()->create();

    $payload = [
        'class_id' => $class->id,
        'name'     => 'Aung Aung',
        'email'    => 'aung@example.com',
        'phone'    => '09123456789',
    ];

    $response = $this->postJson('/api/students', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Aung Aung')
        ->assertJsonPath('data.class.id', $class->id);

    $this->assertDatabaseHas('students', ['email' => 'aung@example.com']);
});

it('validates required fields on create', function () {
    $response = $this->postJson('/api/students', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['class_id', 'name', 'email']);
});

it('rejects invalid email', function () {
    $class = SchoolClass::factory()->create();

    $response = $this->postJson('/api/students', [
        'class_id' => $class->id,
        'name'     => 'Test',
        'email'    => 'not-an-email',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('rejects duplicate email', function () {
    $existing = Student::factory()->create(['email' => 'dup@example.com']);
    $class = SchoolClass::factory()->create();

    $response = $this->postJson('/api/students', [
        'class_id' => $class->id,
        'name'     => 'Test',
        'email'    => 'dup@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('rejects non-existent class_id', function () {
    $response = $this->postJson('/api/students', [
        'class_id' => 99999,
        'name'     => 'Test',
        'email'    => 'test@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['class_id']);
});

it('updates a student', function () {
    $student = Student::factory()->create();
    $newClass = SchoolClass::factory()->create();

    $response = $this->putJson("/api/students/{$student->id}", [
        'class_id' => $newClass->id,
        'name'     => 'Updated Name',
        'email'    => $student->email,
        'phone'    => '0999999999',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Updated Name')
        ->assertJsonPath('data.class.id', $newClass->id);

    $this->assertDatabaseHas('students', [
        'id'   => $student->id,
        'name' => 'Updated Name',
    ]);
});

it('allows updating without changing email', function () {
    $student = Student::factory()->create(['email' => 'same@example.com']);

    $response = $this->putJson("/api/students/{$student->id}", [
        'class_id' => $student->class_id,
        'name'     => 'New Name',
        'email'    => 'same@example.com',
    ]);

    $response->assertOk();
});

it('rejects duplicate email on update for another student', function () {
    $other = Student::factory()->create(['email' => 'taken@example.com']);
    $student = Student::factory()->create();

    $response = $this->putJson("/api/students/{$student->id}", [
        'class_id' => $student->class_id,
        'name'     => $student->name,
        'email'    => 'taken@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('deletes a student', function () {
    $student = Student::factory()->create();

    $response = $this->deleteJson("/api/students/{$student->id}");

    $response->assertOk()
        ->assertJsonPath('message', 'Student deleted successfully');

    $this->assertDatabaseMissing('students', ['id' => $student->id]);
});

it('filters students by search', function () {
    Student::factory()->create(['name' => 'Unique Name XYZ']);
    Student::factory()->count(5)->create();

    $response = $this->getJson('/api/students?search=Unique Name XYZ');

    $response->assertOk()
        ->assertJsonPath('meta.total', 1);
});

it('filters students by class_id', function () {
    $classA = SchoolClass::factory()->create();
    $classB = SchoolClass::factory()->create();
    Student::factory()->count(3)->create(['class_id' => $classA->id]);
    Student::factory()->count(2)->create(['class_id' => $classB->id]);

    $response = $this->getJson("/api/students?class_id={$classA->id}");

    $response->assertOk()
        ->assertJsonPath('meta.total', 3);
});