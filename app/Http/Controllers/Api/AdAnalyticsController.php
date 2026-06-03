<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AdProfile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class AdAnalyticsController extends Controller
{
    /**
     * Get dashboard analytics for a profile.
     */
    public function getDashboard(Request $request, $profileId)
    {
        $profile = AdProfile::where('id', $profileId)
            ->where('user_id', Auth::id())
            ->with('connections')
            ->firstOrFail();

        // Default empty structure
        $data = [
            'total_spend' => 0,
            'total_impressions' => 0,
            'total_clicks' => 0,
            'semrush' => [
                'domain_authority' => 0,
                'organic_keywords' => 0,
                'organic_traffic' => 0,
                'top_keywords' => []
            ]
        ];

        // Fetch SEMrush data if connected
        $semrushConnection = $profile->connections->where('platform', 'semrush')->first();
        if ($semrushConnection) {
            try {
                // Fetch Domain Overview (using standard SEMrush API)
                $response = Http::get('https://api.semrush.com/', [
                    'type' => 'domain_ranks',
                    'key' => $semrushConnection->access_token,
                    'domain' => 'artslabcreatives.com', // In a real app, this should be configurable per profile
                    'database' => 'us'
                ]);

                if ($response->successful()) {
                    $lines = explode("\n", trim($response->body()));
                    if (count($lines) > 1) {
                        // Header: Domain;Rank;Organic Keywords;Organic Traffic;Organic Cost;Adwords Keywords;Adwords Traffic;Adwords Cost
                        $values = explode(';', $lines[1]);
                        
                        $data['semrush']['domain_authority'] = 100 - min(100, log10(max(1, (int)($values[1] ?? 1000000))) * 10); // Rough estimation of DA based on Semrush Rank
                        $data['semrush']['organic_keywords'] = (int)($values[2] ?? 0);
                        $data['semrush']['organic_traffic'] = (int)($values[3] ?? 0);
                        
                        // Fake top keywords for now until we implement the phrase_organic report
                        $data['semrush']['top_keywords'] = [
                            ['kw' => 'artslab creatives', 'vol' => '1.2K', 'pos' => 1],
                            ['kw' => 'digital agency', 'vol' => '8.5K', 'pos' => 12],
                            ['kw' => 'web design', 'vol' => '45K', 'pos' => 24],
                        ];
                    }
                }
            } catch (\Exception $e) {
                // Silently fail and return 0s if API call fails
            }
        }

        // TODO: Fetch Google Ads, TikTok, and LinkedIn data here

        return response()->json($data);
    }
}
