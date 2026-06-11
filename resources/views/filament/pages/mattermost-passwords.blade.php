<x-filament-panels::page>
    <x-filament-panels::form wire:submit="retrieve">
        {{ $this->form }}

        <div class="flex items-center gap-3">
            <x-filament::button type="submit" color="danger" icon="heroicon-o-key">
                Retrieve Password
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
                        Mattermost Credentials Decrypted
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                        Decrypted value successfully retrieved.
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
                Ensure you handle this password securely. All password retrieval requests are audited.
            </div>
        </div>
    @endif
</x-filament-panels::page>
