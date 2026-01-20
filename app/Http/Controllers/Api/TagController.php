<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Tag::query();

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = auth()->user();

        // Authorization check
        if ($user->role !== 'admin' && $user->role !== 'team-lead') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'team-lead' && $user->department_id != $request->department_id) {
            return response()->json(['message' => 'You can only create tags for your own department'], 403);
        }
        
        // Check if tag exists for this department
        $existingTag = \App\Models\Tag::where('name', $request->name)
                                    ->where('department_id', $request->department_id)
                                    ->first();
                                    
        if ($existingTag) {
            return response()->json($existingTag);
        }

        $tag = \App\Models\Tag::create([
            'name' => $request->name,
            'department_id' => $request->department_id,
        ]);

        return response()->json($tag, 201);
    }
}
