<?php

return [
    'docs' => [
        'route' => '/manuals',
        'path' => '/resources/docs',
        'landing' => 'overview',
        'middleware' => ['web'],
    ],

    'versions' => [
        'default' => '1.0',
        'published' => ['1.0'],
    ],

    'settings' => [
        'auth' => false,
        'guard' => null,
        'ga_id' => '',
        'middleware' => ['web'],
    ],

    'cache' => [
        'enabled' => false,
        'period' => 5,
    ],

    'search' => [
        'enabled' => true,
        'default' => 'internal',
        'engines' => [
            'internal' => [
                'index' => ['h2', 'h3'],
            ],
            'algolia' => [
                'key' => '',
                'index' => '',
            ],
        ],
    ],

    'ui' => [
        'code_theme' => 'dark',
        'fav' => '',
        'fa_v4_shims' => true,
        'show_side_bar' => true,
        'colors' => [
            'primary' => '#2563eb',
            'secondary' => '#0f172a',
        ],
        'theme_order' => null,
    ],

    'seo' => [
        'author' => 'Artslab Creatives',
        'description' => 'Aura application role manuals and developer documentation.',
        'keywords' => 'Aura, documentation, admin, employee, developer',
        'og' => [
            'title' => 'Aura Manuals',
            'type' => 'article',
            'url' => '',
            'image' => '',
            'description' => 'Aura application role manuals and developer documentation.',
        ],
    ],

    'forum' => [
        'enabled' => false,
        'default' => 'disqus',
        'services' => [
            'disqus' => [
                'site_name' => '',
            ],
        ],
    ],

    'packages' => [
        'path' => 'larecipe-components',
    ],

    'blade-parser' => [
        'regex' => [
            'code-blocks' => [
                'match' => '/\<pre\>(.|\n)*?<\/pre\>/',
                'replacement' => '<code-block>',
            ],
        ],
    ],
];
