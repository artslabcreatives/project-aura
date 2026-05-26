<?php

namespace App\Jobs;

use App\Events\ChannelAnalysisComplete;
use App\Pipelines\ChannelAnalysisPipeline;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class AnalyzeChannelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $channelId,
        public readonly int $hoursBack = 24,
        public readonly int|string $triggeredBy = 'scheduled',
    ) {
        $this->connection = 'redis';
        $this->queue = 'analysis';
    }

    public function handle(ChannelAnalysisPipeline $pipeline): void
    {
        $result = $pipeline->run($this->channelId, $this->hoursBack);
        $result['triggered_by'] = $this->triggeredBy;

        Cache::put($this->cacheKey($this->channelId), $result, now()->addHour());

        ChannelAnalysisComplete::dispatch($this->channelId, $result);
    }

    public static function cacheKey(string $channelId): string
    {
        return "channel_analysis_{$channelId}";
    }
}
