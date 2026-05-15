<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class EmbeddingService
{
    public function embedDocument(string $text): array
    {
        return $this->embed($text, 'document');
    }

    public function embedQuery(string $text): array
    {
        return $this->embed($text, 'query');
    }

    /**
     * @return array<int, float>
     */
    private function embed(string $text, string $inputType): array
    {
        $apiKey = config('services.voyage.api_key');

        if (! $apiKey) {
            throw new RuntimeException('Voyage API key is not configured.');
        }

        $response = Http::timeout(30)
            ->withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->post(config('services.voyage.endpoint', 'https://api.voyageai.com/v1/embeddings'), [
                'model' => 'voyage-4',
                'input' => $text,
                'input_type' => $inputType,
            ]);

        $response->throw();

        $embedding = $response->json('data.0.embedding');

        if (! is_array($embedding)) {
            throw new RuntimeException('Voyage API did not return an embedding.');
        }

        return array_map('floatval', $embedding);
    }
}
