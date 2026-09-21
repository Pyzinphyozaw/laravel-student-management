<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
{
    return [
        'id'         => $this->id,
        'class_id'   => $this->class_id,
        'name'       => $this->name,
        'email'      => $this->email,
        'phone'      => $this->phone,
        'class'      => new ClassResource($this->whenLoaded('schoolClass')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
}
