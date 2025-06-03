// zip-worker.js
self.onmessage = async (event) => {
    const { filesToZip } = event.data; // Expect an array of {name, path, blob}

    if (!filesToZip || filesToZip.length === 0) {
        self.postMessage({ error: 'No files provided to zip worker.' });
        return;
    }

    // Attempt to import JSZip
    // The path to jszip.min.js needs to be correct relative to the worker's location,
    // or an absolute path if hosted. Assuming it's in the same directory or a known path.
    // For this example, let's assume it's in the root, same as main.js and index.html
    try {
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    } catch (e) {
        // Fallback path if running locally and CDN is not preferred for worker importScripts
        try {
            importScripts('jszip.min.js'); // Assuming jszip.min.js is copied to the root
        } catch (e2) {
             self.postMessage({ error: `Failed to import JSZip: ${e.message || e2.message}` });
             return;
        }
    }

    if (typeof JSZip === 'undefined') {
        self.postMessage({ error: 'JSZip library not loaded in worker.' });
        return;
    }

    const zip = new JSZip();
    filesToZip.forEach(fileData => {
        // Use fileData.path if available and different from name, otherwise just name
        const pathInZip = fileData.path || fileData.name;
        zip.file(pathInZip, fileData.blob, { binary: true });
    });

    try {
        const zipBlob = await zip.generateAsync(
            { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
            (metadata) => { // Progress callback
                self.postMessage({ progress: metadata.percent });
            }
        );
        self.postMessage({ zipBlob: zipBlob, success: true });
    } catch (error) {
        self.postMessage({ error: `Zipping error in worker: ${error.message || error}` });
    }
};
