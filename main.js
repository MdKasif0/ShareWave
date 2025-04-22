// --- ShareWave V5.1 ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Config & Elements (Mostly same as V5) ---
    const CHUNK_SIZE = 128 * 1024;
    const MAX_BUFFERED_AMOUNT = 64 * 1024 * 1024;
    const ICE_SERVERS = { iceServers: [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.services.mozilla.com' } ] };
    const QR_SCANNER_CONFIG = { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };
    const HASH_ALGORITHM = 'SHA-256';
    const SPEED_INTERVAL = 2000;
    const HISTORY_LIMIT = 50;

    // --- Get ALL Elements by ID ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    const historyPanel = document.getElementById('history-panel');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyList = document.getElementById('history-list');
    const previewModal = document.getElementById('preview-modal');
    const modalImagePreview = document.getElementById('modal-image-preview');
    const modalVideoPreview = document.getElementById('modal-video-preview');
    const passwordSectionSender = document.getElementById('password-section-sender');
    const passwordInputSender = document.getElementById('password-input-sender');
    const passwordSectionReceiver = document.getElementById('password-section-receiver');
    const passwordInputReceiver = document.getElementById('password-input-receiver');
    const verifyPasswordBtn = document.getElementById('verify-password-btn');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const cancelTransferBtn = document.getElementById('cancel-transfer-btn');
    const speedIndicator = document.getElementById('speed-indicator');
    const etrIndicator = document.getElementById('etr-indicator');
    const receiveSpeedIndicator = document.getElementById('receive-speed-indicator');
    const chatPanelSender = document.getElementById('chat-panel-sender');
    const chatMessagesSender = document.getElementById('chat-messages-sender');
    const chatInputSender = document.getElementById('chat-input-sender');
    const chatSendBtnSender = document.getElementById('chat-send-btn-sender');
    const chatPanelReceiver = document.getElementById('chat-panel-receiver');
    const chatMessagesReceiver = document.getElementById('chat-messages-receiver');
    const chatInputReceiver = document.getElementById('chat-input-receiver');
    const chatSendBtnReceiver = document.getElementById('chat-send-btn-receiver');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const sendTabBtn = document.getElementById('send-tab-btn');
    const receiveTabBtn = document.getElementById('receive-tab-btn');
    const sendSection = document.getElementById('send-section');
    const receiveSection = document.getElementById('receive-section');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const folderInput = document.getElementById('folder-input');
    const browseLink = document.getElementById('browse-link');
    const selectedFilesSection = document.getElementById('selected-files-section');
    const fileSummarySpan = document.getElementById('file-summary');
    const selectedFilesList = document.getElementById('selected-files-list');
    const generateBtn = document.getElementById('generate-btn');
    const offerStep = document.getElementById('offer-step');
    const offerQrCodeDiv = document.getElementById('offer-qr-code');
    const offerSdpTextarea = document.getElementById('offer-sdp');
    const answerStep = document.getElementById('answer-step');
    const scanAnswerQrBtn = document.getElementById('scan-answer-qr-btn');
    const answerScannerArea = document.getElementById('answer-scanner-area');
    const answerScannerBox = document.getElementById('answer-scanner-box');
    const answerScanStatus = document.getElementById('answer-scan-status');
    const answerSdpTextarea = document.getElementById('answer-sdp');
    const connectBtn = document.getElementById('connect-btn');
    const sendStatusSection = document.getElementById('send-status-section');
    const sendStatusMessage = document.getElementById('send-status-message');
    const sendProgressLabel = document.getElementById('send-progress-label');
    const sendProgressBar = document.getElementById('send-progress-bar');
    const sendProgressText = document.getElementById('send-progress-text');
    const offerInputStep = document.getElementById('offer-input-step');
    const scanOfferQrBtn = document.getElementById('scan-offer-qr-btn');
    const offerScannerArea = document.getElementById('offer-scanner-area');
    const offerScannerBox = document.getElementById('offer-scanner-box');
    const offerScanStatus = document.getElementById('offer-scan-status');
    const offerSdpInputTextarea = document.getElementById('offer-sdp-input');
    const generateAnswerBtn = document.getElementById('generate-answer-btn');
    const answerOutputStep = document.getElementById('answer-output-step');
    const answerQrCodeDiv = document.getElementById('answer-qr-code');
    const answerSdpOutputTextarea = document.getElementById('answer-sdp-output');
    const receiverWaitMessage = document.getElementById('receiver-wait-message');
    const receiveStatusSection = document.getElementById('receive-status-section');
    const receiveStatusMessage = document.getElementById('receive-status-message');
    const receiveProgressLabel = document.getElementById('receive-progress-label');
    const receiveProgressBar = document.getElementById('receive-progress-bar');
    const receiveProgressText = document.getElementById('receive-progress-text');
    const receivedFilesSection = document.getElementById('received-files-section');
    const receivedFilesList = document.getElementById('received-files-list');

    // --- State Variables ---
    let peerConnection;
    let dataChannel;
    let filesToSend = [];
    let currentFileIndex = 0;
    let currentFileOffset = 0;
    let totalBytesToSend = 0;
    let totalBytesSent = 0;
    let isSender = true;
    let offerQrScanner = null;
    let answerQrScanner = null;
    let receiveBuffer = [];
    let receivedSize = 0;
    let filesMetadata = null;
    let currentReceivingFileIndex = 0;
    let currentFileReceivedSize = 0;
    let receivedFiles = []; // Stores { blob, name, type, path }
    let objectUrls = []; // For previews and downloads
    let passwordHash = null; // Stores hash of sender's password if set
    let transferPaused = false;
    let speedIntervalId = null;
    let lastMeasurementTime = 0;
    let lastMeasurementSentBytes = 0;
    let lastMeasurementReceivedBytes = 0;
    let isPasswordRequiredBySender = false; // Receiver flag
    let transferStartTime = 0;

    // --- Crypto Check ---
    const cryptoAvailable = window.crypto && window.crypto.subtle;
    if (!cryptoAvailable) {
        console.warn("Web Crypto API not available (requires secure context: HTTPS or localhost). File hashing/password verification disabled.");
        // Optionally disable password input or show a warning to the user
        // passwordSectionSender.classList.add('hidden'); // Example: hide sender pw section
    }

    // --- Global Functions (Accessible from HTML via onclick) ---
    window.switchTab = (tabName) => {
        isSender = (tabName === 'send');
        stopAllScanners();
        sendTabBtn.classList.toggle('active', isSender);
        receiveTabBtn.classList.toggle('active', !isSender);
        sendSection.classList.toggle('active', isSender);
        receiveSection.classList.toggle('active', !isSender);
        resetState(true); // Full reset when switching tabs
    };

    window.copyToClipboard = (elementId) => {
        const textareaElement = document.getElementById(elementId);
        if (!textareaElement) return;
        textareaElement.select();
        textareaElement.setSelectionRange(0, 99999); // For mobile devices

        navigator.clipboard?.writeText(textareaElement.value)
            .then(() => showCopyFeedback(textareaElement))
            .catch(err => {
                console.error('Clipboard API copy failed:', err);
                fallbackCopy(textareaElement); // Try legacy method
            });
    };

    // Make removeFile accessible globally for onclick
    window.removeFile = (index) => {
        if (index < 0 || index >= filesToSend.length) return;

        const itemToRemove = filesToSend[index];
        totalBytesToSend -= itemToRemove.file.size;
        filesToSend.splice(index, 1);

        // Clean up potential preview URL
        const listItem = selectedFilesList.querySelector(`li[data-index='${index}']`);
        if (listItem) {
            const previewElement = listItem.querySelector('.file-preview img, .file-preview video');
            if (previewElement && previewElement.src && previewElement.src.startsWith('blob:')) {
                URL.revokeObjectURL(previewElement.src);
                const urlIndex = objectUrls.indexOf(previewElement.src);
                if (urlIndex > -1) {
                    objectUrls.splice(urlIndex, 1);
                }
            }
        }

        updateFileListUI(); // Re-render the list with updated indices
        updateFileSummary();
        generateBtn.disabled = filesToSend.length === 0;
        passwordSectionSender.classList.toggle('hidden', filesToSend.length === 0);
    };

     // Make togglePasswordVisibility accessible globally for onclick
    window.togglePasswordVisibility = (inputId, buttonElement) => {
        const input = document.getElementById(inputId);
        const icon = buttonElement.querySelector('i');
        if (!input || !icon) return;

        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
            buttonElement.setAttribute('aria-label', 'Hide password');
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
            buttonElement.setAttribute('aria-label', 'Show password');
        }
    };

    // Make preview functions accessible globally for onclick/ondblclick
    window.openPreviewModal = (element) => {
         const src = element.src;
         if (!src || !previewModal || !modalImagePreview || !modalVideoPreview) return;

         if (element.tagName === 'IMG') {
             modalImagePreview.src = src;
             modalImagePreview.style.display = 'block';
             modalVideoPreview.style.display = 'none';
             modalVideoPreview.pause(); // Ensure video is paused
             modalVideoPreview.src = ''; // Clear video src
         } else if (element.tagName === 'VIDEO') {
             modalVideoPreview.src = src;
             modalVideoPreview.style.display = 'block';
             modalImagePreview.style.display = 'none';
             modalImagePreview.src = ''; // Clear image src
             modalVideoPreview.play().catch(e => console.warn("Autoplay prevented:", e));
         } else {
             return; // Only handle img/video
         }
         previewModal.style.display = 'flex';
    };

    window.closePreviewModal = () => {
         if (!previewModal || !modalImagePreview || !modalVideoPreview) return;
         previewModal.style.display = 'none';
         modalImagePreview.src = '';
         modalVideoPreview.src = '';
         modalVideoPreview.pause();
         modalImagePreview.style.display = 'none';
         modalVideoPreview.style.display = 'none';
    };

    window.closeModalOnClick = (event) => {
        if (event.target === previewModal) {
            closePreviewModal();
        }
    };


    // --- Helper Functions ---
    function fallbackCopy(textareaElement) {
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopyFeedback(textareaElement);
            } else {
                console.error('Fallback copy command failed');
                alert("Copy failed. Please copy manually.");
            }
        } catch (err) {
            console.error('Fallback copy exception:', err);
            alert("Copy failed. Please copy manually.");
        }
    }

    function showCopyFeedback(textareaElement) {
        const textCodeSection = textareaElement.closest('.text-code-section');
        const copyButton = textCodeSection?.querySelector('.copy-btn');
        if (copyButton) {
            const tooltip = copyButton.querySelector('.tooltip');
            if (tooltip) tooltip.textContent = 'Copied!';
            copyButton.classList.add('copied'); // Optional: Add a class for visual feedback
            setTimeout(() => {
                if (tooltip) tooltip.textContent = 'Copy';
                copyButton.classList.remove('copied');
            }, 1500);
        }
    }

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function getFileIconClass(fileType) {
        if (!fileType) return 'fa-file'; // Default icon

        const type = fileType.toLowerCase();

        if (type.startsWith('image/')) return 'fa-file-image';
        if (type.startsWith('video/')) return 'fa-file-video';
        if (type.startsWith('audio/')) return 'fa-file-audio';
        if (type.includes('pdf')) return 'fa-file-pdf';
        if (type.includes('zip') || type.includes('rar') || type.includes('compress')) return 'fa-file-zipper';
        if (type.includes('text')) return 'fa-file-lines'; // More generic than -alt
        if (type.includes('excel') || type.includes('spreadsheet')) return 'fa-file-excel';
        if (type.includes('word') || type.includes('document')) return 'fa-file-word';
        if (type.includes('powerpoint') || type.includes('presentation')) return 'fa-file-powerpoint';
        if (type.includes('csv')) return 'fa-file-csv';
        if (type.includes('code') || type.includes('script') || type.includes('html') || type.includes('css') || type.includes('javascript')) return 'fa-file-code';

        return 'fa-file'; // Fallback for unknown types
    }

    function updateStatusMessage(element, message, type = 'info') {
        if (!element) return;
        element.textContent = message;
        // Ensure only valid type classes are applied
        element.className = 'status-message ' + ['info', 'success', 'error', 'warning'].find(t => t === type) || 'info';
    }

    function closePeerConnection() {
        stopAllScanners();
        stopSpeedAndETRCalc();
        passwordHash = null;
        isPasswordRequiredBySender = false; // Reset flag on close

        if (dataChannel) {
            try { dataChannel.close(); } catch (e) { console.warn("Error closing data channel:", e); }
            dataChannel = null;
        }
        if (peerConnection) {
            try { peerConnection.close(); } catch (e) { console.warn("Error closing peer connection:", e); }
            peerConnection = null;
        }
        console.log("Peer connection closed and resources released.");
        // Optionally disable chat after closing connection
        enableChat(false);
    }

    function resetState(fullReset = true) {
        console.log(`Resetting state (Full: ${fullReset})`);
        closePeerConnection(); // Always close existing connections

        // Reset transfer state variables
        currentFileIndex = 0;
        currentFileOffset = 0;
        totalBytesSent = 0;
        receiveBuffer = [];
        receivedSize = 0;
        filesMetadata = null;
        currentReceivingFileIndex = 0;
        currentFileReceivedSize = 0;
        receivedFiles = [];
        revokeObjectUrls(); // Clean up blob URLs
        transferPaused = false;
        passwordHash = null;
        isPasswordRequiredBySender = false;

        // Reset UI elements - Sender tab
        offerStep.classList.add('hidden');
        offerQrCodeDiv.innerHTML = ''; // Clear QR code
        offerSdpTextarea.value = '';
        answerStep.classList.add('hidden');
        answerSdpTextarea.value = '';
        answerScannerArea.classList.add('hidden');
        answerScanStatus.textContent = '';
        sendStatusSection.classList.add('hidden');
        updateSendProgress(0, ''); // Reset progress bar and labels
        generateBtn.innerHTML = '<i class="fas fa-share-alt"></i> Generate Share Code';
        generateBtn.disabled = filesToSend.length === 0 && isSender; // Disable if no files selected (only if on Send tab)
        connectBtn.innerHTML = '<i class="fas fa-link"></i> Connect';
        connectBtn.disabled = false;
        pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        pauseResumeBtn.disabled = true;
        cancelTransferBtn.disabled = true;
        speedIndicator.textContent = '-- MB/s';
        etrIndicator.textContent = 'ETR: --';
        chatMessagesSender.innerHTML = ''; // Clear chat
        chatPanelSender.classList.add('hidden');

        // Reset UI elements - Receiver tab
        offerInputStep.classList.remove('hidden'); // Show initial step
        offerSdpInputTextarea.value = '';
        offerScannerArea.classList.add('hidden');
        offerScanStatus.textContent = '';
        generateAnswerBtn.innerHTML = '<i class="fas fa-reply"></i> Generate Response Code';
        generateAnswerBtn.disabled = false;
        passwordSectionReceiver.classList.add('hidden');
        passwordInputReceiver.value = '';
        answerOutputStep.classList.add('hidden');
        answerQrCodeDiv.innerHTML = ''; // Clear QR code
        answerSdpOutputTextarea.value = '';
        receiverWaitMessage.classList.remove('hidden'); // Show wait message initially
        receiveStatusSection.classList.add('hidden');
        updateReceiveProgress(0, 'Waiting for connection...'); // Reset progress bar and labels
        receivedFilesSection.classList.add('hidden');
        receivedFilesList.innerHTML = ''; // Clear received files list
        downloadAllBtn.disabled = true;
        downloadZipBtn.disabled = true;
        receiveSpeedIndicator.textContent = '-- MB/s';
        chatMessagesReceiver.innerHTML = ''; // Clear chat
        chatPanelReceiver.classList.add('hidden');

        // Full reset specific actions
        if (fullReset) {
            filesToSend = [];
            totalBytesToSend = 0;
            updateFileListUI(); // Clear file list UI
            updateFileSummary(); // Reset summary
            selectedFilesSection.classList.add('hidden'); // Hide list section
            fileInput.value = ''; // Clear file input
            folderInput.value = ''; // Clear folder input
            passwordInputSender.value = ''; // Clear sender password input
            passwordSectionSender.classList.add('hidden'); // Hide sender password section
             if(isSender) generateBtn.disabled = true; // Ensure generate is disabled if no files
        } else if (isSender) {
            // Partial reset on sender tab (e.g., after failed connection)
             passwordSectionSender.classList.toggle('hidden', filesToSend.length === 0);
             generateBtn.disabled = filesToSend.length === 0;
        }

        // Ensure chat is disabled initially
        enableChat(false);
    }

    async function calculateHash(blob) {
        if (!cryptoAvailable) return null; // Crypto not supported
        try {
            const buffer = await blob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, buffer);
            // Convert buffer to byte array
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            // Convert bytes to hex string
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error('Hashing error:', error);
            return null; // Return null on error
        }
    }

    async function hashPassword(password) {
        if (!cryptoAvailable || !password) return null; // Need crypto and a password
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error("Password hashing error:", error);
            return null;
        }
    }


    // --- UI Updates (Progress, Speed, ETR) ---
    function updateSendProgress(sentBytes = totalBytesSent, statusMsg = null, statusType = 'info') {
        if (!sendStatusSection || !sendProgressBar || !sendProgressText || !sendProgressLabel) return;

        totalBytesSent = sentBytes; // Update global state

        const overallPercent = totalBytesToSend > 0 ? Math.min(100, (totalBytesSent / totalBytesToSend) * 100) : 0;

        sendProgressBar.style.width = overallPercent + '%';
        sendProgressText.textContent = `${formatBytes(totalBytesSent)} / ${formatBytes(totalBytesToSend)} (${Math.round(overallPercent)}%)`;

        let fileLabel = "Overall Progress";
        if (currentFileIndex < filesToSend.length) {
            const currentItem = filesToSend[currentFileIndex];
            const displayPath = currentItem.path !== currentItem.file.name ? ` (${currentItem.path})` : '';
            fileLabel = `Sending: ${currentItem.file.name}${displayPath} (${currentFileIndex + 1}/${filesToSend.length})`;
        } else if (totalBytesSent >= totalBytesToSend && filesToSend.length > 0) {
            fileLabel = `Sent ${filesToSend.length} item(s)`;
            updateStatusMessage(sendStatusMessage, 'Transfer complete!', 'success'); // Explicit completion message
            addHistoryEntry(filesToSend.map(f => f.file.name).join(', '), totalBytesToSend, true);
            stopSpeedAndETRCalc(); // Stop calc on completion
            pauseResumeBtn.disabled = true;
            cancelTransferBtn.disabled = true; // Disable controls on completion
        }
        sendProgressLabel.textContent = fileLabel;

        if (statusMsg !== null) {
            updateStatusMessage(sendStatusMessage, statusMsg, statusType);
        }
        sendStatusSection.classList.remove('hidden'); // Ensure section is visible
    }

    function updateReceiveProgress(receivedBytes = receivedSize, statusMsg = null, statusType = 'info') {
        if (!receiveStatusSection || !receiveProgressBar || !receiveProgressText || !receiveProgressLabel) return;

        const totalSize = filesMetadata ? filesMetadata.reduce((sum, meta) => sum + meta.size, 0) : 0;
        const overallPercent = totalSize > 0 ? Math.min(100, (receivedBytes / totalSize) * 100) : 0;

        receiveProgressBar.style.width = overallPercent + '%';
        receiveProgressText.textContent = `${formatBytes(receivedBytes)} / ${formatBytes(totalSize)} (${Math.round(overallPercent)}%)`;

        let fileLabel = "Overall Progress";
        if (filesMetadata && currentReceivingFileIndex < filesMetadata.length) {
            const currentFileMeta = filesMetadata[currentReceivingFileIndex];
            const displayPath = currentFileMeta.path !== currentFileMeta.name ? ` (${currentFileMeta.path})` : '';
            fileLabel = `Receiving: ${currentFileMeta.name}${displayPath} (${currentReceivingFileIndex + 1}/${filesMetadata.length})`;
        } else if (receivedBytes >= totalSize && filesMetadata && filesMetadata.length > 0) {
            // Completion handled within handleDataChannelMessage when last file is processed
            fileLabel = `Received ${filesMetadata.length} item(s)`;
        }
        receiveProgressLabel.textContent = fileLabel;

        if (statusMsg !== null) {
            updateStatusMessage(receiveStatusMessage, statusMsg, statusType);
        }
        receiveStatusSection.classList.remove('hidden'); // Ensure section is visible
    }

    function startSpeedAndETRCalc() {
        stopSpeedAndETRCalc(); // Clear any existing interval
        lastMeasurementTime = Date.now();
        lastMeasurementSentBytes = totalBytesSent;
        lastMeasurementReceivedBytes = receivedSize;
        transferStartTime = Date.now(); // Reset start time

        console.log("Starting speed calculation interval.");

        speedIntervalId = setInterval(() => {
            const now = Date.now();
            const timeDiffSeconds = (now - lastMeasurementTime) / 1000;

            if (timeDiffSeconds <= 0.1) return; // Avoid division by zero or tiny intervals

            let currentSpeed = 0; // Bytes per second
            let bytesRemaining = 0;
            let currentTotalBytes = 0;

            if (isSender) {
                const bytesSentDiff = totalBytesSent - lastMeasurementSentBytes;
                currentSpeed = bytesSentDiff / timeDiffSeconds;
                lastMeasurementSentBytes = totalBytesSent;
                currentTotalBytes = totalBytesToSend;
                bytesRemaining = currentTotalBytes - totalBytesSent;
            } else { // Receiver
                const bytesReceivedDiff = receivedSize - lastMeasurementReceivedBytes;
                currentSpeed = bytesReceivedDiff / timeDiffSeconds;
                lastMeasurementReceivedBytes = receivedSize;
                currentTotalBytes = filesMetadata ? filesMetadata.reduce((sum, meta) => sum + meta.size, 0) : 0;
                bytesRemaining = currentTotalBytes - receivedSize;
            }

            lastMeasurementTime = now;

            const speedMBps = currentSpeed / 1024 / 1024;
            const speedDisplay = speedMBps >= 0 ? `${speedMBps.toFixed(2)} MB/s` : '-- MB/s';

            let etrDisplay = 'ETR: --';
            // Calculate ETR only if speed is meaningful and bytes remain
            if (currentSpeed > 512 && bytesRemaining > 0) { // Threshold for calculation (e.g., > 0.5 KB/s)
                const etrSeconds = bytesRemaining / currentSpeed;
                if (isFinite(etrSeconds)) {
                    if (etrSeconds < 60) {
                        etrDisplay = `ETR: ~${Math.round(etrSeconds)}s`;
                    } else if (etrSeconds < 3600) {
                        etrDisplay = `ETR: ~${Math.round(etrSeconds / 60)}m`;
                    } else {
                        etrDisplay = `ETR: ~${Math.round(etrSeconds / 3600)}h`;
                    }
                }
            } else if (bytesRemaining <= 0 && currentTotalBytes > 0) {
                etrDisplay = 'ETR: Done'; // Explicitly show done
            }

            // Update UI
            if (isSender) {
                if(speedIndicator) speedIndicator.textContent = speedDisplay;
                if(etrIndicator) etrIndicator.textContent = etrDisplay;
            } else {
                if(receiveSpeedIndicator) receiveSpeedIndicator.textContent = speedDisplay;
                // ETR is typically only shown for sending, but could be added here if desired
            }

        }, SPEED_INTERVAL);
    }

    function stopSpeedAndETRCalc() {
        if (speedIntervalId) {
            clearInterval(speedIntervalId);
            speedIntervalId = null;
            console.log("Stopped speed calculation interval.");
        }
        // Reset indicators if transfer is not complete
        if (isSender) {
             if (totalBytesSent < totalBytesToSend) {
                 if(speedIndicator) speedIndicator.textContent = '-- MB/s';
                 if(etrIndicator) etrIndicator.textContent = 'ETR: --';
             }
        } else {
             const totalSize = filesMetadata ? filesMetadata.reduce((sum, meta) => sum + meta.size, 0) : 0;
             if (receivedSize < totalSize) {
                 if(receiveSpeedIndicator) receiveSpeedIndicator.textContent = '-- MB/s';
             }
        }
    }

    // --- QR Code Gen/Scan ---
    function generateQRCode(elementId, text) {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            console.error(`QR Code target element not found: ${elementId}`);
            return;
        }
        targetElement.innerHTML = ''; // Clear previous QR code

        // Basic check for text length (adjust limit as needed)
        if (text.length > 2000) {
            console.warn("QR Code data is very long, might be hard to scan.");
        }

        try {
            // Use the qrcode-generator library (assuming it's globally available)
            const typeNumber = 0; // Auto-detect type number (size)
            const errorCorrectionLevel = 'M'; // Medium error correction
            const qr = qrcode(typeNumber, errorCorrectionLevel);
            qr.addData(text);
            qr.make();
            // Use createSvgTag for scalable vector output
            targetElement.innerHTML = qr.createSvgTag({ scalable: true });
        } catch (e) {
            console.error("QR Code generation error:", e);
            targetElement.innerHTML = '<p style="color: var(--error-color); font-size: 0.9em;">Error generating QR code.</p>';
        }
    }

    function startScanner(readerElementId, statusElementId, containerElementId, scannerVarName, successCallback) {
        stopAllScanners(); // Stop any other active scanner

        const scannerContainer = document.getElementById(containerElementId);
        const statusElement = document.getElementById(statusElementId);
        if (!scannerContainer || !statusElement || !Html5Qrcode) {
            console.error("Scanner elements or Html5Qrcode library not found.");
            if (statusElement) statusElement.textContent = "Scanner setup error.";
            return;
        }

        scannerContainer.classList.remove('hidden');
        statusElement.textContent = 'Initializing scanner...';
        statusElement.className = ''; // Reset status class

        try {
            // Create a new scanner instance targeting the specific element
            const html5QrCode = new Html5Qrcode(readerElementId);

            // Store the instance reference
            if (scannerVarName === 'offer') offerQrScanner = html5QrCode;
            else if (scannerVarName === 'answer') answerQrScanner = html5QrCode;

            // Start scanning
            html5QrCode.start(
                { facingMode: "environment" }, // Prefer rear camera
                QR_SCANNER_CONFIG,
                (decodedText, decodedResult) => {
                    // Success callback
                    console.log(`QR Code Scanned (${scannerVarName}): ${decodedText}`);
                    statusElement.textContent = 'Scan successful!';
                    statusElement.className = 'success'; // Add success class
                    stopScanner(scannerVarName); // Stop this specific scanner
                    successCallback(decodedText); // Pass the result back
                },
                (errorMessage) => {
                    // Optional: handle scan errors or non-detections (called frequently)
                    // console.log(`QR Scan message: ${errorMessage}`);
                    // statusElement.textContent = 'Scanning... No QR code found.'; // Can be noisy
                }
            )
            .then(() => {
                 statusElement.textContent = 'Scanning for QR code...'; // Update status after start promise resolves
            })
            .catch((err) => {
                console.error(`Error starting scanner (${scannerVarName}):`, err);
                statusElement.textContent = `Scanner Error: ${err}. Requires camera access & HTTPS.`;
                statusElement.className = 'error'; // Add error class
                scannerContainer.classList.add('hidden'); // Hide on error
                // Clear the instance reference on error
                if (scannerVarName === 'offer') offerQrScanner = null;
                else if (scannerVarName === 'answer') answerQrScanner = null;
            });

        } catch (e) {
            console.error("Html5Qrcode library error:", e);
            statusElement.textContent = 'Scanner library failed to load.';
            statusElement.className = 'error';
            scannerContainer.classList.add('hidden');
        }
    }

    function stopScanner(scannerVarName) {
        let scannerInstance = null;
        let containerElementId = '';

        if (scannerVarName === 'offer') {
            scannerInstance = offerQrScanner;
            containerElementId = 'offer-scanner-area';
            offerQrScanner = null; // Clear reference
        } else if (scannerVarName === 'answer') {
            scannerInstance = answerQrScanner;
            containerElementId = 'answer-scanner-area';
            answerQrScanner = null; // Clear reference
        } else {
            return; // Unknown scanner name
        }

        const scannerContainer = document.getElementById(containerElementId);

        if (scannerInstance && typeof scannerInstance.getState === 'function') {
            try {
                // Check if the scanner is actively scanning before stopping
                const state = scannerInstance.getState();
                 // Check for states where stopping is applicable
                if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                    scannerInstance.stop()
                        .then(() => {
                            console.log(`${scannerVarName} scanner stopped successfully.`);
                        })
                        .catch(err => {
                            console.error(`Error stopping ${scannerVarName} scanner:`, err);
                        })
                        .finally(() => {
                            // Always hide the container after attempting to stop
                            if (scannerContainer) scannerContainer.classList.add('hidden');
                        });
                } else {
                     // If not scanning, just hide the container
                     if (scannerContainer) scannerContainer.classList.add('hidden');
                }
            } catch (e) {
                console.warn("Error checking scanner state:", e);
                // Hide container as a fallback
                if (scannerContainer) scannerContainer.classList.add('hidden');
            }
        } else {
             // If instance doesn't exist or is invalid, just hide the container
             if (scannerContainer) scannerContainer.classList.add('hidden');
        }
    }

    function stopAllScanners() {
        stopScanner('offer');
        stopScanner('answer');
    }


    // --- File Handling & UI ---
    if (browseLink) {
        browseLink.onclick = (e) => {
            e.preventDefault(); // Prevent '#' navigation
            fileInput?.click(); // Trigger hidden file input
        };
    }

    if (fileInput) fileInput.onchange = (e) => handleFileSelection(e.target.files);
    if (folderInput) folderInput.onchange = (e) => handleFileSelection(e.target.files);

    // Drag and Drop Handlers
    if (dropZone) {
        dropZone.ondragover = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        };
        dropZone.ondragleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        };
        dropZone.ondrop = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');

            const items = e.dataTransfer.items;
            let filesToProcess = [];

            if (items && items.length > 0 && items[0].webkitGetAsEntry) {
                 // Use DataTransferItemList API for folder support
                const promises = [];
                for (let i = 0; i < items.length; i++) {
                    const entry = items[i].webkitGetAsEntry();
                    if (entry) {
                        promises.push(traverseFileTree(entry));
                    }
                }
                 try {
                    const nestedFiles = await Promise.all(promises);
                    filesToProcess = nestedFiles.flat(); // Flatten the array of arrays
                 } catch (err) {
                     console.error("Error traversing file tree:", err);
                     alert("Error reading dropped folder(s). Please try selecting them manually.");
                 }
            } else if (e.dataTransfer.files) {
                // Fallback for browsers not supporting getAsEntry or for file drops
                filesToProcess = Array.from(e.dataTransfer.files).map(file => ({ file, path: file.name })); // Create objects with path
            }

            handleFileSelection(filesToProcess);
        };
        // Allow clicking area (except links/labels) to trigger file input
        dropZone.onclick = (e) => {
            if (!e.target.matches('a') && !e.target.matches('label') && !e.target.closest('a') && !e.target.closest('label')) {
                fileInput?.click();
            }
        };
    }

    async function traverseFileTree(entry, currentPath = '') {
        const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        let files = [];

        if (entry.isFile) {
            try {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                 files.push({ file: file, path: path }); // Store as object with path
            } catch (err) {
                console.error(`Error getting file ${path}:`, err);
            }
        } else if (entry.isDirectory) {
            try {
                 const reader = entry.createReader();
                 const entries = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
                 const promises = [];
                 for (let i = 0; i < entries.length; i++) {
                     promises.push(traverseFileTree(entries[i], path));
                 }
                 const nestedFiles = await Promise.all(promises);
                 files = files.concat(nestedFiles.flat()); // Collect files from subdirectories
            } catch (err) {
                 console.error(`Error reading directory ${path}:`, err);
            }
        }
        return files;
    }

    function handleFileSelection(selectedItems) {
        if (!selectedItems || selectedItems.length === 0) return;

        let filesAddedCount = 0;
        const newFiles = [];

        for (const item of selectedItems) {
            let file = null;
            let path = null;

            if (item instanceof File) { // From file input or simple drag/drop
                file = item;
                path = item.webkitRelativePath || item.name; // Use relative path if available (folders)
            } else if (item && item.file instanceof File && typeof item.path === 'string') { // From traverseFileTree
                file = item.file;
                path = item.path;
            } else {
                console.warn("Skipping invalid item:", item);
                continue;
            }

            // Check for duplicates based on path AND size (more robust)
            if (filesToSend.some(existing => existing.path === path && existing.file.size === file.size)) {
                console.warn(`Skipping duplicate: ${path} (Size: ${file.size})`);
                continue;
            }

            // Add the new file object to our list
            newFiles.push({ file: file, path: path });
            totalBytesToSend += file.size;
            filesAddedCount++;
        }

        if (filesAddedCount > 0) {
             filesToSend = filesToSend.concat(newFiles); // Add new files to the main list
             updateFileListUI();
             updateFileSummary();
             selectedFilesSection.classList.remove('hidden');
             generateBtn.disabled = false; // Enable generate button
             passwordSectionSender.classList.remove('hidden'); // Show password option
             console.log(`Added ${filesAddedCount} items. Total: ${filesToSend.length}`);
        }

        // Reset input fields to allow selecting same file/folder again
        if (fileInput) fileInput.value = '';
        if (folderInput) folderInput.value = '';
    }

    function updateFileListUI() {
        if (!selectedFilesList) return;

        selectedFilesList.innerHTML = ''; // Clear existing list
        revokeObjectUrls(); // Clean up old preview URLs before creating new ones

        filesToSend.forEach((item, index) => {
            const file = item.file;
            const path = item.path;
            const li = document.createElement('li');
            li.className = 'file-item';
            li.dataset.index = index; // Store index for removal

            // --- Preview Column ---
            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview';
            const fileType = file.type || '';
            // Generate preview for small images/videos
            if ((fileType.startsWith('image/') || fileType.startsWith('video/')) && file.size < 20 * 1024 * 1024) { // Limit preview size
                 const element = fileType.startsWith('image/') ? document.createElement('img') : document.createElement('video');
                 const objectURL = URL.createObjectURL(file);
                 objectUrls.push(objectURL); // Track URL for revocation
                 element.src = objectURL;

                 if (fileType.startsWith('video/')) {
                     element.muted = true;
                     element.preload = 'metadata'; // Load only metadata initially
                 }
                 element.alt = `Preview for ${file.name}`;
                 element.onerror = () => { // Fallback to icon on error
                     previewDiv.innerHTML = `<i class="fas ${getFileIconClass(fileType)}"></i>`;
                 };
                 previewDiv.appendChild(element);
                 // Add dblclick listener for modal preview
                 li.ondblclick = () => openPreviewModal(element);
            } else {
                // Use Font Awesome icon as fallback
                previewDiv.innerHTML = `<i class="fas ${getFileIconClass(fileType)}"></i>`;
            }

            // --- Info Column ---
            const infoDiv = document.createElement('div');
            infoDiv.className = 'file-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-name';
            nameSpan.textContent = file.name;
            nameSpan.title = file.name; // Tooltip for long names
            infoDiv.appendChild(nameSpan);

            // Display path only if it's different from the filename (i.e., it's in a folder)
            if (path !== file.name) {
                const pathSpan = document.createElement('span');
                pathSpan.className = 'file-path';
                pathSpan.textContent = path;
                pathSpan.title = path; // Tooltip for long paths
                infoDiv.appendChild(pathSpan);
            }

            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'file-size';
            sizeSpan.textContent = formatBytes(file.size);
            infoDiv.appendChild(sizeSpan);

            // --- Remove Button ---
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file-btn';
            removeBtn.innerHTML = '&times;'; // Use × symbol
            removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
            removeBtn.title = `Remove ${file.name}`;
            // Use window.removeFile since this is dynamically created HTML
            removeBtn.onclick = (e) => {
                 e.stopPropagation(); // Prevent triggering dblclick on li
                 window.removeFile(index); // Call the globally accessible function
            };


            // --- Assemble List Item ---
            li.appendChild(previewDiv);
            li.appendChild(infoDiv);
            li.appendChild(removeBtn); // Add remove button last

            selectedFilesList.appendChild(li);
        });
    }

    function updateFileSummary() {
        if (!fileSummarySpan) return;
        const count = filesToSend.length;
        fileSummarySpan.textContent = `${count} item${count !== 1 ? 's' : ''} (${formatBytes(totalBytesToSend)})`;
    }

    function revokeObjectUrls() {
        if (objectUrls.length > 0) {
            console.log(`Revoking ${objectUrls.length} preview URLs.`);
            objectUrls.forEach(url => URL.revokeObjectURL(url));
            objectUrls = []; // Clear the array
        }
    }


    // --- WebRTC Signaling & Connection ---
    if (generateBtn) {
        generateBtn.onclick = async () => { // Sender starts process
            if (filesToSend.length === 0) {
                alert("Please select files or a folder to share first.");
                return;
            }
            resetState(false); // Partial reset, keep files
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
            updateStatusMessage(sendStatusMessage, 'Preparing connection...', 'info');
            sendStatusSection.classList.remove('hidden');

            // Hash password if provided
            const senderPassword = passwordInputSender.value;
            passwordHash = senderPassword ? await hashPassword(senderPassword) : null;
            if (senderPassword && !passwordHash && cryptoAvailable) { // Check cryptoAvailable here
                updateStatusMessage(sendStatusMessage, 'Error hashing password. Cannot proceed.', 'error');
                generateBtn.disabled = false; // Re-enable button
                generateBtn.innerHTML = '<i class="fas fa-share-alt"></i> Generate Share Code';
                return;
            }
             if (senderPassword && !cryptoAvailable) {
                 alert("Cannot use password feature: Secure Context (HTTPS/localhost) required for hashing.");
                 updateStatusMessage(sendStatusMessage, 'Password feature disabled (insecure context).', 'warning');
                 // Optionally clear password or disable field
                 passwordInputSender.value = '';
                 passwordHash = null; // Ensure hash is null
            }


            console.log('Sender: Creating Peer Connection');
            try {
                peerConnection = new RTCPeerConnection(ICE_SERVERS);
                addPeerConnectionEvents(peerConnection); // Attach event listeners

                console.log('Sender: Creating Data Channel');
                dataChannel = peerConnection.createDataChannel('ShareWaveV5Channel', { ordered: true });
                addDataChannelEvents(dataChannel); // Attach data channel listeners

                console.log('Sender: Creating Offer');
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                console.log('Sender: Local description set.');

                // Wait briefly for ICE candidates to gather
                setTimeout(() => {
                    if (!peerConnection || !peerConnection.localDescription) {
                        console.error("Offer generation failed or connection closed prematurely.");
                        updateStatusMessage(sendStatusMessage, 'Error: Failed to generate offer.', 'error');
                        resetState(false); // Reset UI state
                        return;
                    }
                    const offerSDP = JSON.stringify(peerConnection.localDescription);
                    offerSdpTextarea.value = offerSDP;
                    generateQRCode('offer-qr-code', offerSDP); // Generate QR from SDP

                    offerStep.classList.remove('hidden');
                    answerStep.classList.remove('hidden');
                    updateStatusMessage(sendStatusMessage, `Share Code generated. ${passwordHash ? 'Password is set. ' : ''}Waiting for Receiver...`, 'info');
                    generateBtn.innerHTML = '<i class="fas fa-check"></i> Code Generated'; // Update button state
                    console.log('Sender: Offer ready.');

                }, 500); // 500ms delay for ICE gathering

            } catch (error) {
                console.error('Offer Creation/Setup Error:', error);
                updateStatusMessage(sendStatusMessage, `Error creating offer: ${error.message}`, 'error');
                resetState(false); // Reset state but keep files
                generateBtn.disabled = filesToSend.length === 0; // Re-enable if files exist
                generateBtn.innerHTML = '<i class="fas fa-share-alt"></i> Generate Share Code';
                closePeerConnection(); // Clean up any partial connection
            }
        };
    }

    if (scanAnswerQrBtn) {
        scanAnswerQrBtn.onclick = () => {
            // Call startScanner with relevant IDs and callback
            startScanner(
                'answer-scanner-box',      // Element ID for the video feed/scanner UI
                'answer-scan-status',      // Element ID for status messages
                'answer-scanner-area',     // Element ID for the scanner container div
                'answer',                  // Identifier for this scanner instance
                (scannedText) => {         // Success callback
                    answerSdpTextarea.value = scannedText; // Populate textarea with scanned code
                }
            );
        };
    }

    if (connectBtn) {
        connectBtn.onclick = async () => { // Sender connects using Receiver's answer
            const answerSdpText = answerSdpTextarea.value.trim();
            if (!answerSdpText) {
                updateStatusMessage(sendStatusMessage, 'Please paste or scan the Receiver\'s code first.', 'warning');
                return;
            }

            if (!peerConnection || peerConnection.signalingState !== 'have-local-offer') {
                // This can happen if the connection was closed or never properly initialized
                updateStatusMessage(sendStatusMessage, 'Connection state error. Please regenerate your Share Code.', 'error');
                resetState(false); // Reset state, keep files
                return;
            }

            connectBtn.disabled = true;
            connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            updateStatusMessage(sendStatusMessage, 'Processing Receiver\'s code...', 'info');

            try {
                const answer = JSON.parse(answerSdpText);
                // Validate if it looks like an SDP answer (basic check)
                if (!answer || answer.type !== 'answer' || !answer.sdp) {
                    throw new Error("Invalid Answer SDP format.");
                }
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('Sender: Remote description (Answer) set.');
                updateStatusMessage(sendStatusMessage, 'Receiver code accepted. Establishing connection...', 'info');
                // Connection state change events will handle further updates ('connecting', 'connected')
            } catch (error) {
                console.error('Set Remote Description (Answer) Error:', error);
                updateStatusMessage(sendStatusMessage, `Connection Error: Invalid code or network issue. ${error.message}`, 'error');
                connectBtn.disabled = false; // Re-enable connect button
                connectBtn.innerHTML = '<i class="fas fa-link"></i> Connect';
                // Do not reset fully here, allow user to retry with corrected code
            }
        };
    }

    if (scanOfferQrBtn) {
        scanOfferQrBtn.onclick = () => {
            // Call startScanner for the offer code
            startScanner(
                'offer-scanner-box',
                'offer-scan-status',
                'offer-scanner-area',
                'offer',
                (scannedText) => {
                    offerSdpInputTextarea.value = scannedText; // Populate receiver's input
                }
            );
        };
    }

    if (generateAnswerBtn) {
        generateAnswerBtn.onclick = async () => { // Receiver generates Answer from Sender's Offer
            const offerSdpText = offerSdpInputTextarea.value.trim();
            if (!offerSdpText) {
                updateStatusMessage(receiveStatusMessage, 'Please paste or scan the Sender\'s code first.', 'warning');
                receiveStatusSection.classList.remove('hidden'); // Show status section for message
                return;
            }

            resetState(false); // Partial reset for receiver
            generateAnswerBtn.disabled = true;
            generateAnswerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            updateStatusMessage(receiveStatusMessage, 'Processing Sender\'s code...', 'info');
            receiveStatusSection.classList.remove('hidden'); // Show status

            try {
                const offer = JSON.parse(offerSdpText);
                 // Validate if it looks like an SDP offer (basic check)
                if (!offer || offer.type !== 'offer' || !offer.sdp) {
                    throw new Error("Invalid Offer SDP format.");
                }

                console.log('Receiver: Creating Peer Connection');
                peerConnection = new RTCPeerConnection(ICE_SERVERS);
                addPeerConnectionEvents(peerConnection); // Attach event listeners

                // IMPORTANT: Set up the data channel handler *before* setting remote description
                peerConnection.ondatachannel = (event) => {
                    console.log('Receiver: Data Channel Received');
                    dataChannel = event.channel;
                    addDataChannelEvents(dataChannel); // Attach listeners to the received channel
                };

                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                console.log('Receiver: Remote description (Offer) set.');

                console.log('Receiver: Creating Answer');
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                console.log('Receiver: Local description (Answer) set.');

                // Wait briefly for ICE candidates
                setTimeout(() => {
                    if (!peerConnection || !peerConnection.localDescription) {
                        console.error("Answer generation failed or connection closed prematurely.");
                        updateStatusMessage(receiveStatusMessage, 'Error: Failed to generate response code.', 'error');
                        resetState(false); // Reset UI state
                        return;
                    }
                    const answerSDP = JSON.stringify(peerConnection.localDescription);
                    answerSdpOutputTextarea.value = answerSDP;
                    generateQRCode('answer-qr-code', answerSDP); // Generate QR

                    answerOutputStep.classList.remove('hidden'); // Show answer output
                    offerInputStep.classList.add('hidden'); // Hide offer input
                    updateStatusMessage(receiveStatusMessage, "Response code generated. Share it with the Sender. Waiting for connection...", 'info');
                    generateAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Code Generated';
                    console.log('Receiver: Answer ready.');

                }, 500); // Delay for ICE

            } catch (error) {
                console.error('Answer Creation/Setup Error:', error);
                updateStatusMessage(receiveStatusMessage, `Error processing Sender code: ${error.message}. Please check the code and try again.`, 'error');
                resetState(false); // Reset receiver state
                generateAnswerBtn.disabled = false; // Re-enable button
                generateAnswerBtn.innerHTML = '<i class="fas fa-reply"></i> Generate Response Code';
                offerInputStep.classList.remove('hidden'); // Show offer input again
                closePeerConnection(); // Clean up any partial connection
            }
        };
    }

    // Receiver Verify Password Button Click Handler
    if (verifyPasswordBtn) {
        verifyPasswordBtn.onclick = async () => {
            const receiverPassword = passwordInputReceiver.value;
            if (!receiverPassword) {
                alert("Please enter the password provided by the sender.");
                return;
            }
             if (!cryptoAvailable) {
                 alert("Cannot verify password: Secure Context (HTTPS/localhost) required for hashing.");
                 // Optionally disable field or hide section again
                 return;
             }


            verifyPasswordBtn.disabled = true;
            verifyPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

            const receiverHash = await hashPassword(receiverPassword);
            if (!receiverHash) {
                alert("Error hashing password. Cannot verify.");
                verifyPasswordBtn.disabled = false;
                verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
                return;
            }

            // Send the hashed password to the sender for verification
            sendControlMessage({ type: 'password_check', hash: receiverHash });
            updateStatusMessage(receiveStatusMessage, "Verifying password with sender...", 'info');

            // The sender will respond with 'password_correct' or 'password_incorrect' via control messages
            // UI update (hiding section) happens after response or timeout ideally, but hiding immediately simplifies UI flow.
            // Re-enable button in case of error/retry needed (handled in message handler)
            // verifyPasswordBtn.disabled = false; // Re-enablement handled by message responses
            // verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
            // Consider adding a timeout here in case the sender doesn't respond
        };
    }


    // --- WebRTC Event Handlers ---
    function addPeerConnectionEvents(pc) {
        if (!pc) return;

        pc.onicecandidate = (event) => {
            // Although we use Trickle ICE implicitly, logging candidates can be useful for debugging
            if (event.candidate) {
                console.log(`ICE Candidate: ${event.candidate.sdpMLineIndex} ${event.candidate.candidate.split(' ')[4]}`);
            } else {
                console.log("ICE Candidate gathering complete.");
            }
        };

        pc.onicegatheringstatechange = () => {
             if (pc) { // Check if pc still exists
                 console.log(`ICE Gathering State: ${pc.iceGatheringState}`);
             }
        };

        pc.onsignalingstatechange = () => {
             if (pc) { // Check if pc still exists
                console.log(`Signaling State: ${pc.signalingState}`);
             }
        };

        pc.onconnectionstatechange = () => {
             if (!pc) return; // Connection might have been closed

             console.log(`Connection State: ${pc.connectionState}`);
             const statusMsgElement = isSender ? sendStatusMessage : receiveStatusMessage;

             switch (pc.connectionState) {
                 case 'new':
                 case 'checking':
                     updateStatusMessage(statusMsgElement, 'Establishing connection...', 'info');
                     break;
                 case 'connecting':
                     updateStatusMessage(statusMsgElement, 'Connecting to peer...', 'info');
                     break;
                 case 'connected':
                     // Connection established! Now wait for data channel to open.
                     updateStatusMessage(statusMsgElement, 'Peer connected! Initializing data channel...', 'success');
                     // Hide signaling UI elements
                     offerStep?.classList.add('hidden');
                     answerStep?.classList.add('hidden');
                     offerInputStep?.classList.add('hidden');
                     answerOutputStep?.classList.add('hidden');
                     // Chat can be enabled once data channel is open
                     if (isSender) {
                         cancelTransferBtn.disabled = false; // Enable cancel early
                         // Pause/Resume enabled later when transfer actually starts
                     } else {
                         downloadAllBtn.disabled = true; // Downloads enabled when files are received
                         downloadZipBtn.disabled = true;
                     }
                     break;
                 case 'disconnected':
                     // May recover automatically, but often indicates a problem
                     updateStatusMessage(statusMsgElement, 'Connection disconnected. Attempting to reconnect...', 'warning');
                     enableChat(false);
                     stopSpeedAndETRCalc(); // Pause calculation
                     // Don't close connection immediately, WebRTC might recover
                     break;
                 case 'closed':
                     updateStatusMessage(statusMsgElement, 'Connection closed.', 'info');
                     enableChat(false);
                     closePeerConnection(); // Ensure cleanup
                     // Check if transfer was incomplete
                     const isIncomplete = isSender ? (totalBytesSent < totalBytesToSend && totalBytesToSend > 0) : (receivedSize < (filesMetadata ? filesMetadata.reduce((s, m) => s + m.size, 0) : 0) && filesMetadata);
                     if (isIncomplete) {
                         updateStatusMessage(statusMsgElement, 'Connection closed: Transfer incomplete.', 'warning');
                          addHistoryEntry(
                             isSender ? filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                             isSender ? totalBytesSent : receivedSize,
                             false, // Not successful
                             false  // Not explicitly cancelled (unless cancel message was received prior)
                         );
                     }
                     break;
                 case 'failed':
                     updateStatusMessage(statusMsgElement, 'Connection failed. Please check network and restart transfer.', 'error');
                     enableChat(false);
                     closePeerConnection(); // Clean up failed connection

                     // Reset buttons to allow retry
                     if (isSender) {
                         generateBtn.disabled = filesToSend.length === 0;
                         connectBtn.disabled = false;
                         connectBtn.innerHTML = '<i class="fas fa-link"></i> Connect';
                         answerStep?.classList.remove('hidden'); // Show answer input again potentially
                     } else {
                         generateAnswerBtn.disabled = false;
                         generateAnswerBtn.innerHTML = '<i class="fas fa-reply"></i> Generate Response Code';
                         offerInputStep?.classList.remove('hidden'); // Show offer input again
                     }
                      addHistoryEntry(
                         isSender ? filesToSend.map(f => f.file.name).join(', ') : 'N/A', // Filenames might not be known on receiver fail
                         0, false, false
                     );
                     break;
             }
        };
    }

    function addDataChannelEvents(dc) {
        if (!dc) return;

        dc.onopen = () => {
            console.log('Data Channel Opened');
            enableChat(true); // Enable chat input/buttons

            if (isSender) {
                updateSendProgress(0, 'Data channel open. Calculating hashes & sending file details...', 'info');
                sendMetadata(); // Sender initiates by sending metadata (includes password flag, calculates hashes)
            } else {
                updateReceiveProgress(0, 'Data channel open. Waiting for file details from sender...', 'info');
                // Receiver waits for 'metadata' message before proceeding
            }
        };

        dc.onclose = () => {
            console.log('Data Channel Closed');
            enableChat(false);
            stopSpeedAndETRCalc(); // Stop speed calculation
            const statusMsgElement = isSender ? sendStatusMessage : receiveStatusMessage;
            const currentBytes = isSender ? totalBytesSent : receivedSize;
            const totalBytes = isSender ? totalBytesToSend : (filesMetadata ? filesMetadata.reduce((s, m) => s + m.size, 0) : 0);

            // Check if closed unexpectedly during transfer
             if (peerConnection && ['connected', 'connecting', 'checking'].includes(peerConnection.connectionState) && currentBytes < totalBytes && totalBytes > 0) {
                 updateStatusMessage(statusMsgElement, 'Transfer interrupted: Data channel closed unexpectedly.', 'error');
                  addHistoryEntry(
                     isSender ? filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                     currentBytes, false, false
                 );
             } else if (currentBytes >= totalBytes && totalBytes > 0) {
                 console.log("Data channel closed normally after transfer completion.");
                 // Status already updated in progress functions or message handlers
             } else {
                  console.log("Data channel closed normally.");
                 // No action needed if transfer wasn't in progress or already handled
             }
            // Disable transfer controls
            pauseResumeBtn.disabled = true;
            cancelTransferBtn.disabled = true;
            // Consider calling full closePeerConnection if state requires it
            // closePeerConnection();
        };

        dc.onerror = (error) => {
            console.error('Data Channel Error:', error);
            enableChat(false);
            stopSpeedAndETRCalc();
            const statusMsgElement = isSender ? sendStatusMessage : receiveStatusMessage;
            updateStatusMessage(statusMsgElement, `Transfer error: ${error.error?.message || 'Unknown data channel error'}. Connection closed.`, 'error');
             addHistoryEntry(
                isSender ? filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                isSender ? totalBytesSent : receivedSize, false, false
            );
            closePeerConnection(); // Close connection fully on data channel error
            pauseResumeBtn.disabled = true;
            cancelTransferBtn.disabled = true;
        };

        // Handle incoming messages (both ArrayBuffer chunks and JSON control messages)
        dc.onmessage = handleDataChannelMessage;

        // Monitor buffered amount (optional but good practice)
         dc.onbufferedamountlow = () => {
             // console.log("Data channel buffer low - ready for more data.");
             // Can potentially trigger sending more data if a manual buffering strategy is used
         };
    }


    // --- Data Channel Message Handler ---
    async function handleDataChannelMessage(event) {
        // --- Binary Data (File Chunks) ---
        if (event.data instanceof ArrayBuffer) {
            if (isSender || transferPaused || !filesMetadata) {
                // Ignore chunks if sender, paused, or metadata not received yet
                 if (!filesMetadata && !isSender) console.warn("Received chunk before metadata.");
                return;
            }

            try {
                const chunk = event.data;
                if (currentReceivingFileIndex >= filesMetadata.length) {
                    console.warn("Received chunk after all files processed.");
                    return; // Already received all files
                }

                receiveBuffer.push(chunk);
                receivedSize += chunk.byteLength;
                currentFileReceivedSize += chunk.byteLength;

                updateReceiveProgress(receivedSize); // Update overall progress

                const currentFileMeta = filesMetadata[currentReceivingFileIndex];
                const currentListItem = receivedFilesList.querySelector(`li[data-filename="${CSS.escape(currentFileMeta.name)}"][data-filepath="${CSS.escape(currentFileMeta.path)}"]`);
                // Add transferring class visual indicator
                if (currentListItem && !currentListItem.classList.contains('transferring')) {
                    receivedFilesList.querySelectorAll('.transferring').forEach(el => el.classList.remove('transferring')); // Remove from others
                    currentListItem.classList.add('transferring');
                }


                // Check if the current file is complete
                if (currentFileReceivedSize >= currentFileMeta.size) {
                    console.log(`Receiver: File ${currentFileMeta.name} (${currentFileMeta.path}) chunk reception complete.`);
                     if (currentListItem) currentListItem.classList.remove('transferring');

                    // Assemble the blob - handle potential overshoot (rare)
                    const completeBuffer = receiveBuffer.slice(0); // Get all chunks for this file
                     const receivedBlob = new Blob(completeBuffer, { type: currentFileMeta.type });
                     // Ensure final blob size matches metadata exactly
                     const finalBlob = (receivedBlob.size > currentFileMeta.size)
                         ? receivedBlob.slice(0, currentFileMeta.size, currentFileMeta.type)
                         : receivedBlob;


                    // --- Hash Verification ---
                    const hashStatusElement = currentListItem?.querySelector('.file-hash-status');
                    if (hashStatusElement) {
                        hashStatusElement.textContent = 'Verifying...';
                        hashStatusElement.className = 'file-hash-status checking';
                    }

                     calculateHash(finalBlob).then(receivedHash => {
                         const expectedHash = currentFileMeta.hash;
                         const isValid = cryptoAvailable && expectedHash && receivedHash === expectedHash;
                         console.log(`File: ${currentFileMeta.name}, Expected Hash: ${expectedHash}, Received Hash: ${receivedHash}, Valid: ${isValid}`);

                         if (hashStatusElement) {
                              if (!cryptoAvailable) {
                                  hashStatusElement.textContent = 'No Verify';
                                  hashStatusElement.className = 'file-hash-status pending'; // Or a specific class
                              } else if (!expectedHash) {
                                 hashStatusElement.textContent = 'No Hash';
                                 hashStatusElement.className = 'file-hash-status pending';
                              } else {
                                 hashStatusElement.textContent = isValid ? 'Verified' : 'Invalid!';
                                 hashStatusElement.className = 'file-hash-status ' + (isValid ? 'valid' : 'invalid');
                              }
                         }

                        // Add file to received list only after potential hash check
                        receivedFiles.push({
                            blob: finalBlob,
                            name: currentFileMeta.name,
                            type: currentFileMeta.type,
                            path: currentFileMeta.path
                        });

                        // Update UI for this specific file item
                        if (currentListItem) {
                            currentListItem.classList.add('ready'); // Mark as ready
                            const downloadBtn = currentListItem.querySelector('.download-btn');
                            const fileSizeSpan = currentListItem.querySelector('.file-size');
                            if (downloadBtn) {
                                const objectURL = URL.createObjectURL(finalBlob);
                                objectUrls.push(objectURL); // Track URL
                                downloadBtn.href = objectURL;
                                downloadBtn.classList.remove('hidden'); // Show download button
                            }
                            if (fileSizeSpan) {
                                fileSizeSpan.textContent = formatBytes(finalBlob.size); // Update size display
                            }
                             // Add preview capability if applicable
                             if (currentFileMeta.type.startsWith('image/') || currentFileMeta.type.startsWith('video/')) {
                                 const previewEl = currentFileMeta.type.startsWith('image/') ? new Image() : document.createElement('video');
                                 previewEl.src = downloadBtn.href; // Use the created object URL
                                 currentListItem.ondblclick = () => openPreviewModal(previewEl);
                             }
                        }


                         // --- Move to next file or finish ---
                         receiveBuffer = []; // Clear buffer for the next file
                         currentReceivingFileIndex++;
                         currentFileReceivedSize = 0; // Reset size for the next file

                         if (currentReceivingFileIndex >= filesMetadata.length) {
                             // All files received
                             const totalSize = filesMetadata.reduce((s, m) => s + m.size, 0);
                             updateReceiveProgress(totalSize, 'All files received successfully!', 'success');
                             console.log("Receiver: All files processed.");
                             stopSpeedAndETRCalc(); // Stop speed calculation
                             downloadAllBtn.disabled = false; // Enable download buttons
                             downloadZipBtn.disabled = false;
                             // Add history entry for successful reception
                             addHistoryEntry(filesMetadata.map(f => f.name).join(', '), totalSize, true);
                         }

                     }).catch(hashError => {
                          console.error(`Error hashing received file ${currentFileMeta.name}:`, hashError);
                          if (hashStatusElement) {
                             hashStatusElement.textContent = 'Hash Error';
                             hashStatusElement.className = 'file-hash-status invalid';
                         }
                         // Decide how to handle hash errors - potentially still add file but mark as failed verification?
                         // For now, we proceed to the next file even if hashing fails locally.
                          receiveBuffer = [];
                          currentReceivingFileIndex++;
                          currentFileReceivedSize = 0;
                           if (currentReceivingFileIndex >= filesMetadata.length) { /* handle completion as above */ }
                     });
                }

            } catch (e) {
                console.error("Error processing received chunk:", e);
                updateReceiveProgress(receivedSize, `Error receiving file chunk: ${e.message}`, 'error');
                closePeerConnection(); // Critical error, stop transfer
            }
        }
        // --- JSON Control Messages ---
        else if (typeof event.data === 'string') {
            try {
                const message = JSON.parse(event.data);
                console.log("Control Message Received:", message);

                switch (message.type) {
                    case 'metadata':
                        if (isSender) return; // Sender shouldn't receive metadata

                        filesMetadata = message.payload;
                        if (!Array.isArray(filesMetadata)) {
                            throw new Error("Invalid metadata format received.");
                        }
                        isPasswordRequiredBySender = message.passwordRequired || false; // Check password flag

                        console.log('Receiver: Received metadata for', filesMetadata.length, 'files. Password Required:', isPasswordRequiredBySender);

                        // Reset receiver state for new transfer
                        receivedSize = 0;
                        currentReceivingFileIndex = 0;
                        currentFileReceivedSize = 0;
                        receivedFiles = [];
                        revokeObjectUrls();
                        receivedFilesList.innerHTML = ''; // Clear old list
                        receivedFilesSection.classList.add('hidden');
                        downloadAllBtn.disabled = true;
                        downloadZipBtn.disabled = true;


                        // Populate the received files list structure (without blobs yet)
                        filesMetadata.forEach(meta => {
                            addReceivedFileToList(null, meta.name, meta.type, meta.path, meta.hash);
                        });

                        // Handle password requirement
                        if (isPasswordRequiredBySender && cryptoAvailable) { // Only require password if crypto is available
                            passwordSectionReceiver.classList.remove('hidden'); // Show password input
                            updateReceiveProgress(0, 'Password required by sender. Please enter it to proceed.', 'warning');
                             passwordInputReceiver.focus(); // Focus input field
                        } else if (isPasswordRequiredBySender && !cryptoAvailable) {
                             updateReceiveProgress(0, 'Sender requires password, but verification is disabled (insecure context). Cannot proceed.', 'error');
                             // Optionally send a message back? Or just close.
                             sendControlMessage({ type: 'error', reason: 'password_unsupported_context' });
                             setTimeout(closePeerConnection, 1000);
                        } else {
                             // No password required, tell sender we're ready
                             updateReceiveProgress(0, 'File details received. Ready to start download.', 'info');
                             sendControlMessage({ type: 'ready_to_receive' });
                             startSpeedAndETRCalc(); // Start speed calc immediately
                        }
                        break;

                     case 'ready_to_receive': // Sender receives this after Receiver processes metadata (and potentially password)
                        if (!isSender) return;
                        console.log("Sender: Received 'ready_to_receive' signal from receiver.");
                         // This is the signal to start the actual file transfer
                         updateStatusMessage(sendStatusMessage, 'Receiver ready. Starting transfer...', 'info');
                         startSpeedAndETRCalc(); // Start speed calculation now
                         pauseResumeBtn.disabled = false; // Enable pause/resume
                         cancelTransferBtn.disabled = false; // Ensure cancel is enabled
                         sendFileChunk(); // Start sending the first chunk
                         break;

                    case 'password_check': // Sender receives hash from receiver
                        if (!isSender) return;
                        console.log("Sender: Received password check request.");

                        if (!passwordHash) {
                            console.warn("Received password check, but no password was set on sender side.");
                            // Send back an error? Or ignore? Sending error is better.
                            sendControlMessage({ type: 'error', reason: 'no_password_set' });
                            return;
                        }

                        const receivedPassHash = message.hash;
                        if (receivedPassHash === passwordHash) {
                            console.log("Sender: Password matches!");
                             // Don't start transfer here. Send confirmation and wait for 'ready_to_receive'.
                             sendControlMessage({ type: 'password_correct' });
                             updateStatusMessage(sendStatusMessage, 'Password correct. Waiting for receiver to start download...', 'info');
                        } else {
                            console.error("Sender: Password mismatch!");
                            sendControlMessage({ type: 'password_incorrect' });
                            updateStatusMessage(sendStatusMessage, 'Password incorrect. Closing connection.', 'error');
                            // Give receiver time to see message before closing
                            setTimeout(closePeerConnection, 1000);
                        }
                        break;

                    case 'password_correct': // Receiver gets confirmation
                         if (isSender) return;
                         console.log("Receiver: Password verified by sender.");
                         passwordSectionReceiver.classList.add('hidden'); // Hide password input
                         updateReceiveProgress(0, 'Password correct. Ready to start download.', 'success');
                         sendControlMessage({ type: 'ready_to_receive' }); // Now tell sender we are ready
                         startSpeedAndETRCalc(); // Start speed calc
                         break;


                    case 'password_incorrect': // Receiver gets rejection
                        if (isSender) return;
                        console.error("Receiver: Password incorrect according to sender.");
                        updateStatusMessage(receiveStatusMessage, 'Password incorrect. Connection closed by sender.', 'error');
                         passwordSectionReceiver.classList.remove('hidden'); // Show section again for retry? Or just close.
                         passwordInputReceiver.value = ''; // Clear wrong password
                         verifyPasswordBtn.disabled = false; // Re-enable verify button (might be closed soon though)
                         verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
                        // Don't close immediately, let user see the message. Sender will likely close.
                        // closePeerConnection();
                        break;

                    case 'chat':
                        if (message.text) {
                             displayChatMessage(message.text, false); // false = received message
                        }
                        break;

                    case 'pause_request':
                        if (isSender) return; // Only receiver handles pause requests
                        transferPaused = true;
                        updateStatusMessage(receiveStatusMessage, 'Transfer paused by sender.', 'warning');
                        stopSpeedAndETRCalc();
                        sendControlMessage({ type: 'pause_ack' }); // Acknowledge pause
                        break;

                    case 'pause_ack':
                        if (!isSender) return; // Only sender handles pause acknowledgments
                        updateStatusMessage(sendStatusMessage, 'Transfer paused.', 'warning');
                        pauseResumeBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                        // Speed calc should have been stopped when request was sent
                        break;

                    case 'resume_request':
                        if (isSender) return; // Only receiver handles resume requests
                        transferPaused = false;
                        updateStatusMessage(receiveStatusMessage, 'Transfer resumed by sender.', 'info');
                        startSpeedAndETRCalc();
                        sendControlMessage({ type: 'resume_ack' }); // Acknowledge resume
                        // Receiver doesn't need to trigger anything else, chunks will just start arriving again
                        break;

                    case 'resume_ack':
                        if (!isSender) return; // Only sender handles resume acknowledgments
                        transferPaused = false; // Ensure state is correct
                        updateStatusMessage(sendStatusMessage, 'Transfer resumed.', 'info');
                        pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                        startSpeedAndETRCalc();
                        sendFileChunk(); // Resume sending chunks
                        break;

                    case 'cancel_transfer':
                        console.log("Received cancellation request from peer.");
                        const cancelMsg = 'Transfer cancelled by peer.';
                        updateStatusMessage(isSender ? sendStatusMessage : receiveStatusMessage, cancelMsg, 'error');
                         addHistoryEntry(
                             isSender ? filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                             isSender ? totalBytesSent : receivedSize,
                             false, // Not successful
                             true   // Was cancelled
                         );
                        closePeerConnection(); // Close the connection immediately
                        break;

                     case 'error': // Generic error message from peer
                         console.error("Received error message from peer:", message.reason || 'Unknown error');
                         updateStatusMessage(
                             isSender ? sendStatusMessage : receiveStatusMessage,
                             `Error from peer: ${message.reason || 'Unknown error'}`,
                             'error'
                         );
                          // Optionally close connection based on error type
                          if (message.reason === 'no_password_set' || message.reason === 'password_unsupported_context') {
                              setTimeout(closePeerConnection, 1000);
                          }
                         break;


                    default:
                        console.warn("Unknown control message type received:", message.type);
                }
            } catch (error) {
                console.error("Error parsing control message:", error, "Data:", event.data);
                // Optionally send an error back or close connection if parsing fails often
            }
        }
    }

    // --- Data Transfer Logic ---
    async function sendMetadata() {
        if (filesToSend.length === 0 || !dataChannel || dataChannel.readyState !== 'open') {
            console.error("Cannot send metadata: No files selected or data channel not open.");
            updateSendProgress(0, 'Error: Cannot send file details.', 'error');
            closePeerConnection();
            return;
        }

        updateStatusMessage(sendStatusMessage, 'Calculating file hashes...', 'info');
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hashing...'; // Indicate hashing process

        try {
            const metadataPromises = filesToSend.map(async (item) => {
                 // Calculate hash only if crypto is available
                 const hash = cryptoAvailable ? await calculateHash(item.file) : null;
                 return {
                     name: item.file.name,
                     type: item.file.type || 'application/octet-stream', // Default MIME type
                     size: item.file.size,
                     path: item.path, // Include relative path
                     hash: hash // Include hash (will be null if crypto not available or hashing failed)
                 };
            });

            const metadata = await Promise.all(metadataPromises);

            console.log('Sender: Sending metadata with hashes:', metadata);

             // Include the password requirement flag in the metadata message
            const metadataMessage = {
                type: 'metadata',
                payload: metadata,
                passwordRequired: !!passwordHash // True if passwordHash is not null/empty
            };

            dataChannel.send(JSON.stringify(metadataMessage));

            // Update UI after sending metadata (don't start sending chunks yet)
             generateBtn.innerHTML = '<i class="fas fa-check"></i> Code Generated'; // Reset button icon

            if (!passwordHash) {
                // If no password, wait for 'ready_to_receive' which receiver should send immediately
                updateSendProgress(0, 'File details sent. Waiting for receiver readiness...', 'info');
            } else {
                // If password was set, wait for receiver to send 'password_check', then sender responds,
                // then receiver sends 'ready_to_receive'
                updateSendProgress(0, 'File details sent. Waiting for password verification by receiver...', 'info');
            }

        } catch (error) {
            console.error("Error calculating hashes or sending metadata:", error);
            updateSendProgress(0, 'Error preparing file details.', 'error');
            generateBtn.innerHTML = '<i class="fas fa-share-alt"></i> Generate Share Code'; // Reset button
            closePeerConnection();
        }
    }

    function sendFileChunk() {
        if (transferPaused) {
            console.log("Send chunk paused.");
            return;
        }
        if (currentFileIndex >= filesToSend.length) {
            // This case should be handled by updateSendProgress completion logic, but good to double-check
            console.log("All files sent. No more chunks to send.");
             // updateSendProgress might have already handled completion / history / UI updates.
            return;
        }
         if (!dataChannel || dataChannel.readyState !== 'open') {
            console.error("Cannot send chunk: Data channel closed or not open.");
            updateSendProgress(totalBytesSent, 'Error: Connection lost during transfer.', 'error');
            stopSpeedAndETRCalc();
             addHistoryEntry(filesToSend.map(f => f.file.name).join(', '), totalBytesSent, false, false);
            return; // Stop sending
        }

        const currentItem = filesToSend[currentFileIndex];
        const file = currentItem.file;

        // Highlight the currently sending file in the UI
        const listItem = selectedFilesList.querySelector(`li[data-index="${currentFileIndex}"]`);
        if (listItem && !listItem.classList.contains('transferring')) {
            selectedFilesList.querySelectorAll('.transferring').forEach(el => el.classList.remove('transferring')); // Clear previous
            listItem.classList.add('transferring');
        }

        // Check buffer pressure before reading/sending more data
        if (dataChannel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
            // console.log(`Buffer full (${dataChannel.bufferedAmount}), waiting...`);
            // Wait for buffer to drain - use onbufferedamountlow event or simple timeout
             setTimeout(sendFileChunk, 100); // Check again in 100ms
            return;
        }

        const slice = file.slice(currentFileOffset, currentFileOffset + CHUNK_SIZE);
        const reader = new FileReader();

        reader.onload = (e) => {
             if (!e.target?.result) {
                 console.error("File reader error: result is null.");
                 updateSendProgress(totalBytesSent, 'Error reading file chunk.', 'error');
                 closePeerConnection();
                 return;
             }

             try {
                 // Double-check channel state and pause flag right before sending
                 if (dataChannel.readyState === 'open' && !transferPaused) {
                     dataChannel.send(e.target.result); // Send ArrayBuffer chunk
                     const chunkSize = e.target.result.byteLength;
                     currentFileOffset += chunkSize;
                     totalBytesSent += chunkSize;

                     updateSendProgress(totalBytesSent); // Update overall progress UI

                     // Check if current file is complete
                     if (currentFileOffset >= file.size) {
                         console.log(`Sent File: ${file.name} (${currentItem.path})`);
                         if (listItem) listItem.classList.remove('transferring'); // Unhighlight completed file
                         currentFileIndex++; // Move to the next file
                         currentFileOffset = 0; // Reset offset for the new file
                     }

                     // Schedule the next chunk if transfer is not paused/completed
                     if (currentFileIndex < filesToSend.length && !transferPaused) {
                        // Use requestAnimationFrame for smoother UI responsiveness, though setTimeout works too
                         requestAnimationFrame(sendFileChunk);
                         // setTimeout(sendFileChunk, 0); // Yield to event loop
                     } else if (currentFileIndex >= filesToSend.length) {
                         // Final file completed - progress update should handle this.
                         console.log("All files sent successfully schedule check.");
                     }
                 } else if (transferPaused) {
                     console.log("Transfer paused during file read/send operation.");
                 } else {
                     console.error("Data channel closed during file read/send operation.");
                     updateSendProgress(totalBytesSent, 'Error: Data channel closed.', 'error');
                     stopSpeedAndETRCalc();
                 }
             } catch (err) {
                 console.error("Error sending data channel chunk:", err);
                 updateSendProgress(totalBytesSent, 'Error sending file chunk.', 'error');
                 closePeerConnection(); // Critical error
             }
        };

        reader.onerror = (err) => {
            console.error("FileReader error:", err);
            updateSendProgress(totalBytesSent, 'Error reading file.', 'error');
            closePeerConnection(); // Stop transfer on read error
        };

        reader.readAsArrayBuffer(slice); // Read the chunk as ArrayBuffer
    }


    // --- Received File Handling ---
    function addReceivedFileToList(blob, name, type, path, hash) {
        if (!receivedFilesList || !receivedFilesSection) return;

        receivedFilesSection.classList.remove('hidden'); // Ensure section is visible

        const li = document.createElement('li');
        // Start without 'ready' class, add it when blob is fully processed and hash checked
        li.className = 'received-file-item';
        li.dataset.filename = name; // Store identifiers for potential later updates
        li.dataset.filepath = path;

        const objectURL = blob ? URL.createObjectURL(blob) : '#'; // Create URL only if blob exists
         if (blob) objectUrls.push(objectURL); // Track URL for revocation


        // Determine initial state for UI elements
        const isReady = !!blob; // File is ready if blob exists
        const initialSizeText = isReady ? formatBytes(blob.size) : 'Pending...';
        const downloadButtonClass = isReady ? '' : 'hidden';

        // Determine initial hash status text and class
        let initialHashText = 'No Hash';
        let initialHashClass = 'pending'; // Default class if no hash info yet
         if (cryptoAvailable) {
             if (hash) { // If a hash was provided in metadata
                 initialHashText = isReady ? 'Verifying...' : 'Pending Hash';
                 initialHashClass = isReady ? 'checking' : 'pending';
             } else {
                  initialHashText = 'No Hash Sent'; // Sender didn't provide hash
                 initialHashClass = 'pending';
             }
         } else {
             initialHashText = 'No Verify'; // Crypto unavailable
             initialHashClass = 'pending';
         }

        const filePathDisplay = path !== name ? `<span class="file-path" title="${path}">${path}</span>` : '';
        const hashDisplay = `<span class="file-hash-status ${initialHashClass}">${initialHashText}</span>`;
         const downloadBtnHTML = `<a href="${objectURL}" download="${name}" class="download-btn ${downloadButtonClass}"><i class="fas fa-download"></i> Download</a>`;

        li.innerHTML = `
            <i class="fas ${getFileIconClass(type)} file-icon"></i>
            <div class="file-info">
                <span class="file-name" title="${name}">${name}</span>
                ${filePathDisplay}
                <span class="file-size">${initialSizeText}</span>
            </div>
            <div class="file-status-indicator"> <!-- Group hash and download -->
                ${hashDisplay}
                ${downloadBtnHTML}
            </div>`;

        // Append to list
        receivedFilesList.appendChild(li);

        // Note: Actual updates to 'ready' class, download button visibility, size, and hash status
        // happen inside handleDataChannelMessage when the blob is fully received and processed.
        // This function primarily sets up the list item structure.
    }


    // --- Control Message Sender Utility ---
    function sendControlMessage(message) {
        if (dataChannel && dataChannel.readyState === 'open') {
            try {
                dataChannel.send(JSON.stringify(message));
                console.log("Control Message Sent:", message);
            } catch (e) {
                console.error("Error sending control message:", e, "Message:", message);
                // Handle potential errors (e.g., message too large, though unlikely for control messages)
            }
        } else {
            console.warn("Cannot send control message: Data channel not open.", "Message:", message);
        }
    }


    // --- Pause/Resume/Cancel Logic ---
    if (pauseResumeBtn) {
        pauseResumeBtn.onclick = () => {
             if (!peerConnection || !dataChannel || dataChannel.readyState !== 'open') {
                 console.warn("Cannot pause/resume: Connection not active.");
                 return;
             }

            if (transferPaused) { // Currently paused, want to resume
                 transferPaused = false; // Optimistically update state
                 sendControlMessage({ type: 'resume_request' });
                 updateStatusMessage(isSender ? sendStatusMessage : receiveStatusMessage, 'Requesting resume...', 'info');
                 // UI update (button text, speed calc) will happen on receiving 'resume_ack' or if request fails
                 pauseResumeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resuming'; // Indicate pending state
            } else { // Currently running, want to pause
                transferPaused = true; // Optimistically update state
                sendControlMessage({ type: 'pause_request' });
                updateStatusMessage(isSender ? sendStatusMessage : receiveStatusMessage, 'Requesting pause...', 'info');
                 stopSpeedAndETRCalc(); // Stop calculation immediately on requesting pause
                 pauseResumeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pausing'; // Indicate pending state
            }
        };
    }

    if (cancelTransferBtn) {
        cancelTransferBtn.onclick = () => {
             if (!peerConnection) {
                 console.warn("Cannot cancel: No active connection.");
                 return;
             }

             console.log("User initiated transfer cancellation.");
             sendControlMessage({ type: 'cancel_transfer' }); // Inform peer
             const cancelMsg = 'Transfer cancelled by user.';
             updateStatusMessage(isSender ? sendStatusMessage : receiveStatusMessage, cancelMsg, 'error');
             addHistoryEntry(
                 isSender ? filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                 isSender ? totalBytesSent : receivedSize,
                 false, // Not successful
                 true   // Was cancelled
             );
             closePeerConnection(); // Close connection immediately
             pauseResumeBtn.disabled = true;
             cancelTransferBtn.disabled = true;
        };
    }


    // --- Chat Logic ---
    function enableChat(enable) {
        const currentChatInput = isSender ? chatInputSender : chatInputReceiver;
        const currentChatSendBtn = isSender ? chatSendBtnSender : chatSendBtnReceiver;
        const currentChatPanel = isSender ? chatPanelSender : chatPanelReceiver;

        if (!currentChatInput || !currentChatSendBtn || !currentChatPanel) return; // Elements might not exist if panel is hidden

        currentChatInput.disabled = !enable;
        currentChatSendBtn.disabled = !enable;
        if (enable) {
             currentChatPanel.classList.remove('hidden');
             currentChatInput.placeholder = "Type message...";
        } else {
             // currentChatPanel.classList.add('hidden'); // Optionally hide panel when disabled
             currentChatInput.placeholder = "Chat unavailable";
        }
    }

    function sendChatMessage() {
        const currentChatInput = isSender ? chatInputSender : chatInputReceiver;
        const text = currentChatInput.value.trim();

        if (text && dataChannel && dataChannel.readyState === 'open') {
            sendControlMessage({ type: 'chat', text: text });
            displayChatMessage(text, true); // Display own message immediately (true = sent)
            currentChatInput.value = ''; // Clear input field
        } else if (!text) {
             // Ignore empty messages
        } else {
            console.warn("Cannot send chat message: Data channel not open.");
             // Optionally provide feedback to user (e.g., input border red)
        }
    }

    function displayChatMessage(text, isSent) {
        const currentChatMessages = isSender ? chatMessagesSender : chatMessagesReceiver;
        if (!currentChatMessages) return;

        const li = document.createElement('li');
        li.classList.add('chat-message', isSent ? 'sent' : 'received');

        const span = document.createElement('span');
        // Basic sanitization (replace < and > to prevent HTML injection)
        // For more robust sanitization, consider a library like DOMPurify if handling untrusted input
        span.textContent = text; // Using textContent automatically escapes HTML

        li.appendChild(span);
        currentChatMessages.appendChild(li);

        // Scroll to the bottom of the chat window
        currentChatMessages.scrollTop = currentChatMessages.scrollHeight;
    }

    // Attach chat send event listeners
    if (chatSendBtnSender) chatSendBtnSender.onclick = sendChatMessage;
    if (chatInputSender) chatInputSender.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }};
    if (chatSendBtnReceiver) chatSendBtnReceiver.onclick = sendChatMessage;
    if (chatInputReceiver) chatInputReceiver.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }};


    // --- Download All & Zip Logic ---
    if (downloadAllBtn) {
        downloadAllBtn.onclick = () => {
            if (receivedFiles.length === 0) {
                 alert("No files have been received to download.");
                 return;
            }
            console.log(`Starting Download All for ${receivedFiles.length} files...`);
            downloadAllBtn.disabled = true;
            downloadZipBtn.disabled = true; // Disable zip while multi-download is in progress
            downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';

            let downloadedCount = 0;
            const totalFiles = receivedFiles.length;

            // Download files sequentially with a small delay to avoid browser blocking popups/downloads
            receivedFiles.forEach((fileData, index) => {
                setTimeout(() => {
                    const link = document.createElement('a');
                    // Recreate URL just in case it was revoked elsewhere, though unlikely with current flow
                    const url = URL.createObjectURL(fileData.blob);
                    link.href = url;
                    link.download = fileData.name; // Use the original filename

                    document.body.appendChild(link); // Append link to trigger download
                    try {
                        link.click();
                        console.log(`Initiated download for: ${fileData.name}`);
                        downloadedCount++;
                    } catch (e) {
                        console.error(`Error initiating download for ${fileData.name}:`, e);
                        // Optionally notify the user about the specific file failure
                    } finally {
                        document.body.removeChild(link); // Clean up the link element
                        URL.revokeObjectURL(url); // Revoke the object URL after triggering download

                        // Re-enable buttons after the last file attempt
                        if (index === totalFiles - 1) {
                             console.log("Finished Download All attempt.");
                             downloadAllBtn.disabled = false;
                             downloadZipBtn.disabled = false;
                             downloadAllBtn.innerHTML = '<i class="fas fa-file-archive"></i> Download All';
                        }
                    }
                }, index * 300); // Stagger downloads by 300ms
            });
        };
    }

    if (downloadZipBtn) {
        downloadZipBtn.onclick = () => {
             if (receivedFiles.length === 0) {
                 alert("No files received to zip.");
                 return;
             }
             if (typeof JSZip === 'undefined') {
                 alert("JSZip library is not loaded. Cannot create zip file.");
                 console.error("JSZip not found!");
                 return;
             }

             console.log("Starting Zip Download preparation...");
             downloadAllBtn.disabled = true; // Disable both buttons during zipping
             downloadZipBtn.disabled = true;
             downloadZipBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Zipping...';
             updateStatusMessage(receiveStatusMessage, `Zipping ${receivedFiles.length} file(s)... this may take a moment.`, 'info');

             const zip = new JSZip();

             // Add files to the zip, respecting original paths
             receivedFiles.forEach(fileData => {
                 // Use the stored path. If path is just the filename, it goes in the root.
                 // If path includes '/', JSZip creates folders automatically.
                 const filePathInZip = fileData.path || fileData.name; // Fallback to name if path is somehow missing
                 zip.file(filePathInZip, fileData.blob, { binary: true });
                 console.log(`Added to zip: ${filePathInZip}`);
             });

             // Generate the zip file asynchronously
             zip.generateAsync(
                 {
                     type: "blob",
                     compression: "DEFLATE", // Standard zip compression
                     compressionOptions: {
                         level: 6 // Balance between speed and compression (1=fastest, 9=best)
                     }
                 },
                 (metadata) => {
                     // Optional: Update progress during zipping (can be slow for many/large files)
                     // console.log("Zipping progress: " + metadata.percent.toFixed(0) + " %");
                     // updateStatusMessage(receiveStatusMessage, `Zipping... ${metadata.percent.toFixed(0)}%`, 'info');
                 }
             )
             .then((content) => {
                 console.log("Zip file generated successfully.");
                 updateStatusMessage(receiveStatusMessage, 'Zip file created. Starting download...', 'success');

                 // Create a filename for the zip
                 const timestamp = new Date().toISOString().replace(/[:\-.]/g, '').slice(0, 15); // YYYYMMDDTHHMMSS
                 const zipFilename = `ShareWave_Files_${timestamp}.zip`;

                 // Trigger the download
                 const url = URL.createObjectURL(content);
                 const link = document.createElement('a');
                 link.href = url;
                 link.download = zipFilename;
                 document.body.appendChild(link);
                 try {
                     link.click();
                 } catch(e) {
                     console.error("Error triggering zip download:", e);
                     alert("Failed to automatically start zip download. Please check your browser settings.");
                 } finally {
                     document.body.removeChild(link);
                     URL.revokeObjectURL(url); // Clean up object URL
                 }
             })
             .catch(err => {
                 console.error("Error generating zip file:", err);
                 updateStatusMessage(receiveStatusMessage, `Error creating zip file: ${err.message}`, 'error');
             })
             .finally(() => {
                 // Re-enable buttons regardless of success or failure
                 downloadAllBtn.disabled = false;
                 downloadZipBtn.disabled = false;
                 downloadZipBtn.innerHTML = '<i class="fas fa-file-zipper"></i> Download Zip';
             });
        };
    }


    // --- Theme Toggle ---
    function applyTheme(theme) {
        const body = document.body;
        const themeIcon = themeToggleBtn?.querySelector('i');
        const themeMeta = document.querySelector('meta[name="theme-color"]');

        if (theme === 'light') {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme'); // Explicitly remove dark
             if(themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
             if(themeMeta) themeMeta.setAttribute('content', '#ffffff'); // Light theme color
             themeToggleBtn?.setAttribute('title', 'Switch to Dark Theme');
        } else { // Default to dark
            body.classList.remove('light-theme');
            body.classList.add('dark-theme'); // Explicitly add dark
             if(themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
             if(themeMeta) themeMeta.setAttribute('content', '#1e1e1e'); // Dark theme color (surface)
             themeToggleBtn?.setAttribute('title', 'Switch to Light Theme');
        }
        // Save preference to local storage
        try {
             localStorage.setItem('sharewave-theme', theme);
        } catch (e) {
             console.warn("Could not save theme preference to localStorage:", e);
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        };
    }

    // Load saved theme on startup
    const savedTheme = localStorage.getItem('sharewave-theme') || 'dark'; // Default to dark
    applyTheme(savedTheme);


    // --- History Panel ---
    function toggleHistoryPanel() {
        if (!historyPanel) return;
        const isOpen = historyPanel.classList.toggle('open');
        historyToggleBtn?.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
             loadHistory(); // Load/refresh history when opening
        }
    }

    if (historyToggleBtn) historyToggleBtn.onclick = toggleHistoryPanel;
    if (closeHistoryBtn) closeHistoryBtn.onclick = toggleHistoryPanel;

    function loadHistory() {
        if (!historyList || !clearHistoryBtn) return;

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('transferHistory') || '[]');
             if (!Array.isArray(history)) history = []; // Ensure it's an array
        } catch (e) {
            console.error("Error parsing transfer history from localStorage:", e);
            history = []; // Reset to empty on parse error
        }

        historyList.innerHTML = ''; // Clear previous entries

        if (history.length === 0) {
            historyList.innerHTML = '<li class="no-history">No past transfers recorded.</li>'; // Use li for consistency
            clearHistoryBtn.disabled = true;
            return;
        }

        clearHistoryBtn.disabled = false;

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';

            const date = new Date(item.timestamp).toLocaleString();

            let statusIcon = '<i class="fas fa-question-circle warning"></i> Unknown';
            let statusText = 'Unknown';
             if (item.cancelled) {
                 statusIcon = '<i class="fas fa-ban error"></i>';
                 statusText = 'Cancelled';
             } else if (item.success) {
                 statusIcon = '<i class="fas fa-check-circle success"></i>';
                 statusText = 'Completed';
             } else {
                 statusIcon = '<i class="fas fa-times-circle error"></i>';
                 statusText = 'Failed/Incomplete';
             }

             // Truncate long filenames list for display
             let displayFilenames = item.filenames || 'N/A';
             if (displayFilenames.length > 100) {
                 displayFilenames = displayFilenames.substring(0, 97) + '...';
             }


            li.innerHTML = `
                <strong>${displayFilenames}</strong>
                <span><i class="fas fa-database"></i> Size: ${formatBytes(item.size || 0)}</span>
                <span><i class="fas fa-calendar-alt"></i> Date: ${date}</span>
                <span><i class="fas fa-info-circle"></i> Status: ${statusIcon} ${statusText}</span>
            `;
            historyList.appendChild(li);
        });
    }

    function addHistoryEntry(filenames, size, success, cancelled = false) {
        let history = [];
         try {
            history = JSON.parse(localStorage.getItem('transferHistory') || '[]');
             if (!Array.isArray(history)) history = [];
         } catch (e) { history = []; }

        const entry = {
            timestamp: Date.now(),
            filenames: filenames || 'N/A', // Ensure filenames is a string
            size: size || 0,
            success: !!success, // Ensure boolean
            cancelled: !!cancelled // Ensure boolean
        };

        history.unshift(entry); // Add to the beginning

        // Limit history size
        if (history.length > HISTORY_LIMIT) {
            history = history.slice(0, HISTORY_LIMIT); // Keep only the latest entries
        }

        try {
            localStorage.setItem('transferHistory', JSON.stringify(history));
        } catch (e) {
             console.warn("Could not save updated history to localStorage:", e);
        }

        // Refresh history panel if it's currently open
        if (historyPanel && historyPanel.classList.contains('open')) {
            loadHistory();
        }
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.onclick = () => {
            if (confirm('Are you sure you want to clear the entire transfer history? This cannot be undone.')) {
                 try {
                    localStorage.removeItem('transferHistory');
                    console.log("Transfer history cleared.");
                    loadHistory(); // Refresh the panel (will show 'No history')
                 } catch (e) {
                     console.error("Failed to clear history from localStorage:", e);
                     alert("Could not clear history.");
                 }
            }
        };
    }


    // --- Initialization ---
    resetState(true); // Initial full reset
    switchTab('send'); // Start on the Send tab by default

}); // End DOMContentLoaded
