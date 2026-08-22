import os
import json
import base64
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

from decryptors import (
    run_darktunnel,
    run_httpcustom,
    run_httpinjector,
    run_npvtunnel,
    run_ssccustom
)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change')

# Map file types to decryption functions
DECRYPTORS = {
    'darktunnel': run_darktunnel,
    'httpcustom': run_httpcustom,
    'httpinjector': run_httpinjector,
    'npvtunnel': run_npvtunnel,
    'ssccustom': run_ssccustom
}

# File extension to type mapping - SUPPORTS .dark
EXTENSION_MAP = {
    '.dark': 'darktunnel',
    '.hc': 'httpcustom',
    '.ehi': 'httpinjector',
    '.npv': 'npvtunnel',
    '.ssc': 'ssccustom'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/decrypt', methods=['POST'])
def decrypt():
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded', 'success': False}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected', 'success': False}), 400
        
        # Get decryptor type from form or detect from extension
        decryptor_type = request.form.get('type', 'auto')
        filename = file.filename.lower()
        
        # Auto-detect if not specified
        if decryptor_type == 'auto':
            for ext, d_type in EXTENSION_MAP.items():
                if filename.endswith(ext):
                    decryptor_type = d_type
                    break
            else:
                # Try to detect from content
                file_bytes = file.read()
                file.seek(0)
                content_preview = file_bytes[:200].decode('utf-8', errors='ignore')
                
                # Dark Tunnel detection - check for common patterns
                if 'encryptedLockedConfig' in content_preview:
                    decryptor_type = 'darktunnel'
                elif 'HTTP Custom' in content_preview or content_preview.startswith('HABIBI'):
                    decryptor_type = 'httpcustom'
                elif content_preview.startswith('NPVTSUB1') or content_preview.startswith('NPVT1'):
                    decryptor_type = 'npvtunnel'
                elif content_preview.startswith('ssc://'):
                    decryptor_type = 'ssccustom'
                elif 'configAesKey' in content_preview or content_preview.startswith('{'):
                    decryptor_type = 'httpinjector'
                else:
                    # Try base64 decode for Dark Tunnel
                    try:
                        import base64
                        decoded = base64.b64decode(content_preview[:100].replace('-', '+').replace('_', '/') + '==')
                        if b'encryptedLockedConfig' in decoded:
                            decryptor_type = 'darktunnel'
                    except:
                        pass
                    
                    if decryptor_type == 'auto':
                        return jsonify({'error': 'Unknown file type. Please select the correct decryptor.', 'success': False}), 400
        
        if decryptor_type not in DECRYPTORS:
            return jsonify({'error': f'Unknown decryptor type: {decryptor_type}', 'success': False}), 400
        
        # Read file bytes
        file_bytes = file.read()
        if not file_bytes:
            return jsonify({'error': 'File is empty', 'success': False}), 400
        
        # Run decryption
        decryptor = DECRYPTORS[decryptor_type]
        result = decryptor(file_bytes)
        
        if result is None:
            return jsonify({
                'error': 'Decryption failed. The file may be corrupted or not a valid config file.',
                'success': False
            }), 400
        
        # Try to parse as JSON for better display
        try:
            parsed = json.loads(result)
            formatted_result = json.dumps(parsed, indent=2, ensure_ascii=False)
        except:
            formatted_result = result
        
        # Get file info
        file_info = {
            'filename': file.filename,
            'size': len(file_bytes),
            'type': decryptor_type,
            'display_name': {
                'darktunnel': 'Dark Tunnel (.dark)',
                'httpcustom': 'HTTP Custom (.hc)',
                'httpinjector': 'HTTP Injector (.ehi)',
                'npvtunnel': 'NPV Tunnel (.npv)',
                'ssccustom': 'SSC Custom (.ssc)'
            }.get(decryptor_type, decryptor_type)
        }
        
        return jsonify({
            'success': True,
            'result': formatted_result,
            'file_info': file_info
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)