<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Aura - Project Task Management</title>
        <meta name="description" content="Modern task management tool for teams. Organize, track, and manage project tasks with kanban boards, filters, and team collaboration features." />
        <link rel="icon" href="/favicon.ico" />

        <!-- Social Media Tags -->
        <meta property="og:title" content="Aura - Project Task Management" />
        <meta property="og:description" content="Modern task management tool for teams. Organize, track, and manage project tasks with kanban boards, filters, and team collaboration features." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="{{ asset('build/assets/login-ui-DEP-tRQd.jpg') }}" />

        @viteReactRefresh
        @vite(['resources/js/project-aura-new/src/index.css', 'resources/js/project-aura-new/src/main.tsx'])
        
        @if(isset($mattermost_token) && $mattermost_token)
        <script>
            // Immediately set the Mattermost token before React loads
            (function() {
                localStorage.clear(); // Clear all previous auth data
                sessionStorage.clear(); // Also clear session storage
                const token = '{{ $mattermost_token }}';
                const userId = '{{ $mattermost_user_id }}';
                localStorage.setItem('auth_token', token);
                console.log('=== MATTERMOST AUTH ===');
                console.log('User ID:', userId);
                console.log('Token (first 30 chars):', token.substring(0, 30) + '...');
                console.log('Token (last 10 chars):', '...' + token.substring(token.length - 10));
                console.log('Full length:', token.length);
                console.log('======================');
            })();
        </script>
        @endif
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
