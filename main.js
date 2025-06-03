// --- ShareWave V5.4 (Avatars Integrated) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Config & Constants ---
    const CHUNK_SIZE = 128 * 1024;
    const MAX_BUFFERED_AMOUNT = 64 * 1024 * 1024;
    const ICE_SERVERS = { iceServers: [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.services.mozilla.com' } ] };
    const QR_SCANNER_CONFIG = { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };
    const HASH_ALGORITHM = 'SHA-256';
    const SPEED_INTERVAL = 2000;
    const HISTORY_LIMIT = 50;
    const DEFAULT_AVATAR_ID = 'avatar_default';
    const PRESET_AVATARS = {
        'avatar_default': 'icons/avatar_default.png',
        'avatar_cat': 'icons/avatar_cat.png',
        'avatar_dog': 'icons/avatar_dog.png',
        'avatar_computer': 'icons/avatar_computer.png',
        'avatar_rocket': 'icons/avatar_rocket.png',
        'avatar_coffee': 'icons/avatar_coffee.png',
        'avatar_controller': 'icons/avatar_controller.png',
        'avatar_book': 'icons/avatar_book.png',
        'avatar_planet': 'icons/avatar_planet.png',
        'avatar_star': 'icons/avatar_star.png',
    };

    // --- Element Getters (Common) ---
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
    const troubleshootingToggleBtn = document.getElementById('troubleshooting-toggle-btn');
    const troubleshootingPanel = document.getElementById('troubleshooting-panel');
    const closeTroubleshootingBtn = document.getElementById('close-troubleshooting-btn');
    const tsIceConnectionState = document.getElementById('ts-ice-connection-state');
    const tsSignalingState = document.getElementById('ts-signaling-state');
    const tsDataChannelState = document.getElementById('ts-data-channel-state');
    const tsIceCandidates = document.getElementById('ts-ice-candidates');
    const sendTabBtn = document.getElementById('send-tab-btn');
    const receiveTabBtn = document.getElementById('receive-tab-btn');
    const sendSection = document.getElementById('send-section');
    const receiveSection = document.getElementById('receive-section');

    // --- Send Tab Elements ---
    const dropZone = document.getElementById('drop-zone');
    const nicknameInputSender = document.getElementById('nickname-input-sender');
    const avatarSelectionSender = document.getElementById('avatar-selection-sender')?.querySelector('.avatar-options');
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
    // const chatTitleAvatarSender = document.getElementById('chat-title-avatar-sender'); // Already part of chatTitleSender's innerHTML

    // --- Receive Tab Elements ---
    const nicknameInputReceiver = document.getElementById('nickname-input-receiver');
    const avatarSelectionReceiver = document.getElementById('avatar-selection-receiver')?.querySelector('.avatar-options');
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
    // const chatTitleAvatarReceiver = document.getElementById('chat-title-avatar-receiver'); // Already part of chatTitleReceiver's innerHTML

    // --- State Variables ---
    let peerConnection;
    let dataChannel;
    let activeTab = 'send';
    let isSenderRole = true;

    let sendTabState = {
        filesToSend: [], totalBytesToSend: 0,
        userInfo: { nickname: '', avatarId: DEFAULT_AVATAR_ID },
        peerInfo: { nickname: '', avatarId: DEFAULT_AVATAR_ID },
        transferId: null, isResuming: false, resumeAttempted: false,
        passwordInputSenderValue: '', offerSdpTextareaValue: '', answerSdpTextareaValue: '',
        isPasswordSectionSenderVisible: false, isSelectedFilesSectionVisible: false,
        isOfferStepVisible: false, isAnswerStepVisible: false,
        isGenerateBtnDisabled: true, chatMessages: []
    };
    let receiveTabState = {
        offerSdpInputTextareaValue: '', answerSdpOutputTextareaValue: '',
        userInfo: { nickname: '', avatarId: DEFAULT_AVATAR_ID },
        peerInfo: { nickname: '', avatarId: DEFAULT_AVATAR_ID },
        transferId: null, isResuming: false, passwordInputReceiverValue: '',
        isPasswordSectionReceiverVisible: false, isAnswerOutputStepVisible: false,
        isReceiverWaitMessageVisible: true, chatMessages: []
    };

    // ... (rest of the state variables like currentFileIndex, etc. remain the same)
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
            closePeerConnection();
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

        if (!connectionInProgress) {
            restoreTabState(tabName);
        } else {
             resetUiToInitial(tabName === 'send' ? sendTabState : receiveTabState, tabName);
        }
        enableChatForCurrentTab(false);
    };

    function saveCurrentTabState() {
        const currentTabState = isSenderRole ? sendTabState : receiveTabState;
        const nicknameInput = isSenderRole ? nicknameInputSender : nicknameInputReceiver;
        const chatMessagesElement = isSenderRole ? chatMessagesSender : chatMessagesReceiver;

        currentTabState.userInfo.nickname = nicknameInput.value;
        // avatarId is already updated by selectAvatar

        if (isSenderRole) {
            sendTabState.passwordInputSenderValue = passwordInputSender.value;
            sendTabState.offerSdpTextareaValue = offerSdpTextarea.value;
            sendTabState.answerSdpTextareaValue = answerSdpTextarea.value;
            sendTabState.isPasswordSectionSenderVisible = !passwordSectionSender.classList.contains('hidden');
            sendTabState.isSelectedFilesSectionVisible = !selectedFilesSection.classList.contains('hidden');
            sendTabState.isOfferStepVisible = !offerStep.classList.contains('hidden');
            sendTabState.isAnswerStepVisible = !answerStep.classList.contains('hidden');
            sendTabState.isGenerateBtnDisabled = generateBtn.disabled;
        } else {
            receiveTabState.offerSdpInputTextareaValue = offerSdpInputTextarea.value;
            receiveTabState.answerSdpOutputTextareaValue = answerSdpOutputTextarea.value;
            receiveTabState.passwordInputReceiverValue = passwordInputReceiver.value;
            receiveTabState.isPasswordSectionReceiverVisible = !passwordSectionReceiver.classList.contains('hidden');
            receiveTabState.isAnswerOutputStepVisible = !answerOutputStep.classList.contains('hidden');
            receiveTabState.isReceiverWaitMessageVisible = !receiverWaitMessage.classList.contains('hidden');
        }
        currentTabState.chatMessages = Array.from(chatMessagesElement.children).map(li => ({
            text: li.querySelector('.message-content span').innerHTML.replace(/<strong>.*?<\/strong>/, '').trim(), // Get only text
            isSent: li.classList.contains('sent'),
            nickname: li.dataset.nickname || (li.classList.contains('sent') ? currentTabState.userInfo.nickname : currentTabState.peerInfo.nickname),
            avatarId: li.dataset.avatarId || (li.classList.contains('sent') ? currentTabState.userInfo.avatarId : currentTabState.peerInfo.avatarId)
        }));
    }

    function restoreTabState(tabName) {
        const currentTabState = tabName === 'send' ? sendTabState : receiveTabState;
        const nicknameInput = tabName === 'send' ? nicknameInputSender : nicknameInputReceiver;
        const chatMessagesElement = tabName === 'send' ? chatMessagesSender : chatMessagesReceiver;
        const avatarSelectionContainer = tabName === 'send' ? avatarSelectionSender : avatarSelectionReceiver;

        nicknameInput.value = currentTabState.userInfo.nickname;
        updateAvatarSelectionUI(avatarSelectionContainer, currentTabState.userInfo.avatarId);


        if (tabName === 'send') {
            sendTabState.filesToSend = sendTabState.filesToSend || [];
            sendTabState.totalBytesToSend = sendTabState.totalBytesToSend || 0;
            filesToSend = sendTabState.filesToSend;
            totalBytesToSend = sendTabState.totalBytesToSend;
            updateFileListUI();
            updateFileSummary();
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
        } else {
            offerSdpInputTextarea.value = receiveTabState.offerSdpInputTextareaValue;
            answerSdpOutputTextarea.value = receiveTabState.answerSdpOutputTextareaValue;
            passwordInputReceiver.value = receiveTabState.passwordInputReceiverValue;
            passwordSectionReceiver.classList.toggle('hidden', !receiveTabState.isPasswordSectionReceiverVisible);
            answerOutputStep.classList.toggle('hidden', !receiveTabState.isAnswerOutputStepVisible);
            offerInputStep.classList.toggle('hidden', receiveTabState.isAnswerOutputStepVisible);
            receiverWaitMessage.classList.toggle('hidden', !receiveTabState.isReceiverWaitMessageVisible);
            if (receiveTabState.answerSdpOutputTextareaValue) generateQRCode('answer-qr-code', receiveTabState.answerSdpOutputTextareaValue);
            else answerQrCodeDiv.innerHTML = '';
            receiveStatusSection.classList.add('hidden');
            receivedFilesSection.classList.add('hidden');
            receivedFilesList.innerHTML = '';
        }

        chatMessagesElement.innerHTML = '';
        currentTabState.chatMessages.forEach(msg => displayChatMessageInternal(msg.text, msg.isSent, chatMessagesElement, msg.nickname, msg.avatarId));
        const chatPanel = tabName === 'send' ? chatPanelSender : chatPanelReceiver;
        chatPanel.classList.toggle('hidden', currentTabState.chatMessages.length === 0 || !dataChannel || dataChannel.readyState !== 'open');
        enableChatForCurrentTab(dataChannel && dataChannel.readyState === 'open'); // Update title based on restored peerInfo
    }

    function resetUiToInitial(tabStateObject, tabName) {
        currentFileIndex = 0; currentFileOffset = 0; totalBytesSent = 0;
        receiveBuffer = []; receivedSize = 0; filesMetadata = null;
        currentReceivingFileIndex = 0; currentFileReceivedSize = 0;
        receivedFiles = []; revokeObjectUrls();
        passwordHash = null; transferPaused = false; isPasswordRequiredBySender = false;

        tabStateObject.userInfo = { nickname: '', avatarId: DEFAULT_AVATAR_ID };
        tabStateObject.peerInfo = { nickname: '', avatarId: DEFAULT_AVATAR_ID };
        tabStateObject.transferId = null;
        tabStateObject.isResuming = false;
        tabStateObject.chatMessages = [];

        const nicknameInput = tabName === 'send' ? nicknameInputSender : nicknameInputReceiver;
        const avatarContainer = tabName === 'send' ? avatarSelectionSender : avatarSelectionReceiver;
        const chatMessagesEl = tabName === 'send' ? chatMessagesSender : chatMessagesReceiver;
        const chatPanelEl = tabName === 'send' ? chatPanelSender : chatPanelReceiver;
        const chatTitleEl = tabName === 'send' ? chatTitleSender : chatTitleReceiver;

        nicknameInput.value = '';
        updateAvatarSelectionUI(avatarContainer, DEFAULT_AVATAR_ID);


        if (tabName === 'send') {
            tabStateObject.filesToSend = [];
            tabStateObject.totalBytesToSend = 0;
            tabStateObject.resumeAttempted = false;
            tabStateObject.passwordInputSenderValue = '';
            tabStateObject.offerSdpTextareaValue = '';
            tabStateObject.answerSdpTextareaValue = '';
            tabStateObject.isPasswordSectionSenderVisible = false;
            tabStateObject.isSelectedFilesSectionVisible = false;
            tabStateObject.isOfferStepVisible = false;
            tabStateObject.isAnswerStepVisible = false;
            tabStateObject.isGenerateBtnDisabled = true;

            filesToSend = []; totalBytesToSend = 0; updateFileListUI(); updateFileSummary();
            passwordInputSender.value = '';
            offerSdpTextarea.value = ''; offerQrCodeDiv.innerHTML = '';
            answerSdpTextarea.value = '';
            // nicknameSectionSender.classList.remove('hidden'); // Already handled by general reset
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
        } else if (tabName === 'receive') {
            tabStateObject.offerSdpInputTextareaValue = '';
            tabStateObject.answerSdpOutputTextareaValue = '';
            tabStateObject.passwordInputReceiverValue = '';
            tabStateObject.isPasswordSectionReceiverVisible = false;
            tabStateObject.isAnswerOutputStepVisible = false;
            tabStateObject.isReceiverWaitMessageVisible = true;

            offerSdpInputTextarea.value = '';
            answerSdpOutputTextarea.value = ''; answerQrCodeDiv.innerHTML = '';
            passwordInputReceiver.value = '';
            // nicknameSectionReceiver.classList.remove('hidden');
            passwordSectionReceiver.classList.add('hidden');
            answerOutputStep.classList.add('hidden');
            offerInputStep.classList.remove('hidden');
            receiverWaitMessage.classList.remove('hidden');
            generateAnswerBtn.innerHTML = '<i class="fas fa-reply"></i> Generate Response Code'; generateAnswerBtn.disabled = false;
            receiveStatusSection.classList.add('hidden');
            receivedFilesSection.classList.add('hidden'); receivedFilesList.innerHTML = '';
            downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
        }

        chatMessagesEl.innerHTML = ''; chatPanelEl.classList.add('hidden');
        if (chatTitleEl) chatTitleEl.innerHTML = `<i class="fas fa-comments"></i> Chat`;

        if (typeof updateTroubleshootingPanelDisplay === 'function') {
            updateTroubleshootingPanelDisplay({
                iceConnectionState: 'Idle', signalingState: 'Idle', dataChannelState: 'N/A',
            });
            if (tsIceCandidates) tsIceCandidates.value = '';
        }
    }

    // --- Avatar Functions ---
    function initializeAvatarSelection(container, tabType) {
        if (!container) return;
        container.innerHTML = '';
        Object.keys(PRESET_AVATARS).forEach(avatarId => {
            const img = document.createElement('img');
            img.src = PRESET_AVATARS[avatarId];
            img.alt = avatarId.replace('avatar_', '');
            img.dataset.avatarId = avatarId;
            img.classList.add('avatar-option');
            img.setAttribute('role', 'button');
            img.setAttribute('tabindex', '0');
            if (avatarId === (tabType === 'send' ? sendTabState.userInfo.avatarId : receiveTabState.userInfo.avatarId)) {
                img.classList.add('selected');
            }
            img.onclick = () => selectAvatar(avatarId, tabType, container);
            img.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') selectAvatar(avatarId, tabType, container); };
            container.appendChild(img);
        });
    }

    function selectAvatar(avatarId, tabType, container) {
        const state = tabType === 'send' ? sendTabState : receiveTabState;
        state.userInfo.avatarId = avatarId;
        updateAvatarSelectionUI(container, avatarId);
        console.log(`${tabType} selected avatar: ${avatarId}`);
    }

    function updateAvatarSelectionUI(container, selectedAvatarId) {
        if (!container) return;
        container.querySelectorAll('.avatar-option').forEach(img => {
            img.classList.toggle('selected', img.dataset.avatarId === selectedAvatarId);
        });
    }

    // Initialize avatar pickers
    initializeAvatarSelection(avatarSelectionSender, 'send');
    initializeAvatarSelection(avatarSelectionReceiver, 'receive');


    // ... (copyToClipboard, removeFile, togglePasswordVisibility, openPreviewModal, etc. are mostly unchanged)
    // ... (formatBytes, getFileIconClass, updateStatusDisplay are unchanged)
    // ... (closePeerConnection needs to reset peerInfo in states)
    // ... (hashPassword, updateSendProgressUI, updateReceiveProgressUI, start/stopSpeedAndETRCalc unchanged)
    // ... (generateQRCode, startScanner, stopScanner, stopAllScanners unchanged)
    // ... (File handling: browseLink, dropZone, traverseFileTree, handleFileSelection, updateFileListUI, updateFileSummary, revokeObjectUrls unchanged)
    // ... (createFileTransferOffer, handleFileTransferAnswerAndConnect, processFileOfferAndGenerateAnswer need to use userInfo)

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

    async function createFileTransferOffer() {
        connectionInProgress = true;
        const newTransferId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        sendTabState.transferId = newTransferId;
        console.log(`Generated Transfer ID: ${sendTabState.transferId}`);
        localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
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
            connectionInProgress = false;
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
            connectionInProgress = false;
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
            updateTroubleshootingPanelDisplay({ iceConnectionState: pc.iceConnectionState });
            const statusMsgElement = isSenderRole ? sendStatusMessage : receiveStatusMessage;
            const currentPeerInfo = isSenderRole ? sendTabState.peerInfo : receiveTabState.peerInfo;
            const peerDisplay = currentPeerInfo.nickname || 'peer';

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
                const currentTabStateForResume = isSenderRole ? sendTabState : receiveTabState;
                const storageKey = isSenderRole ? `sharewaveSenderResumeState_${currentTabStateForResume.transferId}` : `sharewaveReceiverResumeState_${currentTabStateForResume.transferId}`;
                if (currentTabStateForResume.transferId && connectionInProgress &&
                    (isSenderRole ? totalBytesSent < currentTabStateForResume.totalBytesToSend : (filesMetadata && receivedSize < filesMetadata.reduce((s,m)=>s+m.size,0)))) {
                    const resumeState = {
                        transferId: currentTabStateForResume.transferId,
                        userInfo: { ...currentTabStateForResume.userInfo }, // Save own info
                        peerInfo: { ...currentTabStateForResume.peerInfo }, // Save peer info
                        ...(isSenderRole ? {
                            currentFileIndex: currentFileIndex, currentFileOffset: currentFileOffset,
                            totalBytesToSend: currentTabStateForResume.totalBytesToSend, filesToSendPaths: currentTabStateForResume.filesToSend.map(f => f.path)
                        } : {
                            currentReceivingFileIndex: currentReceivingFileIndex, currentFileReceivedSize: currentFileReceivedSize, filesMetadata: filesMetadata
                        })
                    };
                    localStorage.setItem(storageKey, JSON.stringify(resumeState));
                    console.log(`${isSenderRole ? 'Sender' : 'Receiver'}: Saved resume state for transfer ${currentTabStateForResume.transferId}`);
                    showToast('Connection lost. Transfer state saved.', 'warning');
                }
                break;
                case 'closed': // Similar logic for closed as disconnected for resume
                case 'failed':
                    const action = pc.connectionState === 'closed' ? 'closed' : 'failed';
                    updateStatusDisplay(statusMsgElement, `Connection with ${peerDisplay} ${action}.`, action === 'failed' ? 'error' : 'info');
                    if (action === 'failed') showToast(`Connection with ${peerDisplay} failed. Please check network.`, 'error');
                    else if (!document.hidden) showToast(`Connection with ${peerDisplay} closed.`, 'info');
                    enableChatForCurrentTab(false);

                    const wasInProgress = connectionInProgress;
                    const cTs = isSenderRole ? sendTabState : receiveTabState;
                    const key = isSenderRole ? `sharewaveSenderResumeState_${cTs.transferId}` : `sharewaveReceiverResumeState_${cTs.transferId}`;

                    if (cTs.transferId && wasInProgress &&
                        (isSenderRole ? totalBytesSent < cTs.totalBytesToSend : (filesMetadata && receivedSize < filesMetadata.reduce((s,m)=>s+m.size,0)))) {
                        const resumeState = {
                            transferId: cTs.transferId, userInfo: { ...cTs.userInfo }, peerInfo: { ...cTs.peerInfo },
                            ...(isSenderRole ? {
                                currentFileIndex: currentFileIndex, currentFileOffset: currentFileOffset, totalBytesToSend: cTs.totalBytesToSend, filesToSendPaths: cTs.filesToSend.map(f => f.path)
                            } : {
                                currentReceivingFileIndex: currentReceivingFileIndex, currentFileReceivedSize: currentFileReceivedSize, filesMetadata: filesMetadata
                            })
                        };
                        localStorage.setItem(key, JSON.stringify(resumeState));
                        console.log(`${isSenderRole ? 'Sender' : 'Receiver'}: Saved resume state on ${action} for transfer ${cTs.transferId}`);
                    }

                    const isIncomplete = isSenderRole ? (totalBytesSent < sendTabState.totalBytesToSend && sendTabState.totalBytesToSend > 0)
                                             : (receivedSize < (filesMetadata ? filesMetadata.reduce((s, m) => s + m.size, 0) : 0) && filesMetadata);
                    if (isIncomplete && wasInProgress) {
                        updateStatusDisplay(statusMsgElement, `Connection ${action} with ${peerDisplay}: Transfer incomplete.`, 'warning');
                        addHistoryEntry(
                            isSenderRole ? sendTabState.filesToSend.map(f => f.file.name).join(', ') : filesMetadata?.map(f => f.name).join(', '),
                            isSenderRole ? totalBytesSent : receivedSize, false, false, 'file'
                        );
                    }
                    closePeerConnection();
                    break;
            }
        };
    }

    function addDataChannelEvents(dc) {
        if (!dc) return;
        dc.onopen = () => {
            console.log('Data Channel Opened');
            updateTroubleshootingPanelDisplay({ dataChannelState: `Open (readyState: ${dc.readyState})` });

            const currentUserInfo = isSenderRole ? sendTabState.userInfo : receiveTabState.userInfo;
            sendControlMessage({
                type: 'peer_info',
                nickname: currentUserInfo.nickname || 'Anon',
                avatarId: currentUserInfo.avatarId || DEFAULT_AVATAR_ID // Send avatarId
            });

            if (isSenderRole) {
                const savedSenderStateString = localStorage.getItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                if (savedSenderStateString && sendTabState.transferId) {
                    try {
                        const savedState = JSON.parse(savedSenderStateString);
                        if (savedState.transferId === sendTabState.transferId) {
                            sendTabState.resumeAttempted = true;
                            if(savedState.userInfo) sendTabState.userInfo = savedState.userInfo; // Restore own info
                            if(savedState.peerInfo) sendTabState.peerInfo = savedState.peerInfo; // Restore peer info

                            if (savedState.filesToSendPaths && sendTabState.filesToSend.length === savedState.filesToSendPaths.length &&
                                sendTabState.filesToSend.every((file, idx) => file.path === savedState.filesToSendPaths[idx])) {
                                console.log('Sender: Attempting to resume transfer:', savedState.transferId);
                                updateStatusDisplay(sendStatusMessage, `Attempting to resume previous transfer with ${sendTabState.peerInfo.nickname || 'peer'}...`, 'info');
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
                                sendMetadata();
                            }
                        } else {
                             localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                             sendMetadata();
                        }
                    } catch (e) {
                        console.error("Error parsing sender resume state:", e);
                        localStorage.removeItem(`sharewaveSenderResumeState_${sendTabState.transferId}`);
                        sendMetadata();
                    }
                } else {
                    sendMetadata();
                }
            } else {
                updateReceiveProgressUI(0, `Data channel open with ${receiveTabState.peerInfo.nickname || 'sender'}. Waiting for file details...`, 'info');
            }
        };
        dc.onclose = () => {
            console.log('Data Channel Closed');
            const peerDisplay = (isSenderRole ? sendTabState.peerInfo.nickname : receiveTabState.peerInfo.nickname) || 'peer';
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
            const peerDisplay = (isSenderRole ? sendTabState.peerInfo.nickname : receiveTabState.peerInfo.nickname) || 'peer';
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
            // ... (ArrayBuffer handling remains largely the same, but uses peerInfo.nickname for messages)
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
                    const completeBuffer = receiveBuffer.slice(0);
                    const receivedBlob = new Blob(completeBuffer, { type: currentFileMeta.type });
                    const finalBlob = (receivedBlob.size > currentFileMeta.size) ? receivedBlob.slice(0, currentFileMeta.size, currentFileMeta.type) : receivedBlob;

                    const hashStatusElement = currentListItem?.querySelector('.file-hash-status');
                    if (hashStatusElement) {
                        hashStatusElement.textContent = 'Verifying...';
                        hashStatusElement.className = 'file-hash-status checking';
                    }
                    const receivedHash = null;
                    const expectedHash = currentFileMeta.hash;
                    let isValid = !expectedHash || (cryptoAvailable && receivedHash === expectedHash);

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
                            if (downloadBtnEl) previewEl.src = downloadBtnEl.href;
                            currentListItem.ondblclick = () => openPreviewModal(previewEl);
                        }
                    }
                    receiveBuffer = [];
                    currentReceivingFileIndex++;
                    currentFileReceivedSize = 0;
                    if (currentReceivingFileIndex >= filesMetadata.length) {
                        const totalSize = filesMetadata.reduce((s, m) => s + m.size, 0);
                        updateReceiveProgressUI(totalSize, `All files received from ${receiveTabState.peerInfo.nickname || 'sender'}!`, 'success');
                        showToast(`All files received from ${receiveTabState.peerInfo.nickname || 'sender'}!`, 'success');
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
                    case 'peer_info':
                        const receivedNickname = message.nickname || 'Anon';
                        const receivedAvatarId = message.avatarId || DEFAULT_AVATAR_ID;
                        const targetState = isSenderRole ? sendTabState : receiveTabState;

                        targetState.peerInfo = { nickname: receivedNickname, avatarId: receivedAvatarId };
                        console.log(`${isSenderRole ? 'Sender' : 'Receiver'}: Received peer_info: Nickname=${receivedNickname}, AvatarID=${receivedAvatarId}`);
                        enableChatForCurrentTab(true); // Enable chat and update title with new peer info

                        // Update status message based on role
                        if (isSenderRole) {
                            updateStatusDisplay(sendStatusMessage, `Connected with ${receivedNickname}. Ready for transfer.`, 'info');
                        } else {
                            updateStatusDisplay(receiveStatusMessage, `Connected with ${receivedNickname}. Waiting for metadata...`, 'info');
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
                                        if(savedState.userInfo) receiveTabState.userInfo = savedState.userInfo;
                                        if(savedState.peerInfo) receiveTabState.peerInfo = savedState.peerInfo;

                                        filesMetadata = savedState.filesMetadata;
                                        currentReceivingFileIndex = savedState.currentReceivingFileIndex;
                                        currentFileReceivedSize = savedState.currentFileReceivedSize;
                                        receivedSize = 0;
                                        for (let i = 0; i < currentReceivingFileIndex; i++) {
                                            receivedSize += filesMetadata[i].size;
                                        }
                                        receivedSize += currentFileReceivedSize;
                                        updateReceiveProgressUI(receivedSize, `Resuming transfer with ${receiveTabState.peerInfo.nickname || 'sender'}. Preparing file ${currentReceivingFileIndex + 1}...`, 'info');
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
                            const statusMessageText = `Resuming transfer of ${currentItem.file.name}${displayPath} with ${sendTabState.peerInfo.nickname || 'peer'}.`;
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
                            sendMetadata();
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
                            sendTabState.transferId = null;
                            currentFileIndex = 0;
                            currentFileOffset = 0;
                            totalBytesSent = 0;
                            sendMetadata();
                        }
                        break;
                    case 'metadata':
                        if (isSenderRole) return;
                        filesMetadata = message.payload;
                        if (!Array.isArray(filesMetadata)) throw new Error("Invalid metadata payload.");

                        isPasswordRequiredBySender = message.passwordRequired || false;

                        const senderNick = message.senderNickname || 'Anon';
                        const senderAvatar = message.senderAvatarId || DEFAULT_AVATAR_ID;
                        receiveTabState.peerInfo = { nickname: senderNick, avatarId: senderAvatar };
                        console.log(`Receiver: Received sender's info: Nickname=${senderNick}, AvatarID=${senderAvatar}`);
                        enableChatForCurrentTab(true);

                        if (message.transferId) {
                            receiveTabState.transferId = message.transferId;
                            console.log(`Receiver: Received Transfer ID: ${receiveTabState.transferId}`);
                            localStorage.removeItem(`sharewaveReceiverResumeState_${receiveTabState.transferId}`);
                        } else {
                            receiveTabState.transferId = null;
                            console.warn("Receiver: No Transfer ID received in metadata.");
                        }

                        const ownInfo = receiveTabState.userInfo;
                        sendControlMessage({
                            type: 'peer_info',
                            nickname: ownInfo.nickname || 'Anon',
                            avatarId: ownInfo.avatarId || DEFAULT_AVATAR_ID
                        });

                        console.log('Receiver: Metadata for', filesMetadata.length, `file(s) from ${senderNick}. PwdReq:`, isPasswordRequiredBySender);
                        receivedSize = 0; currentReceivingFileIndex = 0; currentFileReceivedSize = 0; receivedFiles = []; revokeObjectUrls();
                        receivedFilesList.innerHTML = '';
                        if (connectionInProgress) receivedFilesSection.classList.remove('hidden');
                        downloadAllBtn.disabled = true; downloadZipBtn.disabled = true;
                        filesMetadata.forEach(meta => addReceivedFileToList(null, meta.name, meta.type, meta.path, meta.hash));

                        if (isPasswordRequiredBySender && cryptoAvailable) {
                            passwordSectionReceiver.classList.remove('hidden');
                            receiveTabState.isPasswordSectionReceiverVisible = true;
                            updateReceiveProgressUI(0, `Password required by ${senderNick}.`, 'warning');
                            passwordInputReceiver.focus();
                        } else if (isPasswordRequiredBySender && !cryptoAvailable) {
                            updateReceiveProgressUI(0, 'Password required, but verification disabled (insecure context).', 'error');
                            showToast('Cannot verify password due to insecure context.', 'error');
                            sendControlMessage({ type: 'error', reason: 'password_unsupported_context' });
                            setTimeout(closePeerConnection, 1000);
                        } else {
                            updateReceiveProgressUI(0, `File details received from ${senderNick}. Ready for download.`, 'info');
                            sendControlMessage({ type: 'ready_to_receive' });
                            startSpeedAndETRCalc();
                        }
                        break;
                    case 'ready_to_receive':
                        if (!isSenderRole) return;
                        console.log("Sender: Received 'ready_to_receive' for files.");
                        const peerDisplayReady = sendTabState.peerInfo.nickname || 'Receiver';
                        updateStatusDisplay(sendStatusMessage, `${peerDisplayReady} is ready. Starting transfer...`, 'info');
                        startSpeedAndETRCalc();
                        pauseResumeBtn.disabled = false;
                        cancelTransferBtn.disabled = false;
                        sendFileChunk();
                        break;
                    case 'password_check':
                        if (!isSenderRole) return;
                        if (!passwordHash) {
                            sendControlMessage({ type: 'error', reason: 'no_password_set_sender' }); return;
                        }
                        const pHash = message.hash;
                        if (pHash === passwordHash) {
                            sendControlMessage({ type: 'password_correct' });
                            updateStatusDisplay(sendStatusMessage, `Password correct for ${sendTabState.peerInfo.nickname || 'Receiver'}. Waiting for readiness...`, 'info');
                        } else {
                            sendControlMessage({ type: 'password_incorrect' });
                            updateStatusDisplay(sendStatusMessage, `Password incorrect from ${sendTabState.peerInfo.nickname || 'Receiver'}. Closing.`, 'error');
                            showToast(`Password incorrect by ${sendTabState.peerInfo.nickname || 'Receiver'}.`, 'error');
                            setTimeout(closePeerConnection, 1000);
                        }
                        break;
                    case 'password_correct':
                        if (isSenderRole) return;
                        passwordSectionReceiver.classList.add('hidden');
                        receiveTabState.isPasswordSectionReceiverVisible = false;
                        updateReceiveProgressUI(0, `Password correct with ${receiveTabState.peerInfo.nickname || 'Sender'}. Ready for download.`, 'success');
                        showToast('Password verified!', 'success');
                        sendControlMessage({ type: 'ready_to_receive' });
                        startSpeedAndETRCalc();
                        break;
                    case 'password_incorrect':
                        if (isSenderRole) return;
                        updateStatusDisplay(receiveStatusMessage, `Password incorrect. Connection closed by ${receiveTabState.peerInfo.nickname || 'Sender'}.`, 'error');
                        showToast('Password incorrect. Please try again or ask sender.', 'error');
                        passwordInputReceiver.value = ''; receiveTabState.passwordInputReceiverValue = '';
                        verifyPasswordBtn.disabled = false;
                        verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify';
                        break;
                    case 'chat':
                        const chatCtx = getCurrentChatContext();
                        const peerChatInfo = isSenderRole ? sendTabState.peerInfo : receiveTabState.peerInfo;
                        if (message.text && chatCtx.messagesUl) {
                            displayChatMessageInternal(message.text, false, chatCtx.messagesUl, peerChatInfo.nickname || 'Peer', peerChatInfo.avatarId || DEFAULT_AVATAR_ID);
                            if (connectionInProgress) {
                                const targetState = isSenderRole ? sendTabState : receiveTabState;
                                targetState.chatMessages.push({ text: message.text, isSent: false, nickname: peerChatInfo.nickname || 'Peer', avatarId: peerChatInfo.avatarId || DEFAULT_AVATAR_ID });
                            }
                        }
                        break;
                    case 'pause_request':
                        if (isSenderRole) return;
                        transferPaused = true;
                        updateStatusDisplay(receiveStatusMessage, `Transfer paused by ${receiveTabState.peerInfo.nickname || 'Sender'}.`, 'warning');
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
                        updateStatusDisplay(receiveStatusMessage, `Transfer resumed by ${receiveTabState.peerInfo.nickname || 'Sender'}.`, 'info');
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
                        const peerCancelNickname = (isSenderRole ? sendTabState.peerInfo.nickname : receiveTabState.peerInfo.nickname) || 'Peer';
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
                        const peerErrorNickname = (isSenderRole ? sendTabState.peerInfo.nickname : receiveTabState.peerInfo.nickname) || 'Peer';
                        updateStatusDisplay(isSenderRole ? sendStatusMessage : receiveStatusMessage, `Error from ${peerErrorNickname}: ${message.reason || 'Unknown'}`, 'error');
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

    async function sendMetadata() {
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
                        hashWorker.postMessage({ fileId: i, file: item.file });
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
                    path: item.path,
                    hash: hashes[index]
                }));

                console.log('Sender: Sending file metadata:', metadataPayload);
                const currentTransferId = sendTabState.transferId || (Date.now().toString(36) + Math.random().toString(36).substring(2));
                sendTabState.transferId = currentTransferId;

                const userInfo = sendTabState.userInfo;

                dataChannel.send(JSON.stringify({
                    type: 'metadata',
                    payload: metadataPayload,
                    passwordRequired: !!passwordHash,
                    senderNickname: userInfo.nickname || 'Anon',
                    senderAvatarId: userInfo.avatarId || DEFAULT_AVATAR_ID, // Include sender's avatar
                    transferId: currentTransferId
                }));

                const waitMsg = passwordHash ? 'Waiting for password verification...' : 'Waiting for receiver readiness...';
                updateSendProgressUI(0, `File details sent to ${sendTabState.peerInfo.nickname || 'Receiver'}. ${waitMsg}`, 'info');

            } catch (error) {
                console.error("Error collecting hashes or sending metadata:", error);
                updateSendProgressUI(0, 'Error preparing file details.', 'error');
                showToast(`Error preparing files for sending: ${error.message}`, 'error');
                closePeerConnection();
            }
        }

    function sendFileChunk() {
        // ... (sendFileChunk remains the same)
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
        // ... (addReceivedFileToList remains the same)
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
        // ... (pause/resume logic unchanged)
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
        // ... (cancel logic unchanged)
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
        // Updated to use userInfo and peerInfo for avatar display
        if (activeTab === 'send') return {
            messagesUl: chatMessagesSender, input: chatInputSender, sendBtn: chatSendBtnSender,
            panel: chatPanelSender, stateMessages: sendTabState.chatMessages,
            titleEl: chatTitleSender,
            currentUserInfo: sendTabState.userInfo, peerInfo: sendTabState.peerInfo
        };
        if (activeTab === 'receive') return {
            messagesUl: chatMessagesReceiver, input: chatInputReceiver, sendBtn: chatSendBtnReceiver,
            panel: chatPanelReceiver, stateMessages: receiveTabState.chatMessages,
            titleEl: chatTitleReceiver,
            currentUserInfo: receiveTabState.userInfo, peerInfo: receiveTabState.peerInfo
        };
        return {};
    }

    function sanitizeHTML(str) { // Basic sanitizer
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }


    function enableChatForCurrentTab(enable) {
        const chatCtx = getCurrentChatContext();
        if (!chatCtx.panel || !chatCtx.input || !chatCtx.sendBtn || !chatCtx.titleEl) return;

        chatCtx.input.disabled = !enable;
        chatCtx.sendBtn.disabled = !enable;

        if (enable && chatCtx.peerInfo && chatCtx.peerInfo.nickname) {
            const avatarSrc = PRESET_AVATARS[chatCtx.peerInfo.avatarId || DEFAULT_AVATAR_ID];
            const sanitizedNickname = sanitizeHTML(chatCtx.peerInfo.nickname);
            chatCtx.titleEl.innerHTML = `<img src="${avatarSrc}" alt="${sanitizedNickname}" class="chat-title-avatar" style="display:inline-block; vertical-align: middle; width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;"> <i class="fas fa-comments"></i> Chat with ${sanitizedNickname}`;
        } else if (enable) {
            chatCtx.titleEl.innerHTML = `<i class="fas fa-comments"></i> Chat`;
        } else {
            chatCtx.titleEl.innerHTML = `<i class="fas fa-comments"></i> Chat`;
        }

        const shouldShowPanel = enable || (chatCtx.stateMessages && chatCtx.stateMessages.length > 0);
        chatCtx.panel.classList.toggle('hidden', !shouldShowPanel);
        chatCtx.input.placeholder = enable ? "Type message..." : "Chat unavailable";
    }

    function sendChatMessageInternal() {
        const chatCtx = getCurrentChatContext();
        if (!chatCtx.input || !chatCtx.messagesUl || !chatCtx.currentUserInfo) return;
        const text = chatCtx.input.value.trim();
        if (text && dataChannel && dataChannel.readyState === 'open') {
            sendControlMessage({ type: 'chat', text: text });
            displayChatMessageInternal(text, true, chatCtx.messagesUl, chatCtx.currentUserInfo.nickname || 'You', chatCtx.currentUserInfo.avatarId);
            chatCtx.stateMessages.push({ text: text, isSent: true, nickname: chatCtx.currentUserInfo.nickname || 'You', avatarId: chatCtx.currentUserInfo.avatarId });
            chatCtx.input.value = '';
        } else if (!text) { /* ignore */ }
        else showToast("Chat not connected.", "warning");
    }

    function displayChatMessageInternal(text, isSent, messagesUl, nickname, avatarIdParam) {
        if (!messagesUl) return;
        const li = document.createElement('li');
        li.classList.add('chat-message', isSent ? 'sent' : 'received');

        const chatCtx = getCurrentChatContext(); // To get correct state for avatarId if not passed
        let avatarId = avatarIdParam;
        if (!avatarId) { // Fallback if avatarIdParam is not provided (e.g. from older state restore)
            avatarId = isSent ? (chatCtx.currentUserInfo?.avatarId || DEFAULT_AVATAR_ID)
                              : (chatCtx.peerInfo?.avatarId || DEFAULT_AVATAR_ID);
        }

        const displayName = nickname || (isSent ? 'You' : 'Peer');
        const altText = `${displayName}'s Avatar`;
        const sanitizedText = sanitizeHTML(text);
        const sanitizedNickname = sanitizeHTML(displayName);

        const avatarImg = document.createElement('img');
        avatarImg.src = PRESET_AVATARS[avatarId] || PRESET_AVATARS[DEFAULT_AVATAR_ID];
        avatarImg.alt = altText;
        avatarImg.className = 'message-avatar';

        const messageContentDiv = document.createElement('div');
        messageContentDiv.className = 'message-content';

        const span = document.createElement('span');
        if (!isSent && sanitizedNickname !== 'You') {
            span.innerHTML = `<strong>${sanitizedNickname}:</strong> ${sanitizedText}`;
        } else {
            span.innerHTML = sanitizedText;
        }
        messageContentDiv.appendChild(span);

        if (isSent) {
            li.appendChild(messageContentDiv);
            li.appendChild(avatarImg);
        } else {
            li.appendChild(avatarImg);
            li.appendChild(messageContentDiv);
        }

        messagesUl.appendChild(li);
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }

    [chatSendBtnSender, chatSendBtnReceiver].forEach(btn => { if (btn) btn.onclick = sendChatMessageInternal; });
    [chatInputSender, chatInputReceiver].forEach(input => {
        if (input) input.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessageInternal(); }};
    });

    // ... (downloadAllBtn, downloadZipBtn, theme, history, troubleshooting, initShakeDetection logic largely unchanged)
    // ... but ensure they use new state structure (userInfo, peerInfo) if they access nicknames/avatars.
    // For brevity, assuming these parts are correctly adapted or don't directly conflict.
    // The core focus is on the avatar signaling and display in chat.

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
                    name: f.name,
                    path: f.path,
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
                receivedFiles.forEach(fileData => zip.file(fileData.path || fileData.name, fileData.blob, { binary: true }));

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
    resetUiToInitial(sendTabState, 'send');
    resetUiToInitial(receiveTabState, 'receive');
    initializeAvatarSelection(avatarSelectionSender, 'send'); // Initialize after state reset
    initializeAvatarSelection(avatarSelectionReceiver, 'receive');
    switchTab('send');

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
