// --- ShareWave V5.3 (Text Share Removed, Tab State Improved) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Config & Elements ---
    const CHUNK_SIZE = 128 * 1024;
    const MAX_BUFFERED_AMOUNT = 64 * 1024 * 1024;
    const ICE_SERVERS = { iceServers: [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.services.mozilla.com' } ] };
    const QR_SCANNER_CONFIG = { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };
    const HASH_ALGORITHM = 'SHA-256'; // Still used for password hashing
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

    // --- Troubleshooting Panel Elements ---
    const troubleshootingToggleBtn = document.getElementById('troubleshooting-toggle-btn');
    const troubleshootingPanel = document.getElementById('troubleshooting-panel');
    const closeTroubleshootingBtn = document.getElementById('close-troubleshooting-btn');
    const tsIceConnectionState = document.getElementById('ts-ice-connection-state');
    const tsSignalingState = document.getElementById('ts-signaling-state');
    const tsDataChannelState = document.getElementById('ts-data-channel-state');
    const tsIceCandidates = document.getElementById('ts-ice-candidates');

    // --- Tab Buttons & Sections ---
    const sendTabBtn = document.getElementById('send-tab-btn');
    const receiveTabBtn = document.getElementById('receive-tab-btn');
    const sendSection = document.getElementById('send-section');
    const receiveSection = document.getElementById('receive-section');

    // --- File Send Elements ---
    const dropZone = document.getElementById('drop-zone');
    const nicknameInputSender = document.getElementById('nickname-input-sender');
    const nicknameSectionSender = document.getElementById('nickname-section-sender');
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
    const chatTitleSender = document.getElementById('chat-title-sender');

    // --- File Receive Elements ---
    const nicknameInputReceiver = document.getElementById('nickname-input-receiver');
    const nicknameSectionReceiver = document.getElementById('nickname-section-receiver');
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
    const chatTitleReceiver = document.getElementById('chat-title-receiver');

    // --- State Variables ---
    let peerConnection;
    let dataChannel;
    let activeTab = 'send';
    let isSenderRole = true;

    // Consolidating state for clarity
    let sendTabState = {
        filesToSend: [], totalBytesToSend: 0,
        nicknameSender: '', peerNickname: '', // Nicknames
        transferId: null,
        isResuming: false, resumeAttempted: false,
        passwordInputSenderValue: '', offerSdpTextareaValue: '',
        answerSdpTextareaValue: '',
        isPasswordSectionSenderVisible: false, isSelectedFilesSectionVisible: false,
        isOfferStepVisible: false, isAnswerStepVisible: false,
        isGenerateBtnDisabled: true,
        chatMessages: [] // For chat persistence if needed
    };
    let receiveTabState = {
        offerSdpInputTextareaValue: '', answerSdpOutputTextareaValue: '',
        nicknameReceiver: '', peerNickname: '', // Nicknames
        transferId: null,
        isResuming: false,
        passwordInputReceiverValue: '',
        isPasswordSectionReceiverVisible: false,
        isAnswerOutputStepVisible: false, isReceiverWaitMessageVisible: true,
        chatMessages: [] // For chat persistence
    };

    let currentFileIndex = 0;
    let currentFileOffset = 0;
    let totalBytesSent = 0;
    let offerQrScanner = null;
    let answerQrScanner = null;
    let receiveBuffer = [];
    let receivedSize = 0;
    let filesMetadata = null;
    let currentReceivingFileIndex = 0;
    let currentFileReceivedSize = 0;
    let receivedFiles = [];
    let objectUrls = [];
    let passwordHash = null;
    let transferPaused = false;
    let speedIntervalId = null;
    let lastMeasurementTime = 0;
    let lastMeasurementSentBytes = 0;
    let lastMeasurementReceivedBytes = 0;
    let isPasswordRequiredBySender = false;
    let transferStartTime = 0;
    let connectionInProgress = false;

    const cryptoAvailable = window.crypto && window.crypto.subtle;
    if (!cryptoAvailable) {
        console.warn("Web Crypto API not available (requires secure context: HTTPS or localhost). File hashing/password verification disabled.");
    }

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

    window.switchTab = (tabName) => {
        if (activeTab === tabName) return;
        saveCurrentTabState();
        activeTab = tabName;
        isSenderRole = (tabName === 'send');
        if (connectionInProgress) {
            showToast("Switching tabs will reset the current connection process.", "warning");
            closePeerConnection(); // This will also call resetUiToInitial internally if needed
            connectionInProgress = false;
        } else {
            stopAllScanners();
        }
        sendTabBtn.classList.toggle('active', tabName === 'send');
        receiveTabBtn.classList.toggle('active', tabName === 'receive');
        sendTabBtn.setAttribute('aria-selected', tabName === 'send');
        receiveTabBtn.setAttribute('aria-selected', tabName !== 'send');
        sendSection.classList.toggle('active', tabName === 'send');
        receiveSection.classList.toggle('active', tabName === 'receive');

        if (!connectionInProgress) { // Restore state only if not mid-connection
            restoreTabState(tabName);
        } else { // If connection was in progress and now reset, ensure UI is clean for the new tab
             resetUiToInitial(tabName === 'send' ? sendTabState : receiveTabState, tabName);
        }
        enableChatForCurrentTab(false); // Ensure chat is reset/disabled on tab switch initially
    };

    function saveCurrentTabState() {
        if (activeTab === 'send') {
            sendTabState.nicknameSender = nicknameInputSender.value;
            sendTabState.passwordInputSenderValue = passwordInputSender.value;
            sendTabState.offerSdpTextareaValue = offerSdpTextarea.value;
            sendTabState.answerSdpTextareaValue = answerSdpTextarea.value;
            sendTabState.isPasswordSectionSenderVisible = !passwordSectionSender.classList.contains('hidden');
            sendTabState.isSelectedFilesSectionVisible = !selectedFilesSection.classList.contains('hidden');
            sendTabState.isOfferStepVisible = !offerStep.classList.contains('hidden');
            sendTabState.isAnswerStepVisible = !answerStep.classList.contains('hidden');
            sendTabState.isGenerateBtnDisabled = generateBtn.disabled;
            sendTabState.chatMessages = Array.from(chatMessagesSender.children).map(li => ({
                text: li.querySelector('span').textContent, // Simplified, adjust if structure is complex
                isSent: li.classList.contains('sent'),
                nickname: li.dataset.nickname || ''
            }));
        } else if (activeTab === 'receive') {
            receiveTabState.nicknameReceiver = nicknameInputReceiver.value;
            receiveTabState.offerSdpInputTextareaValue = offerSdpInputTextarea.value;
            receiveTabState.answerSdpOutputTextareaValue = answerSdpOutputTextarea.value;
            receiveTabState.passwordInputReceiverValue = passwordInputReceiver.value;
            receiveTabState.isPasswordSectionReceiverVisible = !passwordSectionReceiver.classList.contains('hidden');
            receiveTabState.isAnswerOutputStepVisible = !answerOutputStep.classList.contains('hidden');
            receiveTabState.isReceiverWaitMessageVisible = !receiverWaitMessage.classList.contains('hidden');
            receiveTabState.chatMessages = Array.from(chatMessagesReceiver.children).map(li => ({
                text: li.querySelector('span').textContent, // Simplified
                isSent: li.classList.contains('sent'),
                nickname: li.dataset.nickname || ''
            }));
        }
    }

    function restoreTabState(tabName) {
        if (tabName === 'send') {
            sendTabState.filesToSend = sendTabState.filesToSend || []; // Ensure array exists
            sendTabState.totalBytesToSend = sendTabState.totalBytesToSend || 0;
            filesToSend = sendTabState.filesToSend;
            totalBytesToSend = sendTabState.totalBytesToSend;
            updateFileListUI();
            updateFileSummary();
            nicknameInputSender.value = sendTabState.nicknameSender;
            // Peer nickname is not restored here, it's set during connection
            passwordInputSender.value = sendTabState.passwordInputSenderValue;
            offerSdpTextarea.value = sendTabState.offerSdpTextareaValue;
            answerSdpTextarea.value = sendTabState.answerSdpTextareaValue;
            passwordSectionSender.classList.toggle('hidden', !sendTabState.isPasswordSectionSenderVisible);
            selectedFilesSection.classList.toggle('hidden', !sendTabState.isSelectedFilesSectionVisible);
            offerStep.classList.toggle('hidden', !sendTabState.isOfferStepVisible);
            answerStep.classList.toggle('hidden', !sendTabState.isAnswerStepVisible);
            generateBtn.disabled = sendTabState.isGenerateBtnDisabled;
            if (sendTabState.offerSdpTextareaValue) generateQRCode('offer-qr-code', sendTabState.offerSdpTextareaValue);
            else offerQrCodeDiv.innerHTML = '';
            chatMessagesSender.innerHTML = '';
            sendTabState.chatMessages.forEach(msg => displayChatMessageInternal(msg.text, msg.isSent, chatMessagesSender, msg.nickname));
            chatPanelSender.classList.toggle('hidden', sendTabState.chatMessages.length === 0 || !dataChannel || dataChannel.readyState !== 'open');

        } else if (tabName === 'receive') {
            nicknameInputReceiver.value = receiveTabState.nicknameReceiver;
            // Peer nickname not restored here
            offerSdpInputTextarea.value = receiveTabState.offerSdpInputTextareaValue;
            answerSdpOutputTextarea.value = receiveTabState.answerSdpOutputTextareaValue;
            passwordInputReceiver.value = receiveTabState.passwordInputReceiverValue;
            passwordSectionReceiver.classList.toggle('hidden', !receiveTabState.isPasswordSectionReceiverVisible);
            answerOutputStep.classList.toggle('hidden', !receiveTabState.isAnswerOutputStepVisible);
            offerInputStep.classList.toggle('hidden', receiveTabState.isAnswerOutputStepVisible);
            receiverWaitMessage.classList.toggle('hidden', !receiveTabState.isReceiverWaitMessageVisible);
            if (receiveTabState.answerSdpOutputTextareaValue) generateQRCode('answer-qr-code', receiveTabState.answerSdpOutputTextareaValue);
            else answerQrCodeDiv.innerHTML = '';
            chatMessagesReceiver.innerHTML = '';
            receiveTabState.chatMessages.forEach(msg => displayChatMessageInternal(msg.text, msg.isSent, chatMessagesReceiver, msg.nickname));
            chatPanelReceiver.classList.toggle('hidden', receiveTabState.chatMessages.length === 0 || !dataChannel || dataChannel.readyState !== 'open');
            receiveStatusSection.classList.add('hidden');
            receivedFilesSection.classList.add('hidden');
            receivedFilesList.innerHTML = '';
        }
    }

    function resetUiToInitial(tabStateObject, tabName) {
        currentFileIndex = 0; currentFileOffset = 0; totalBytesSent = 0;
        receiveBuffer = []; receivedSize = 0; filesMetadata = null;
        currentReceivingFileIndex = 0; currentFileReceivedSize = 0;
        receivedFiles = []; revokeObjectUrls();
        passwordHash = null; transferPaused = false; isPasswordRequiredBySender = false;

        if (tabName === 'send') {
            tabStateObject.filesToSend = [];
            tabStateObject.totalBytesToSend = 0;
            tabStateObject.nicknameSender = ''; // Reset nickname
            tabStateObject.peerNickname = '';   // Reset peer nickname
            tabStateObject.transferId = null;
            tabStateObject.isResuming = false;
            tabStateObject.resumeAttempted = false;
            tabStateObject.passwordInputSenderValue = '';
            tabStateObject.offerSdpTextareaValue = '';
            tabStateObject.answerSdpTextareaValue = '';
            tabStateObject.isPasswordSectionSenderVisible = false;
            tabStateObject.isSelectedFilesSectionVisible = false;
            tabStateObject.isOfferStepVisible = false;
            tabStateObject.isAnswerStepVisible = false;
            tabStateObject.isGenerateBtnDisabled = true;
            tabStateObject.chatMessages = [];

            filesToSend = []; totalBytesToSend = 0; updateFileListUI(); updateFileSummary();
            nicknameInputSender.value = ''; // Clear UI
            passwordInputSender.value = '';
            offerSdpTextarea.value = ''; offerQrCodeDiv.innerHTML = '';
            answerSdpTextarea.value = '';
            nicknameSectionSender.classList.remove('hidden'); // Ensure visible
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
            if (chatTitleSender) chatTitleSender.innerHTML = '<i class="fas fa-comments"></i> Chat'; // Reset title
            if (typeof updateTroubleshootingPanelDisplay === 'function') {
                updateTroubleshootingPanelDisplay({
                    iceConnectionState: 'Idle',
                    signalingState: 'Idle',
                    dataChannelState: 'N/A',
                });
                if (tsIceCandidates) tsIceCandidates.value = '';
            }
        } else if (tabName === 'receive') {
            tabStateObject.offerSdpInputTextareaValue = '';
            tabStateObject.answerSdpOutputTextareaValue = '';
            tabStateObject.nicknameReceiver = ''; // Reset nickname
            tabStateObject.peerNickname = '';   // Reset peer nickname
            tabStateObject.transferId = null;
            tabStateObject.isResuming = false;
            tabStateObject.passwordInputReceiverValue = '';
            tabStateObject.isPasswordSectionReceiverVisible = false;
            tabStateObject.isAnswerOutputStepVisible = false;
            tabStateObject.isReceiverWaitMessageVisible = true;
            tabStateObject.chatMessages = [];

            offerSdpInputTextarea.value = '';
            answerSdpOutputTextarea.value = ''; answerQrCodeDiv.innerHTML = '';
            nicknameInputReceiver.value = ''; // Clear UI
            passwordInputReceiver.value = '';
            nicknameSectionReceiver.classList.remove('hidden'); // Ensure visible
            passwordSectionReceiver.classList.add('hidden');
            answerOutputStep.classList.add('hidden');
            offerInputStep.classList.remove('hidden');
            receiverWaitMessage.classList.remove('hidden');
            generateAnswerBtn.innerHTML = '<i class="fas fa-reply"></i> Generate Response Code'; generateAnswerBtn.disabled = false;
            receiveStatusSection.classList.add('hidden');
            receivedFilesSection.classList.add('hidden'); receivedFilesList.innerHTML = '';
            downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
            chatMessagesReceiver.innerHTML = ''; chatPanelReceiver.classList.add('hidden');
            if (chatTitleReceiver) chatTitleReceiver.innerHTML = '<i class="fas fa-comments"></i> Chat'; // Reset title
            if (typeof updateTroubleshootingPanelDisplay === 'function') {
                updateTroubleshootingPanelDisplay({
                    iceConnectionState: 'Idle',
                    signalingState: 'Idle',
                    dataChannelState: 'N/A',
                });
                if (tsIceCandidates) tsIceCandidates.value = '';
            }
        }
    }

    window.copyToClipboard = (elementId) => {
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
        if (activeTab !== 'send') return;
        if (index < 0 || index >= sendTabState.filesToSend.length) return;
        const itemToRemove = sendTabState.filesToSend[index];
        sendTabState.totalBytesToSend -= itemToRemove.file.size;
        sendTabState.filesToSend.splice(index, 1);
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
        } else { return; }
        previewModal.style.display = 'flex';
        previewModal.classList.remove('fade-out');
        document.body.style.overflow = 'hidden';
    };

    window.closePreviewModal = () => {
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
        if (event.target === previewModal) {
            closePreviewModal();
        }
    };

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function getFileIconClass(fileType) {
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
        if (!element) return;
        element.textContent = message;
        element.className = 'status-message ' + (['info', 'success', 'error', 'warning'].find(t => t === type) || 'info');
    }

    function closePeerConnection() {
        updateTroubleshootingPanelDisplay({
            iceConnectionState: 'Closed',
            signalingState: 'Closed',
            dataChannelState: 'Closed'
        });
        stopAllScanners();
        stopSpeedAndETRCalc();
        passwordHash = null;
        isPasswordRequiredBySender = false;
        connectionInProgress = false;
        if (dataChannel) {
            try { dataChannel.close(); } catch (e) { console.warn("Error closing data channel:", e); }
            dataChannel = null;
        }
        if (peerConnection) {
            try { peerConnection.close(); } catch (e) { console.warn("Error closing peer connection:", e); }
            peerConnection = null;
        }
        console.log("Peer connection closed.");
        enableChatForCurrentTab(false);
        // Call resetUiToInitial AFTER setting connectionInProgress to false
        // to ensure UI elements are reset correctly for the current active tab.
        if (activeTab === 'send') {
            resetUiToInitial(sendTabState, 'send');
        } else if (activeTab === 'receive') {
            resetUiToInitial(receiveTabState, 'receive');
        }
    }


    async function hashPassword(password) {
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

    function updateSendProgressUI(sentBytes = totalBytesSent, statusMsg = null, statusType = 'info') {
        if (!sendStatusSection || !sendProgressBar || !sendProgressText || !sendProgressLabel) return;
        totalBytesSent = sentBytes;
        const currentFilesForSend = sendTabState.filesToSend;
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
            connectionInProgress = false;
            if (sendTabState.transferId) {
                localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`); // Use specific key
                console.log(`Sender: Cleared resume state for completed transfer ${sendTabState.transferId}`);
            }
        }
        sendProgressLabel.textContent = fileLabel;
        if (statusMsg !== null) updateStatusDisplay(sendStatusMessage, statusMsg, statusType);
        sendStatusSection.classList.remove('hidden');
    }

    function updateReceiveProgressUI(receivedBytes = receivedSize, statusMsg = null, statusType = 'info') {
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
            connectionInProgress = false;
        }
        receiveProgressLabel.textContent = fileLabel;
        if (statusMsg !== null) updateStatusDisplay(receiveStatusMessage, statusMsg, statusType);
        receiveStatusSection.classList.remove('hidden');
    }

    function startSpeedAndETRCalc() {
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
            if (isSenderRole) {
                const bytesSentDiff = totalBytesSent - lastMeasurementSentBytes;
                currentSpeed = bytesSentDiff / timeDiffSeconds;
                lastMeasurementSentBytes = totalBytesSent;
                currentTotalBytes = sendTabState.totalBytesToSend;
                bytesRemaining = currentTotalBytes - totalBytesSent;
            } else {
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

    function generateQRCode(elementId, text) {
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
        const scannerInstanceVar = (readerElementId.includes('offer')) ? 'offerQrScanner' : 'answerQrScanner';
        try {
            const html5QrCode = new Html5Qrcode(readerElementId);
            if (scannerInstanceVar === 'offerQrScanner') offerQrScanner = html5QrCode;
            else if (scannerInstanceVar === 'answerQrScanner') answerQrScanner = html5QrCode;
            html5QrCode.start(
                { facingMode: "environment" }, QR_SCANNER_CONFIG,
                (decodedText, decodedResult) => {
                    console.log(`QR Code Scanned (${scannerVarNamePrefix}-${scannerInstanceVar}): ${decodedText}`);
                    statusElement.textContent = 'Scan successful!';
                    statusElement.className = 'success';
                    showToast('QR Code scanned successfully!', 'success', 1500);
                    stopScanner(scannerInstanceVar);
                    successCallback(decodedText);
                },
                (errorMessage) => {}
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

    function stopScanner(scannerInstanceVarName) {
        let scannerInstance = null;
        let containerElementId = '';
        if (scannerInstanceVarName === 'offerQrScanner') {
            scannerInstance = offerQrScanner;
            containerElementId = offerScannerArea.id;
        } else if (scannerInstanceVarName === 'answerQrScanner') {
            scannerInstance = answerQrScanner;
            containerElementId = answerScannerArea.id;
        } else { return; }
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

    if (browseLink) browseLink.onclick = (e) => { e.preventDefault(); fileInput?.click(); };
    if (fileInput) fileInput.onchange = (e) => handleFileSelection(e.target.files);
    if (folderInput) folderInput.onchange = (e) => handleFileSelection(e.target.files);

    if (dropZone) {
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
        if (activeTab !== 'send') return;
        if (!selectedItems || selectedItems.length === 0) return;
        let filesAddedCount = 0;
        const newFilesForState = [];
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
            if (sendTabState.filesToSend.some(existing => existing.path === path && existing.file.size === file.size)) {
                console.warn(`Skipping duplicate: ${path}`);
                continue;
            }
            newFilesForState.push({ file: file, path: path });
            sendTabState.totalBytesToSend += file.size;
            filesAddedCount++;
        }
        if (filesAddedCount > 0) {
            sendTabState.filesToSend = sendTabState.filesToSend.concat(newFilesForState);
            filesToSend = sendTabState.filesToSend;
            totalBytesToSend = sendTabState.totalBytesToSend;
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

    function updateFileListUI() {
        if (!selectedFilesList) return;
        selectedFilesList.innerHTML = '';
        revokeObjectUrls();
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

    function updateFileSummary() {
        if (!fileSummarySpan) return;
        const count = filesToSend.length;
        fileSummarySpan.textContent = `${count} item${count !== 1 ? 's' : ''} (${formatBytes(totalBytesToSend)})`;
    }

    function revokeObjectUrls() {
        if (objectUrls.length > 0) {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
            objectUrls = [];
        }
    }

    async function createFileTransferOffer() {
        connectionInProgress = true;
        const newTransferId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        sendTabState.transferId = newTransferId;
        console.log(`Generated Transfer ID: ${sendTabState.transferId}`);
        localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`); // Clear any old state for this ID
        localStorage.removeItem(`sharewaveReceiverResumeState_${sendTabState.transferId}`);

        sendTabState.isGenerateBtnDisabled = true;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        updateStatusDisplay(sendStatusMessage, 'Preparing connection...', 'info');
        sendStatusSection.classList.remove('hidden');
        const senderPassword = passwordInputSender.value;
        if (senderPassword && !cryptoAvailable) {
            showToast("Password feature disabled: Secure Context (HTTPS/localhost) required.", "warning");
            passwordInputSender.value = '';
            sendTabState.passwordInputSenderValue = '';
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
            if (tsIceCandidates) tsIceCandidates.value = '';
            updateTroubleshootingPanelDisplay({
                iceConnectionState: 'New',
                signalingState: 'New',
                dataChannelState: 'N/A (Initializing)'
            });
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
                    resetUiToInitial(sendTabState, 'send');
                    connectionInProgress = false;
                    return;
                }
                const offerSDP = JSON.stringify(peerConnection.localDescription);
                sendTabState.offerSdpTextareaValue = offerSDP;
                offerSdpTextarea.value = offerSDP;
                generateQRCode(offerQrCodeDiv.id, offerSDP);
                sendTabState.isOfferStepVisible = true; offerStep.classList.remove('hidden');
                sendTabState.isAnswerStepVisible = true; answerStep.classList.remove('hidden');
                updateStatusDisplay(sendStatusMessage, `Code generated. ${passwordHash ? 'Password is set. ' : ''}Waiting for Receiver...`, 'info');
                generateBtn.innerHTML = '<i class="fas fa-check"></i> Code Generated';
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
        connectionInProgress = true;
        const answerSdpText = answerSdpTextarea.value.trim();
        if (!answerSdpText) {
            updateStatusDisplay(sendStatusMessage, 'Please paste or scan the Receiver\'s code.', 'warning');
            showToast('Receiver\'s code is missing.', 'warning');
            connectionInProgress = false; // Allow retry
            return;
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
        } catch (error) {
            console.error('Set Remote Description (Answer) Error:', error);
            updateStatusDisplay(sendStatusMessage, `Connection Error: ${error.message}`, 'error');
            showToast(`Connection error: ${error.message}`, 'error');
            connectBtn.disabled = false;
            connectBtn.innerHTML = `<i class="fas fa-link"></i> Connect`;
            connectionInProgress = false; // Allow retry
        }
    }

    async function processFileOfferAndGenerateAnswer() {
        connectionInProgress = true;
        const offerSdpText = offerSdpInputTextarea.value.trim();
        if (!offerSdpText) {
            updateStatusDisplay(receiveStatusMessage, 'Please paste or scan Sender\'s code.', 'warning');
            showToast('Sender\'s code is missing.', 'warning');
            receiveStatusSection.classList.remove('hidden');
            connectionInProgress = false;
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
            if (tsIceCandidates) tsIceCandidates.value = '';
            updateTroubleshootingPanelDisplay({
                iceConnectionState: 'New',
                signalingState: 'New',
                dataChannelState: 'N/A (Initializing)'
            });
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
                receiveTabState.answerSdpOutputTextareaValue = answerSDP;
                answerSdpOutputTextarea.value = answerSDP;
                generateQRCode(answerQrCodeDiv.id, answerSDP);
                receiveTabState.isAnswerOutputStepVisible = true; answerOutputStep.classList.remove('hidden');
                offerInputStep.classList.add('hidden');
                receiveTabState.isReceiverWaitMessageVisible = true; receiverWaitMessage.classList.remove('hidden');
                updateStatusDisplay(receiveStatusMessage, "Response code generated. Share with Sender.", 'info');
                generateAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Code Generated';
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

    if (generateBtn) generateBtn.onclick = createFileTransferOffer;
    if (scanAnswerQrBtn) scanAnswerQrBtn.onclick = () => startScanner('answer-scanner-box', 'answer-scan-status', 'answer-scanner-area', 'file-answer', (txt) => {
        answerSdpTextarea.value = txt;
        sendTabState.answerSdpTextareaValue = txt;
    });
    if (connectBtn) connectBtn.onclick = handleFileTransferAnswerAndConnect;
    if (scanOfferQrBtn) scanOfferQrBtn.onclick = () => startScanner('offer-scanner-box', 'offer-scan-status', 'offer-scanner-area', 'file-offer', (txt) => {
        offerSdpInputTextarea.value = txt;
        receiveTabState.offerSdpInputTextareaValue = txt;
    });
    if (generateAnswerBtn) generateAnswerBtn.onclick = processFileOfferAndGenerateAnswer;
    if (verifyPasswordBtn) verifyPasswordBtn.onclick = async () => {
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

    function addPeerConnectionEvents(pc) {
        if (!pc) return;
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`ICE Candidate: ${event.candidate.sdpMLineIndex}`);
                let candidateString = `type: ${event.candidate.type}, protocol: ${event.candidate.protocol}, addr: ${event.candidate.address}:${event.candidate.port}, sdpMid: ${event.candidate.sdpMid}, lineIdx: ${event.candidate.sdpMLineIndex}`;
                if (event.candidate.relatedAddress) {
                    candidateString += `, raddr: ${event.candidate.relatedAddress}:${event.candidate.relatedPort}`;
                }
                if (event.candidate.candidate.includes("relay")) candidateString += " (relay)";
                updateTroubleshootingPanelDisplay({ iceCandidate: candidateString });
            } else {
                console.log("ICE Gathering complete.");
                updateTroubleshootingPanelDisplay({ iceCandidate: "--- ICE Gathering Complete ---" });
            }
        };
        pc.onicegatheringstatechange = () => { if (pc) console.log(`ICE Gathering State: ${pc.iceGatheringState}`); };
        pc.onsignalingstatechange = () => {
            if (pc) console.log(`Signaling State: ${pc.signalingState}`);
            if (pc) updateTroubleshootingPanelDisplay({ signalingState: pc.signalingState });
        };
        pc.onconnectionstatechange = () => {
            if (!pc) return;
            console.log(`Connection State: ${pc.connectionState}`);
            updateTroubleshootingPanelDisplay({ iceConnectionState: pc.iceConnectionState }); // Use iceConnectionState for panel
            const statusMsgElement = isSenderRole ? sendStatusMessage : receiveStatusMessage;
            const currentPeerNickname = isSenderRole ? sendTabState.peerNickname : receiveTabState.peerNickname;
            const peerDisplay = currentPeerNickname || 'peer';

            switch (pc.connectionState) {
                case 'new': case 'checking':
                    updateStatusDisplay(statusMsgElement, `Establishing connection with ${peerDisplay}...`, 'info'); break;
                case 'connecting':
                    updateStatusDisplay(statusMsgElement, `Connecting to ${peerDisplay}...`, 'info'); break;
                case 'connected':
                    updateStatusDisplay(statusMsgElement, `Connected to ${peerDisplay}! Initializing data channel...`, 'success');
                    showToast(`Connection established with ${peerDisplay}!`, 'success');
                    if (isSenderRole) {
                        offerStep.classList.add('hidden'); sendTabState.isOfferStepVisible = false;
                        answerStep.classList.add('hidden'); sendTabState.isAnswerStepVisible = false;
                        cancelTransferBtn.disabled = false;
                    } else {
                        offerInputStep.classList.add('hidden');
                        answerOutputStep.classList.add('hidden'); receiveTabState.isAnswerOutputStepVisible = false;
                    }
                    const iceCandidatesText = tsIceCandidates ? tsIceCandidates.value : '';
                    if (iceCandidatesText.includes("✨ LOCAL:")) {
                        console.log("Troubleshooting info: A local 'host' candidate was gathered for this connection.");
                    }
                    break;
                case 'disconnected':
                    updateStatusDisplay(statusMsgElement, `Connection with ${peerDisplay} disconnected.`, 'warning');
                    showToast(`Connection lost with ${peerDisplay}. Attempting to reconnect...`, 'warning');
                    enableChatForCurrentTab(false);
                    stopSpeedAndETRCalc();
                if (isSenderRole && sendTabState.transferId && connectionInProgress && totalBytesSent < sendTabState.totalBytesToSend) {
                    const senderResumeState = {
                        transferId: sendTabState.transferId,
                        currentFileIndex: currentFileIndex,
                        currentFileOffset: currentFileOffset,
                        totalBytesToSend: sendTabState.totalBytesToSend,
                        filesToSendPaths: sendTabState.filesToSend.map(f => f.path),
                        peerNickname: sendTabState.peerNickname, // Save peer nickname
                        nicknameSender: sendTabState.nicknameSender // Save own nickname
                    };
                    localStorage.setItem(`sharewaveSenderResumeState_${sendTabState.transferId}`, JSON.stringify(senderResumeState));
                    console.log('Sender: Saved resume state for transfer', sendTabState.transferId, senderResumeState);
                    showToast('Connection lost. Transfer state saved.', 'warning');
                } else if (!isSenderRole && receiveTabState.transferId && connectionInProgress && filesMetadata) {
                    const totalSize = filesMetadata.reduce((sum, meta) => sum + meta.size, 0);
                    if (receivedSize < totalSize) {
                        const receiverResumeState = {
                            transferId: receiveTabState.transferId,
                            currentReceivingFileIndex: currentReceivingFileIndex,
                            currentFileReceivedSize: currentFileReceivedSize,
                            filesMetadata: filesMetadata,
                            peerNickname: receiveTabState.peerNickname, // Save peer nickname
                            nicknameReceiver: receiveTabState.nicknameReceiver // Save own nickname
                        };
                        localStorage.setItem(`sharewaveReceiverResumeState_${receiveTabState.transferId}`, JSON.stringify(receiverResumeState));
                        console.log('Receiver: Saved resume state for transfer', receiveTabState.transferId, receiverResumeState);
                        showToast('Connection lost. Transfer state saved.', 'warning');
                    }
                }
                break;
                case 'closed':
                    updateStatusDisplay(statusMsgElement, `Connection with ${peerDisplay} closed.`, 'info');
                    enableChatForCurrentTab(false);
                    const wasInProgress = connectionInProgress; // Capture state before closePeerConnection modifies it
                    const wasSender = isSenderRole;
                    const sTs = { ...sendTabState }; // Shallow copy for safety
                    const rTs = { ...receiveTabState };
                    const tbs = totalBytesSent;
                    const fm = filesMetadata; // filesMetadata is already a copy or directly usable
                    const rs = receivedSize;

                    if (wasSender && sTs.transferId && wasInProgress && tbs < sTs.totalBytesToSend) {
                        const senderResumeState = {
                            transferId: sTs.transferId, currentFileIndex: currentFileIndex, currentFileOffset: currentFileOffset,
                            totalBytesToSend: sTs.totalBytesToSend, filesToSendPaths: sTs.filesToSend.map(f => f.path),
                            peerNickname: sTs.peerNickname, nicknameSender: sTs.nicknameSender
                        };
                        localStorage.setItem(`sharewaveSenderResumeState_${sTs.transferId}`, JSON.stringify(senderResumeState));
                        console.log('Sender: Saved resume state on unexpected close for transfer', sTs.transferId);
                        if(!document.hidden) showToast('Connection closed. Transfer state saved.', 'warning');
                    } else if (!wasSender && rTs.transferId && wasInProgress && fm) {
                        const totalSize = fm.reduce((sum, meta) => sum + meta.size, 0);
                        if (rs < totalSize) {
                            const receiverResumeState = {
                                transferId: rTs.transferId, currentReceivingFileIndex: currentReceivingFileIndex, currentFileReceivedSize: currentFileReceivedSize,
                                filesMetadata: fm, peerNickname: rTs.peerNickname, nicknameReceiver: rTs.nicknameReceiver
                            };
                            localStorage.setItem(`sharewaveReceiverResumeState_${rTs.transferId}`, JSON.stringify(receiverResumeState));
                            console.log('Receiver: Saved resume state on unexpected close for transfer', rTs.transferId);
                            if(!document.hidden) showToast('Connection closed. Transfer state saved.', 'warning');
                        }
                    }
                    const isIncomplete = isSenderRole ? (totalBytesSent < sendTabState.totalBytesToSend && sendTabState.totalBytesToSend > 0)
                                             : (receivedSize < (filesMetadata ? filesMetadata.reduce((s, m) => s + m.size, 0) : 0) && filesMetadata);
                    if (isIncomplete && connectionInProgress) { // Check connectionInProgress again as it might be set false by other logic
                        updateStatusDisplay(statusMsgElement, `Connection closed with ${peerDisplay}: Transfer incomplete.`, 'warning');
                        addHistoryEntry(
                            isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                            isSenderRole ? totalBytesSent : receivedSize, false, false, 'file'
                        );
                    }
                    closePeerConnection(); // This will call resetUiToInitial
                    break;
                case 'failed':
                    updateStatusDisplay(statusMsgElement, `Connection with ${peerDisplay} failed. Please restart.`, 'error');
                    showToast(`Connection failed with ${peerDisplay}. Please check network and restart.`, 'error');
                    enableChatForCurrentTab(false);
                // Save resume state on 'failed' as well
                if (isSenderRole && sendTabState.transferId && connectionInProgress && totalBytesSent < sendTabState.totalBytesToSend) {
                     const senderResumeState = {
                        transferId: sendTabState.transferId, currentFileIndex: currentFileIndex, currentFileOffset: currentFileOffset,
                        totalBytesToSend: sendTabState.totalBytesToSend, filesToSendPaths: sendTabState.filesToSend.map(f => f.path),
                        peerNickname: sendTabState.peerNickname, nicknameSender: sendTabState.nicknameSender
                    };
                    localStorage.setItem(`sharewaveSenderResumeState_${sendTabState.transferId}`, JSON.stringify(senderResumeState));
                } else if (!isSenderRole && receiveTabState.transferId && connectionInProgress && filesMetadata) {
                    const totalSize = filesMetadata.reduce((sum, meta) => sum + meta.size, 0);
                    if (receivedSize < totalSize) {
                         const receiverResumeState = {
                            transferId: receiveTabState.transferId, currentReceivingFileIndex: currentReceivingFileIndex, currentFileReceivedSize: currentFileReceivedSize,
                            filesMetadata: filesMetadata, peerNickname: receiveTabState.peerNickname, nicknameReceiver: receiveTabState.nicknameReceiver
                        };
                        localStorage.setItem(`sharewaveReceiverResumeState_${receiveTabState.transferId}`, JSON.stringify(receiverResumeState));
                    }
                }
                    if(connectionInProgress) { // Check before closePeerConnection
                        addHistoryEntry(
                            isSenderRole ? sendTabState.filesToSend.map(f=>f.file.name).join(', ') : 'N/A',
                            0, false, false, 'file'
                        );
                    }
                    closePeerConnection(); // This will call resetUiToInitial
                    break;
            }
        };
    }

    function addDataChannelEvents(dc) {
        if (!dc) return;
        dc.onopen = () => {
            console.log('Data Channel Opened');
            updateTroubleshootingPanelDisplay({ dataChannelState: `Open (readyState: ${dc.readyState})` });

            const currentNickname = isSenderRole ? (sendTabState.nicknameSender || 'Anon') : (receiveTabState.nicknameReceiver || 'Anon');
            sendControlMessage({ type: 'peer_info', nickname: currentNickname }); // Send own nickname first

            // Enable chat AFTER sending peer_info, so peer has a chance to get nickname first
            // enableChatForCurrentTab(true); // Moved this to be set after peer_info is received by the other side.

            if (isSenderRole) {
                const savedSenderStateString = localStorage.getItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                if (savedSenderStateString && sendTabState.transferId) { // Ensure transferId is set for resume
                    try {
                        const savedState = JSON.parse(savedSenderStateString);
                        if (savedState.transferId === sendTabState.transferId) { // Double check ID match
                            sendTabState.resumeAttempted = true;
                            // Restore nicknames if available in saved state
                            if(savedState.nicknameSender) sendTabState.nicknameSender = savedState.nicknameSender;
                            if(savedState.peerNickname) sendTabState.peerNickname = savedState.peerNickname;

                            if (savedState.filesToSendPaths && sendTabState.filesToSend.length === savedState.filesToSendPaths.length &&
                                sendTabState.filesToSend.every((file, idx) => file.path === savedState.filesToSendPaths[idx])) {
                                console.log('Sender: Attempting to resume transfer:', savedState.transferId);
                                updateStatusDisplay(sendStatusMessage, `Attempting to resume previous transfer with ${sendTabState.peerNickname || 'peer'}...`, 'info');
                                sendControlMessage({
                                    type: 'resume_request_sender',
                                    transferId: savedState.transferId,
                                    lastFileIndex: savedState.currentFileIndex,
                                    lastFileOffset: savedState.currentFileOffset,
                                    expectedFilePaths: savedState.filesToSendPaths
                                });
                            } else {
                                console.log('Sender: Files changed, cannot resume. Starting fresh.');
                                localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                                sendTabState.resumeAttempted = false;
                                sendMetadata(); // Send fresh metadata
                            }
                        } else {
                             localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`); // Mismatched ID, clear
                             sendMetadata();
                        }
                    } catch (e) {
                        console.error("Error parsing sender resume state:", e);
                        localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                        sendMetadata();
                    }
                } else {
                    sendMetadata(); // No resume state, send initial metadata
                }
            } else { // Receiver side on DC open
                updateReceiveProgressUI(0, `Data channel open with ${receiveTabState.peerNickname || 'sender'}. Waiting for file details...`, 'info');
                 // Chat will be enabled once peer_info is received from sender
            }
        };
        dc.onclose = () => {
            console.log('Data Channel Closed');
            const peerDisplay = (isSenderRole ? sendTabState.peerNickname : receiveTabState.peerNickname) || 'peer';
            updateTroubleshootingPanelDisplay({ dataChannelState: `Closed (readyState: ${dc.readyState})` });
            enableChatForCurrentTab(false);
            stopSpeedAndETRCalc();
            if (connectionInProgress && peerConnection && ['connected', 'connecting', 'checking'].includes(peerConnection.connectionState)) {
                 const statusMsgElement = isSenderRole ? sendStatusMessage : receiveStatusMessage;
                 updateStatusDisplay(statusMsgElement, `Transfer interrupted with ${peerDisplay}: Data channel closed.`, 'error');
                 if (isSenderRole && totalBytesSent < sendTabState.totalBytesToSend && sendTabState.totalBytesToSend > 0) {
                    addHistoryEntry(sendTabState.filesToSend.map(f=>f.file.name).join(', '), totalBytesSent, false, false, 'file');
                 } else if (!isSenderRole && filesMetadata && receivedSize < filesMetadata.reduce((s,m)=>s+m.size,0)) {
                    addHistoryEntry(filesMetadata.map(f=>f.name).join(', '), receivedSize, false, false, 'file');
                 }
            }
        };
        dc.onerror = (error) => {
            console.error('Data Channel Error:', error);
            const peerDisplay = (isSenderRole ? sendTabState.peerNickname : receiveTabState.peerNickname) || 'peer';
            updateTroubleshootingPanelDisplay({ dataChannelState: `Error (readyState: ${dc.readyState}, error: ${error.error?.message || 'Unknown'})` });
            enableChatForCurrentTab(false);
            stopSpeedAndETRCalc();
            const errText = error.error?.message || 'Unknown data channel error';
            updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, `Transfer error with ${peerDisplay}: ${errText}.`, 'error');
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

    async function handleDataChannelMessage(event) {
        if (event.data instanceof ArrayBuffer) {
            if (isSenderRole || transferPaused || !filesMetadata) return;
            try {
                const chunk = event.data;
                if (currentReceivingFileIndex >= filesMetadata.length) return;
                if (receiveTabState.isResuming) {
                    receiveTabState.isResuming = false;
                    console.log("Receiver: Processed first chunk of resumed file. Continuing normally.");
                }
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
                    const completeBuffer = receiveBuffer.slice(0); // Shallow copy for this file
                    const receivedBlob = new Blob(completeBuffer, { type: currentFileMeta.type });
                    const finalBlob = (receivedBlob.size > currentFileMeta.size) ? receivedBlob.slice(0, currentFileMeta.size, currentFileMeta.type) : receivedBlob;

                    // Hashing logic (placeholder as it's complex and might use workers)
                    const hashStatusElement = currentListItem?.querySelector('.file-hash-status');
                    if (hashStatusElement) {
                        hashStatusElement.textContent = 'Verifying...';
                        hashStatusElement.className = 'file-hash-status checking';
                    }
                    const receivedHash = null; // Placeholder for actual hash calculation
                    const expectedHash = currentFileMeta.hash;
                    let isValid = !expectedHash || (cryptoAvailable && receivedHash === expectedHash); // Auto-valid if no expected hash

                    if (hashStatusElement) {
                        if (!cryptoAvailable && expectedHash) { hashStatusElement.textContent = 'No Verify'; hashStatusElement.className = 'file-hash-status no-verify'; }
                        else if (!expectedHash) { hashStatusElement.textContent = 'No Hash'; hashStatusElement.className = 'file-hash-status no-hash'; }
                        else if (receivedHash === null && expectedHash) { hashStatusElement.textContent = 'Verify Pend'; hashStatusElement.className = 'file-hash-status pending';}
                        else { hashStatusElement.textContent = isValid ? 'Verified' : 'Invalid!'; hashStatusElement.className = 'file-hash-status ' + (isValid ? 'valid' : 'invalid'); }
                    }
                    if (currentListItem && !isValid && cryptoAvailable && expectedHash && receivedHash !== null) showToast(`Hash mismatch for ${currentFileMeta.name}! File may be corrupt.`, 'error');

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
                            if (downloadBtnEl) previewEl.src = downloadBtnEl.href; // Use existing URL if available
                            currentListItem.ondblclick = () => openPreviewModal(previewEl);
                        }
                    }
                    receiveBuffer = []; // Clear buffer for next file
                    currentReceivingFileIndex++;
                    currentFileReceivedSize = 0;
                    if (currentReceivingFileIndex >= filesMetadata.length) {
                        const totalSize = filesMetadata.reduce((s, m) => s + m.size, 0);
                        updateReceiveProgressUI(totalSize, `All files received from ${receiveTabState.peerNickname || 'sender'}!`, 'success');
                        showToast(`All files received from ${receiveTabState.peerNickname || 'sender'}!`, 'success');
                        stopSpeedAndETRCalc();
                        downloadAllBtn.disabled = false;
                        downloadZipBtn.disabled = false;
                        addHistoryEntry(filesMetadata.map(f => f.name).join(', '), totalSize, true, false, 'file');
                        if (receiveTabState.transferId) {
                            localStorage.removeItem(`sharewaveReceiverResumeState_${receiveTabState.transferId}`);
                            console.log(`Receiver: Cleared resume state for completed transfer ${receiveTabState.transferId}`);
                        }
                        connectionInProgress = false;
                    }
                }
            } catch (e) {
                console.error("Error processing received chunk:", e);
                updateReceiveProgressUI(receivedSize, `Error receiving file: ${e.message}`, 'error');
                showToast(`Error receiving file chunk: ${e.message}`, 'error');
                closePeerConnection();
            }
        } else if (typeof event.data === 'string') {
            try {
                const message = JSON.parse(event.data);
                console.log("Control Message Received:", message);
                switch (message.type) {
                    case 'peer_info': // Received by both sender and receiver
                        const receivedNickname = message.nickname || 'Anon';
                        if (isSenderRole) { // Sender receives this from Receiver
                            sendTabState.peerNickname = receivedNickname;
                            console.log(`Sender: Received Receiver's nickname: ${sendTabState.peerNickname}`);
                            enableChatForCurrentTab(true); // Enable chat now that peer nickname is known
                            updateStatusDisplay(sendStatusMessage, `Connected with ${sendTabState.peerNickname}. Ready for transfer.`, 'info');
                        } else { // Receiver receives this from Sender (potentially, if sender also sends one)
                            receiveTabState.peerNickname = receivedNickname;
                            console.log(`Receiver: Received Sender's nickname: ${receiveTabState.peerNickname}`);
                            enableChatForCurrentTab(true); // Enable chat
                             updateStatusDisplay(receiveStatusMessage, `Connected with ${receiveTabState.peerNickname}. Waiting for metadata...`, 'info');
                        }
                        break;

                    case 'resume_request_sender':
                        if (isSenderRole) return;
                        const savedReceiverStateString = localStorage.getItem(`sharewaveReceiverResumeState_${message.transferId}`);
                        let canResume = false;
                        if (savedReceiverStateString && message.transferId) {
                            try {
                                const savedState = JSON.parse(savedReceiverStateString);
                                if (savedState.transferId === message.transferId) {
                                    const savedPaths = savedState.filesMetadata.map(m => m.path);
                                    const expectedPaths = message.expectedFilePaths;
                                    if (Array.isArray(expectedPaths) && savedPaths.length === expectedPaths.length &&
                                        savedPaths.every((path, idx) => path === expectedPaths[idx])) {

                                        receiveTabState.transferId = message.transferId;
                                        receiveTabState.isResuming = true;
                                        // Restore nicknames if available in saved state
                                        if(savedState.nicknameReceiver) receiveTabState.nicknameReceiver = savedState.nicknameReceiver;
                                        if(savedState.peerNickname) receiveTabState.peerNickname = savedState.peerNickname;

                                        filesMetadata = savedState.filesMetadata;
                                        currentReceivingFileIndex = savedState.currentReceivingFileIndex;
                                        currentFileReceivedSize = savedState.currentFileReceivedSize;
                                        receivedSize = 0;
                                        for (let i = 0; i < currentReceivingFileIndex; i++) {
                                            receivedSize += filesMetadata[i].size;
                                        }
                                        receivedSize += currentFileReceivedSize;
                                        updateReceiveProgressUI(receivedSize, `Resuming transfer with ${receiveTabState.peerNickname || 'sender'}. Preparing file ${currentReceivingFileIndex + 1}...`, 'info');
                                        receivedFilesList.innerHTML = '';
                                        revokeObjectUrls();
                                        filesMetadata.forEach((meta, idx) => {
                                            addReceivedFileToList(null, meta.name, meta.type, meta.path, meta.hash);
                                            if (idx < currentReceivingFileIndex) {
                                                const item = receivedFilesList.querySelector(`li[data-filename="${CSS.escape(meta.name)}"][data-filepath="${CSS.escape(meta.path)}"]`);
                                                if(item) {
                                                    item.classList.add('ready');
                                                    const sizeEl = item.querySelector('.file-size');
                                                    if(sizeEl) sizeEl.textContent = formatBytes(meta.size);
                                                }
                                            }
                                        });
                                        receivedFilesSection.classList.remove('hidden');
                                        sendControlMessage({
                                            type: 'resume_accept_receiver',
                                            transferId: message.transferId,
                                            receiverFileIndex: currentReceivingFileIndex,
                                            receiverFileReceivedSize: currentFileReceivedSize
                                        });
                                        canResume = true;
                                        localStorage.removeItem(`sharewaveReceiverResumeState_${message.transferId}`);
                                    } else {
                                        console.log("Receiver: File list mismatch. Rejecting resume.");
                                        sendControlMessage({ type: 'resume_reject_receiver', transferId: message.transferId, reason: 'File list mismatch' });
                                        localStorage.removeItem(`sharewaveReceiverResumeState_${message.transferId}`);
                                    }
                                } else {
                                     console.log("Receiver: Transfer ID mismatch. Not this session. Waiting for new metadata.");
                                     sendControlMessage({ type: 'resume_reject_receiver', transferId: message.transferId, reason: 'Transfer ID mismatch with saved state' });
                                     localStorage.removeItem(`sharewaveReceiverResumeState_${message.transferId}`);
                                }
                            } catch (e) {
                                console.error("Error parsing receiver resume state:", e);
                                sendControlMessage({ type: 'resume_reject_receiver', transferId: message.transferId, reason: 'Receiver state error' });
                                localStorage.removeItem(`sharewaveReceiverResumeState_${message.transferId}`);
                            }
                        }
                        if (!canResume && !savedReceiverStateString && message.transferId) {
                            sendControlMessage({ type: 'resume_reject_receiver', transferId: message.transferId, reason: 'No saved session found' });
                        }
                        break;
                    case 'resume_accept_receiver':
                        if (!isSenderRole || !sendTabState.resumeAttempted) return;
                        if (message.transferId === sendTabState.transferId) {
                            console.log('Sender: Resume accepted by receiver.', message);
                            sendTabState.isResuming = true;
                            currentFileIndex = message.receiverFileIndex;
                            currentFileOffset = message.receiverFileReceivedSize;
                            totalBytesSent = 0;
                            for (let i = 0; i < currentFileIndex; i++) {
                                totalBytesSent += sendTabState.filesToSend[i].file.size;
                            }
                            totalBytesSent += currentFileOffset;
                            const currentItem = sendTabState.filesToSend[currentFileIndex];
                            const displayPath = currentItem.path !== currentItem.file.name ? ` (${currentItem.path})` : '';
                            const statusMessageText = `Resuming transfer of ${currentItem.file.name}${displayPath} with ${sendTabState.peerNickname || 'peer'}.`;
                            updateSendProgressUI(totalBytesSent, statusMessageText, 'info');
                            showToast(statusMessageText, 'success');
                            localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                            sendTabState.resumeAttempted = false;
                            pauseResumeBtn.disabled = false;
                            cancelTransferBtn.disabled = false;
                            startSpeedAndETRCalc();
                            sendFileChunk();
                        } else {
                            console.warn("Sender: Received resume_accept for wrong transferId or not expecting it.");
                            sendTabState.resumeAttempted = false;
                            localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                            sendMetadata(); // Fallback to fresh metadata
                        }
                        break;
                    case 'resume_reject_receiver':
                        if (!isSenderRole || !sendTabState.resumeAttempted) return;
                        if (message.transferId === sendTabState.transferId) {
                            console.log(`Sender: Resume rejected by receiver. Reason: ${message.reason}`);
                            showToast(`Resume rejected: ${message.reason || 'Unknown'}. Starting fresh transfer.`, 'warning');
                            localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                            sendTabState.resumeAttempted = false;
                            sendTabState.isResuming = false;
                            sendTabState.transferId = null; // Reset transferId for a fresh one
                            currentFileIndex = 0;
                            currentFileOffset = 0;
                            totalBytesSent = 0;
                            sendMetadata(); // Start a fresh transfer
                        }
                        break;
                    case 'metadata': // Received by Receiver
                        if (isSenderRole) return;
                        filesMetadata = message.payload; // Assuming payload is the array of file metadata
                        if (!Array.isArray(filesMetadata)) throw new Error("Invalid metadata payload.");

                        isPasswordRequiredBySender = message.passwordRequired || false;

                        // Store sender's nickname and update UI
                        const senderNickname = message.senderNickname || 'Anon';
                        receiveTabState.peerNickname = senderNickname;
                        console.log(`Receiver: Received sender's nickname: ${receiveTabState.peerNickname}`);
                        enableChatForCurrentTab(true); // Now we have peer nickname

                        if (message.transferId) {
                            receiveTabState.transferId = message.transferId;
                            console.log(`Receiver: Received Transfer ID: ${receiveTabState.transferId}`);
                            localStorage.removeItem(`sharewaveReceiverResumeState_${receiveTabState.transferId}`); // Clear any old state
                        } else {
                            receiveTabState.transferId = null;
                            console.warn("Receiver: No Transfer ID received in metadata.");
                        }

                        // Send own nickname back to sender
                        const ownNickname = receiveTabState.nicknameReceiver || 'Anon';
                        sendControlMessage({ type: 'peer_info', nickname: ownNickname });

                        console.log('Receiver: Metadata for', filesMetadata.length, `file(s) from ${senderNickname}. Password Req:`, isPasswordRequiredBySender);
                        receivedSize = 0; currentReceivingFileIndex = 0; currentFileReceivedSize = 0; receivedFiles = []; revokeObjectUrls();
                        receivedFilesList.innerHTML = '';
                        if (connectionInProgress) receivedFilesSection.classList.remove('hidden');
                        downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
                        filesMetadata.forEach(meta => addReceivedFileToList(null, meta.name, meta.type, meta.path, meta.hash));

                        if (isPasswordRequiredBySender && cryptoAvailable) {
                            passwordSectionReceiver.classList.remove('hidden');
                            receiveTabState.isPasswordSectionReceiverVisible = true;
                            updateReceiveProgressUI(0, `Password required by ${senderNickname}.`, 'warning');
                            passwordInputReceiver.focus();
                        } else if (isPasswordRequiredBySender && !cryptoAvailable) {
                            updateReceiveProgressUI(0, 'Password required, but verification disabled (insecure context).', 'error');
                            showToast('Cannot verify password due to insecure context.', 'error');
                            sendControlMessage({ type: 'error', reason: 'password_unsupported_context' });
                            setTimeout(closePeerConnection, 1000);
                        } else {
                            updateReceiveProgressUI(0, `File details received from ${senderNickname}. Ready for download.`, 'info');
                            sendControlMessage({ type: 'ready_to_receive' });
                            startSpeedAndETRCalc();
                        }
                        break;
                    case 'ready_to_receive': // Received by Sender
                        if (!isSenderRole) return;
                        console.log("Sender: Received 'ready_to_receive' for files.");
                        const peerDisplayReady = sendTabState.peerNickname || 'Receiver';
                        updateStatusDisplay(sendStatusMessage, `${peerDisplayReady} is ready. Starting transfer...`, 'info');
                        startSpeedAndETRCalc();
                        pauseResumeBtn.disabled = false;
                        cancelTransferBtn.disabled = false;
                        sendFileChunk();
                        break;
                    case 'password_check': // Received by Sender
                        if (!isSenderRole) return;
                        if (!passwordHash) {
                            sendControlMessage({ type: 'error', reason: 'no_password_set_sender' }); return;
                        }
                        const pHash = message.hash;
                        if (pHash === passwordHash) {
                            sendControlMessage({ type: 'password_correct' });
                            updateStatusDisplay(sendStatusMessage, `Password correct for ${sendTabState.peerNickname || 'Receiver'}. Waiting for readiness...`, 'info');
                        } else {
                            sendControlMessage({ type: 'password_incorrect' });
                            updateStatusDisplay(sendStatusMessage, `Password incorrect from ${sendTabState.peerNickname || 'Receiver'}. Closing.`, 'error');
                            showToast(`Password incorrect by ${sendTabState.peerNickname || 'Receiver'}.`, 'error');
                            setTimeout(closePeerConnection, 1000);
                        }
                        break;
                    case 'password_correct': // Received by Receiver
                        if (isSenderRole) return;
                        passwordSectionReceiver.classList.add('hidden');
                        receiveTabState.isPasswordSectionReceiverVisible = false;
                        updateReceiveProgressUI(0, `Password correct with ${receiveTabState.peerNickname || 'Sender'}. Ready for download.`, 'success');
                        showToast('Password verified!', 'success');
                        sendControlMessage({ type: 'ready_to_receive' });
                        startSpeedAndETRCalc();
                        break;
                    case 'password_incorrect': // Received by Receiver
                        if (isSenderRole) return;
                        updateStatusDisplay(receiveStatusMessage, `Password incorrect. Connection closed by ${receiveTabState.peerNickname || 'Sender'}.`, 'error');
                        showToast('Password incorrect. Please try again or ask sender.', 'error');
                        passwordInputReceiver.value = ''; receiveTabState.passwordInputReceiverValue = '';
                        verifyPasswordBtn.disabled = false;
                        verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
                        break;
                    case 'chat':
                        const chatCtx = getCurrentChatContext();
                        const peerChatNickname = isSenderRole ? sendTabState.peerNickname : receiveTabState.peerNickname;
                        if (message.text && chatCtx.messagesUl) {
                            displayChatMessageInternal(message.text, false, chatCtx.messagesUl, peerChatNickname || 'Peer');
                            if (connectionInProgress) { // Store message if still connected
                                const targetState = isSenderRole ? sendTabState : receiveTabState; // Save to current tab's state
                                targetState.chatMessages.push({ text: message.text, isSent: false, nickname: peerChatNickname || 'Peer' });
                            }
                        }
                        break;
                    case 'pause_request':
                        if (isSenderRole) return;
                        transferPaused = true;
                        updateStatusDisplay(receiveStatusMessage, `Transfer paused by ${receiveTabState.peerNickname || 'Sender'}.`, 'warning');
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
                        updateStatusDisplay(receiveStatusMessage, `Transfer resumed by ${receiveTabState.peerNickname || 'Sender'}.`, 'info');
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
                        const peerCancelNickname = (isSenderRole ? sendTabState.peerNickname : receiveTabState.peerNickname) || 'Peer';
                        const cancelMsg = `Transfer cancelled by ${peerCancelNickname}.`;
                        updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, cancelMsg, 'error');
                        showToast(cancelMsg, 'error');
                        if(connectionInProgress) {
                            addHistoryEntry(
                                isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                                isSenderRole ? totalBytesSent : receivedSize,
                                false, true, 'file'
                            );
                        }
                        closePeerConnection();
                        break;
                    case 'error':
                        const peerErrorNickname = (isSenderRole ? sendTabState.peerNickname : receiveTabState.peerNickname) || 'Peer';
                        updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, `Error from ${peerErrorNickname}: ${message.reason || 'Unknown'}`, 'error');
                        showToast(`Peer error: ${message.reason || 'Unknown error'}`, 'error');
                        if (message.reason === 'no_password_set_sender' || message.reason === 'password_unsupported_context') {
                            setTimeout(closePeerConnection, 1000);
                        }
                        break;
                    // 'peer_info' handled at the top of this switch for immediate nickname update
                    default: console.warn("Unknown control message:", message.type);
                }
            } catch (error) {
                console.error("Error parsing control message:", error, "Data:", event.data);
                showToast('Received invalid message from peer.', 'error');
            }
        }
    }

    async function sendMetadata() { // For initial metadata sending
            if (sendTabState.filesToSend.length === 0 || !dataChannel || dataChannel.readyState !== 'open') {
                updateSendProgressUI(0, 'Error: Cannot send file details.', 'error');
                showToast('Failed to send file details.', 'error');
                closePeerConnection();
                return;
            }

            updateStatusDisplay(sendStatusMessage, 'Calculating file hashes...', 'info');
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hashing...';

            const filesToHash = sendTabState.filesToSend;
            const hashPromises = [];

            if (cryptoAvailable && typeof Worker !== 'undefined') {
                console.log("Using Web Worker for hashing.");
                for (let i = 0; i < filesToHash.length; i++) {
                    const item = filesToHash[i];
                    const promise = new Promise((resolve, reject) => {
                        const hashWorker = new Worker('hash-worker.js');
                        hashWorker.onmessage = (event) => {
                            if (event.data.error) {
                                console.error(`Hashing error for ${item.file.name}:`, event.data.error);
                                showToast(`Error hashing ${item.file.name}: ${event.data.error}`, 'error');
                                resolve(null);
                            } else {
                                resolve(event.data.hash);
                            }
                            hashWorker.terminate();
                        };
                        hashWorker.onerror = (error) => {
                            console.error(`Worker error for ${item.file.name}:`, error.message);
                            showToast(`Worker error while hashing ${item.file.name}.`, 'error');
                            resolve(null);
                            hashWorker.terminate();
                        };
                        hashWorker.postMessage({ fileId: i, file: item.file }); // Pass file object directly
                    });
                    hashPromises.push(promise);
                }
            } else {
                console.log("Fallback: Hashing on main thread (or no hashing if crypto unavailable).");
                if (!cryptoAvailable) showToast("Hashing skipped: Crypto API unavailable.", "warning");

                for (const item of filesToHash) {
                    if (!cryptoAvailable) {
                        hashPromises.push(Promise.resolve(null));
                        continue;
                    }
                    // Fallback main thread hashing (simplified, consider performance for large files)
                    const promise = item.file.arrayBuffer()
                        .then(buffer => crypto.subtle.digest('SHA-256', buffer))
                        .then(hashBuffer => Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''))
                        .catch(err => {
                            console.error(`Fallback hashing error for ${item.file.name}:`, err);
                            showToast(`Error hashing ${item.file.name} (fallback).`, 'error');
                            return null;
                        });
                    hashPromises.push(promise);
                }
            }

            try {
                const hashes = await Promise.all(hashPromises);
                const metadataPayload = filesToHash.map((item, index) => ({
                    name: item.file.name,
                    type: item.file.type || 'application/octet-stream',
                    size: item.file.size,
                    path: item.path, // Relative path
                    hash: hashes[index]
                }));

                console.log('Sender: Sending file metadata:', metadataPayload);
                const currentTransferId = sendTabState.transferId || (Date.now().toString(36) + Math.random().toString(36).substring(2)); // Ensure ID if not set
                sendTabState.transferId = currentTransferId; // Store it back

                const nickname = sendTabState.nicknameSender || 'Anon';

                dataChannel.send(JSON.stringify({ // Direct send, not via sendControlMessage
                    type: 'metadata',
                    payload: metadataPayload,
                    passwordRequired: !!passwordHash,
                    senderNickname: nickname, // Include sender's nickname
                    transferId: currentTransferId
                }));

                const waitMsg = passwordHash ? 'Waiting for password verification...' : 'Waiting for receiver readiness...';
                updateSendProgressUI(0, `File details sent to ${sendTabState.peerNickname || 'Receiver'}. ${waitMsg}`, 'info');

            } catch (error) {
                console.error("Error collecting hashes or sending metadata:", error);
                updateSendProgressUI(0, 'Error preparing file details.', 'error');
                showToast(`Error preparing files for sending: ${error.message}`, 'error');
                closePeerConnection();
            }
        }

    function sendFileChunk() {
        if (transferPaused) { console.log("Send chunk paused."); return; }
        if (currentFileIndex >= sendTabState.filesToSend.length) { console.log("All files sent."); return; }
        if (!dataChannel || dataChannel.readyState !== 'open') {
            updateSendProgressUI(totalBytesSent, 'Error: Connection lost.', 'error');
            showToast('Connection lost during transfer.', 'error');
            stopSpeedAndETRCalc();
            if(connectionInProgress) addHistoryEntry(sendTabState.filesToSend.map(f => f.file.name).join(', '), totalBytesSent, false, false, 'file');
            return;
        }
        const currentItem = sendTabState.filesToSend[currentFileIndex];
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

    function addReceivedFileToList(blob, name, type, path, hash) {
        if (!receivedFilesList || !receivedFilesSection) return;
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

    function sendControlMessage(message) {
        if (dataChannel && dataChannel.readyState === 'open') {
            try { dataChannel.send(JSON.stringify(message)); console.log("Ctrl Msg Sent:", message); }
            catch (e) {
                console.error("Error sending ctrl msg:", e, message);
                showToast('Failed to send control message.', 'error');
            }
        } else console.warn("Ctrl msg not sent: DC not open.", message);
    }

    if (pauseResumeBtn) pauseResumeBtn.onclick = () => {
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
        if (!peerConnection) { showToast("Cannot cancel: No active connection.", "warning"); return; }
        console.log(`User initiated file transfer cancellation.`);
        const transferIdToClear = isSenderRole ? sendTabState.transferId : receiveTabState.transferId;
        if (transferIdToClear) {
            localStorage.removeItem(`sharewaveSenderResumeState_${transferIdToClear}`);
            localStorage.removeItem(`sharewaveReceiverResumeState_${transferIdToClear}`);
            console.log(`Cleared resume states for transfer ID ${transferIdToClear} due to cancellation.`);
        }
        sendControlMessage({ type: 'cancel_transfer', mode: 'file' });
        const cancelMsg = `File transfer cancelled by user.`;
        updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, cancelMsg, 'error');
        showToast(cancelMsg, 'info');
        if(connectionInProgress) {
            addHistoryEntry(
                isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                isSenderRole ? totalBytesSent : receivedSize,
                false, true, 'file'
            );
        }
        closePeerConnection();
        pauseResumeBtn.disabled = true;
        cancelTransferBtn.disabled = true;
    };

    function getCurrentChatContext() {
        if (activeTab === 'send') return { messagesUl: chatMessagesSender, input: chatInputSender, sendBtn: chatSendBtnSender, panel: chatPanelSender, stateMessages: sendTabState.chatMessages, titleEl: chatTitleSender, peerNickname: sendTabState.peerNickname };
        if (activeTab === 'receive') return { messagesUl: chatMessagesReceiver, input: chatInputReceiver, sendBtn: chatSendBtnReceiver, panel: chatPanelReceiver, stateMessages: receiveTabState.chatMessages, titleEl: chatTitleReceiver, peerNickname: receiveTabState.peerNickname };
        return {};
    }

    function enableChatForCurrentTab(enable) {
        const chatCtx = getCurrentChatContext();
        if (!chatCtx.panel) return;

        chatCtx.input.disabled = !enable;
        chatCtx.sendBtn.disabled = !enable;

        if (chatCtx.titleEl) {
            if (enable && chatCtx.peerNickname) {
                chatCtx.titleEl.innerHTML = `<i class="fas fa-comments"></i> Chat with ${chatCtx.peerNickname}`;
            } else if (enable) {
                chatCtx.titleEl.innerHTML = `<i class="fas fa-comments"></i> Chat`;
            } else {
                chatCtx.titleEl.innerHTML = `<i class="fas fa-comments"></i> Chat`; // Reset title
            }
        }

        // Show panel if enabled OR if there are existing messages (even if DC is now closed)
        const shouldShowPanel = enable || (chatCtx.stateMessages && chatCtx.stateMessages.length > 0);
        chatCtx.panel.classList.toggle('hidden', !shouldShowPanel);
        chatCtx.input.placeholder = enable ? "Type message..." : "Chat unavailable";

        if (!enable && chatCtx.messagesUl) {
            // Optionally, you might want to clear messages only when a new connection starts,
            // not just when chat is disabled due to DC close. For now, this matches previous behavior.
            // chatCtx.messagesUl.innerHTML = ''; // Clears messages when chat is disabled
        }
    }


    function sendChatMessageInternal() {
        const chatCtx = getCurrentChatContext();
        if (!chatCtx.input || !chatCtx.messagesUl) return;
        const text = chatCtx.input.value.trim();
        if (text && dataChannel && dataChannel.readyState === 'open') {
            sendControlMessage({ type: 'chat', text: text });
            const myNickname = activeTab === 'send' ? (sendTabState.nicknameSender || 'You') : (receiveTabState.nicknameReceiver || 'You');
            displayChatMessageInternal(text, true, chatCtx.messagesUl, myNickname);
            chatCtx.stateMessages.push({ text: text, isSent: true, nickname: myNickname });
            chatCtx.input.value = '';
        } else if (!text) { /* ignore empty message */ }
        else showToast("Chat not connected.", "warning");
    }

    function displayChatMessageInternal(text, isSent, messagesUl, nickname) {
        if (!messagesUl) return;
        const li = document.createElement('li');
        li.classList.add('chat-message', isSent ? 'sent' : 'received');
        const span = document.createElement('span');
        const displayName = nickname || (isSent ? 'You' : 'Peer'); // Fallback if nickname is empty

        // Sanitize HTML to prevent XSS - very basic, consider a library for robust sanitization
        const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const sanitizedNickname = displayName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        if (!isSent && sanitizedNickname !== 'You') { // Only show nickname for received messages from others
            span.innerHTML = `<strong>${sanitizedNickname}:</strong> ${sanitizedText}`;
        } else {
            span.innerHTML = sanitizedText; // For sent messages, or if nickname is "You"
        }
        li.appendChild(span);
        messagesUl.appendChild(li);
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }

    [chatSendBtnSender, chatSendBtnReceiver].forEach(btn => { if (btn) btn.onclick = sendChatMessageInternal; });
    [chatInputSender, chatInputReceiver].forEach(input => {
        if (input) input.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessageInternal(); }};
    });

    if (downloadAllBtn) downloadAllBtn.onclick = () => {
        if (receivedFiles.length === 0) { showToast("No files to download.", "warning"); return; }
        downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
        downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        let downloadedCount = 0;
        receivedFiles.forEach((fileData, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                const url = URL.createObjectURL(fileData.blob);
                link.href = url;
                link.download = fileData.path || fileData.name; // Use path for download name if available
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
            }, index * 300); // Stagger downloads
        });
    };
    if (downloadZipBtn) downloadZipBtn.onclick = () => {
            if (receivedFiles.length === 0) { showToast("No files to zip.", "warning"); return; }

            if (typeof JSZip === 'undefined' && typeof Worker === 'undefined') {
                 showToast("JSZip library not loaded and Workers unavailable.", "error"); return;
            }

            downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
        downloadZipBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Zipping...';
        updateStatusDisplay(receiveStatusMessage, `Zipping ${receivedFiles.length} file(s)... (0%)`, 'info');

            if (typeof Worker !== 'undefined') {
                console.log("Using Web Worker for zipping.");
                const zipWorker = new Worker('zip-worker.js');
                let lastReportedProgress = 0;

                zipWorker.onmessage = (event) => {
                    if (event.data.error) {
                        console.error("Zip Worker Error:", event.data.error);
                        showToast(`Zipping failed: ${event.data.error}`, 'error');
                        updateStatusDisplay(receiveStatusMessage, `Error creating zip: ${event.data.error}`, 'error');
                        downloadAllBtn.disabled = false; downloadZipBtn.disabled = false;
                        downloadZipBtn.innerHTML = '<i class="fas fa-file-zipper"></i> Download Zip';
                        zipWorker.terminate();
                        return;
                    }

                    if (event.data.progress) {
                        const progress = Math.round(event.data.progress);
                        if (progress > lastReportedProgress) {
                           downloadZipBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Zipping (${progress}%)...`;
                           updateStatusDisplay(receiveStatusMessage, `Zipping ${receivedFiles.length} file(s)... (${progress}%)`, 'info');
                           lastReportedProgress = progress;
                        }
                        return;
                    }

                    if (event.data.success && event.data.zipBlob) {
                        console.log("Zipping complete via worker.");
                        updateStatusDisplay(receiveStatusMessage, 'Zip created via worker. Starting download...', 'success');
                        showToast('Zip file generated, download starting.', 'success');

                        const timestamp = new Date().toISOString().replace(/[:\-\.]/g, '').slice(0, 15);
                        const zipFilename = `ShareWave_Files_${timestamp}.zip`;
                        const url = URL.createObjectURL(event.data.zipBlob);
                        const link = document.createElement('a');
                        link.href = url; link.download = zipFilename;
                        document.body.appendChild(link);
                        try { link.click(); } catch (e) { showToast("Failed to start zip download.", "error"); }
                        finally { document.body.removeChild(link); URL.revokeObjectURL(url); }

                        downloadAllBtn.disabled = false; downloadZipBtn.disabled = false;
                        downloadZipBtn.innerHTML = '<i class="fas fa-file-zipper"></i> Download Zip';
                        zipWorker.terminate();
                    }
                };

                zipWorker.onerror = (error) => {
                    console.error("Unhandled Zip Worker Error:", error.message);
                    showToast(`Zipping worker crashed: ${error.message}`, 'error');
                    updateStatusDisplay(receiveStatusMessage, `Fatal error in zipping worker: ${error.message}`, 'error');
                    downloadAllBtn.disabled = false; downloadZipBtn.disabled = false;
                    downloadZipBtn.innerHTML = '<i class="fas fa-file-zipper"></i> Download Zip';
                    zipWorker.terminate();
                };

                const filesForWorker = receivedFiles.map(f => ({
                    name: f.name, // Original filename
                    path: f.path, // Full path for folder structure in zip
                    blob: f.blob
                }));
                zipWorker.postMessage({ filesToZip: filesForWorker });

            } else {
                console.log("Fallback: Zipping on main thread.");
                 if (typeof JSZip === 'undefined') {
                    showToast("JSZip library not loaded for fallback.", "error");
                    downloadAllBtn.disabled = false; downloadZipBtn.disabled = false;
                    downloadZipBtn.innerHTML = '<i class="fas fa-file-zipper"></i> Download Zip';
                    return;
                }
                const zip = new JSZip();
                receivedFiles.forEach(fileData => zip.file(fileData.path || fileData.name, fileData.blob, { binary: true })); // Use path for zip structure

                zip.generateAsync(
                    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
                    (metadata) => {
                        const progress = Math.round(metadata.percent);
                        downloadZipBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Zipping (${progress}%)...`;
                        updateStatusDisplay(receiveStatusMessage, `Zipping ${receivedFiles.length} file(s)... (${progress}%)`, 'info');
                    }
                )
                .then((content) => {
                    updateStatusDisplay(receiveStatusMessage, 'Zip created. Starting download...', 'success');
                    showToast('Zip file generated, download starting.', 'success');
                    const timestamp = new Date().toISOString().replace(/[:\-\.]/g, '').slice(0, 15);
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
        }
    };

    function applyTheme(theme) {
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

    function toggleHistoryPanel() {
        if (!historyPanel) return;
        const isOpen = historyPanel.classList.toggle('open');
        historyToggleBtn?.setAttribute('aria-expanded', isOpen.toString());
        if (isOpen) loadHistory();
    }
    if (historyToggleBtn) historyToggleBtn.onclick = toggleHistoryPanel;
    if (closeHistoryBtn) closeHistoryBtn.onclick = toggleHistoryPanel;

    function loadHistory() {
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
            let statusIconClass = 'warning fas fa-question-circle', statusText = 'Unknown';
            if (item.cancelled) { statusIconClass = 'error fas fa-ban'; statusText = 'Cancelled'; }
            else if (item.success) { statusIconClass = 'success fas fa-check-circle'; statusText = 'Completed'; }
            else { statusIconClass = 'error fas fa-times-circle'; statusText = 'Failed/Incomplete'; }
            let displayFilenames = item.filenames || 'N/A';
            if (displayFilenames.length > 60) displayFilenames = displayFilenames.substring(0, 57) + '...';
            li.innerHTML = `
                <strong>${displayFilenames}</strong>
                <span><i class="fas fa-database"></i> Size: ${formatBytes(item.size || 0)}</span>
                <span><i class="fas fa-calendar-alt"></i> Date: ${date}</span>
                <span>Status: <i class="${statusIconClass}"></i> ${statusText}</span>
                <span><i class="fas fa-exchange-alt"></i> Type: File(s)</span>`;
            historyList.appendChild(li);
        });
    }

    function addHistoryEntry(filenames, size, success, cancelled = false, transferType = 'file') {
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
    if (clearHistoryBtn) clearHistoryBtn.onclick = () => {
        if (confirm('Clear transfer history? This cannot be undone.')) {
            try { localStorage.removeItem('transferHistory'); loadHistory(); showToast('History cleared.', 'info'); }
            catch (e) { console.error("Failed to clear history:", e); showToast('Could not clear history.', 'error');}
        }
    };
    
    function updateTroubleshootingPanelDisplay(states = {}) {
        if (states.hasOwnProperty('iceConnectionState') && tsIceConnectionState) {
            tsIceConnectionState.textContent = states.iceConnectionState || 'N/A';
        }
        if (states.hasOwnProperty('signalingState') && tsSignalingState) {
            tsSignalingState.textContent = states.signalingState || 'N/A';
        }
        if (states.hasOwnProperty('dataChannelState') && tsDataChannelState) {
            tsDataChannelState.textContent = states.dataChannelState || 'N/A';
        }
        if (states.hasOwnProperty('iceCandidate') && tsIceCandidates) {
            tsIceCandidates.value += states.iceCandidate + '\n';
            tsIceCandidates.scrollTop = tsIceCandidates.scrollHeight;
        }
    }

    function toggleTroubleshootingPanel() {
        if (!troubleshootingPanel) return;
        const isOpen = troubleshootingPanel.classList.toggle('open');
        troubleshootingPanel.hidden = !isOpen;
        troubleshootingToggleBtn?.setAttribute('aria-expanded', isOpen.toString());
    }

    if (troubleshootingToggleBtn) troubleshootingToggleBtn.onclick = toggleTroubleshootingPanel;
    if (closeTroubleshootingBtn) closeTroubleshootingBtn.onclick = toggleTroubleshootingPanel;

    if(currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    resetUiToInitial(sendTabState, 'send'); // Initialize send tab state
    resetUiToInitial(receiveTabState, 'receive'); // Initialize receive tab state
    switchTab('send'); // Set default tab

    if (troubleshootingPanel) troubleshootingPanel.hidden = true;
    if (troubleshootingToggleBtn) troubleshootingToggleBtn.setAttribute('aria-expanded', 'false');

    const showLanInfoBtn = document.getElementById('show-lan-info-btn');
    const lanSharingInfoDiv = document.getElementById('lan-sharing-info');
    if (showLanInfoBtn && lanSharingInfoDiv) {
        showLanInfoBtn.onclick = () => {
            const infoText = Array.from(lanSharingInfoDiv.children)
                .map(el => {
                    if (el.tagName === 'UL') {
                        return Array.from(el.children).map(li => `- ${li.textContent || li.innerText}`).join('\n');
                    }
                    return el.textContent || el.innerText;
                })
                .join('\n\n');
            alert(infoText);
        };
    }

    // --- Shake Detection Logic ---
    const SHAKE_THRESHOLD = 20;
    const SHAKE_TIME_GAP = 500;
    const SHAKE_RESET_TIMEOUT = 3000;
    let lastShakeTime = 0;
    let lastX = null, lastY = null, lastZ = null;
    let shakeResetTimer = null;

    function handleDeviceMotion(event) {
        if (connectionInProgress) return;

        const currentTime = new Date().getTime();
        if ((currentTime - lastShakeTime) < SHAKE_TIME_GAP) return;

        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration || !acceleration.x || !acceleration.y || !acceleration.z) {
            return;
        }

        if (lastX === null && lastY === null && lastZ === null) {
            lastX = acceleration.x;
            lastY = acceleration.y;
            lastZ = acceleration.z;
            return;
        }

        const deltaX = Math.abs(acceleration.x - lastX);
        const deltaY = Math.abs(acceleration.y - lastY);
        const deltaZ = Math.abs(acceleration.z - lastZ);

        if ((deltaX > SHAKE_THRESHOLD && deltaY > SHAKE_THRESHOLD) ||
            (deltaX > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD) ||
            (deltaY > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD)) {

            console.log('Shake detected!');
            lastShakeTime = currentTime;

            if (shakeResetTimer) clearTimeout(shakeResetTimer);
            shakeResetTimer = setTimeout(() => {
                lastX = null; lastY = null; lastZ = null;
                console.log("Shake detection variables reset.");
            }, SHAKE_RESET_TIMEOUT);

            if (activeTab === 'send' && generateBtn && !generateBtn.disabled && offerStep.classList.contains('hidden')) {
                showToast('Shake detected! Generating share code...', 'info', 2000);
                generateBtn.click();
                if (navigator.vibrate) navigator.vibrate(100);
            } else if (activeTab === 'receive' && scanOfferQrBtn && offerInputStep.classList.contains('hidden') === false && offerScannerArea.classList.contains('hidden')) {
                showToast('Shake detected! Opening QR scanner...', 'info', 2000);
                scanOfferQrBtn.click();
                if (navigator.vibrate) navigator.vibrate(100);
            } else {
                console.log("Shake detected but no action taken (already in connection process or button unavailable).");
            }
        }

        lastX = acceleration.x;
        lastY = acceleration.y;
        lastZ = acceleration.z;
    }

    async function initShakeDetection() {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));

        if (!isMobile) {
            console.log("Shake detection not initialized: Not a mobile device.");
            return;
        }

        if (window.DeviceMotionEvent) {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                try {
                    const permissionState = await DeviceMotionEvent.requestPermission();
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', handleDeviceMotion, false);
                        console.log("DeviceMotionEvent permission granted and listener added.");
                    } else {
                        console.warn("DeviceMotionEvent permission not granted.");
                    }
                } catch (error) {
                    console.error("Error requesting DeviceMotionEvent permission:", error);
                    window.addEventListener('devicemotion', handleDeviceMotion, false);
                    console.log("Attempting to add devicemotion listener without explicit permission request (e.g. Android or already granted).");
                }
            } else {
                window.addEventListener('devicemotion', handleDeviceMotion, false);
                console.log("DeviceMotionEvent listener added (no explicit permission needed).");
            }
        } else {
            console.warn("DeviceMotionEvent not supported on this device/browser.");
        }
    }
    initShakeDetection();

}); // End DOMContentLoaded
