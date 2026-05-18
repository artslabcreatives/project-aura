<?php

namespace App\Console\Commands;

use App\Services\XeroService;
use Illuminate\Console\Command;

class SyncEstimatesFromXeroCommand extends Command
{
    protected $signature   = 'xero:sync-estimates';
    protected $description = 'Sync Quotes from Xero into local Estimates';

    public function __construct(private XeroService $xeroService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        if (!$this->xeroService->isConnected()) {
            $this->error('Xero is not connected. Visit /settings/integrations to complete OAuth2.');
            return self::FAILURE;
        }

        $this->info('Syncing estimates from Xero...');

        try {
            $summary = $this->xeroService->syncEstimates();
        } catch (\Throwable $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->info(sprintf(
            'Done — %d created, %d updated, %d skipped.',
            $summary['created'],
            $summary['updated'],
            $summary['skipped'],
        ));

        return self::SUCCESS;
    }
}
