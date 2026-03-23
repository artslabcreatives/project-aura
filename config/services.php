<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'mattermost' => [
        'url' => env('MATTERMOST_URL'),
        'token' => env('MATTERMOST_TOKEN'),
        'team_id' => env('MATTERMOST_TEAM_ID'),
        'api_key' => env('MATTERMOST_API_KEY'),
        'plugin_id' => env('MATTERMOST_PLUGIN_ID', 'com.artslabcreatives.auraai'),
        'jwt_secret' => env('MATTERMOST_JWT_SECRET'),
    ],

	'slack' => [
		'token' => env('SLACK_TOKEN'),
	],

    'zoho' => [
        'client_id' => env('ZOHO_CLIENT_ID'),
        'client_secret' => env('ZOHO_CLIENT_SECRET'),
        'redirect_uri' => env('ZOHO_REDIRECT_URI'),
        'accounts_url' => env('ZOHO_ACCOUNTS_URL', 'https://accounts.zoho.com'),
        'mail_url' => env('ZOHO_MAIL_URL', 'https://mail.zoho.com/api/v1'),
    ],

    'xero' => [
        'client_id'     => env('XERO_CLIENT_ID'),
        'client_secret' => env('XERO_CLIENT_SECRET'),
        'redirect_uri'  => env('XERO_REDIRECT_URI'),
        'scopes'        => env('XERO_SCOPES', 'accounting.invoices.read offline_access'),
    ],
];
