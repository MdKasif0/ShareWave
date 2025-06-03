// --- ShareWave V5.3 (Text Share Removed, Tab State Improved) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Config & Elements ---
    const CHUNK_SIZE = 128 * 1024;
    const MAX_BUFFERED_AMOUNT = 64 * 1024 * 1024;
    const ICE_SERVERS = { iceServers: [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.services.mozilla.com' } ] };
    const QR_SCANNER_CONFIG = { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };
    const HASH_ALGORITHM = 'SHA-256';
    const SPEED_INTERVAL = 2000;
    const HISTORY_LIMIT = 50;

    // --- Get ALL Elements by ID (Common) ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    const historyPanel = document.getElementById('history-panel');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyList = document.getElementById('history-list');
    const previewModal = document.getElementById('preview-modal');
    const modalImagePreview = document.getElementById('modal-image-preview');
    const modalVideoPreview = document.getElementById('modal-video-preview');
    const toastContainer = document.getElementById('toast-container');
    const currentYearSpan = document.getElementById('current-year');

    // --- Tab Buttons & Sections ---
    const sendTabBtn = document.getElementById('send-tab-btn');
    const receiveTabBtn = document.getElementById('receive-tab-btn');
    const sendSection = document.getElementById('send-section');
    const receiveSection = document.getElementById('receive-section');

    // --- File Send Elements ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const folderInput = document.getElementById('folder-input');
    const browseLink = document.getElementById('browse-link');
    const selectedFilesSection = document.getElementById('selected-files-section');
    const fileSummarySpan = document.getElementById('file-summary');
    const selectedFilesList = document.getElementById('selected-files-list');
    const passwordSectionSender = document.getElementById('password-section-sender');
    const passwordInputSender = document.getElementById('password-input-sender');
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
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const cancelTransferBtn = document.getElementById('cancel-transfer-btn');
    const speedIndicator = document.getElementById('speed-indicator');
    const etrIndicator = document.getElementById('etr-indicator');
    const chatPanelSender = document.getElementById('chat-panel-sender');
    const chatMessagesSender = document.getElementById('chat-messages-sender');
    const chatInputSender = document.getElementById('chat-input-sender');
    const chatSendBtnSender = document.getElementById('chat-send-btn-sender');

    // --- File Receive Elements ---
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
    const passwordSectionReceiver = document.getElementById('password-section-receiver');
    const passwordInputReceiver = document.getElementById('password-input-receiver');
    const verifyPasswordBtn = document.getElementById('verify-password-btn');
    const receiveStatusSection = document.getElementById('receive-status-section');
    const receiveStatusMessage = document.getElementById('receive-status-message');
    const receiveProgressLabel = document.getElementById('receive-progress-label');
    const receiveProgressBar = document.getElementById('receive-progress-bar');
    const receiveProgressText = document.getElementById('receive-progress-text');
    const receivedFilesSection = document.getElementById('received-files-section');
    const receivedFilesList = document.getElementById('received-files-list');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const receiveSpeedIndicator = document.getElementById('receive-speed-indicator');
    const chatPanelReceiver = document.getElementById('chat-panel-receiver');
    const chatMessagesReceiver = document.getElementById('chat-messages-receiver');
    const chatInputReceiver = document.getElementById('chat-input-receiver');
    const chatSendBtnReceiver = document.getElementById('chat-send-btn-receiver');


    // --- State Variables ---
    let peerConnection;
    let dataChannel;
    let activeTab = 'send'; // 'send', 'receive'
    let isSenderRole = true; // True if user is on Send Tab, false for Receive Tab. This defines the role.

    // --- Tab-Specific State Objects ---
    // These objects will hold the state for each tab to persist data on switching
    let sendTabState = {
        filesToSend: [],
        totalBytesToSend: 0,
        passwordInputSenderValue: '',
        offerSdpTextareaValue: '',
        answerSdpTextareaValue: '',
        isPasswordSectionSenderVisible: false,
        isSelectedFilesSectionVisible: false,
        isOfferStepVisible: false,
        isAnswerStepVisible: false,
        isGenerateBtnDisabled: true,
        chatMessages: []
    };

    let receiveTabState = {
        offerSdpInputTextareaValue: '',
        answerSdpOutputTextareaValue: '',
        passwordInputReceiverValue: '',
        isPasswordSectionReceiverVisible: false,
        isAnswerOutputStepVisible: false,
        isReceiverWaitMessageVisible: true,
        chatMessages: []
    };


    let currentFileIndex = 0;
    let currentFileOffset = 0;
    let totalBytesSent = 0;

    let offerQrScanner = null;
    let answerQrScanner = null;
    let receiveBuffer = [];
    let receivedSize = 0;
    let filesMetadata = null; // For file sharing
    let currentReceivingFileIndex = 0;
    let currentFileReceivedSize = 0;
    let receivedFiles = [];
    let objectUrls = [];
    let passwordHash = null; // Only relevant during an active connection attempt
    let transferPaused = false;
    let speedIntervalId = null;
    let lastMeasurementTime = 0;
    let lastMeasurementSentBytes = 0;
    let lastMeasurementReceivedBytes = 0;
    let isPasswordRequiredBySender = false; // Also reset with connection
    let transferStartTime = 0;
    let connectionInProgress = false; // Flag to indicate if a WebRTC connection process has started

    const cryptoAvailable = window.crypto && window.crypto.subtle;
    if (!cryptoAvailable) {
        console.warn("Web Crypto API not available (requires secure context: HTTPS or localhost). File hashing/password verification disabled.");
    }

    // --- Toast Notification Function ---
    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');

        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // --- Global Functions (Accessible from HTML via onclick) ---
    window.switchTab = (tabName) => {
        if (activeTab === tabName) return; // No change

        // Save current tab's state BEFORE switching
        saveCurrentTabState();

        activeTab = tabName;
        isSenderRole = (tabName === 'send'); // Role is tied to the tab itself now

        // If a connection process was active, it needs to be fully reset.
        // Otherwise, try to restore state.
        if (connectionInProgress) {
            showToast("Switching tabs will reset the current connection process.", "warning");
            closePeerConnection(); // Fully close and reset connection variables
            connectionInProgress = false; // Reset flag
            resetUiToInitial(tabName === 'send' ? sendTabState : receiveTabState, tabName); // Reset UI completely for the new tab
        } else {
            // No active connection, just switch UI and restore non-connection state
            stopAllScanners(); // Stop scanners if any were active without connection
        }

        // Update tab button active states
        sendTabBtn.classList.toggle('active', tabName === 'send');
        receiveTabBtn.classList.toggle('active', tabName === 'receive');
        sendTabBtn.setAttribute('aria-selected', tabName === 'send');
        receiveTabBtn.setAttribute('aria-selected', tabName !== 'send');

        // Update section visibility
        sendSection.classList.toggle('active', tabName === 'send');
        receiveSection.classList.toggle('active', tabName === 'receive');

        // Restore the new tab's state (if not reset by connectionInProgress)
        if (!connectionInProgress) {
            restoreTabState(tabName);
        }
        // Ensure chat is correctly set for the new tab
        enableChatForCurrentTab(false); // Disable chat initially, enable on connection
    };


    function saveCurrentTabState() {
        if (activeTab === 'send') {
            // filesToSend and totalBytesToSend are already global and modified directly for sendTabState
            sendTabState.passwordInputSenderValue = passwordInputSender.value;
            sendTabState.offerSdpTextareaValue = offerSdpTextarea.value;
            sendTabState.answerSdpTextareaValue = answerSdpTextarea.value;
            sendTabState.isPasswordSectionSenderVisible = !passwordSectionSender.classList.contains('hidden');
            sendTabState.isSelectedFilesSectionVisible = !selectedFilesSection.classList.contains('hidden');
            sendTabState.isOfferStepVisible = !offerStep.classList.contains('hidden');
            sendTabState.isAnswerStepVisible = !answerStep.classList.contains('hidden');
            sendTabState.isGenerateBtnDisabled = generateBtn.disabled;
            sendTabState.chatMessages = Array.from(chatMessagesSender.children).map(li => ({
                text: li.querySelector('span').textContent,
                isSent: li.classList.contains('sent')
            }));

        } else if (activeTab === 'receive') {
            receiveTabState.offerSdpInputTextareaValue = offerSdpInputTextarea.value;
            receiveTabState.answerSdpOutputTextareaValue = answerSdpOutputTextarea.value;
            receiveTabState.passwordInputReceiverValue = passwordInputReceiver.value;
            receiveTabState.isPasswordSectionReceiverVisible = !passwordSectionReceiver.classList.contains('hidden');
            receiveTabState.isAnswerOutputStepVisible = !answerOutputStep.classList.contains('hidden');
            receiveTabState.isReceiverWaitMessageVisible = !receiverWaitMessage.classList.contains('hidden');
            receiveTabState.chatMessages = Array.from(chatMessagesReceiver.children).map(li => ({
                text: li.querySelector('span').textContent,
                isSent: li.classList.contains('sent')
            }));
        }
    }

    function restoreTabState(tabName) {
        if (tabName === 'send') {
            // filesToSend and totalBytesToSend are part of sendTabState
            filesToSend = sendTabState.filesToSend; // Restore from state
            totalBytesToSend = sendTabState.totalBytesToSend; // Restore from state
            updateFileListUI(); // This uses the global filesToSend
            updateFileSummary(); // This uses global totalBytesToSend

            passwordInputSender.value = sendTabState.passwordInputSenderValue;
            offerSdpTextarea.value = sendTabState.offerSdpTextareaValue;
            answerSdpTextarea.value = sendTabState.answerSdpTextareaValue;

            passwordSectionSender.classList.toggle('hidden', !sendTabState.isPasswordSectionSenderVisible);
            selectedFilesSection.classList.toggle('hidden', !sendTabState.isSelectedFilesSectionVisible);
            offerStep.classList.toggle('hidden', !sendTabState.isOfferStepVisible);
            answerStep.classList.toggle('hidden', !sendTabState.isAnswerStepVisible);
            generateBtn.disabled = sendTabState.isGenerateBtnDisabled;

            // Restore QR codes if SDP exists
            if (sendTabState.offerSdpTextareaValue) generateQRCode('offer-qr-code', sendTabState.offerSdpTextareaValue);
            else offerQrCodeDiv.innerHTML = '';

            // Restore chat
            chatMessagesSender.innerHTML = '';
            sendTabState.chatMessages.forEach(msg => displayChatMessageInternal(msg.text, msg.isSent, chatMessagesSender));
            chatPanelSender.classList.toggle('hidden', sendTabState.chatMessages.length === 0 || !dataChannel);


        } else if (tabName === 'receive') {
            offerSdpInputTextarea.value = receiveTabState.offerSdpInputTextareaValue;
            answerSdpOutputTextarea.value = receiveTabState.answerSdpOutputTextareaValue;
            passwordInputReceiver.value = receiveTabState.passwordInputReceiverValue;

            passwordSectionReceiver.classList.toggle('hidden', !receiveTabState.isPasswordSectionReceiverVisible);
            answerOutputStep.classList.toggle('hidden', !receiveTabState.isAnswerOutputStepVisible);
            offerInputStep.classList.toggle('hidden', receiveTabState.isAnswerOutputStepVisible); // If answer output is visible, offer input is not.
            receiverWaitMessage.classList.toggle('hidden', !receiveTabState.isReceiverWaitMessageVisible);

            // Restore QR codes if SDP exists
            if (receiveTabState.answerSdpOutputTextareaValue) generateQRCode('answer-qr-code', receiveTabState.answerSdpOutputTextareaValue);
            else answerQrCodeDiv.innerHTML = '';

            // Restore chat
            chatMessagesReceiver.innerHTML = '';
            receiveTabState.chatMessages.forEach(msg => displayChatMessageInternal(msg.text, msg.isSent, chatMessagesReceiver));
            chatPanelReceiver.classList.toggle('hidden', receiveTabState.chatMessages.length === 0 || !dataChannel);

            // Important: Elements like received files list, progress bars, status messages are generally NOT restored
            // as they are tied to an active/completed transfer session, which is reset on tab switch if connectionInProgress.
            // If connection was NOT in progress, these should be in their default hidden/reset state anyway.
            receiveStatusSection.classList.add('hidden');
            receivedFilesSection.classList.add('hidden');
            receivedFilesList.innerHTML = '';
        }
    }

    function resetUiToInitial(tabStateObject, tabName) {
        // This function is called when a connection was in progress and tab is switched,
        // requiring a full UI reset for the tab being switched TO, using its pristine state.
        // Or for the initial load.

        // Reset global connection-specific states
        currentFileIndex = 0; currentFileOffset = 0; totalBytesSent = 0;
        receiveBuffer = []; receivedSize = 0; filesMetadata = null;
        currentReceivingFileIndex = 0; currentFileReceivedSize = 0;
        receivedFiles = []; revokeObjectUrls();
        passwordHash = null; transferPaused = false; isPasswordRequiredBySender = false;

        if (tabName === 'send') {
            tabStateObject.filesToSend = []; // Clear files for this tab's state
            tabStateObject.totalBytesToSend = 0;
            tabStateObject.passwordInputSenderValue = '';
            tabStateObject.offerSdpTextareaValue = '';
            tabStateObject.answerSdpTextareaValue = '';
            tabStateObject.isPasswordSectionSenderVisible = false;
            tabStateObject.isSelectedFilesSectionVisible = false;
            tabStateObject.isOfferStepVisible = false;
            tabStateObject.isAnswerStepVisible = false;
            tabStateObject.isGenerateBtnDisabled = true;
            tabStateObject.chatMessages = [];

            // Apply this pristine state to UI
            filesToSend = []; totalBytesToSend = 0; updateFileListUI(); updateFileSummary();
            passwordInputSender.value = '';
            offerSdpTextarea.value = ''; offerQrCodeDiv.innerHTML = '';
            answerSdpTextarea.value = '';
            passwordSectionSender.classList.add('hidden');
            selectedFilesSection.classList.add('hidden');
            offerStep.classList.add('hidden');
            answerStep.classList.add('hidden');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-share-alt"></i> Generate Share Code';
            connectBtn.innerHTML = '<i class="fas fa-link"></i> Connect'; connectBtn.disabled = false;
            sendStatusSection.classList.add('hidden');
            pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause'; pauseResumeBtn.disabled = true;
            cancelTransferBtn.disabled = true;
            chatMessagesSender.innerHTML = ''; chatPanelSender.classList.add('hidden');

        } else if (tabName === 'receive') {
            tabStateObject.offerSdpInputTextareaValue = '';
            tabStateObject.answerSdpOutputTextareaValue = '';
            tabStateObject.passwordInputReceiverValue = '';
            tabStateObject.isPasswordSectionReceiverVisible = false;
            tabStateObject.isAnswerOutputStepVisible = false;
            tabStateObject.isReceiverWaitMessageVisible = true; // Default for receive tab
            tabStateObject.chatMessages = [];

            // Apply this pristine state to UI
            offerSdpInputTextarea.value = '';
            answerSdpOutputTextarea.value = ''; answerQrCodeDiv.innerHTML = '';
            passwordInputReceiver.value = '';
            passwordSectionReceiver.classList.add('hidden');
            answerOutputStep.classList.add('hidden');
            offerInputStep.classList.remove('hidden'); // Default for receive tab
            receiverWaitMessage.classList.remove('hidden');
            generateAnswerBtn.innerHTML = '<i class="fas fa-reply"></i> Generate Response Code'; generateAnswerBtn.disabled = false;
            receiveStatusSection.classList.add('hidden');
            receivedFilesSection.classList.add('hidden'); receivedFilesList.innerHTML = '';
            downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
            chatMessagesReceiver.innerHTML = ''; chatPanelReceiver.classList.add('hidden');
        }
    }



    window.copyToClipboard = (elementId) => {
        // ... (same as before, uses showToast) ...
        const textareaElement = document.getElementById(elementId);
        if (!textareaElement || !textareaElement.value) {
            showToast("Nothing to copy.", "warning");
            return;
        }
        textareaElement.select();
        textareaElement.setSelectionRange(0, 99999);

        navigator.clipboard?.writeText(textareaElement.value)
            .then(() => {
                showToast('Copied to clipboard!', 'success');
                const textCodeSection = textareaElement.closest('.text-code-section');
                const copyButton = textCodeSection?.querySelector('.copy-btn');
                if (copyButton) {
                    const tooltip = copyButton.querySelector('.tooltip');
                    if (tooltip) tooltip.textContent = 'Copied!';
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        if (tooltip) tooltip.textContent = 'Copy';
                        copyButton.classList.remove('copied');
                    }, 1500);
                }
            })
            .catch(err => {
                console.error('Clipboard API copy failed:', err);
                try {
                    const successful = document.execCommand('copy');
                    if (successful) showToast('Copied (fallback)!', 'success');
                    else throw new Error('Fallback failed');
                } catch (fallbackErr) {
                    showToast('Copy failed. Please copy manually.', 'error');
                    console.error('Fallback copy failed:', fallbackErr);
                }
            });
    };

    window.removeFile = (index) => {
        if (activeTab !== 'send') return; // Should only be callable from send tab
        if (index < 0 || index >= sendTabState.filesToSend.length) return;

        const itemToRemove = sendTabState.filesToSend[index];
        sendTabState.totalBytesToSend -= itemToRemove.file.size;
        sendTabState.filesToSend.splice(index, 1);

        // Update global alias for UI functions
        filesToSend = sendTabState.filesToSend;
        totalBytesToSend = sendTabState.totalBytesToSend;

        const listItem = selectedFilesList.querySelector(`li[data-index='${index}']`);
        if (listItem) {
            const previewElement = listItem.querySelector('.file-preview img, .file-preview video');
            if (previewElement && previewElement.src && previewElement.src.startsWith('blob:')) {
                URL.revokeObjectURL(previewElement.src);
                const urlIndex = objectUrls.indexOf(previewElement.src);
                if (urlIndex > -1) objectUrls.splice(urlIndex, 1);
            }
        }
        updateFileListUI();
        updateFileSummary();
        sendTabState.isGenerateBtnDisabled = sendTabState.filesToSend.length === 0;
        generateBtn.disabled = sendTabState.isGenerateBtnDisabled;
        sendTabState.isPasswordSectionSenderVisible = sendTabState.filesToSend.length > 0;
        passwordSectionSender.classList.toggle('hidden', !sendTabState.isPasswordSectionSenderVisible);
        sendTabState.isSelectedFilesSectionVisible = sendTabState.filesToSend.length > 0;
        selectedFilesSection.classList.toggle('hidden', !sendTabState.isSelectedFilesSectionVisible);

        showToast(`Removed ${itemToRemove.file.name}`, 'info', 1500);
    };


    window.togglePasswordVisibility = (inputId, buttonElement) => {
        // ... (same as before) ...
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

    window.openPreviewModal = (element) => {
        // ... (same as before) ...
        const src = element.src;
        if (!src || !previewModal || !modalImagePreview || !modalVideoPreview) return;

        if (element.tagName === 'IMG') {
            modalImagePreview.src = src;
            modalImagePreview.style.display = 'block';
            modalVideoPreview.style.display = 'none';
            modalVideoPreview.pause();
            modalVideoPreview.src = '';
        } else if (element.tagName === 'VIDEO') {
            modalVideoPreview.src = src;
            modalVideoPreview.style.display = 'block';
            modalImagePreview.style.display = 'none';
            modalImagePreview.src = '';
            modalVideoPreview.play().catch(e => console.warn("Autoplay prevented:", e));
        } else {
            return;
        }
        previewModal.style.display = 'flex';
        previewModal.classList.remove('fade-out');
        document.body.style.overflow = 'hidden';
    };

    window.closePreviewModal = () => {
        // ... (same as before) ...
        if (!previewModal || !modalImagePreview || !modalVideoPreview) return;
        previewModal.classList.add('fade-out');
        setTimeout(() => {
            previewModal.style.display = 'none';
            modalImagePreview.src = '';
            modalVideoPreview.src = '';
            modalVideoPreview.pause();
            modalImagePreview.style.display = 'none';
            modalVideoPreview.style.display = 'none';
        }, 280);
        document.body.style.overflow = '';
    };

    window.closeModalOnClick = (event) => {
        // ... (same as before) ...
        if (event.target === previewModal) {
            closePreviewModal();
        }
    };

    // --- Helper Functions ---
    function formatBytes(bytes, decimals = 2) {
        // ... (same as before) ...
        if (!+bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function getFileIconClass(fileType) {
        // ... (same as before) ...
        if (!fileType) return 'fa-file';
        const type = fileType.toLowerCase();
        if (type.startsWith('image/')) return 'fa-file-image';
        if (type.startsWith('video/')) return 'fa-file-video';
        if (type.startsWith('audio/')) return 'fa-file-audio';
        if (type.includes('pdf')) return 'fa-file-pdf';
        if (type.includes('zip') || type.includes('rar')) return 'fa-file-zipper';
        if (type.includes('text')) return 'fa-file-lines';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'fa-file-excel';
        if (type.includes('word') || type.includes('document')) return 'fa-file-word';
        if (type.includes('powerpoint')) return 'fa-file-powerpoint';
        if (type.includes('csv')) return 'fa-file-csv';
        if (type.includes('code') || ['html', 'css', 'js', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift'].some(ext => type.includes(ext))) return 'fa-file-code';
        return 'fa-file';
    }

    function updateStatusDisplay(element, message, type = 'info') {
        // ... (same as before) ...
        if (!element) return;
        element.textContent = message;
        element.className = 'status-message ' + (['info', 'success', 'error', 'warning'].find(t => t === type) || 'info');
    }

    function closePeerConnection() {
        stopAllScanners();
        stopSpeedAndETRCalc();
        // Reset connection-specific global state
        passwordHash = null;
        isPasswordRequiredBySender = false;
        connectionInProgress = false; // Crucial for tab switching logic

        if (dataChannel) {
            try { dataChannel.close(); } catch (e) { console.warn("Error closing data channel:", e); }
            dataChannel = null;
        }
        if (peerConnection) {
            try { peerConnection.close(); } catch (e) { console.warn("Error closing peer connection:", e); }
            peerConnection = null;
        }
        console.log("Peer connection closed.");
        enableChatForCurrentTab(false); // Disable chat for the current tab
    }

    async function calculateHash(blob) {
        // ... (same as before, uses showToast) ...
        if (!cryptoAvailable) return null;
        try {
            const buffer = await blob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Hashing error:', error);
            showToast('Error calculating file hash.', 'error');
            return null;
        }
    }

    async function hashPassword(password) {
        // ... (same as before, uses showToast) ...
        if (!cryptoAvailable || !password) return null;
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error("Password hashing error:", error);
            showToast('Error securing password.', 'error');
            return null;
        }
    }

    // --- UI Updates (Progress, Speed, ETR) ---
    function updateSendProgressUI(sentBytes = totalBytesSent, statusMsg = null, statusType = 'info') {
        // ... (same as before, uses showToast and addHistoryEntry) ...
        if (!sendStatusSection || !sendProgressBar || !sendProgressText || !sendProgressLabel) return;
        totalBytesSent = sentBytes;
        const currentFilesForSend = sendTabState.filesToSend; // Use state data
        const currentTotalBytesToSend = sendTabState.totalBytesToSend;

        const overallPercent = currentTotalBytesToSend > 0 ? Math.min(100, (totalBytesSent / currentTotalBytesToSend) * 100) : 0;
        sendProgressBar.style.width = overallPercent + '%';
        sendProgressBar.setAttribute('aria-valuenow', overallPercent);
        sendProgressText.textContent = `${formatBytes(totalBytesSent)} / ${formatBytes(currentTotalBytesToSend)} (${Math.round(overallPercent)}%)`;

        let fileLabel = "Overall Progress";
        if (currentFileIndex < currentFilesForSend.length) {
            const currentItem = currentFilesForSend[currentFileIndex];
            const displayPath = currentItem.path !== currentItem.file.name ? ` (${currentItem.path})` : '';
            fileLabel = `Sending: ${currentItem.file.name}${displayPath} (${currentFileIndex + 1}/${currentFilesForSend.length})`;
        } else if (totalBytesSent >= currentTotalBytesToSend && currentFilesForSend.length > 0) {
            fileLabel = `Sent ${currentFilesForSend.length} item(s)`;
            updateStatusDisplay(sendStatusMessage, 'Transfer complete!', 'success');
            showToast('File transfer complete!', 'success');
            addHistoryEntry(currentFilesForSend.map(f => f.file.name).join(', '), currentTotalBytesToSend, true, false, 'file');
            stopSpeedAndETRCalc();
            pauseResumeBtn.disabled = true;
            cancelTransferBtn.disabled = true;
            connectionInProgress = false; // Allow normal tab switching again
        }
        sendProgressLabel.textContent = fileLabel;
        if (statusMsg !== null) updateStatusDisplay(sendStatusMessage, statusMsg, statusType);
        sendStatusSection.classList.remove('hidden');
    }

    function updateReceiveProgressUI(receivedBytes = receivedSize, statusMsg = null, statusType = 'info') {
        // ... (same as before) ...
        if (!receiveStatusSection || !receiveProgressBar || !receiveProgressText || !receiveProgressLabel) return;
        const totalSize = filesMetadata ? filesMetadata.reduce((sum, meta) => sum + meta.size, 0) : 0;
        const overallPercent = totalSize > 0 ? Math.min(100, (receivedBytes / totalSize) * 100) : 0;
        receiveProgressBar.style.width = overallPercent + '%';
        receiveProgressBar.setAttribute('aria-valuenow', overallPercent);
        receiveProgressText.textContent = `${formatBytes(receivedBytes)} / ${formatBytes(totalSize)} (${Math.round(overallPercent)}%)`;

        let fileLabel = "Overall Progress";
        if (filesMetadata && currentReceivingFileIndex < filesMetadata.length) {
            const currentFileMeta = filesMetadata[currentReceivingFileIndex];
            const displayPath = currentFileMeta.path !== currentFileMeta.name ? ` (${currentFileMeta.path})` : '';
            fileLabel = `Receiving: ${currentFileMeta.name}${displayPath} (${currentReceivingFileIndex + 1}/${filesMetadata.length})`;
        } else if (receivedBytes >= totalSize && filesMetadata && filesMetadata.length > 0) {
            fileLabel = `Received ${filesMetadata.length} item(s)`;
            connectionInProgress = false; // Allow normal tab switching
        }
        receiveProgressLabel.textContent = fileLabel;
        if (statusMsg !== null) updateStatusDisplay(receiveStatusMessage, statusMsg, statusType);
        receiveStatusSection.classList.remove('hidden');
    }

    function startSpeedAndETRCalc() {
        // ... (same as before, but uses isSenderRole and sendTabState.totalBytesToSend) ...
        stopSpeedAndETRCalc();
        lastMeasurementTime = Date.now();
        lastMeasurementSentBytes = totalBytesSent;
        lastMeasurementReceivedBytes = receivedSize;
        transferStartTime = Date.now();
        console.log("Starting speed calculation interval.");

        speedIntervalId = setInterval(() => {
            const now = Date.now();
            const timeDiffSeconds = (now - lastMeasurementTime) / 1000;
            if (timeDiffSeconds <= 0.1) return;

            let currentSpeed = 0, bytesRemaining = 0, currentTotalBytes = 0;

            if (isSenderRole) { // Sender on Send Tab
                const bytesSentDiff = totalBytesSent - lastMeasurementSentBytes;
                currentSpeed = bytesSentDiff / timeDiffSeconds;
                lastMeasurementSentBytes = totalBytesSent;
                currentTotalBytes = sendTabState.totalBytesToSend;
                bytesRemaining = currentTotalBytes - totalBytesSent;
            } else { // Receiver on Receive Tab
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
            if (currentSpeed > 512 && bytesRemaining > 0) {
                const etrSeconds = bytesRemaining / currentSpeed;
                if (isFinite(etrSeconds)) {
                    if (etrSeconds < 60) etrDisplay = `ETR: ~${Math.round(etrSeconds)}s`;
                    else if (etrSeconds < 3600) etrDisplay = `ETR: ~${Math.round(etrSeconds / 60)}m`;
                    else etrDisplay = `ETR: ~${Math.round(etrSeconds / 3600)}h`;
                }
            } else if (bytesRemaining <= 0 && currentTotalBytes > 0) {
                etrDisplay = 'ETR: Done';
            }

            if (isSenderRole) {
                if (speedIndicator) speedIndicator.textContent = speedDisplay;
                if (etrIndicator) etrIndicator.textContent = etrDisplay;
            } else {
                if (receiveSpeedIndicator) receiveSpeedIndicator.textContent = speedDisplay;
            }
        }, SPEED_INTERVAL);
    }

    function stopSpeedAndETRCalc() {
        // ... (same as before, uses isSenderRole and sendTabState.totalBytesToSend) ...
        if (speedIntervalId) {
            clearInterval(speedIntervalId);
            speedIntervalId = null;
            console.log("Stopped speed calculation interval.");
        }
        if (isSenderRole) {
            if (totalBytesSent < sendTabState.totalBytesToSend) {
                if (speedIndicator) speedIndicator.textContent = '-- MB/s';
                if (etrIndicator) etrIndicator.textContent = 'ETR: --';
            }
        } else {
            const totalSize = filesMetadata ? filesMetadata.reduce((s, m) => s + m.size, 0) : 0;
            if (receivedSize < totalSize) {
                if (receiveSpeedIndicator) receiveSpeedIndicator.textContent = '-- MB/s';
            }
        }
    }

    // --- QR Code Gen/Scan ---
    function generateQRCode(elementId, text) {
        // ... (same as before, uses showToast) ...
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            console.error(`QR Code target element not found: ${elementId}`);
            showToast(`Error: QR display area not found.`, 'error');
            return;
        }
        targetElement.innerHTML = '';
        if (text.length > 2000) {
            console.warn("QR Code data is very long, might be hard to scan.");
            showToast("QR code data is large, may be difficult to scan.", "warning");
        }
        try {
            const typeNumber = 0;
            const errorCorrectionLevel = 'M';
            const qr = qrcode(typeNumber, errorCorrectionLevel);
            qr.addData(text);
            qr.make();
            targetElement.innerHTML = qr.createSvgTag({ scalable: true });
        } catch (e) {
            console.error("QR Code generation error:", e);
            targetElement.innerHTML = '<p style="color: var(--error-color); font-size: 0.9em;">Error generating QR code.</p>';
            showToast('Failed to generate QR code.', 'error');
        }
    }

    function startScanner(readerElementId, statusElementId, containerElementId, scannerVarNamePrefix, successCallback) {
        // ... (scannerVarNamePrefix will be 'file' or 'text') ...
        // ... (uses showToast) ...
        stopAllScanners();
        const scannerContainer = document.getElementById(containerElementId);
        const statusElement = document.getElementById(statusElementId);
        if (!scannerContainer || !statusElement || !Html5Qrcode) {
            console.error("Scanner elements or Html5Qrcode library not found.");
            if (statusElement) statusElement.textContent = "Scanner setup error.";
            showToast("QR Scanner setup error.", "error");
            return;
        }
        scannerContainer.classList.remove('hidden');
        statusElement.textContent = 'Initializing scanner...';
        statusElement.className = '';

        // Determine if it's offer or answer scanner based on current context
        const scannerInstanceVar = (readerElementId.includes('offer')) ? 'offerQrScanner' : 'answerQrScanner';


        try {
            const html5QrCode = new Html5Qrcode(readerElementId); // readerElementId is the div like 'offer-scanner-box'
            if (scannerInstanceVar === 'offerQrScanner') offerQrScanner = html5QrCode;
            else if (scannerInstanceVar === 'answerQrScanner') answerQrScanner = html5QrCode;


            html5QrCode.start(
                { facingMode: "environment" }, QR_SCANNER_CONFIG,
                (decodedText, decodedResult) => {
                    console.log(`QR Code Scanned (${scannerVarNamePrefix}-${scannerInstanceVar}): ${decodedText}`);
                    statusElement.textContent = 'Scan successful!';
                    statusElement.className = 'success';
                    showToast('QR Code scanned successfully!', 'success', 1500);
                    stopScanner(scannerInstanceVar); // Pass the specific instance variable name ('offerQrScanner' or 'answerQrScanner')
                    successCallback(decodedText);
                },
                (errorMessage) => { /* Optional: console.log(`QR Scan message: ${errorMessage}`); */ }
            )
            .then(() => { statusElement.textContent = 'Scanning for QR code...'; })
            .catch((err) => {
                console.error(`Error starting scanner (${scannerVarNamePrefix}-${scannerInstanceVar}):`, err);
                statusElement.textContent = `Scanner Error. Requires camera & HTTPS.`;
                statusElement.className = 'error';
                showToast(`Scanner Error: ${err.message || 'Unknown error'}. Ensure camera access.`, 'error');
                scannerContainer.classList.add('hidden');
                if (scannerInstanceVar === 'offerQrScanner') offerQrScanner = null;
                else if (scannerInstanceVar === 'answerQrScanner') answerQrScanner = null;
            });
        } catch (e) {
            console.error("Html5Qrcode library error:", e);
            statusElement.textContent = 'Scanner library failed.';
            statusElement.className = 'error';
            showToast('QR Scanner library failed to load.', 'error');
            scannerContainer.classList.add('hidden');
        }
    }


    function stopScanner(scannerInstanceVarName) { // e.g., 'offerQrScanner' or 'answerQrScanner'
        let scannerInstance = null;
        let containerElementId = '';

        if (scannerInstanceVarName === 'offerQrScanner') {
            scannerInstance = offerQrScanner;
            containerElementId = offerScannerArea.id; // Use the element directly
        } else if (scannerInstanceVarName === 'answerQrScanner') {
            scannerInstance = answerQrScanner;
            containerElementId = answerScannerArea.id;
        } else {
            return;
        }

        const scannerContainerElem = document.getElementById(containerElementId);

        if (scannerInstance && typeof scannerInstance.getState === 'function') {
            try {
                const state = scannerInstance.getState();
                if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                    scannerInstance.stop()
                        .then(() => console.log(`${scannerInstanceVarName} stopped.`))
                        .catch(err => console.error(`Error stopping ${scannerInstanceVarName}:`, err))
                        .finally(() => {
                            if (scannerContainerElem) scannerContainerElem.classList.add('hidden');
                        });
                } else {
                    if (scannerContainerElem) scannerContainerElem.classList.add('hidden');
                }
            } catch (e) {
                console.warn("Error checking scanner state:", e);
                if (scannerContainerElem) scannerContainerElem.classList.add('hidden');
            }
        } else {
            if (scannerContainerElem) scannerContainerElem.classList.add('hidden');
        }

        if (scannerInstanceVarName === 'offerQrScanner') offerQrScanner = null;
        else if (scannerInstanceVarName === 'answerQrScanner') answerQrScanner = null;
    }


    function stopAllScanners() {
        stopScanner('offerQrScanner');
        stopScanner('answerQrScanner');
    }


    // --- File Handling & UI ---
    if (browseLink) browseLink.onclick = (e) => { e.preventDefault(); fileInput?.click(); };
    if (fileInput) fileInput.onchange = (e) => handleFileSelection(e.target.files);
    if (folderInput) folderInput.onchange = (e) => handleFileSelection(e.target.files);

    if (dropZone) {
        // ... (ondragover, ondragleave same as before) ...
        dropZone.ondragover = (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('dragover'); };
        dropZone.ondragleave = (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('dragover'); };
        dropZone.ondrop = async (e) => {
            e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('dragover');
            const items = e.dataTransfer.items;
            let filesToProcess = [];
            if (items && items.length > 0 && items[0].webkitGetAsEntry) {
                const promises = [];
                for (let i = 0; i < items.length; i++) {
                    const entry = items[i].webkitGetAsEntry();
                    if (entry) promises.push(traverseFileTree(entry));
                }
                try {
                    const nestedFiles = await Promise.all(promises);
                    filesToProcess = nestedFiles.flat();
                } catch (err) {
                    console.error("Error traversing file tree:", err);
                    showToast("Error reading dropped folder(s).", "error");
                }
            } else if (e.dataTransfer.files) {
                filesToProcess = Array.from(e.dataTransfer.files).map(file => ({ file, path: file.name }));
            }
            if (filesToProcess.length > 0) handleFileSelection(filesToProcess);
            else showToast("No valid files or folders dropped.", "warning");
        };
        dropZone.onclick = (e) => {
            if (!e.target.matches('a') && !e.target.matches('label') && !e.target.closest('a') && !e.target.closest('label')) {
                fileInput?.click();
            }
        };
    }

    async function traverseFileTree(entry, currentPath = '') {
        // ... (same as before, uses showToast) ...
        const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        let files = [];
        if (entry.isFile) {
            try {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                files.push({ file: file, path: path });
            } catch (err) {
                console.error(`Error getting file ${path}:`, err);
                showToast(`Could not read file: ${entry.name}`, 'error');
            }
        } else if (entry.isDirectory) {
            try {
                const reader = entry.createReader();
                const entries = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
                const promises = entries.map(subEntry => traverseFileTree(subEntry, path));
                const nestedFiles = await Promise.all(promises);
                files = files.concat(nestedFiles.flat());
            } catch (err) {
                console.error(`Error reading directory ${path}:`, err);
                showToast(`Could not read directory: ${entry.name}`, 'error');
            }
        }
        return files;
    }

    function handleFileSelection(selectedItems) {
        if (activeTab !== 'send') return; // Only for send tab
        if (!selectedItems || selectedItems.length === 0) return;

        let filesAddedCount = 0;
        const newFilesForState = []; // Collect new files for the state object

        for (const item of selectedItems) {
            let file = null, path = null;
            if (item instanceof File) {
                file = item;
                path = item.webkitRelativePath || item.name;
            } else if (item && item.file instanceof File && typeof item.path === 'string') {
                file = item.file;
                path = item.path;
            } else {
                console.warn("Skipping invalid item:", item);
                continue;
            }
            // Check against current sendTabState.filesToSend for duplicates
            if (sendTabState.filesToSend.some(existing => existing.path === path && existing.file.size === file.size)) {
                console.warn(`Skipping duplicate: ${path}`);
                continue;
            }
            newFilesForState.push({ file: file, path: path });
            sendTabState.totalBytesToSend += file.size; // Directly update state
            filesAddedCount++;
        }

        if (filesAddedCount > 0) {
            sendTabState.filesToSend = sendTabState.filesToSend.concat(newFilesForState); // Update state
            filesToSend = sendTabState.filesToSend; // Update global alias
            totalBytesToSend = sendTabState.totalBytesToSend; // Update global alias

            updateFileListUI();
            updateFileSummary();
            sendTabState.isSelectedFilesSectionVisible = true;
            selectedFilesSection.classList.remove('hidden');
            sendTabState.isGenerateBtnDisabled = false;
            generateBtn.disabled = false;
            sendTabState.isPasswordSectionSenderVisible = true;
            passwordSectionSender.classList.remove('hidden');
            showToast(`Added ${filesAddedCount} item(s).`, 'success', 1500);
        } else if (newFilesForState.length === 0 && selectedItems.length > 0) {
             showToast('Selected items are duplicates or invalid.', 'info');
        }
        if (fileInput) fileInput.value = '';
        if (folderInput) folderInput.value = '';
    }


    function updateFileListUI() { // Uses global filesToSend which points to sendTabState.filesToSend
        // ... (same as before) ...
        if (!selectedFilesList) return;
        selectedFilesList.innerHTML = '';
        revokeObjectUrls(); // Revoke previously created URLs for previews
        filesToSend.forEach((item, index) => {
            const file = item.file, path = item.path;
            const li = document.createElement('li');
            li.className = 'file-item';
            li.dataset.index = index;

            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview';
            const fileType = file.type || '';
            let canPreviewModal = false;
            if ((fileType.startsWith('image/') || fileType.startsWith('video/')) && file.size < 20 * 1024 * 1024) {
                const element = fileType.startsWith('image/') ? document.createElement('img') : document.createElement('video');
                const objectURL = URL.createObjectURL(file);
                objectUrls.push(objectURL);
                element.src = objectURL;
                if (fileType.startsWith('video/')) { element.muted = true; element.preload = 'metadata'; }
                element.alt = `Preview for ${file.name}`;
                element.onerror = () => { previewDiv.innerHTML = `<i class="fas ${getFileIconClass(fileType)}"></i>`; };
                previewDiv.appendChild(element);
                li.ondblclick = () => openPreviewModal(element);
                canPreviewModal = true;
            } else {
                previewDiv.innerHTML = `<i class="fas ${getFileIconClass(fileType)}"></i>`;
            }
            if (canPreviewModal) li.setAttribute('title', 'Double-click to preview');


            const infoDiv = document.createElement('div');
            infoDiv.className = 'file-info';
            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-name';
            nameSpan.textContent = file.name;
            nameSpan.title = file.name;
            infoDiv.appendChild(nameSpan);
            if (path !== file.name) {
                const pathSpan = document.createElement('span');
                pathSpan.className = 'file-path';
                pathSpan.textContent = path;
                pathSpan.title = path;
                infoDiv.appendChild(pathSpan);
            }
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'file-size';
            sizeSpan.textContent = formatBytes(file.size);
            infoDiv.appendChild(sizeSpan);


            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
            removeBtn.title = `Remove ${file.name}`;
            removeBtn.onclick = (e) => { e.stopPropagation(); window.removeFile(index); };

            li.appendChild(previewDiv);
            li.appendChild(infoDiv);
            li.appendChild(removeBtn);
            selectedFilesList.appendChild(li);
        });
    }

    function updateFileSummary() { // Uses global totalBytesToSend which points to sendTabState.totalBytesToSend
        // ... (same as before) ...
        if (!fileSummarySpan) return;
        const count = filesToSend.length; // filesToSend is alias for sendTabState.filesToSend
        fileSummarySpan.textContent = `${count} item${count !== 1 ? 's' : ''} (${formatBytes(totalBytesToSend)})`;
    }

    function revokeObjectUrls() {
        // ... (same as before) ...
        if (objectUrls.length > 0) {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
            objectUrls = [];
        }
    }

    // --- WebRTC Signaling & Connection (Generic Setup for Files) ---
    async function createFileTransferOffer() {
        connectionInProgress = true; // Set flag
        // resetState(false); // Partial reset, keep files from sendTabState

        // UI updates are now more targeted based on sendTabState
        sendTabState.isGenerateBtnDisabled = true;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        updateStatusDisplay(sendStatusMessage, 'Preparing connection...', 'info');
        sendStatusSection.classList.remove('hidden'); // Make sure it's visible

        const senderPassword = passwordInputSender.value; // Use current input value
        if (senderPassword && !cryptoAvailable) {
            showToast("Password feature disabled: Secure Context (HTTPS/localhost) required.", "warning");
            passwordInputSender.value = ''; // Clear it
            sendTabState.passwordInputSenderValue = ''; // Update state too
            passwordHash = null;
        } else {
            passwordHash = senderPassword ? await hashPassword(senderPassword) : null;
            if (senderPassword && !passwordHash && cryptoAvailable) {
                updateStatusDisplay(sendStatusMessage, 'Error hashing password.', 'error');
                sendTabState.isGenerateBtnDisabled = false;
                generateBtn.disabled = false;
                generateBtn.innerHTML = `<i class="fas fa-share-alt"></i> Generate Share Code`;
                connectionInProgress = false;
                return;
            }
        }

        console.log(`File Sender: Creating Peer Connection`);
        try {
            peerConnection = new RTCPeerConnection(ICE_SERVERS);
            addPeerConnectionEvents(peerConnection);
            dataChannel = peerConnection.createDataChannel('ShareWaveChannel', { ordered: true });
            addDataChannelEvents(dataChannel);
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log(`File Sender: Local description set.`);

            setTimeout(() => {
                if (!peerConnection || !peerConnection.localDescription) {
                    console.error("Offer generation failed or connection closed.");
                    updateStatusDisplay(sendStatusMessage, 'Error: Failed to generate offer.', 'error');
                    showToast('Error generating connection offer.', 'error');
                    resetUiToInitial(sendTabState, 'send'); // Full reset of Send tab UI to initial state
                    connectionInProgress = false;
                    return;
                }
                const offerSDP = JSON.stringify(peerConnection.localDescription);
                sendTabState.offerSdpTextareaValue = offerSDP; // Save to state
                offerSdpTextarea.value = offerSDP;
                generateQRCode(offerQrCodeDiv.id, offerSDP);

                sendTabState.isOfferStepVisible = true; offerStep.classList.remove('hidden');
                sendTabState.isAnswerStepVisible = true; answerStep.classList.remove('hidden');
                updateStatusDisplay(sendStatusMessage, `Code generated. ${passwordHash ? 'Password is set. ' : ''}Waiting for Receiver...`, 'info');
                generateBtn.innerHTML = '<i class="fas fa-check"></i> Code Generated'; // Stays disabled
                console.log(`File Sender: Offer ready.`);
            }, 500);
        } catch (error) {
            console.error('Offer Creation Error:', error);
            updateStatusDisplay(sendStatusMessage, `Error creating offer: ${error.message}`, 'error');
            showToast(`Offer creation failed: ${error.message}`, 'error');
            resetUiToInitial(sendTabState, 'send');
            connectionInProgress = false;
        }
    }

    async function handleFileTransferAnswerAndConnect() {
        connectionInProgress = true; // Already set by createFileTransferOffer, but good to ensure
        const answerSdpText = answerSdpTextarea.value.trim(); // Use current input

        if (!answerSdpText) {
            updateStatusDisplay(sendStatusMessage, 'Please paste or scan the Receiver\'s code.', 'warning');
            showToast('Receiver\'s code is missing.', 'warning');
            return; // Don't reset connectionInProgress here, user might paste code
        }
        if (!peerConnection || peerConnection.signalingState !== 'have-local-offer') {
            updateStatusDisplay(sendStatusMessage, 'Connection error. Regenerate Share Code.', 'error');
            showToast('Connection state invalid. Please restart.', 'error');
            resetUiToInitial(sendTabState, 'send');
            connectionInProgress = false;
            return;
        }

        connectBtn.disabled = true;
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        updateStatusDisplay(sendStatusMessage, 'Processing Receiver\'s code...', 'info');

        try {
            const answer = JSON.parse(answerSdpText);
            if (!answer || answer.type !== 'answer' || !answer.sdp) throw new Error("Invalid Answer SDP.");
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log(`File Sender: Remote description (Answer) set.`);
            updateStatusDisplay(sendStatusMessage, 'Receiver code accepted. Establishing connection...', 'info');
            // No changes to sendTabState here, connection events will drive further UI.
        } catch (error) {
            console.error('Set Remote Description (Answer) Error:', error);
            updateStatusDisplay(sendStatusMessage, `Connection Error: ${error.message}`, 'error');
            showToast(`Connection error: ${error.message}`, 'error');
            connectBtn.disabled = false;
            connectBtn.innerHTML = `<i class="fas fa-link"></i> Connect`;
            // Don't fully reset connectionInProgress, allow retry
        }
    }

    async function processFileOfferAndGenerateAnswer() {
        connectionInProgress = true;
        // resetState(false); // Partial reset for receiver
        const offerSdpText = offerSdpInputTextarea.value.trim(); // Use current input

        if (!offerSdpText) {
            updateStatusDisplay(receiveStatusMessage, 'Please paste or scan Sender\'s code.', 'warning');
            showToast('Sender\'s code is missing.', 'warning');
            receiveStatusSection.classList.remove('hidden');
            connectionInProgress = false; // No actual connection attempt started
            return;
        }

        generateAnswerBtn.disabled = true;
        generateAnswerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        updateStatusDisplay(receiveStatusMessage, 'Processing Sender\'s code...', 'info');
        receiveStatusSection.classList.remove('hidden');

        try {
            const offer = JSON.parse(offerSdpText);
            if (!offer || offer.type !== 'offer' || !offer.sdp) throw new Error("Invalid Offer SDP.");

            console.log(`File Receiver: Creating Peer Connection`);
            peerConnection = new RTCPeerConnection(ICE_SERVERS);
            addPeerConnectionEvents(peerConnection);
            peerConnection.ondatachannel = (event) => {
                console.log(`File Receiver: Data Channel Received`);
                dataChannel = event.channel;
                addDataChannelEvents(dataChannel);
            };
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            console.log(`File Receiver: Remote description (Offer) set.`);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log(`File Receiver: Local description (Answer) set.`);

            setTimeout(() => {
                if (!peerConnection || !peerConnection.localDescription) {
                    console.error("Answer generation failed or connection closed.");
                    updateStatusDisplay(receiveStatusMessage, 'Error: Failed to generate response.', 'error');
                    showToast('Failed to generate response code.', 'error');
                    resetUiToInitial(receiveTabState, 'receive');
                    connectionInProgress = false;
                    return;
                }
                const answerSDP = JSON.stringify(peerConnection.localDescription);
                receiveTabState.answerSdpOutputTextareaValue = answerSDP; // Save to state
                answerSdpOutputTextarea.value = answerSDP;
                generateQRCode(answerQrCodeDiv.id, answerSDP);

                receiveTabState.isAnswerOutputStepVisible = true; answerOutputStep.classList.remove('hidden');
                offerInputStep.classList.add('hidden'); // Hide offer input step
                receiveTabState.isReceiverWaitMessageVisible = true; receiverWaitMessage.classList.remove('hidden'); // Show wait message
                updateStatusDisplay(receiveStatusMessage, "Response code generated. Share with Sender.", 'info');
                generateAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Code Generated'; // Stays disabled
                console.log(`File Receiver: Answer ready.`);
            }, 500);
        } catch (error) {
            console.error('Answer Creation Error:', error);
            updateStatusDisplay(receiveStatusMessage, `Error processing Sender code: ${error.message}`, 'error');
            showToast(`Error with Sender's code: ${error.message}`, 'error');
            resetUiToInitial(receiveTabState, 'receive');
            connectionInProgress = false;
        }
    }


    // --- Event Listeners for File Send/Receive ---
    if (generateBtn) generateBtn.onclick = createFileTransferOffer;
    if (scanAnswerQrBtn) scanAnswerQrBtn.onclick = () => startScanner('answer-scanner-box', 'answer-scan-status', 'answer-scanner-area', 'file-answer', (txt) => {
        answerSdpTextarea.value = txt;
        sendTabState.answerSdpTextareaValue = txt; // Update state if needed before connect
    });
    if (connectBtn) connectBtn.onclick = handleFileTransferAnswerAndConnect;

    if (scanOfferQrBtn) scanOfferQrBtn.onclick = () => startScanner('offer-scanner-box', 'offer-scan-status', 'offer-scanner-area', 'file-offer', (txt) => {
        offerSdpInputTextarea.value = txt;
        receiveTabState.offerSdpInputTextareaValue = txt; // Update state
    });
    if (generateAnswerBtn) generateAnswerBtn.onclick = processFileOfferAndGenerateAnswer;
    if (verifyPasswordBtn) verifyPasswordBtn.onclick = async () => {
        // ... (same as before, uses showToast) ...
        const receiverPassword = passwordInputReceiver.value;
        if (!receiverPassword) {
            showToast("Please enter the password.", "warning"); return;
        }
        if (!cryptoAvailable) {
            showToast("Password verification disabled (insecure context).", "error"); return;
        }
        verifyPasswordBtn.disabled = true;
        verifyPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        const receiverHash = await hashPassword(receiverPassword);
        if (!receiverHash) {
            showToast("Error hashing password for verification.", "error");
            verifyPasswordBtn.disabled = false;
            verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify'; return;
        }
        sendControlMessage({ type: 'password_check', hash: receiverHash });
        updateStatusDisplay(receiveStatusMessage, "Verifying password with sender...", 'info');
    };


    // --- WebRTC Event Handlers ---
    function addPeerConnectionEvents(pc) {
        // ... (same as before, uses showToast, addHistoryEntry, resetUiToInitial, connectionInProgress flag) ...
        if (!pc) return;
        pc.onicecandidate = (event) => {
            if (event.candidate) console.log(`ICE Candidate: ${event.candidate.sdpMLineIndex}`);
            else console.log("ICE Gathering complete.");
        };
        pc.onicegatheringstatechange = () => { if (pc) console.log(`ICE Gathering State: ${pc.iceGatheringState}`); };
        pc.onsignalingstatechange = () => { if (pc) console.log(`Signaling State: ${pc.signalingState}`); };
        pc.onconnectionstatechange = () => {
            if (!pc) return;
            console.log(`Connection State: ${pc.connectionState}`);
            const statusMsgElement = isSenderRole ? sendStatusMessage : receiveStatusMessage;

            switch (pc.connectionState) {
                case 'new': case 'checking':
                    updateStatusDisplay(statusMsgElement, 'Establishing connection...', 'info'); break;
                case 'connecting':
                    updateStatusDisplay(statusMsgElement, 'Connecting to peer...', 'info'); break;
                case 'connected':
                    updateStatusDisplay(statusMsgElement, 'Peer connected! Initializing data channel...', 'success');
                    showToast('Connection established!', 'success');
                    // Hide signaling UI elements for the current tab
                    if (isSenderRole) {
                        offerStep.classList.add('hidden'); sendTabState.isOfferStepVisible = false;
                        answerStep.classList.add('hidden'); sendTabState.isAnswerStepVisible = false;
                        cancelTransferBtn.disabled = false;
                    } else {
                        offerInputStep.classList.add('hidden');
                        answerOutputStep.classList.add('hidden'); receiveTabState.isAnswerOutputStepVisible = false;
                    }
                    break;
                case 'disconnected':
                    updateStatusDisplay(statusMsgElement, 'Connection disconnected.', 'warning');
                    showToast('Connection lost. Attempting to reconnect...', 'warning');
                    enableChatForCurrentTab(false);
                    stopSpeedAndETRCalc(); break;
                case 'closed':
                    updateStatusDisplay(statusMsgElement, 'Connection closed.', 'info');
                    enableChatForCurrentTab(false);
                    const isIncomplete = isSenderRole ? (totalBytesSent < sendTabState.totalBytesToSend && sendTabState.totalBytesToSend > 0)
                                             : (receivedSize < (filesMetadata ? filesMetadata.reduce((s, m) => s + m.size, 0) : 0) && filesMetadata);
                    if (isIncomplete && connectionInProgress) { // Only add history if a transfer was attempted
                        updateStatusDisplay(statusMsgElement, 'Connection closed: Transfer incomplete.', 'warning');
                        addHistoryEntry(
                            isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                            isSenderRole ? totalBytesSent : receivedSize, false, false, 'file'
                        );
                    }
                    closePeerConnection(); // This sets connectionInProgress = false
                    // After closing, reset the UI of the *current* tab to its initial state
                    // because the connection specific UI (like progress, status) is no longer valid.
                    // Don't reset the other tab's non-connection state.
                    if (activeTab === 'send') resetUiToInitial(sendTabState, 'send');
                    else if (activeTab === 'receive') resetUiToInitial(receiveTabState, 'receive');

                    break;
                case 'failed':
                    updateStatusDisplay(statusMsgElement, 'Connection failed. Please restart.', 'error');
                    showToast('Connection failed. Please check network and restart.', 'error');
                    enableChatForCurrentTab(false);
                    if(connectionInProgress) { // Only add history if connection was being attempted
                        addHistoryEntry(
                            isSenderRole ? sendTabState.filesToSend.map(f=>f.file.name).join(', ') : 'N/A',
                            0, false, false, 'file'
                        );
                    }
                    closePeerConnection(); // Sets connectionInProgress = false
                    if (activeTab === 'send') resetUiToInitial(sendTabState, 'send');
                    else if (activeTab === 'receive') resetUiToInitial(receiveTabState, 'receive');
                    break;
            }
        };
    }

    function addDataChannelEvents(dc) {
        // ... (same as before, uses showToast, addHistoryEntry, connectionInProgress) ...
        if (!dc) return;
        dc.onopen = () => {
            console.log('Data Channel Opened');
            enableChatForCurrentTab(true);

            if (isSenderRole) {
                updateSendProgressUI(0, 'Data channel open. Sending file details...', 'info');
                sendMetadata(); // This function now uses sendTabState.filesToSend
            } else {
                updateReceiveProgressUI(0, 'Data channel open. Waiting for file details...', 'info');
            }
        };
        dc.onclose = () => {
            console.log('Data Channel Closed');
            enableChatForCurrentTab(false);
            stopSpeedAndETRCalc();
            // Additional logic if closed unexpectedly during active transfer
            if (connectionInProgress && peerConnection && ['connected', 'connecting', 'checking'].includes(peerConnection.connectionState)) {
                 const statusMsgElement = isSenderRole ? sendStatusMessage : receiveStatusMessage;
                 updateStatusDisplay(statusMsgElement, 'Transfer interrupted: Data channel closed.', 'error');
                 if (isSenderRole && totalBytesSent < sendTabState.totalBytesToSend && sendTabState.totalBytesToSend > 0) {
                    addHistoryEntry(sendTabState.filesToSend.map(f=>f.file.name).join(', '), totalBytesSent, false, false, 'file');
                 } else if (!isSenderRole && filesMetadata && receivedSize < filesMetadata.reduce((s,m)=>s+m.size,0)) {
                    addHistoryEntry(filesMetadata.map(f=>f.name).join(', '), receivedSize, false, false, 'file');
                 }
            }
            // connectionInProgress = false; // Should be handled by peerconnection state 'closed' or 'failed'
        };
        dc.onerror = (error) => {
            console.error('Data Channel Error:', error);
            enableChatForCurrentTab(false);
            stopSpeedAndETRCalc();
            const errText = error.error?.message || 'Unknown data channel error';
            updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, `Transfer error: ${errText}.`, 'error');
            showToast(`Data channel error: ${errText}`, 'error');
             if(connectionInProgress) {
                addHistoryEntry(
                    isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                    isSenderRole ? totalBytesSent : receivedSize, false, false, 'file'
                );
             }
            closePeerConnection();
        };
        dc.onmessage = handleDataChannelMessage;
    }

    // --- Data Channel Message Handler ---
    async function handleDataChannelMessage(event) {
        // ... (same as before, uses showToast, addHistoryEntry, connectionInProgress) ...
        // Ensure this function correctly identifies if it's for file data or control messages.
        // File chunk processing:
        if (event.data instanceof ArrayBuffer) {
            if (isSenderRole || transferPaused || !filesMetadata) return; // Sender doesn't receive chunks
            try {
                const chunk = event.data;
                if (currentReceivingFileIndex >= filesMetadata.length) return;
                receiveBuffer.push(chunk);
                receivedSize += chunk.byteLength;
                currentFileReceivedSize += chunk.byteLength;
                updateReceiveProgressUI(receivedSize);

                const currentFileMeta = filesMetadata[currentReceivingFileIndex];
                const currentListItem = receivedFilesList.querySelector(`li[data-filename="${CSS.escape(currentFileMeta.name)}"][data-filepath="${CSS.escape(currentFileMeta.path)}"]`);
                if (currentListItem && !currentListItem.classList.contains('transferring')) {
                    receivedFilesList.querySelectorAll('.transferring').forEach(el => el.classList.remove('transferring'));
                    currentListItem.classList.add('transferring');
                }

                if (currentFileReceivedSize >= currentFileMeta.size) {
                    console.log(`Receiver: File ${currentFileMeta.name} chunks complete.`);
                    if (currentListItem) currentListItem.classList.remove('transferring');
                    const completeBuffer = receiveBuffer.slice(0);
                    const receivedBlob = new Blob(completeBuffer, { type: currentFileMeta.type });
                    const finalBlob = (receivedBlob.size > currentFileMeta.size) ? receivedBlob.slice(0, currentFileMeta.size, currentFileMeta.type) : receivedBlob;

                    const hashStatusElement = currentListItem?.querySelector('.file-hash-status');
                    if (hashStatusElement) {
                        hashStatusElement.textContent = 'Verifying...';
                        hashStatusElement.className = 'file-hash-status checking';
                    }
                    const receivedHash = await calculateHash(finalBlob);
                    const expectedHash = currentFileMeta.hash;
                    let isValid = false;
                    if (cryptoAvailable && expectedHash) isValid = receivedHash === expectedHash;

                    console.log(`File: ${currentFileMeta.name}, Expected: ${expectedHash}, Received: ${receivedHash}, Valid: ${isValid}`);
                    if (hashStatusElement) {
                        if (!cryptoAvailable) { hashStatusElement.textContent = 'No Verify'; hashStatusElement.className = 'file-hash-status no-verify'; }
                        else if (!expectedHash) { hashStatusElement.textContent = 'No Hash'; hashStatusElement.className = 'file-hash-status no-hash'; }
                        else { hashStatusElement.textContent = isValid ? 'Verified' : 'Invalid!'; hashStatusElement.className = 'file-hash-status ' + (isValid ? 'valid' : 'invalid'); }
                    }
                    if (currentListItem && !isValid && cryptoAvailable && expectedHash) showToast(`Hash mismatch for ${currentFileMeta.name}! File may be corrupt.`, 'error');


                    receivedFiles.push({ blob: finalBlob, name: currentFileMeta.name, type: currentFileMeta.type, path: currentFileMeta.path });
                    if (currentListItem) {
                        currentListItem.classList.add('ready');
                        const downloadBtnEl = currentListItem.querySelector('.download-btn');
                        const fileSizeSpan = currentListItem.querySelector('.file-size');
                        if (downloadBtnEl) {
                            const objectURL = URL.createObjectURL(finalBlob);
                            objectUrls.push(objectURL);
                            downloadBtnEl.href = objectURL;
                            downloadBtnEl.classList.remove('hidden');
                        }
                        if (fileSizeSpan) fileSizeSpan.textContent = formatBytes(finalBlob.size);
                        if (currentFileMeta.type.startsWith('image/') || currentFileMeta.type.startsWith('video/')) {
                            const previewEl = currentFileMeta.type.startsWith('image/') ? new Image() : document.createElement('video');
                            if (downloadBtnEl) previewEl.src = downloadBtnEl.href; // Check if downloadBtnEl exists
                            currentListItem.ondblclick = () => openPreviewModal(previewEl);
                        }
                    }
                    receiveBuffer = [];
                    currentReceivingFileIndex++;
                    currentFileReceivedSize = 0;
                    if (currentReceivingFileIndex >= filesMetadata.length) {
                        const totalSize = filesMetadata.reduce((s, m) => s + m.size, 0);
                        updateReceiveProgressUI(totalSize, 'All files received!', 'success');
                        showToast('All files received successfully!', 'success');
                        stopSpeedAndETRCalc();
                        downloadAllBtn.disabled = false;
                        downloadZipBtn.disabled = false;
                        addHistoryEntry(filesMetadata.map(f => f.name).join(', '), totalSize, true, false, 'file');
                        connectionInProgress = false; // Transfer complete
                    }
                }
            } catch (e) {
                console.error("Error processing received chunk:", e);
                updateReceiveProgressUI(receivedSize, `Error receiving file: ${e.message}`, 'error');
                showToast(`Error receiving file chunk: ${e.message}`, 'error');
                closePeerConnection();
            }
        } else if (typeof event.data === 'string') { // Control Messages
            try {
                const message = JSON.parse(event.data);
                console.log("Control Message Received:", message);

                switch (message.type) {
                    case 'metadata':
                        if (isSenderRole) return; // Sender shouldn't receive own metadata
                        filesMetadata = message.payload;
                        if (!Array.isArray(filesMetadata)) throw new Error("Invalid metadata.");
                        isPasswordRequiredBySender = message.passwordRequired || false;
                        console.log('Receiver: Metadata for', filesMetadata.length, 'files. Password Req:', isPasswordRequiredBySender);
                        receivedSize = 0; currentReceivingFileIndex = 0; currentFileReceivedSize = 0; receivedFiles = []; revokeObjectUrls();
                        receivedFilesList.innerHTML = '';
                        // Only show received files section if it's not already part of a reset UI state
                        if (connectionInProgress) receivedFilesSection.classList.remove('hidden');
                        downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
                        filesMetadata.forEach(meta => addReceivedFileToList(null, meta.name, meta.type, meta.path, meta.hash));

                        if (isPasswordRequiredBySender && cryptoAvailable) {
                            passwordSectionReceiver.classList.remove('hidden');
                            receiveTabState.isPasswordSectionReceiverVisible = true; // Update state
                            updateReceiveProgressUI(0, 'Password required by sender.', 'warning');
                            passwordInputReceiver.focus();
                        } else if (isPasswordRequiredBySender && !cryptoAvailable) {
                            updateReceiveProgressUI(0, 'Password required, but verification disabled (insecure context).', 'error');
                            showToast('Cannot verify password due to insecure context.', 'error');
                            sendControlMessage({ type: 'error', reason: 'password_unsupported_context' });
                            setTimeout(closePeerConnection, 1000);
                        } else {
                            updateReceiveProgressUI(0, 'File details received. Ready for download.', 'info');
                            sendControlMessage({ type: 'ready_to_receive' });
                            startSpeedAndETRCalc();
                        }
                        break;
                    case 'ready_to_receive':
                        if (!isSenderRole) return;
                        console.log("Sender: Received 'ready_to_receive' for files.");
                        updateStatusDisplay(sendStatusMessage, 'Receiver ready. Starting file transfer...', 'info');
                        startSpeedAndETRCalc();
                        pauseResumeBtn.disabled = false;
                        cancelTransferBtn.disabled = false;
                        sendFileChunk();
                        break;
                    // ... other control messages (password_check, chat, pause/resume, cancel, error) same as before ...
                    case 'password_check':
                        if (!isSenderRole) return;
                        if (!passwordHash) { // passwordHash is connection-specific
                            sendControlMessage({ type: 'error', reason: 'no_password_set_sender' }); return;
                        }
                        const pHash = message.hash;
                        if (pHash === passwordHash) {
                            sendControlMessage({ type: 'password_correct' });
                            updateStatusDisplay(sendStatusMessage, 'Password correct. Waiting for receiver...', 'info');
                        } else {
                            sendControlMessage({ type: 'password_incorrect' });
                            updateStatusDisplay(sendStatusMessage, 'Password incorrect. Closing.', 'error');
                            showToast('Password incorrect on receiver side.', 'error');
                            setTimeout(closePeerConnection, 1000);
                        }
                        break;
                    case 'password_correct':
                        if (isSenderRole) return;
                        passwordSectionReceiver.classList.add('hidden');
                        receiveTabState.isPasswordSectionReceiverVisible = false; // Update state
                        updateReceiveProgressUI(0, 'Password correct. Ready for download.', 'success');
                        showToast('Password verified!', 'success');
                        sendControlMessage({ type: 'ready_to_receive' });
                        startSpeedAndETRCalc();
                        break;
                    case 'password_incorrect':
                        if (isSenderRole) return;
                        updateStatusDisplay(receiveStatusMessage, 'Password incorrect. Connection closed by sender.', 'error');
                        showToast('Password incorrect. Please try again or ask sender.', 'error');
                        passwordInputReceiver.value = ''; receiveTabState.passwordInputReceiverValue = ''; // Update state
                        verifyPasswordBtn.disabled = false;
                        verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
                        break;
                    case 'chat':
                        const chatCtx = getCurrentChatContext();
                        if (message.text && chatCtx.messagesUl) {
                            displayChatMessageInternal(message.text, false, chatCtx.messagesUl);
                            // Also save to the correct tab's chat state if connection is active
                            if (connectionInProgress) {
                                const targetState = isSenderRole ? receiveTabState : sendTabState; // Peer's state
                                targetState.chatMessages.push({ text: message.text, isSent: false });
                            }
                        }
                        break;
                    case 'pause_request':
                        if (isSenderRole) return;
                        transferPaused = true;
                        updateStatusDisplay(receiveStatusMessage, 'Transfer paused by sender.', 'warning');
                        stopSpeedAndETRCalc();
                        sendControlMessage({ type: 'pause_ack' });
                        break;
                    case 'pause_ack':
                        if (!isSenderRole) return;
                        updateStatusDisplay(sendStatusMessage, 'Transfer paused.', 'warning');
                        pauseResumeBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                        break;
                    case 'resume_request':
                        if (isSenderRole) return;
                        transferPaused = false;
                        updateStatusDisplay(receiveStatusMessage, 'Transfer resumed by sender.', 'info');
                        startSpeedAndETRCalc();
                        sendControlMessage({ type: 'resume_ack' });
                        break;
                    case 'resume_ack':
                        if (!isSenderRole) return;
                        transferPaused = false;
                        updateStatusDisplay(sendStatusMessage, 'Transfer resumed.', 'info');
                        pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                        startSpeedAndETRCalc();
                        sendFileChunk();
                        break;
                    case 'cancel_transfer':
                        const cancelMsg = 'Transfer cancelled by peer.';
                        updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, cancelMsg, 'error');
                        showToast(cancelMsg, 'error');
                        if(connectionInProgress) {
                            addHistoryEntry(
                                isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                                isSenderRole ? totalBytesSent : receivedSize,
                                false, true, 'file' // true for cancelled
                            );
                        }
                        closePeerConnection();
                        break;
                    case 'error':
                        updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, `Error from peer: ${message.reason || 'Unknown'}`, 'error');
                        showToast(`Peer error: ${message.reason || 'Unknown error'}`, 'error');
                        if (message.reason === 'no_password_set_sender' || message.reason === 'password_unsupported_context') {
                            setTimeout(closePeerConnection, 1000);
                        }
                        break;

                    default: console.warn("Unknown control message:", message.type);
                }
            } catch (error) {
                console.error("Error parsing control message:", error, "Data:", event.data);
                showToast('Received invalid message from peer.', 'error');
            }
        }
    }

    // --- Data Transfer Logic ---
    async function sendMetadata() { // Uses sendTabState for files
        // ... (same as before, but uses sendTabState.filesToSend and sendTabState.totalBytesToSend) ...
        if (sendTabState.filesToSend.length === 0 || !dataChannel || dataChannel.readyState !== 'open') {
            updateSendProgressUI(0, 'Error: Cannot send file details.', 'error');
            showToast('Failed to send file details.', 'error');
            closePeerConnection(); return;
        }
        updateStatusDisplay(sendStatusMessage, 'Calculating file hashes...', 'info');
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hashing...';
        try {
            const metadataPayload = await Promise.all(sendTabState.filesToSend.map(async (item) => ({
                name: item.file.name, type: item.file.type || 'application/octet-stream',
                size: item.file.size, path: item.path,
                hash: cryptoAvailable ? await calculateHash(item.file) : null
            })));
            console.log('Sender: Sending file metadata:', metadataPayload);
            dataChannel.send(JSON.stringify({ type: 'metadata', payload: metadataPayload, passwordRequired: !!passwordHash })); // passwordHash is connection-specific
            // Don't update generateBtn here as it might be hidden if user switched tabs and came back
            // The UI state for button is managed by sendTabState and restoreTabState
            const waitMsg = passwordHash ? 'Waiting for password verification...' : 'Waiting for receiver readiness...';
            updateSendProgressUI(0, `File details sent. ${waitMsg}`, 'info');
        } catch (error) {
            console.error("Error in sendMetadata:", error);
            updateSendProgressUI(0, 'Error preparing file details.', 'error');
            showToast(`Error preparing files: ${error.message}`, 'error');
            // Reset relevant parts of sendTabState if metadata fails
            sendTabState.isGenerateBtnDisabled = sendTabState.filesToSend.length === 0;
            generateBtn.disabled = sendTabState.isGenerateBtnDisabled;
            generateBtn.innerHTML = '<i class="fas fa-share-alt"></i> Generate Share Code';
            closePeerConnection();
        }
    }

    function sendFileChunk() { // Uses sendTabState.filesToSend
        // ... (same as before, uses showToast, addHistoryEntry) ...
        if (transferPaused) { console.log("Send chunk paused."); return; }
        if (currentFileIndex >= sendTabState.filesToSend.length) { console.log("All files sent."); return; } // Check against state
        if (!dataChannel || dataChannel.readyState !== 'open') {
            updateSendProgressUI(totalBytesSent, 'Error: Connection lost.', 'error');
            showToast('Connection lost during transfer.', 'error');
            stopSpeedAndETRCalc();
            if(connectionInProgress) addHistoryEntry(sendTabState.filesToSend.map(f => f.file.name).join(', '), totalBytesSent, false, false, 'file');
            return;
        }
        const currentItem = sendTabState.filesToSend[currentFileIndex]; // Use state
        const file = currentItem.file;
        const listItem = selectedFilesList.querySelector(`li[data-index="${currentFileIndex}"]`);
        if (listItem && !listItem.classList.contains('transferring')) {
            selectedFilesList.querySelectorAll('.transferring').forEach(el => el.classList.remove('transferring'));
            listItem.classList.add('transferring');
        }
        if (dataChannel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
            setTimeout(sendFileChunk, 100); return;
        }
        const slice = file.slice(currentFileOffset, currentFileOffset + CHUNK_SIZE);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target?.result) {
                updateSendProgressUI(totalBytesSent, 'Error reading file chunk.', 'error');
                showToast('Error reading file.', 'error');
                closePeerConnection(); return;
            }
            try {
                if (dataChannel.readyState === 'open' && !transferPaused) {
                    dataChannel.send(e.target.result);
                    const chunkSize = e.target.result.byteLength;
                    currentFileOffset += chunkSize;
                    totalBytesSent += chunkSize;
                    updateSendProgressUI(totalBytesSent);
                    if (currentFileOffset >= file.size) {
                        console.log(`Sent File: ${file.name}`);
                        if (listItem) listItem.classList.remove('transferring');
                        currentFileIndex++;
                        currentFileOffset = 0;
                    }
                    if (currentFileIndex < sendTabState.filesToSend.length && !transferPaused) requestAnimationFrame(sendFileChunk);
                    else if (currentFileIndex >= sendTabState.filesToSend.length) {
                        console.log("All file chunks scheduled for sending.");
                        // updateSendProgressUI will handle completion status and history
                    }
                } else if (transferPaused) console.log("Transfer paused during send op.");
                else {
                     updateSendProgressUI(totalBytesSent, 'Error: Data channel closed.', 'error');
                     showToast('Data channel closed unexpectedly.', 'error');
                }
            } catch (err) {
                console.error("Error sending chunk:", err);
                updateSendProgressUI(totalBytesSent, 'Error sending file chunk.', 'error');
                showToast(`Error sending data: ${err.message}`, 'error');
                closePeerConnection();
            }
        };
        reader.onerror = (err) => {
            console.error("FileReader error:", err);
            updateSendProgressUI(totalBytesSent, 'Error reading file.', 'error');
            showToast(`File read error: ${err.message}`, 'error');
            closePeerConnection();
        };
        reader.readAsArrayBuffer(slice);
    }

    // --- Received File Handling ---
    function addReceivedFileToList(blob, name, type, path, hash) {
        // ... (same as before) ...
        if (!receivedFilesList || !receivedFilesSection) return;
        // Only show if connection is active, otherwise it might flash during tab state restoration
        if(connectionInProgress) receivedFilesSection.classList.remove('hidden');

        const li = document.createElement('li');
        li.className = 'received-file-item';
        li.dataset.filename = name;
        li.dataset.filepath = path;

        const isReady = !!blob;
        const objectURL = blob ? URL.createObjectURL(blob) : '#';
        if (blob) objectUrls.push(objectURL);


        const initialSizeText = isReady ? formatBytes(blob.size) : 'Pending...';
        const downloadButtonClass = isReady ? '' : 'hidden';
        let initialHashText = 'No Hash Sent', initialHashClass = 'no-hash';
        if (cryptoAvailable) {
            if (hash) { initialHashText = isReady ? 'Verifying...' : 'Pending Hash'; initialHashClass = isReady ? 'checking' : 'pending'; }
        } else { initialHashText = 'No Verify'; initialHashClass = 'no-verify'; }

        const filePathDisplay = path !== name ? `<span class="file-path" title="${path}">${path}</span>` : '';
        const hashDisplay = `<span class="file-hash-status ${initialHashClass}">${initialHashText}</span>`;
        const downloadBtnHTML = `<a href="${objectURL}" download="${name}" class="download-btn ${downloadButtonClass}" role="button" aria-label="Download ${name}"><i class="fas fa-download"></i> Download</a>`;

        li.innerHTML = `
            <i class="fas ${getFileIconClass(type)} file-icon"></i>
            <div class="file-info">
                <span class="file-name" title="${name}">${name}</span>
                ${filePathDisplay}
                <span class="file-size">${initialSizeText}</span>
            </div>
            <div class="file-status-indicator">
                ${hashDisplay}
                ${downloadBtnHTML}
            </div>`;
        receivedFilesList.appendChild(li);
    }

    // --- Control Message Sender Utility ---
    function sendControlMessage(message) {
        // ... (same as before, uses showToast) ...
        if (dataChannel && dataChannel.readyState === 'open') {
            try { dataChannel.send(JSON.stringify(message)); console.log("Ctrl Msg Sent:", message); }
            catch (e) {
                console.error("Error sending ctrl msg:", e, message);
                showToast('Failed to send control message.', 'error');
            }
        } else console.warn("Ctrl msg not sent: DC not open.", message);
    }

    // --- Pause/Resume/Cancel Logic ---
    if (pauseResumeBtn) pauseResumeBtn.onclick = () => {
        // ... (same as before, uses showToast) ...
        if (!peerConnection || !dataChannel || dataChannel.readyState !== 'open') {
            showToast("Cannot pause/resume: Connection inactive.", "warning"); return;
        }
        if (transferPaused) {
            sendControlMessage({ type: 'resume_request' });
            updateStatusDisplay(sendStatusMessage, 'Requesting resume...', 'info');
            pauseResumeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resuming';
        } else {
            sendControlMessage({ type: 'pause_request' });
            updateStatusDisplay(sendStatusMessage, 'Requesting pause...', 'info');
            stopSpeedAndETRCalc();
            pauseResumeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pausing';
        }
    };
    if (cancelTransferBtn) cancelTransferBtn.onclick = () => {
        // ... (same as before, uses showToast, addHistoryEntry) ...
        if (!peerConnection) { showToast("Cannot cancel: No active connection.", "warning"); return; }
        console.log(`User initiated file transfer cancellation.`);
        sendControlMessage({ type: 'cancel_transfer', mode: 'file' }); // Specify mode
        const cancelMsg = `File transfer cancelled by user.`;
        updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, cancelMsg, 'error');
        showToast(cancelMsg, 'info');
        if(connectionInProgress) { // Only add history if a transfer was being attempted
            addHistoryEntry(
                isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                isSenderRole ? totalBytesSent : receivedSize,
                false, true, 'file' // true for cancelled
            );
        }
        closePeerConnection();
        pauseResumeBtn.disabled = true;
        cancelTransferBtn.disabled = true;
    };

    // --- Chat Logic (Contextual) ---
    function getCurrentChatContext() {
        // ... (same as before) ...
        if (activeTab === 'send') return { messagesUl: chatMessagesSender, input: chatInputSender, sendBtn: chatSendBtnSender, panel: chatPanelSender, stateMessages: sendTabState.chatMessages };
        if (activeTab === 'receive') return { messagesUl: chatMessagesReceiver, input: chatInputReceiver, sendBtn: chatSendBtnReceiver, panel: chatPanelReceiver, stateMessages: receiveTabState.chatMessages };
        return {};
    }
    function enableChatForCurrentTab(enable) {
        const chatCtx = getCurrentChatContext();
        if (chatCtx.input) chatCtx.input.disabled = !enable;
        if (chatCtx.sendBtn) chatCtx.sendBtn.disabled = !enable;
        // Show panel only if enabled AND there are messages OR if connection is active
        const shouldShowPanel = enable || (chatCtx.stateMessages && chatCtx.stateMessages.length > 0);
        if (chatCtx.panel) chatCtx.panel.classList.toggle('hidden', !shouldShowPanel);
        if (chatCtx.input) chatCtx.input.placeholder = enable ? "Type message..." : "Chat unavailable";
    }

    function sendChatMessageInternal() {
        // ... (same as before, uses showToast, also saves to current tab's chat state) ...
        const chatCtx = getCurrentChatContext();
        if (!chatCtx.input) return;
        const text = chatCtx.input.value.trim();
        if (text && dataChannel && dataChannel.readyState === 'open') {
            sendControlMessage({ type: 'chat', text: text });
            displayChatMessageInternal(text, true, chatCtx.messagesUl);
            chatCtx.stateMessages.push({ text: text, isSent: true }); // Save to state
            chatCtx.input.value = '';
        } else if (!text) { /* ignore */ }
        else showToast("Chat not connected.", "warning");
    }
    function displayChatMessageInternal(text, isSent, messagesUl) {
        // ... (same as before) ...
        if (!messagesUl) return;
        const li = document.createElement('li');
        li.classList.add('chat-message', isSent ? 'sent' : 'received');
        const span = document.createElement('span');
        span.textContent = text;
        li.appendChild(span);
        messagesUl.appendChild(li);
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }
    [chatSendBtnSender, chatSendBtnReceiver].forEach(btn => { if (btn) btn.onclick = sendChatMessageInternal; });
    [chatInputSender, chatInputReceiver].forEach(input => {
        if (input) input.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessageInternal(); }};
    });

    // --- Download All & Zip Logic ---
    if (downloadAllBtn) downloadAllBtn.onclick = () => { /* ... same as before, uses showToast ... */
        if (receivedFiles.length === 0) { showToast("No files to download.", "warning"); return; }
        downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
        downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        let downloadedCount = 0;
        receivedFiles.forEach((fileData, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                const url = URL.createObjectURL(fileData.blob);
                link.href = url;
                link.download = fileData.path || fileData.name;
                document.body.appendChild(link);
                try { link.click(); downloadedCount++; }
                catch (e) { console.error(`Error downloading ${fileData.name}:`, e); showToast(`Failed to download ${fileData.name}`, 'error'); }
                finally {
                    document.body.removeChild(link); URL.revokeObjectURL(url);
                    if (index === receivedFiles.length - 1) {
                        downloadAllBtn.disabled = false; downloadZipBtn.disabled = false;
                        downloadAllBtn.innerHTML = '<i class="fas fa-file-archive"></i> Download All';
                        showToast(`${downloadedCount} files downloaded.`, 'success');
                    }
                }
            }, index * 300);
        });
    };
    if (downloadZipBtn) downloadZipBtn.onclick = () => { /* ... same as before, uses showToast ... */
        if (receivedFiles.length === 0) { showToast("No files to zip.", "warning"); return; }
        if (typeof JSZip === 'undefined') { showToast("JSZip library not loaded.", "error"); return; }
        downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
        downloadZipBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Zipping...';
        updateStatusDisplay(receiveStatusMessage, `Zipping ${receivedFiles.length} file(s)...`, 'info');
        const zip = new JSZip();
        receivedFiles.forEach(fileData => zip.file(fileData.path || fileData.name, fileData.blob, { binary: true }));
        zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
            .then((content) => {
                updateStatusDisplay(receiveStatusMessage, 'Zip created. Starting download...', 'success');
                showToast('Zip file generated, download starting.', 'success');
                const timestamp = new Date().toISOString().replace(/[:\-.]/g, '').slice(0, 15);
                const zipFilename = `ShareWave_Files_${timestamp}.zip`;
                const url = URL.createObjectURL(content);
                const link = document.createElement('a');
                link.href = url; link.download = zipFilename;
                document.body.appendChild(link);
                try { link.click(); } catch (e) { showToast("Failed to start zip download.", "error"); }
                finally { document.body.removeChild(link); URL.revokeObjectURL(url); }
            })
            .catch(err => {
                updateStatusDisplay(receiveStatusMessage, `Error creating zip: ${err.message}`, 'error');
                showToast(`Zip creation failed: ${err.message}`, 'error');
            })
            .finally(() => {
                downloadAllBtn.disabled = false; downloadZipBtn.disabled = false;
                downloadZipBtn.innerHTML = '<i class="fas fa-file-zipper"></i> Download Zip';
            });
    };

    // --- Theme Toggle ---
    function applyTheme(theme) { /* ... same as before ... */
        const body = document.body;
        const themeIcon = themeToggleBtn?.querySelector('i');
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (theme === 'light') {
            body.classList.add('light-theme'); body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            if (themeMeta) themeMeta.setAttribute('content', '#ffffff');
            if (themeToggleBtn) themeToggleBtn.setAttribute('title', 'Switch to Dark Theme');
        } else {
            body.classList.remove('light-theme'); body.classList.add('dark-theme');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            if (themeMeta) themeMeta.setAttribute('content', '#1e1e1e');
            if (themeToggleBtn) themeToggleBtn.setAttribute('title', 'Switch to Light Theme');
        }
        try { localStorage.setItem('sharewave-theme', theme); }
        catch (e) { console.warn("Could not save theme preference:", e); }
    }
    if (themeToggleBtn) themeToggleBtn.onclick = () => applyTheme(document.body.classList.contains('light-theme') ? 'dark' : 'light');
    applyTheme(localStorage.getItem('sharewave-theme') || 'dark');

    // --- History Panel ---
    function toggleHistoryPanel() { /* ... same as before ... */
        if (!historyPanel) return;
        const isOpen = historyPanel.classList.toggle('open');
        historyToggleBtn?.setAttribute('aria-expanded', isOpen.toString());
        if (isOpen) loadHistory();
    }
    if (historyToggleBtn) historyToggleBtn.onclick = toggleHistoryPanel;
    if (closeHistoryBtn) closeHistoryBtn.onclick = toggleHistoryPanel;

    function loadHistory() { /* ... same as before ... */
        if (!historyList || !clearHistoryBtn) return;
        let history = [];
        try { history = JSON.parse(localStorage.getItem('transferHistory') || '[]'); if (!Array.isArray(history)) history = []; }
        catch (e) { console.error("Error parsing history:", e); history = []; }
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<li class="no-history">No past transfers recorded.</li>';
            clearHistoryBtn.disabled = true; return;
        }
        clearHistoryBtn.disabled = false;
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            const date = new Date(item.timestamp).toLocaleString();
            let statusIconClass = 'warning fas fa-question-circle', statusText = 'Unknown'; // Default icon too
            if (item.cancelled) { statusIconClass = 'error fas fa-ban'; statusText = 'Cancelled'; }
            else if (item.success) { statusIconClass = 'success fas fa-check-circle'; statusText = 'Completed'; }
            else { statusIconClass = 'error fas fa-times-circle'; statusText = 'Failed/Incomplete'; }

            let displayFilenames = item.filenames || 'N/A';
             // item.transferType will be 'file' as text share is removed.
            if (displayFilenames.length > 60) displayFilenames = displayFilenames.substring(0, 57) + '...';

            li.innerHTML = `
                <strong>${displayFilenames}</strong>
                <span><i class="fas fa-database"></i> Size: ${formatBytes(item.size || 0)}</span>
                <span><i class="fas fa-calendar-alt"></i> Date: ${date}</span>
                <span>Status: <i class="${statusIconClass}"></i> ${statusText}</span>
                <span><i class="fas fa-exchange-alt"></i> Type: File(s)</span>`; // Always File(s) now
            historyList.appendChild(li);
        });
    }

    function addHistoryEntry(filenames, size, success, cancelled = false, transferType = 'file') { /* ... same as before ... */
        // transferType will always be 'file' now, but kept for consistency if re-added
        let history = [];
        try { history = JSON.parse(localStorage.getItem('transferHistory') || '[]'); if (!Array.isArray(history)) history = []; }
        catch (e) { history = []; }
        const entry = {
            timestamp: Date.now(), filenames: filenames || 'N/A', size: size || 0,
            success: !!success, cancelled: !!cancelled, transferType: transferType
        };
        history.unshift(entry);
        if (history.length > HISTORY_LIMIT) history = history.slice(0, HISTORY_LIMIT);
        try { localStorage.setItem('transferHistory', JSON.stringify(history)); }
        catch (e) { console.warn("Could not save history:", e); }
        if (historyPanel && historyPanel.classList.contains('open')) loadHistory();
    }
    if (clearHistoryBtn) clearHistoryBtn.onclick = () => { /* ... same as before, uses showToast ... */
        if (confirm('Clear transfer history? This cannot be undone.')) {
            try { localStorage.removeItem('transferHistory'); loadHistory(); showToast('History cleared.', 'info'); }
            catch (e) { console.error("Failed to clear history:", e); showToast('Could not clear history.', 'error');}
        }
    };
    
    // --- Initialization ---
    if(currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    resetUiToInitial(sendTabState, 'send'); // Initialize Send tab UI state
    resetUiToInitial(receiveTabState, 'receive'); // Initialize Receive tab UI state
    switchTab('send'); // Start on Send tab by default, this will call restoreTabState for 'send'

}); // End DOMContentLoaded
