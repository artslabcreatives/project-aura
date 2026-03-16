<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Project;

class ProjectIdGenerationService
{
    /**
     * Generate a unique project code for the given project.
     *
     * The code is composed of a prefix (derived from the associated client's
     * company name, or "PRJ" when no client is set) followed by a hyphen and a
     * zero-padded sequential number that is unique within that prefix series.
     *
     * Examples: ABC-001, TECHC-003, PRJ-002
     */
    public function generate(Project $project): string
    {
        $prefix = $this->getPrefix($project);
        $number = $this->getNextSequentialNumber($prefix);

        return sprintf('%s-%03d', $prefix, $number);
    }

    /**
     * Derive the prefix for the project code.
     *
     * When the project has an associated client the prefix is built from the
     * client's company name.  Otherwise the generic prefix "PRJ" is used.
     */
    protected function getPrefix(Project $project): string
    {
        if ($project->client_id) {
            $client = $project->client ?? $project->load('client')->client;

            if ($client) {
                return $this->getClientCode($client);
            }
        }

        return 'PRJ';
    }

    /**
     * Derive a short, uppercase code from a client's company name.
     *
     * For multi-word names the initials of each word are joined (up to 5
     * characters).  For single-word names the first 4 characters are used.
     *
     * Examples:
     *   "Acme Corporation"      → "AC"
     *   "Tech Corp Innovations" → "TCI"
     *   "GlobalTech"            → "GLOB"
     */
    protected function getClientCode(Client $client): string
    {
        $name = trim($client->company_name);
        $words = preg_split('/[\s\-_]+/', $name, -1, PREG_SPLIT_NO_EMPTY);

        if (count($words) >= 2) {
            $initials = implode('', array_map(fn ($w) => strtoupper($w[0]), $words));
            return substr($initials, 0, 5);
        }

        return strtoupper(substr($name, 0, 4));
    }

    /**
     * Return the next sequential number for the given prefix.
     *
     * The number is one greater than the highest existing number already used
     * for this prefix, or 1 when no projects with that prefix exist yet.
     */
    protected function getNextSequentialNumber(string $prefix): int
    {
        $max = Project::where('project_code', 'like', $prefix . '-%')
            ->whereNotNull('project_code')
            ->pluck('project_code')
            ->map(function (string $code) {
                if (preg_match('/-(\d+)$/', $code, $matches)) {
                    return (int) $matches[1];
                }
                return 0;
            })
            ->max() ?? 0;

        return $max + 1;
    }
}
