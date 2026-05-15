<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChannelAnalysisComplete
{
    use Dispatchable, SerializesModels;

    /**
     * @param  array<string, mixed>  $result
     */
    public function __construct(
        public readonly string $channelId,
        public readonly array $result,
    ) {}
}
