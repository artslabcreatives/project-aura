<?php

namespace App\Exceptions;

use RuntimeException;

class AiProviderRateLimitException extends RuntimeException
{
    public function __construct(
        string $message = 'The AI provider is rate limited right now. Please wait a moment and try again.',
        private readonly ?int $retryAfterSeconds = null,
    ) {
        parent::__construct($message, 429);
    }

    public function retryAfterSeconds(): ?int
    {
        return $this->retryAfterSeconds;
    }
}
