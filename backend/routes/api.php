<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\ClassController;
use Illuminate\Support\Facades\Route;

Route::apiResource('students', StudentController::class);
Route::apiResource('classes', ClassController::class)->only(['index', 'store']);