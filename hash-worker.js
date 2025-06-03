// hash-worker.js
self.onmessage = async (event) => {
    const { fileId, file } = event.data; // Expect a file Blob and an ID to correlate results

    if (!file) {
        self.postMessage({ error: 'No file provided to worker.', fileId: fileId });
        return;
    }

    if (!self.crypto || !self.crypto.subtle) {
        // If crypto is not available in worker (should be in secure contexts),
        // send null hash. Main thread already checks cryptoAvailable.
        self.postMessage({ hash: null, fileId: fileId, notice: 'Crypto API not available in worker.' });
        return;
    }

    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await self.crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        self.postMessage({ hash: hashHex, fileId: fileId });
    } catch (error) {
        self.postMessage({ error: `Hashing error in worker: ${error.message}`, fileId: fileId });
    }
};
