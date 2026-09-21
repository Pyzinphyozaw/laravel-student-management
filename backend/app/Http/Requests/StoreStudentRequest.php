<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
{
    return true;
}

public function rules()
{
    return [
        'class_id' => ['required', 'exists:classes,id'],
        'name'     => ['required', 'string', 'max:255'],
        'email'    => ['required', 'email', 'unique:students,email'],
        'phone'    => ['nullable', 'string', 'max:20'],
    ];
}
}
