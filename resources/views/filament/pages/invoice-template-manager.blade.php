<x-filament-panels::page>
    {{-- Template Selector --}}
    @if ($this->templates->count() > 0)
        <div class="mb-4 flex items-center gap-2 flex-wrap">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Templates:</span>
            @foreach ($this->templates as $tpl)
                <button
                    wire:click="switchTemplate({{ $tpl->id }})"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition
                        {{ $activeTemplateId === $tpl->id
                            ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500 text-primary-700 dark:text-primary-400 font-semibold'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700' }}"
                >
                    @if ($tpl->is_default)
                        <x-heroicon-s-star class="w-3.5 h-3.5 text-amber-500" />
                    @endif
                    {{ $tpl->name }}
                </button>
            @endforeach
        </div>
    @endif

    {{-- State Data Bridge for Javascript --}}
    @if ($this->activePdfUrl)
        <div id="pdf-viewer-root" 
             data-pdf-url="{{ $this->activePdfUrl }}" 
             data-mappings="{{ json_encode($templateData['mappings'] ?? []) }}" 
             class="hidden"></div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {{-- Forms & Mappings Column --}}
        <div class="lg:col-span-2 space-y-6">
            {{-- Template Configuration Form --}}
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <form wire:submit="saveTemplate" class="space-y-6">
                    {{ $this->templateForm }}

                    <div class="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <x-filament::button type="submit" icon="heroicon-o-check">
                            Save Template Config
                        </x-filament::button>

                        @if ($activeTemplateId)
                            <x-filament::button
                                type="button"
                                wire:click="previewPdf"
                                color="gray"
                                icon="heroicon-o-eye"
                            >
                                Preview with Sample Data
                            </x-filament::button>

                            <x-filament::button
                                type="button"
                                wire:click="deleteTemplate"
                                color="danger"
                                icon="heroicon-o-trash"
                                wire:confirm="Are you sure you want to delete this template?"
                            >
                                Delete Template
                            </x-filament::button>
                        @endif
                    </div>
                </form>
            </div>

            @if ($activeTemplateId)
                <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                    {{-- Generate Invoice Form --}}
                    <form wire:submit="generatePdf" class="space-y-6">
                        {{ $this->generateForm }}

                        <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <x-filament::button type="submit" icon="heroicon-o-arrow-down-tray" color="success">
                                Generate & Download PDF
                            </x-filament::button>
                        </div>
                    </form>
                </div>
            @endif
        </div>

        {{-- Interactive Visual PDF Mapper Column --}}
        <div class="lg:col-span-1">
            @if ($this->activePdfUrl)
                <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm sticky top-6">
                    <h3 class="text-sm font-semibold text-gray-850 dark:text-white mb-1">
                        📐 Interactive Visual Mapper
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                        Click anywhere on the PDF page preview below to set coordinates for a variable. Existing mappings will display as colored overlays.
                    </p>

                    {{-- PDF Canvas Container --}}
                    <div class="relative border border-gray-250 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-950 overflow-hidden select-none" style="min-height: 480px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06);">
                        <canvas id="pdf-canvas" class="w-full h-auto block cursor-crosshair"></canvas>
                        
                        {{-- Drag/click overlay layer --}}
                        <div id="pdf-overlay" class="absolute inset-0 cursor-crosshair" style="z-index: 10;"></div>
                    </div>

                    {{-- Controls --}}
                    <div class="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <div class="flex items-center gap-1">
                            <button type="button" id="prev-page-btn" class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-750 transition">Prev</button>
                            <span id="page-num-display" class="px-2 font-medium">Page 1 of 1</span>
                            <button type="button" id="next-page-btn" class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-750 transition">Next</button>
                        </div>
                        <span id="coordinates-display" class="font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded shadow-sm text-primary-600 dark:text-primary-400">X: 0.0mm, Y: 0.0mm</span>
                    </div>

                    {{-- Popover for Placement --}}
                    <div id="placement-popover" class="hidden absolute bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-700 shadow-xl rounded-lg p-3 w-64 transition-all" style="z-index: 999; filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));">
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                            📍 Place variable at click point:
                        </p>
                        <select id="popover-variable-select" class="w-full text-xs rounded-md border-gray-300 dark:border-gray-705 dark:bg-gray-800 dark:text-white p-1.5 mb-2 focus:ring-primary-500 focus:border-primary-500">
                            @foreach (\App\Models\InvoiceTemplate::availableVariables() as $var)
                                <option value="{{ $var['key'] }}">{{ $var['label'] }} ({{ $var['key'] }})</option>
                            @endforeach
                        </select>
                        <div class="flex gap-2 justify-end">
                            <button type="button" id="popover-cancel-btn" class="px-2.5 py-1 text-xs text-gray-650 dark:text-gray-400 hover:bg-gray-105 dark:hover:bg-gray-800 rounded transition">Cancel</button>
                            <button type="button" id="popover-place-btn" class="px-2.5 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded font-medium shadow-sm transition">Place Field</button>
                        </div>
                    </div>
                </div>
            @else
                <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm text-center">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Please upload and save a PDF template file to view the interactive visual mapper.</p>
                </div>
            @endif
        </div>
    </div>

    {{-- Reference variables guide collapsible --}}
    <div class="mt-6">
        <details class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <summary class="px-4 py-3 bg-gray-50 dark:bg-gray-850 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition select-none">
                📋 Available Mapped Variables Reference List
            </summary>
            <div class="p-4 overflow-x-auto border-t border-gray-200 dark:border-gray-800">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th class="px-4 py-3">Variable Key</th>
                            <th class="px-4 py-3">Label</th>
                            <th class="px-4 py-3">Group</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach (\App\Models\InvoiceTemplate::availableVariables() as $var)
                            <tr class="border-b dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition {{ $loop->even ? 'bg-gray-50/30 dark:bg-gray-800/10' : '' }}">
                                <td class="px-4 py-2 font-mono text-xs text-primary-600 dark:text-primary-400 font-semibold">{{ $var['key'] }}</td>
                                <td class="px-4 py-2">{{ $var['label'] }}</td>
                                <td class="px-4 py-2 text-gray-550 dark:text-gray-400 text-xs">{{ $var['group'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </details>
    </div>

    {{-- Interactive Visual Mapper Javascript --}}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        function initPdfMapper() {
            const root = document.getElementById('pdf-viewer-root');
            if (!root) return;

            const pdfUrl = root.getAttribute('data-pdf-url');
            if (!pdfUrl) return;

            const canvas = document.getElementById('pdf-canvas');
            const overlay = document.getElementById('pdf-overlay');
            if (!canvas || !overlay) return;

            const ctx = canvas.getContext('2d');
            let pdfDoc = null;
            let pageNum = 1;
            let pageRendering = false;
            let pageNumPending = null;
            const scale = 1.25;

            let pdfPageWidthMm = 210; // default A4
            let pdfPageHeightMm = 297;
            let pdfPageWidthPoints = 595.276;
            let pdfPageHeightPoints = 841.89;

            let currentMappings = JSON.parse(root.getAttribute('data-mappings') || '[]');

            // Configure PDF.js worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            // Load PDF
            pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
                pdfDoc = pdfDoc_;
                document.getElementById('page-num-display').textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
                renderPage(pageNum);
            }).catch(err => {
                console.error("PDF loading error:", err);
            });

            function renderPage(num) {
                if (!pdfDoc) return;
                pageRendering = true;
                
                pdfDoc.getPage(num).then(function(page) {
                    const viewport = page.getViewport({ scale: scale });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    pdfPageWidthPoints = viewport.width / scale;
                    pdfPageHeightPoints = viewport.height / scale;
                    
                    // 1 point = 0.352778 mm
                    pdfPageWidthMm = pdfPageWidthPoints * 0.352778;
                    pdfPageHeightMm = pdfPageHeightPoints * 0.352778;

                    const renderContext = {
                        canvasContext: ctx,
                        viewport: viewport
                    };
                    const renderTask = page.render(renderContext);

                    renderTask.promise.then(function() {
                        pageRendering = false;
                        drawOverlay();
                        if (pageNumPending !== null) {
                            renderPage(pageNumPending);
                            pageNumPending = null;
                        }
                    });
                });
            }

            function drawOverlay() {
                overlay.innerHTML = '';
                const canvasWidth = canvas.clientWidth;
                const canvasHeight = canvas.clientHeight;

                if (!canvasWidth || !canvasHeight) {
                    // Try again shortly if not fully layouted yet
                    setTimeout(drawOverlay, 100);
                    return;
                }

                // Force overlay to match canvas size exactly to prevent coordinate scaling mismatch
                overlay.style.width = canvasWidth + 'px';
                overlay.style.height = canvasHeight + 'px';

                currentMappings.forEach((mapping) => {
                    const x = parseFloat(mapping.x || 0);
                    const y = parseFloat(mapping.y || 0);
                    const width = parseFloat(mapping.width || 40);
                    const label = mapping.variable || '';

                    if (!label) return;

                    // Map millimeter to screen pixels relative to current displayed size
                    const pxLeft = (x / pdfPageWidthMm) * canvasWidth;
                    const pxTop = (y / pdfPageHeightMm) * canvasHeight;
                    const pxWidth = (width / pdfPageWidthMm) * canvasWidth;
                    const pxHeight = 16; // highlight overlay height

                    // Create highlight container
                    const marker = document.createElement('div');
                    marker.className = 'absolute bg-primary-500/20 hover:bg-primary-500/35 border border-primary-500 rounded text-primary-900 dark:text-primary-100 font-mono font-bold select-none truncate hover:z-20 shadow-sm transition-all';
                    marker.style.left = pxLeft + 'px';
                    marker.style.top = pxTop + 'px';
                    marker.style.width = pxWidth + 'px';
                    marker.style.height = pxHeight + 'px';
                    marker.style.fontSize = '8px';
                    marker.style.lineHeight = '14px';
                    marker.style.paddingLeft = '3px';
                    marker.style.paddingRight = '3px';
                    marker.title = `${label} (X: ${x}mm, Y: ${y}mm)`;
                    
                    // Indicator text
                    marker.textContent = label;
                    overlay.appendChild(marker);
                });
            }

            // Recalculate overlays when window size changes
            window.removeEventListener('resize', drawOverlay);
            window.addEventListener('resize', drawOverlay);

            // MutationObserver to listen to dynamic Livewire changes of mappings
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-mappings') {
                        currentMappings = JSON.parse(root.getAttribute('data-mappings') || '[]');
                        drawOverlay();
                    }
                });
            });
            observer.observe(root, { attributes: true });

            // Coordinates Mouse Move
            overlay.removeEventListener('mousemove', onMouseMove);
            overlay.addEventListener('mousemove', onMouseMove);

            function onMouseMove(e) {
                const rect = canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                const mmX = (clickX / rect.width) * pdfPageWidthMm;
                const mmY = (clickY / rect.height) * pdfPageHeightMm;

                document.getElementById('coordinates-display').textContent = `X: ${mmX.toFixed(1)}mm, Y: ${mmY.toFixed(1)}mm`;
            }

            // Click placement logic
            let clickCoords = { x: 0, y: 0 };
            overlay.removeEventListener('click', onOverlayClick);
            overlay.addEventListener('click', onOverlayClick);

            function onOverlayClick(e) {
                // If clicked a label itself, don't trigger new dialog
                if (e.target !== overlay) return;

                const rect = canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                clickCoords.x = (clickX / rect.width) * pdfPageWidthMm;
                clickCoords.y = (clickY / rect.height) * pdfPageHeightMm;

                // Position and show popover dialog
                const popover = document.getElementById('placement-popover');
                popover.classList.remove('hidden');
                
                // Keep popover within screen boundaries
                const popoverWidth = 256;
                let leftPos = e.clientX + window.scrollX + 12;
                if (leftPos + popoverWidth > window.innerWidth) {
                    leftPos = e.clientX + window.scrollX - popoverWidth - 12;
                }

                popover.style.left = leftPos + 'px';
                popover.style.top = (e.clientY + window.scrollY + 12) + 'px';
            }

            // Controls listeners
            document.getElementById('prev-page-btn').onclick = function() {
                if (pageNum <= 1) return;
                pageNum--;
                document.getElementById('page-num-display').textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
                renderPage(pageNum);
            };

            document.getElementById('next-page-btn').onclick = function() {
                if (pageNum >= pdfDoc.numPages) return;
                pageNum++;
                document.getElementById('page-num-display').textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
                renderPage(pageNum);
            };

            // Popover Cancel/Place buttons
            document.getElementById('popover-cancel-btn').onclick = function() {
                document.getElementById('placement-popover').classList.add('hidden');
            };

            document.getElementById('popover-place-btn').onclick = function() {
                const variable = document.getElementById('popover-variable-select').value;
                if (!variable) return;

                // Call Livewire component method
                @this.call('addMappingAtCoordinates', clickCoords.x, clickCoords.y, variable);

                document.getElementById('placement-popover').classList.add('hidden');
            };
        }

        // Initialize mapper
        document.addEventListener('DOMContentLoaded', initPdfMapper);
        document.addEventListener('livewire:navigated', initPdfMapper);
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(initPdfMapper, 100);
        }
    </script>
</x-filament-panels::page>
