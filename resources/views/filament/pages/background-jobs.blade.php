<x-filament-panels::page>
    <div class="space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            @php
                $jobs = [
                    [
                        'command' => 'tasks:process-recurring',
                        'title' => 'Task Recurrence Engine',
                        'description' => 'Process scheduled recurring template tasks, clone active cards, and shift next run intervals forward.',
                        'icon' => 'heroicon-o-arrow-path',
                        'color' => 'indigo',
                        'colorHex' => 'indigo-500',
                    ],
                ];
            @endphp

            @foreach ($jobs as $job)
                <div class="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start gap-4">
                        <div class="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-{{ $job['colorHex'] }}">
                            @svg($job['icon'], 'h-6 w-6')
                        </div>
                        <div class="flex-1 space-y-1">
                            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                {{ $job['title'] }}
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {{ $job['description'] }}
                            </p>
                            <div class="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-4">
                                <span class="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-md">
                                    {{ $job['command'] }}
                                </span>
                                <x-filament::button
                                    wire:click="runJob('{{ $job['command'] }}')"
                                    wire:loading.attr="disabled"
                                    color="{{ $job['color'] }}"
                                    icon="heroicon-m-play"
                                    labeled-from="sm"
                                    class="shadow-sm active:scale-[0.98] transition-transform"
                                >
                                    Run Now
                                </x-filament::button>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <!-- Job Logs Section -->
        <div class="mt-8 space-y-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <x-heroicon-o-document-text class="h-6 w-6 text-gray-400" />
                Job Execution History (Last 15 Runs)
            </h2>

            @php
                $logs = $this->getLogs();
            @endphp

            @if ($logs->isEmpty())
                <div class="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-gray-500 dark:text-gray-400">
                    No execution logs recorded yet. Run the job to generate logs.
                </div>
            @else
                <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                    <th class="px-6 py-4">Triggered By</th>
                                    <th class="px-6 py-4">Status</th>
                                    <th class="px-6 py-4">Time (Local)</th>
                                    <th class="px-6 py-4">Output Log</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                @foreach ($logs as $log)
                                    <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                                        <td class="px-6 py-4 font-medium whitespace-nowrap">
                                            @if ($log->runner === 'manual')
                                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-500">
                                                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                    Manual Run
                                                </span>
                                            @else
                                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Auto Scheduler
                                                </span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            @if ($log->status === 'success')
                                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                    Success
                                                </span>
                                            @else
                                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400">
                                                    Failed
                                                </span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {{ $log->created_at->setTimezone('Asia/Colombo')->format('Y-m-d H:i:s') }}
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="max-w-xl">
                                                <pre class="overflow-x-auto max-h-32 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 leading-relaxed whitespace-pre-wrap">{{ $log->output }}</pre>
                                                @if ($log->error_message)
                                                    <div class="mt-1 text-xs text-red-500 font-medium">
                                                        Error: {{ $log->error_message }}
                                                    </div>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif
        </div>
    </div>
</x-filament-panels::page>
