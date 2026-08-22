document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const decryptBtn = document.getElementById('decryptBtn');
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileType = document.getElementById('fileType');
    const typeSelect = document.getElementById('typeSelect');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');

    let currentResult = '';

    // Drag & Drop
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            updateFileInfo(files[0]);
        }
    });

    // File input change - SUPPORT ALL FILES
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            updateFileInfo(this.files[0]);
        }
    });

    function updateFileInfo(file) {
        const size = file.size;
        const sizeStr = size < 1024 ? size + ' B' :
                        size < 1024 * 1024 ? (size / 1024).toFixed(1) + ' KB' :
                        (size / (1024 * 1024)).toFixed(1) + ' MB';

        fileName.textContent = file.name;
        fileSize.textContent = sizeStr;
        
        // Detect type from extension
        const ext = file.name.split('.').pop().toLowerCase();
        const typeMap = {
            'dark': 'Dark Tunnel (.dark)',
            'hc': 'HTTP Custom (.hc)',
            'ehi': 'HTTP Injector (.ehi)',
            'npv': 'NPV Tunnel (.npv)',
            'ssc': 'SSC Custom (.ssc)'
        };
        const detectedType = typeMap[ext] || 'Unknown';
        fileType.textContent = detectedType;
        
        // Set badge data attribute
        const typeMapData = {
            'dark': 'darktunnel',
            'hc': 'httpcustom',
            'ehi': 'httpinjector',
            'npv': 'npvtunnel',
            'ssc': 'ssccustom'
        };
        if (typeMapData[ext]) {
            fileType.setAttribute('data-type', typeMapData[ext]);
        }
        
        // Auto-select type
        const typeMapSelect = {
            'dark': 'darktunnel',
            'hc': 'httpcustom',
            'ehi': 'httpinjector',
            'npv': 'npvtunnel',
            'ssc': 'ssccustom'
        };
        if (typeMapSelect[ext]) {
            typeSelect.value = typeMapSelect[ext];
        } else {
            // Kalo gak dikenal, pilih auto
            typeSelect.value = 'auto';
        }

        fileInfo.style.display = 'block';
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (fileInput.files.length === 0) {
            showError('Please select a file first.');
            return;
        }

        // Cek ukuran file (max 50MB)
        const file = fileInput.files[0];
        if (file.size > 50 * 1024 * 1024) {
            showError('File too large. Maximum size is 50MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', typeSelect.value);

        // Show loading
        decryptBtn.disabled = true;
        decryptBtn.innerHTML = '<span class="loading-spinner"></span> Decrypting...';
        hideErrors();
        resultSection.style.display = 'none';

        try {
            const response = await fetch('/decrypt', {
                method: 'POST',
                body: formData,
                // Tambahkan timeout
                signal: AbortSignal.timeout(60000) // 60 detik timeout
            });

            const data = await response.json();

            if (data.success) {
                currentResult = data.result;
                resultContent.textContent = data.result;
                resultSection.style.display = 'block';
                
                if (data.file_info) {
                    fileType.textContent = data.file_info.display_name;
                }

                // Auto scroll ke result
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                highlightJSON(resultContent);
            } else {
                showError(data.error || 'Decryption failed.');
            }
        } catch (error) {
            if (error.name === 'TimeoutError') {
                showError('Request timed out. The file might be too large or complex.');
            } else {
                showError('Network error: ' + error.message);
            }
        } finally {
            decryptBtn.disabled = false;
            decryptBtn.innerHTML = '<span class="btn-icon">🔓</span> Decrypt';
        }
    });

    // Copy button
    copyBtn.addEventListener('click', function() {
        if (currentResult) {
            navigator.clipboard.writeText(currentResult).then(() => {
                const original = this.textContent;
                this.textContent = '✅ Copied!';
                setTimeout(() => {
                    this.textContent = original;
                }, 2000);
            }).catch(() => {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = currentResult;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                const original = this.textContent;
                this.textContent = '✅ Copied!';
                setTimeout(() => {
                    this.textContent = original;
                }, 2000);
            });
        }
    });

    // Download button
    downloadBtn.addEventListener('click', function() {
        if (currentResult) {
            const blob = new Blob([currentResult], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const originalName = fileInput.files[0]?.name || 'config';
            const baseName = originalName.replace(/\.[^.]+$/, '');
            a.download = `${baseName}_decrypted.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
        resultSection.style.display = 'none';
        currentResult = '';
        fileInput.value = '';
        fileInfo.style.display = 'none';
        hideErrors();
        typeSelect.value = 'auto';
    });

    function showError(message) {
        errorSection.style.display = 'block';
        errorMessage.textContent = message;
        errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideErrors() {
        errorSection.style.display = 'none';
    }

    function highlightJSON(element) {
        try {
            const text = element.textContent;
            const parsed = JSON.parse(text);
            const highlighted = JSON.stringify(parsed, null, 2);
            element.textContent = highlighted;
        } catch (e) {
            // Not valid JSON, keep as is
        }
    }
});
