<!doctype html>
<html>
    <head>
        <!-- META Tags -->
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>{{ isset($title) ? $title . ' | ' : null }}{{ config('app.name') }}</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- SEO -->
        <meta name="author" content="{{ config('larecipe.seo.author') }}">
        <meta name="description" content="{{ config('larecipe.seo.description') }}">
        <meta name="keywords" content="{{ config('larecipe.seo.keywords') }}">
        <meta name="twitter:card" value="summary">
        @if (isset($canonical) && $canonical)
            <link rel="canonical" href="{{ url($canonical) }}" />
        @endif
        @if($openGraph = config('larecipe.seo.og'))
            @foreach($openGraph as $key => $value)
                @if($value)
                    <meta property="og:{{ $key }}" content="{{ $value }}" />
                @endif
            @endforeach
        @endif

        <!-- CSS -->
        <link rel="stylesheet" href="{{ route('larecipe.styles', 'app.css') }}">

        @if (config('larecipe.ui.fav'))
            <!-- Favicon -->
            <link rel="apple-touch-icon" href="{{ asset(config('larecipe.ui.fav')) }}">
            <link rel="shortcut icon" type="image/png" href="{{ asset(config('larecipe.ui.fav')) }}"/>
        @endif

        <!-- FontAwesome -->
        <link rel="stylesheet" href="{{ route('larecipe.styles', 'font-awesome.css') }}">
        @if (config('larecipe.ui.fa_v4_shims', true))
            <link rel="stylesheet" href="{{ route('larecipe.styles', 'font-awesome-v4-shims.css') }}">
        @endif

        <!-- Dynamic Colors -->
        @include('larecipe::style')

        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @foreach(LaRecipe::allStyles() as $name => $path)
            @if (preg_match('/^https?:\/\//', $path))
                <link rel="stylesheet" href="{{ $path }}">
            @else
                <link rel="stylesheet" href="{{ route('larecipe.styles', $name) }}">
            @endif
        @endforeach

    </head>
    <body>
        <div id="app" v-cloak>
            @include('larecipe::partials.nav')

            @include('larecipe::plugins.search')

            @yield('content')

            <larecipe-back-to-top></larecipe-back-to-top>
        </div>


        @php($cspNonce = app('csp-nonce'))

        <script nonce="{{ $cspNonce }}">
            window.config = @json([]);
        </script>

        <script type="text/javascript" nonce="{{ $cspNonce }}">
            if(localStorage.getItem('larecipeSidebar') == null) {
                localStorage.setItem('larecipeSidebar', !! {{ config('larecipe.ui.show_side_bar') ?: 0 }});
            }
        </script>

        <script src="{{ route('larecipe.scripts', 'app.js') }}" nonce="{{ $cspNonce }}"></script>

        <script nonce="{{ $cspNonce }}">
            window.LaRecipe = new CreateLarecipe(config)
        </script>

        <!-- Google Analytics -->
        @if(config('larecipe.settings.ga_id'))
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('larecipe.settings.ga_id') }}" nonce="{{ $cspNonce }}"></script>
            <script nonce="{{ $cspNonce }}">
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', "{{ config('larecipe.settings.ga_id') }}");
            </script>
        @endif
        <!-- /Google Analytics -->

        @foreach (LaRecipe::allScripts() as $name => $path)
            @if (preg_match('/^https?:\/\//', $path))
                <script src="{{ $path }}" nonce="{{ $cspNonce }}"></script>
            @else
                <script src="{{ route('larecipe.scripts', $name) }}" nonce="{{ $cspNonce }}"></script>
            @endif
        @endforeach

        <script nonce="{{ $cspNonce }}">
            LaRecipe.run()
        </script>
    </body>
</html>
