#!/usr/bin/env php
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$slack = app('Vluzrmos\SlackApi\Contracts\SlackChannel');
$response = $slack->history('C09NTG1CPQR', ['limit' => 100]);
$messages = $response->messages ?? [];

echo "Total messages found: " . count($messages) . PHP_EOL . PHP_EOL;

$userCounts = [];
foreach ($messages as $message) {
    $userId = $message->user ?? null;
    $text = $message->text ?? '';
    if ($userId && $text) {
        if (!isset($userCounts[$userId])) {
            $userCounts[$userId] = 0;
        }
        $userCounts[$userId]++;
    }
}

echo "Messages per user:" . PHP_EOL;
arsort($userCounts);
$userApi = app('Vluzrmos\SlackApi\Contracts\SlackUser');
foreach ($userCounts as $userId => $count) {
    $userInfo = $userApi->info($userId);
    $username = $userInfo->user->name ?? 'unknown';
    $isDeleted = $userInfo->user->deleted ?? false;
    $isBot = $userInfo->user->is_bot ?? false;
    $status = [];
    if ($isDeleted) $status[] = 'DELETED';
    if ($isBot) $status[] = 'BOT';
    $statusStr = $status ? ' [' . implode(', ', $status) . ']' : '';
    echo "$username ($userId): $count messages$statusStr" . PHP_EOL;
}
