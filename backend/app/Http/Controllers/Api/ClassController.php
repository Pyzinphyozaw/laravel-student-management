<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClassRequest;
use App\Http\Resources\ClassResource;
use App\Models\SchoolClass;

class ClassController extends Controller
{
    public function index()
    {
        return ClassResource::collection(SchoolClass::all());
    }

    public function store(StoreClassRequest $request)
    {
        $class = SchoolClass::create($request->validated());
        return new ClassResource($class);
    }
}