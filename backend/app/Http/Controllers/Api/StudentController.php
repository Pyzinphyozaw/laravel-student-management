<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with('schoolClass');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $students = $query->paginate(10);

        return StudentResource::collection($students);
    }

    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());
        $student->load('schoolClass');

        return new StudentResource($student);
    }

    public function show(Student $student)
    {
        $student->load('schoolClass');
        return new StudentResource($student);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());
        $student->load('schoolClass');

        return new StudentResource($student);
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json(['message' => 'Student deleted successfully']);
    }
}