#!/usr/bin/env python3
import os
import zipfile
import sys

def package_project():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    output_zip = os.path.join(root_dir, 'public', 'lurl-full-app.zip')
    
    # Exclude unnecessary heavy directories
    exclude_dirs = {
        'node_modules',
        '.git',
        'dist',
        '.vite',
        '.cache',
        '__pycache__'
    }
    
    print(f"Creating complete LURL application package at: {output_zip}")
    
    os.makedirs(os.path.dirname(output_zip), exist_ok=True)
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Do not include the target zip itself
                if file == 'lurl-full-app.zip':
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                zipf.write(full_path, rel_path)
                
    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"Successfully created lurl-full-app.zip ({zip_size_mb:.2f} MB)")

if __name__ == '__main__':
    package_project()
