<x-filament-panels::page>
    <div class="space-y-6">
        <!-- Main Stats & Configuration Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Connection Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between transition duration-200 hover:shadow-md">
                <div>
                    <div class="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-700">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-primary-50 dark:bg-primary-950 rounded-lg text-primary-600 dark:text-primary-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Google Drive Integration</h2>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Automatic daily backups & retention</p>
                            </div>
                        </div>
                        <div>
                            @if($isConnected)
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">
                                    Connected
                                </span>
                            @else
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    Disconnected
                                </span>
                            @endif
                        </div>
                    </div>

                    <div class="mt-4 space-y-4">
                        @if($isConnected)
                            <div class="flex items-center justify-between py-2 text-sm">
                                <span class="text-gray-500 dark:text-gray-400">Connected Account:</span>
                                <span class="font-medium text-gray-800 dark:text-gray-200">{{ $googleEmail ?: 'N/A' }}</span>
                            </div>
                            
                            <div class="space-y-2 pt-2">
                                <label for="folderId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Drive Folder ID</label>
                                <div class="flex gap-2">
                                    <input 
                                        type="text" 
                                        id="folderId" 
                                        wire:model.defer="folderId" 
                                        placeholder="Enter folder ID or auto-create"
                                        class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    />
                                    <button 
                                        type="button"
                                        wire:click="saveFolderSettings"
                                        class="inline-flex items-center px-3.5 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                                    >
                                        Save
                                    </button>
                                </div>
                                <p class="text-xs text-gray-400 dark:text-gray-500">Backups will be stored inside this folder.</p>
                            </div>
                        @else
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Connect your Google Account to authorize automatic backup scheduling and store database zip archives securely in Google Drive.
                            </p>
                        @endif
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 flex flex-wrap gap-3">
                    @if($isConnected)
                        <button 
                            type="button" 
                            wire:click="autoConfigureFolder"
                            class="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-sm transition"
                        >
                            Auto-Create Folder
                        </button>
                        <button 
                            type="button"
                            wire:click="disconnectGoogle"
                            wire:confirm="Are you sure you want to disconnect Google Drive? Backups will stop running."
                            class="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border border-danger-300 dark:border-danger-700 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition"
                        >
                            Disconnect
                        </button>
                    @else
                        <a 
                            href="{{ route('admin.google-drive.auth') }}"
                            class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-sm transition w-full md:w-auto"
                        >
                            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.743-.08-1.3-.176-1.854h-10.617z"/>
                            </svg>
                            Connect Google Account
                        </a>
                    @endif
                </div>
            </div>

            <!-- Backup Status Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between transition duration-200 hover:shadow-md">
                <div>
                    <div class="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-700">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-primary-50 dark:bg-primary-950 rounded-lg text-primary-600 dark:text-primary-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">System Backup Status</h2>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Schedule: Daily at 12:00 AM (midnight)</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 space-y-3">
                        <div class="flex items-center justify-between py-1 text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Last Backup Run:</span>
                            <span class="font-medium text-gray-800 dark:text-gray-200">{{ $lastBackupTime ?: 'Never' }}</span>
                        </div>
                        
                        <div class="flex items-center justify-between py-1 text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Last Run Status:</span>
                            <span>
                                @if($lastBackupStatus === 'success')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">
                                        Success
                                    </span>
                                @elseif($lastBackupStatus === 'failed')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-100 text-danger-800 dark:bg-danger-900/40 dark:text-danger-400">
                                        Failed
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        Never Run
                                    </span>
                                @endif
                            </span>
                        </div>

                        @if($lastBackupError)
                            <div class="mt-2 p-3 bg-danger-50 dark:bg-danger-950/20 border border-danger-100 dark:border-danger-900/50 rounded-lg">
                                <p class="text-xs font-semibold text-danger-800 dark:text-danger-400">Error details:</p>
                                <p class="text-xs text-danger-700 dark:text-danger-300/80 mt-1 leading-normal">
                                    {{ $lastBackupError }}
                                </p>
                            </div>
                        @endif
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-end">
                    <button 
                        type="button" 
                        wire:click="triggerBackup" 
                        wire:loading.attr="disabled"
                        @if(!$isConnected || $isBackingUp || $isRestoring) disabled @endif
                        class="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50 shadow-sm transition"
                    >
                        <span wire:loading.remove wire:target="triggerBackup" class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            Run Backup Now
                        </span>
                        <span wire:loading wire:target="triggerBackup" class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Backing up...
                        </span>
                    </button>
                </div>
            </div>

        </div>

        <!-- Backups List Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition duration-200 hover:shadow-md">
            <div class="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-700 mb-4">
                <div>
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Backups Available in Google Drive</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Pruning keeps only the latest 5 backups. Restoration replaces database tables manually.</p>
                </div>
                <button 
                    type="button" 
                    wire:click="loadBackups" 
                    wire:loading.attr="disabled"
                    class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                    <svg wire:loading.class="animate-spin" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2H12.24"></path>
                    </svg>
                </button>
            </div>

            <!-- Loader / Table -->
            @if($isRestoring)
                <div class="flex flex-col items-center justify-center py-12">
                    <svg class="animate-spin h-12 w-12 text-primary-600 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 class="text-md font-semibold text-gray-700 dark:text-gray-300">Restoring database...</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm text-center">
                        This download and installation may take up to a minute. Please do not refresh the page.
                    </p>
                </div>
            @elseif($isLoadingBackups)
                <div class="flex flex-col items-center justify-center py-12">
                    <svg class="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-xs text-gray-500 dark:text-gray-400 mt-2">Loading backup files...</span>
                </div>
            @elseif(!$isConnected)
                <div class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Google Drive Not Connected</h3>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Connect Google Drive to list and manage backups.</p>
                </div>
            @elseif(empty($backups))
                <div class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No Backup Files Found</h3>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">No backup zip files were found in the configured Google Drive folder.</p>
                </div>
            @else
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                <th class="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">File Name</th>
                                <th class="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Size (MB)</th>
                                <th class="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date Created</th>
                                <th class="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @foreach($backups as $file)
                                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                    <td class="py-3.5 px-4 font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                        <svg class="w-5 h-5 mr-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0113 2.414l3.586 3.586a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                                        </svg>
                                        {{ $file['name'] }}
                                    </td>
                                    <td class="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                                        {{ number_format($file['size'] / (1024 * 1024), 2) }} MB
                                    </td>
                                    <td class="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                                        {{ $file['created_at'] }}
                                    </td>
                                    <td class="py-3.5 px-4 text-right">
                                        <div class="inline-flex space-x-2">
                                            <button 
                                                type="button"
                                                wire:click="restoreBackup('{{ $file['id'] }}')"
                                                wire:confirm="WARNING: You are about to perform a manual database restoration. This will replace all current tables. Because the active sessions are stored in the database, this action will automatically log you out and terminate all active sessions. Do you want to proceed?"
                                                class="inline-flex items-center px-3 py-1.5 border border-primary-300 dark:border-primary-700 text-xs font-semibold rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition"
                                            >
                                                Restore
                                            </button>
                                            <button 
                                                type="button"
                                                wire:click="deleteBackup('{{ $file['id'] }}')"
                                                wire:confirm="Are you sure you want to permanently delete this backup from Google Drive?"
                                                class="inline-flex items-center px-3 py-1.5 border border-danger-300 dark:border-danger-700 text-xs font-semibold rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    </div>
</x-filament-panels::page>
