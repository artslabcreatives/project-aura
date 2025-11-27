<?php

namespace App\Mcp\Resources;

use App\Models\Stage;
use ElliottLawson\LaravelMcp\Resources\BaseResource;

class StageResource extends BaseResource
{
    public function __construct()
    {
        parent::__construct('stages', [
            'description' => 'Access stage data including project, responsible users, and tasks',
        ]);
    }

    /**
     * Get stage data.
     *
     * @param array $params Parameters for filtering stages
     * @return array The stage data
     */
    public function getData(array $params = []): array
    {
        $query = Stage::with(['project', 'mainResponsible', 'backupResponsible1', 'backupResponsible2', 'tasks']);

        if (isset($params['id'])) {
            return $query->find($params['id'])?->toArray() ?? [];
        }

        if (isset($params['project_id'])) {
            $query->where('project_id', $params['project_id']);
        }

        if (isset($params['type'])) {
            $query->where('type', $params['type']);
        }

        return $query->orderBy('order')->get()->toArray();
    }
}
