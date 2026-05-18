<?php

return [
    'final_disk' => 's3',

    'temp_path' => storage_path('app/resumable-uploads'),

    'cache_path' => storage_path('framework/cache/tus'),

    'cache_file' => 'tus_php.server.cache',

    'api_path' => '/api/uploads/tus',

    'max_upload_size' => (int) env('RESUMABLE_UPLOAD_MAX_SIZE', 1024 * 1024 * 1024),
];