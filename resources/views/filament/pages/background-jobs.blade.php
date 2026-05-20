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
                        'color' => 'primary',
                    ],
                ];
            @endphp

            @foreach ($jobs as $job)
                <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start gap-4">
                        <div class="p-3 rounded-xl" style="background-color: rgba(245, 158, 11, 0.15); color: rgb(245, 158, 11);">
                            @svg($job['icon'], 'h-6 w-6')
                        </div>
                        <div class="flex-1 space-y-1">
                            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
                                {{ $job['title'] }}
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {{ $job['description'] }}
                            </p>
                            <div class="mt-2 flex items-center gap-1.5 text-xs font-semibold" style="color: rgb(245, 158, 11);">
                                @svg('heroicon-o-clock', 'h-4 w-4')
                                Schedule: Daily at 12:00 AM (Sri Lanka Time)
                            </div>
                            <div class="pt-4 flex items-center justify-between mt-3">
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
                <div class="overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-xs font-bold uppercase tracking-wider" style="background-color: rgba(24, 24, 27, 0.95); color: rgb(245, 158, 11); border-bottom: 2px solid rgba(245, 158, 11, 0.25);">
                                    <th class="px-6 py-4">Scheduler Name</th>
                                    <th class="px-6 py-4">Triggered By</th>
                                    <th class="px-6 py-4">Status</th>
                                    <th class="px-6 py-4">Time (Local)</th>
                                    <th class="px-6 py-4">Output Log</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                @foreach ($logs as $log)
                                    <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20" style="border-bottom: 1px solid rgba(63, 63, 70, 0.3);">
                                        <td class="px-6 py-4 font-semibold whitespace-nowrap text-gray-900 dark:text-gray-100">
                                            Task Recurrence Engine
                                        </td>
                                        <td class="px-6 py-4 font-medium whitespace-nowrap">
                                            @if ($log->runner === 'manual')
                                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold" style="background-color: rgba(245, 158, 11, 0.15); color: rgb(245, 158, 11); border: 1px solid rgba(245, 158, 11, 0.25);">
                                                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: rgb(245, 158, 11);"></span>
                                                    Manual Run
                                                </span>
                                            @else
                                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold" style="background-color: rgba(16, 185, 129, 0.15); color: rgb(52, 211, 153); border: 1px solid rgba(16, 185, 129, 0.25);">
                                                    <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: rgb(16, 185, 129);"></span>
                                                    Auto Scheduler
                                                </span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            @if ($log->status === 'success')
                                                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style="background-color: rgba(16, 185, 129, 0.15); color: rgb(52, 211, 153); border: 1px solid rgba(16, 185, 129, 0.25);">
                                                    Success
                                                </span>
                                            @else
                                                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style="background-color: rgba(239, 68, 68, 0.15); color: rgb(248, 113, 113); border: 1px solid rgba(239, 68, 68, 0.25);">
                                                    Failed
                                                </span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {{ $log->created_at->setTimezone('Asia/Colombo')->format('Y-m-d H:i:s') }}
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="max-w-xl">
                                                <pre class="overflow-x-auto max-h-32 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">{{ $log->output }}</pre>
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
