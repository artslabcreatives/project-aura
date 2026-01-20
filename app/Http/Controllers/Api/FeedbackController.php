<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'screenshot' => 'nullable|file|image|max:10240', // Max 10MB
            'device_info' => 'nullable|json',
            'type' => 'nullable|string|in:bug_report,feature_request,general',
        ]);

        $feedbackData = [
            'user_id' => $request->user()->id,
            'description' => $validated['description'],
            'device_info' => isset($validated['device_info']) ? json_decode($validated['device_info'], true) : null,
            'type' => $validated['type'] ?? 'bug_report',
            'status' => 'pending',
        ];

        if ($request->hasFile('screenshot')) {
            $path = $request->file('screenshot')->store('feedback-screenshots', 'public');
            $feedbackData['screenshot_path'] = $path;
        }

        $feedback = \App\Models\Feedback::create($feedbackData);

        return response()->json($feedback, 201);
    }
}
