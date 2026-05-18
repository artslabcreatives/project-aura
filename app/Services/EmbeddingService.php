<?php

namespace App\Services;

class EmbeddingService
{
    private const DIMENSIONS = 1024;

    public function embedDocument(string $text): array
    {
        return $this->embed($text);
    }

    public function embedQuery(string $text): array
    {
        return $this->embed($text);
    }

    /**
     * @return array<int, float>
     */
    private function embed(string $text): array
    {
        $vector = array_fill(0, self::DIMENSIONS, 0.0);
        $tokens = $this->tokens($text);

        if ($tokens === []) {
            return $vector;
        }

        foreach ($tokens as $token) {
            $hash = crc32($token);
            $index = $hash % self::DIMENSIONS;
            $sign = ($hash & 1) === 0 ? 1.0 : -1.0;

            $vector[$index] += $sign;
        }

        return $this->normalize($vector);
    }

    /**
     * @return array<int, string>
     */
    private function tokens(string $text): array
    {
        $normalized = mb_strtolower(strip_tags($text));
        preg_match_all('/[\p{L}\p{N}]+/u', $normalized, $matches);

        return array_values(array_filter($matches[0] ?? [], static fn (string $token): bool => mb_strlen($token) > 1));
    }

    /**
     * @param  array<int, float>  $vector
     * @return array<int, float>
     */
    private function normalize(array $vector): array
    {
        $magnitude = sqrt(array_sum(array_map(static fn (float $value): float => $value * $value, $vector)));

        if ($magnitude <= 0.0) {
            return $vector;
        }

        return array_map(static fn (float $value): float => $value / $magnitude, $vector);
    }
}
