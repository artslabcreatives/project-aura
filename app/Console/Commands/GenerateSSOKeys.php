<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateSSOKeys extends Command
{
    protected $signature = 'sso:generate-keys {--force : Overwrite existing keys}';
    protected $description = 'Generate RSA key pair for SSO JWT signing';

    public function handle(): int
    {
        $dir = storage_path('oauth');
        $privatePath = $dir . '/private.key';
        $publicPath  = $dir . '/public.key';

        if (!is_dir($dir)) {
            mkdir($dir, 0700, true);
        }

        if (file_exists($privatePath) && !$this->option('force')) {
            $this->error('SSO keys already exist. Use --force to overwrite.');
            return self::FAILURE;
        }

        $this->info('Generating 2048-bit RSA key pair...');

        $config = [
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ];

        $resource = openssl_pkey_new($config);
        if (!$resource) {
            $this->error('Failed to generate key: ' . openssl_error_string());
            return self::FAILURE;
        }

        openssl_pkey_export($resource, $privateKey);
        $details   = openssl_pkey_get_details($resource);
        $publicKey = $details['key'];

        file_put_contents($privatePath, $privateKey);
        chmod($privatePath, 0600);

        file_put_contents($publicPath, $publicKey);
        chmod($publicPath, 0644);

        $this->info("Private key: {$privatePath}");
        $this->info("Public key:  {$publicPath}");
        $this->info('');
        $this->info('Key ID (kid): ' . substr(hash('sha256', $publicKey), 0, 16));
        $this->info('');
        $this->warn('Keep storage/oauth/private.key out of version control!');

        return self::SUCCESS;
    }
}
