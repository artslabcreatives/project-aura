<x-filament-panels::page>
    {{-- ─────────────────────────────────────────────
         SECTION 1 · Retrieve & Manage Credentials
    ───────────────────────────────────────────── --}}
    <x-filament-panels::form wire:submit="retrieve">
        {{ $this->form }}

        <div class="flex items-center gap-3">
            <x-filament::button type="submit" color="danger" icon="heroicon-o-key">
                Retrieve Password
            </x-filament::button>

            <x-filament::button type="button" wire:click="generate" color="warning" icon="heroicon-o-arrow-path">
                Generate & Sync Password
            </x-filament::button>
        </div>
    </x-filament-panels::form>

    @if ($retrievedPassword)
        <div class="mt-8 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-500/30 p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400">
                    @svg('heroicon-o-shield-check', 'h-6 w-6')
                </div>
                <div>
                    <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
                        @if ($isGenerated)
                            Mattermost Credentials Generated & Synced
                        @else
                            Mattermost Credentials Decrypted
                        @endif
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                        @if ($isGenerated)
                            A new secure password was generated, saved locally, and synced to Mattermost.
                        @else
                            Decrypted value successfully retrieved.
                        @endif
                    </p>
                </div>
            </div>
            
            <div class="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <code id="mattermost-password-code" class="font-mono text-sm break-all font-bold select-all text-gray-900 dark:text-gray-100 pl-2 pr-10">
                    {{ $retrievedPassword }}
                </code>
                
                <div x-data="{ copied: false }" class="shrink-0 ml-4">
                    <x-filament::button
                        color="gray"
                        icon="heroicon-o-clipboard-document"
                        size="sm"
                        x-on:click="window.navigator.clipboard.writeText('{{ e($retrievedPassword) }}'); copied = true; setTimeout(() => copied = false, 2000)"
                    >
                        <span x-show="!copied">Copy</span>
                        <span x-show="copied" class="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                    </x-filament::button>
                </div>
            </div>
            
            <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                @svg('heroicon-o-information-circle', 'h-4 w-4 text-gray-400')
                Ensure you handle this password securely. All password retrieval and generation requests are audited.
            </div>
        </div>
    @endif

    {{-- ─────────────────────────────────────────────
         SECTION 2 · Send Credentials by Email
    ───────────────────────────────────────────── --}}
    <div class="mt-10">
        <div class="rounded-2xl bg-white dark:bg-gray-900 border border-blue-500/25 shadow-sm overflow-hidden">

            {{-- Header --}}
            <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20">
                <div class="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                    @svg('heroicon-o-envelope', 'h-6 w-6')
                </div>
                <div>
                    <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">Send Credentials by Email</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 leading-normal mt-0.5">
                        Dispatch Mattermost login credentials + download link to active users via n8n. Requires the Admin Secret Key to be filled above.
                    </p>
                </div>
            </div>

            <div class="p-6 space-y-6">

                <fieldset @if ($isQueueRunning) disabled @endif class="space-y-6 border-0 p-0 m-0">
                    {{-- Radio: All users vs Specific users --}}
                    <div class="space-y-3">
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                            Who should receive the email?
                        </label>

                        <label class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all
                            {{ $sendToAllUsers === '1' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800/40 hover:border-blue-500/50' }}">
                            <input
                                type="radio"
                                wire:model.live="sendToAllUsers"
                                value="1"
                                class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0"
                            />
                            <div>
                                <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">All active users</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Every active user with a stored Mattermost password will receive the email.
                                </div>
                            </div>
                        </label>

                        <label class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all
                            {{ $sendToAllUsers === '0' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800/40 hover:border-blue-500/50' }}">
                            <input
                                type="radio"
                                wire:model.live="sendToAllUsers"
                                value="0"
                                class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0"
                            />
                            <div class="w-full">
                                <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">Select specific users</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Choose one or more users individually. Only users with stored passwords are listed.
                                </div>

                                @if ($sendToAllUsers === '0')
                                    <div class="mt-3" id="tom-select-wrapper">
                                        {{-- Hidden native select synced to Livewire --}}
                                        <select
                                            id="email-user-select"
                                            name="selectedEmailUsers[]"
                                            multiple
                                            class="w-full"
                                            wire:ignore
                                        >
                                            @foreach ($this->activeUsersWithPasswords as $id => $label)
                                                <option value="{{ $id }}">{{ $label }}</option>
                                            @endforeach
                                        </select>
                                        <p class="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                                            {{ count($this->activeUsersWithPasswords) }} user(s) available. Type to search.
                                        </p>
                                    </div>
                                @endif
                            </div>
                        </label>
                    </div>

                    {{-- What gets sent info box --}}
                    <div class="flex gap-3 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-700 dark:text-indigo-300">
                        @svg('heroicon-o-information-circle', 'h-4 w-4 shrink-0 mt-0.5 text-indigo-500')
                        <div class="space-y-1 leading-relaxed">
                            <p class="font-semibold">Each email will include:</p>
                            <ul class="list-disc list-inside space-y-0.5 text-indigo-600 dark:text-indigo-400">
                                <li>User's full name & email (Mattermost username)</li>
                                <li>Their stored Mattermost password</li>
                                <li>Mattermost server URL</li>
                                <li>Link to the Mattermost download & setup guide</li>
                            </ul>
                        </div>
                    </div>
                </fieldset>

                {{-- Progress Bar Block --}}
                @if ($isQueueRunning)
                    <div class="p-5 rounded-2xl border border-blue-500/25 bg-blue-500/5 space-y-4 animate-in fade-in duration-300">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-semibold text-blue-500 dark:text-blue-400">Sending Mattermost Credentials...</span>
                            <span class="text-xs font-mono text-gray-500 dark:text-gray-400">
                                {{ $queueSent + $queueFailed }} / {{ $queueTotal }}
                            </span>
                        </div>
                        
                        {{-- Progress Bar Container --}}
                        <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                                class="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out" 
                                style="width: {{ $queueTotal > 0 ? (($queueSent + $queueFailed) / $queueTotal * 100) : 0 }}%"
                            ></div>
                        </div>

                        <div class="flex justify-between items-center text-xs">
                            <span class="text-gray-600 dark:text-gray-400">
                                @if ($currentProcessingName)
                                    Sending to: <strong class="text-gray-800 dark:text-gray-200">{{ $currentProcessingName }}</strong>
                                @else
                                    Preparing batch...
                                @endif
                            </span>
                            <div class="flex gap-4 font-mono">
                                <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Sent: {{ $queueSent }}</span>
                                <span class="text-rose-600 dark:text-rose-400 font-semibold">Failed: {{ $queueFailed }}</span>
                            </div>
                        </div>
                    </div>
                @endif

                {{-- Send button --}}
                <div class="flex items-center gap-4 pt-1">
                    <x-filament::button
                        type="button"
                        wire:click="startEmailBlast"
                        wire:loading.attr="disabled"
                        wire:target="startEmailBlast"
                        :disabled="$isQueueRunning"
                        color="info"
                        icon="heroicon-o-paper-airplane"
                        class="shadow-sm"
                    >
                        <span wire:loading.remove wire:target="startEmailBlast">
                            Send Mattermost Credentials Email
                        </span>
                        <span wire:loading wire:target="startEmailBlast" class="flex items-center gap-2">
                            @svg('heroicon-o-arrow-path', 'h-4 w-4 animate-spin')
                            Starting…
                        </span>
                    </x-filament::button>

                    <p class="text-xs text-gray-400 dark:text-gray-500">
                        All send actions are recorded in the Audit Log.
                    </p>
                </div>

                {{-- Result banner --}}
                @if ($emailSendResult !== null)
                    <div class="mt-2 rounded-xl overflow-hidden border
                        {{ $emailSendResult['failed'] === 0
                            ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/25'
                            : 'border-amber-400/40 bg-amber-50 dark:bg-amber-950/25' }}
                        p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        <div class="shrink-0 mt-0.5 {{ $emailSendResult['failed'] === 0 ? 'text-emerald-500' : 'text-amber-500' }}">
                            @if ($emailSendResult['failed'] === 0)
                                @svg('heroicon-o-check-circle', 'h-5 w-5')
                            @else
                                @svg('heroicon-o-exclamation-triangle', 'h-5 w-5')
                            @endif
                        </div>

                        <div class="text-sm space-y-1">
                            <p class="font-semibold {{ $emailSendResult['failed'] === 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300' }}">
                                @if ($emailSendResult['failed'] === 0)
                                    All emails sent successfully!
                                @else
                                    Emails sent with some failures.
                                @endif
                            </p>
                            <div class="flex items-center gap-4 text-xs font-mono">
                                <span class="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                    @svg('heroicon-o-check', 'h-3.5 w-3.5')
                                    Sent: {{ $emailSendResult['sent'] }}
                                </span>
                                @if ($emailSendResult['failed'] > 0)
                                    <span class="flex items-center gap-1 text-red-600 dark:text-red-400">
                                        @svg('heroicon-o-x-mark', 'h-3.5 w-3.5')
                                        Failed: {{ $emailSendResult['failed'] }}
                                    </span>
                                @endif
                            </div>
                            @if ($emailSendResult['failed'] > 0)
                                <p class="text-xs text-amber-600 dark:text-amber-400">
                                    Check Laravel logs for details on failed deliveries.
                                </p>
                            @endif
                        </div>
                    </div>
                @endif

            </div>{{-- /p-6 --}}
        </div>
    </div>

{{-- Tom Select: styles + script inline (Filament doesn't use @push stacks) --}}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/css/tom-select.min.css">
<style>
    .ts-wrapper.multi .ts-control {
        min-height: 46px;
        border-radius: 0.75rem;
        border: 1px solid #374151;
        background: #111827;
        padding: 6px 10px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        box-shadow: none;
        cursor: text;
        color: #f3f4f6;
    }
    .ts-wrapper.multi .ts-control .item {
        background: #2563eb;
        color: #fff;
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 12px;
        font-weight: 500;
        border: none;
        display: flex;
        align-items: center;
        gap: 5px;
        line-height: 1.4;
    }
    .ts-wrapper.multi .ts-control .item .remove {
        color: rgba(255,255,255,0.75);
        font-size: 15px;
        font-weight: bold;
        padding: 0;
        margin: 0;
        line-height: 1;
        border: none;
        background: none;
        cursor: pointer;
    }
    .ts-wrapper.multi .ts-control .item .remove:hover { color: #fff; }
    .ts-wrapper.focus .ts-control {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.25) !important;
    }
    .ts-control input {
        font-size: 13px;
        color: #f3f4f6 !important;
        background: transparent !important;
        outline: none;
        border: none;
        flex: 1;
        min-width: 100px;
    }
    .ts-control input::placeholder { color: #6b7280; }
    .ts-dropdown {
        border-radius: 0.75rem;
        border: 1px solid #374151;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        overflow: hidden;
        z-index: 9999;
        background: #1e2737;
        margin-top: 4px;
    }
    .ts-dropdown-content { padding: 4px; }
    .ts-dropdown .option {
        padding: 9px 12px;
        font-size: 13px;
        border-radius: 6px;
        cursor: pointer;
        color: #d1d5db;
        transition: background 0.1s;
    }
    .ts-dropdown .option:hover,
    .ts-dropdown .option.active { background: #1e3a5f; color: #93c5fd; }
    .ts-dropdown .no-results { padding: 10px 14px; font-size: 13px; color: #6b7280; }
</style>

<script src="https://cdn.jsdelivr.net/npm/tom-select@2.3.1/dist/js/tom-select.complete.min.js"></script>
<script>
(function () {
    let tsInstance = null;

    function initTS() {
        const el = document.getElementById('email-user-select');
        if (!el) { destroyTS(); return; }
        if (tsInstance) return; // already alive

        tsInstance = new TomSelect(el, {
            plugins: ['remove_button'],
            maxOptions: 300,
            placeholder: 'Search by name or email…',
            onChange(values) {
                @this.set('selectedEmailUsers', values.map(Number));
            }
        });
    }

    function destroyTS() {
        if (tsInstance) { tsInstance.destroy(); tsInstance = null; }
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTS);
    } else {
        initTS();
    }

    // Re-check after every Livewire commit (handles radio switch show/hide)
    document.addEventListener('livewire:init', () => {
        Livewire.hook('commit', ({ succeed }) => {
            succeed(() => setTimeout(() => {
                document.getElementById('email-user-select') ? initTS() : destroyTS();
            }, 60));
        });

        Livewire.on('start-email-queue', async () => {
            const userIds = @this.get('queueUsers');
            if (!userIds || userIds.length === 0) return;

            for (let i = 0; i < userIds.length; i++) {
                const userId = userIds[i];
                try {
                    await @this.sendEmailForUser(userId);
                } catch (e) {
                    console.error('Error sending email for user ID: ' + userId, e);
                }
            }

            try {
                await @this.finalizeQueue();
            } catch (e) {
                console.error('Error finalizing queue', e);
            }
        });
    });
})();
</script>

</x-filament-panels::page>

