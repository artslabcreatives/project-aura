<?php

namespace App\Search;

use Laravel\Scout\Engines\TypesenseEngine;
use Illuminate\Support\Facades\Log;
use Throwable;

class SafeTypesenseEngine extends TypesenseEngine
{
    /**
     * Update the given model in the index.
     *
     * @param  \Illuminate\Database\Eloquent\Collection  $models
     * @return void
     */
    public function update($models)
    {
        try {
            parent::update($models);
        } catch (Throwable $e) {
            $modelClass = $models->isEmpty() ? 'Unknown' : get_class($models->first());
            $ids = $models->pluck('id')->toArray();
            Log::error('Typesense update failed: ' . $e->getMessage(), [
                'exception' => $e,
                'model' => $modelClass,
                'ids' => $ids
            ]);
        }
    }

    /**
     * Remove the given model from the index.
     *
     * @param  \Illuminate\Database\Eloquent\Collection  $models
     * @return void
     */
    public function delete($models)
    {
        try {
            parent::delete($models);
        } catch (Throwable $e) {
            $modelClass = $models->isEmpty() ? 'Unknown' : get_class($models->first());
            $ids = $models->pluck('id')->toArray();
            Log::error('Typesense delete failed: ' . $e->getMessage(), [
                'exception' => $e,
                'model' => $modelClass,
                'ids' => $ids
            ]);
        }
    }

    /**
     * Flush all the model's records from the engine.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function flush($model)
    {
        try {
            parent::flush($model);
        } catch (Throwable $e) {
            Log::error('Typesense flush failed: ' . $e->getMessage(), [
                'exception' => $e,
                'model' => get_class($model)
            ]);
        }
    }
}
