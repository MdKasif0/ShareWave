# ShareWave V5.1 - Secure P2P File Sharing

[![ShareWave Demo](./docs/screenshot.gif)](https://your-demo-link-here.com) <!-- Optional: Add a screenshot/GIF -->

ShareWave is a web application that enables fast, secure, and direct peer-to-peer (P2P) file transfers between two devices using WebRTC. It eliminates the need for cloud storage or server-side intermediaries for the actual file data, ensuring privacy and speed. Connections are established easily using QR codes or text codes, and transfers can be optionally protected with a password.

## ✨ Features

*   **Direct P2P Transfers:** Files are sent directly between the sender and receiver using WebRTC DataChannels. No server stores your files.
*   **Secure Connections:** WebRTC connections are inherently encrypted (DTLS-SRTP).
*   **Easy Connection Setup:**
    *   **QR Codes:** Simply scan a QR code to establish a connection.
    *   **Text Codes:** Copy and paste connection codes if QR scanning isn't feasible.
*   **Cross-Platform:** Works on any modern web browser that supports WebRTC (Chrome, Firefox, Safari, Edge, mobile browsers).
*   **File & Folder Sharing:**
    *   Select multiple files.
    *   Select entire folders (maintaining directory structure when zipped).
    *   Drag and drop support for files and folders.
*   **Password Protection:** Secure your transfer with an optional password. The password is hashed and verified, never transmitted directly.
*   **Transfer Management:**
    *   Real-time progress display (overall percentage, current file, speed, ETR).
    *   Pause and resume ongoing transfers.
    *   Cancel transfers.
*   **File Integrity Check:** Uses the Web Crypto API (SHA-256) to hash files on the sender's side and verify them on the receiver's side, ensuring files are not corrupted during transfer.
*   **Built-in Chat:** Communicate with the connected peer directly within the app.
*   **Download Options (Receiver):**
    *   Download individual files.
    *   **Download All:** Get all received files individually with a single click.
    *   **Download as Zip:** Download all received files conveniently packaged in a single ZIP archive (maintaining folder structure).
*   **File Previews:** Preview selected images and videos before sending (for reasonably sized files).
*   **Transfer History:** Keep track of your past transfers (status, size, date, filenames) stored locally in your browser.
*   **Light & Dark Themes:** Choose your preferred visual theme, with the preference saved locally.
*   **Responsive Design:** User-friendly interface that adapts to desktops, tablets, and mobile devices.
*   **No Sign-up Required:** Use it instantly without creating an account.

## 🚀 How it Works

ShareWave leverages **WebRTC (Web Real-Time Communication)**, a technology that enables browsers to establish direct peer-to-peer connections.

1.  **Signaling:** When a sender initiates a share, they generate an "offer" code (an SDP - Session Description Protocol - message). This code contains information needed to set up the WebRTC connection. The sender shares this offer (via QR or text) with the receiver.
2.  **Connection:** The receiver inputs the sender's offer and generates an "answer" code (another SDP message), which they share back with the sender.
3.  **ICE Candidates:** During this process, both peers exchange network information (ICE candidates) to find the best path to connect directly. This often involves STUN servers (like the Google STUN server used in ShareWave) to discover public IP addresses and navigate NATs/firewalls.
4.  **Direct Data Transfer:** Once the connection is established, a secure DataChannel is opened directly between the two peers. Files are broken into chunks, sent over this channel, and reassembled by the receiver. No server touches the actual file data.
5.  **Password & Hashing:** If a password is set, it's hashed on the sender's side. The receiver must provide the same password, which is also hashed. Only the hashes are compared for verification. File hashes (SHA-256) are sent with the metadata to ensure data integrity upon arrival.

##Usage:-

The application has two main tabs: **Send** and **Receive**.

### Sender Instructions

1.  **Open ShareWave:** Navigate to the ShareWave web application in your browser.
2.  **Select Files/Folders:**
    *   Click "Browse Files" or drag and drop files onto the designated area.
    *   Click "Select Folder" or drag and drop a folder.
    *   Selected items will appear in the "Selected Items" list. You can remove items if needed.
3.  **Set Optional Password:**
    *   If you want to protect the transfer, enter a password in the "Optional: Set Transfer Password" field.
4.  **Generate Share Code:**
    *   Click the "Generate Share Code" button.
    *   A QR code and a text code (your "Offer Code") will be displayed.
5.  **Share Code with Receiver:**
    *   Have the receiver scan your QR code.
    *   Alternatively, copy the text code and send it to the receiver via any messaging platform.
    *   **Important:** If you set a password, communicate it securely to the receiver.
6.  **Get Receiver's Code:**
    *   Once the receiver processes your code, they will generate their own "Answer Code".
    *   Scan the receiver's QR code using the "Scan Receiver's QR Code" button.
    *   Alternatively, paste their text code into the "Or paste receiver's text code here..." textarea.
7.  **Connect:**
    *   Click the "Connect" button.
    *   The connection will establish, and the file transfer will begin automatically if no password was set by you, or if the receiver has already verified it.
8.  **Transfer:**
    *   Monitor the progress. You can pause/resume or cancel the transfer.
    *   Use the chat feature to communicate with the receiver.

### Receiver Instructions

1.  **Open ShareWave:** Navigate to the ShareWave web application in your browser.
2.  **Switch to Receive Tab:** Click the "Receive" tab.
3.  **Get Sender's Code:**
    *   Ask the sender for their Share Code.
    *   Scan the sender's QR code using the "Scan Sender's QR Code" button.
    *   Alternatively, paste their text code into the "Or paste sender's text code here..." textarea.
4.  **Generate Response Code:**
    *   Click the "Generate Response Code" button.
    *   Your "Answer Code" (QR and text) will be displayed.
5.  **Share Code with Sender:**
    *   Have the sender scan your QR code.
    *   Alternatively, copy your text code and send it back to the sender.
    *   Keep the ShareWave tab open.
6.  **Enter Password (if required):**
    *   If the sender set a password, the "Enter Transfer Password" section will appear after the sender initiates the connection with your code.
    *   Enter the password provided by the sender and click "Verify".
7.  **Receiving Files:**
    *   Once the connection is established (and password verified, if applicable), files will start transferring.
    *   Monitor the progress.
    *   Received files will appear in the "Successfully Received" list.
8.  **Download Files:**
    *   **Individual Files:** Click the "Download" button next to each file.
    *   **Download All:** Click "Download All" to save all files separately.
    *   **Download Zip:** Click "Download Zip" to save all files as a single compressed ZIP archive, preserving any folder structure.
    *   You can preview received images/videos by double-clicking their list item.

## 🛠️ Technologies & Libraries

*   **HTML5, CSS3, JavaScript (ES6+)**
*   **WebRTC (Web Real-Time Communication):** For peer-to-peer data channels.
*   **Web Crypto API:** For SHA-256 file hashing and password hashing (requires secure context: HTTPS or localhost).
*   **JSZip:** For creating ZIP archives on the client-side.
*   **qrcode-generator:** For generating QR codes.
*   **html5-qrcode:** For scanning QR codes using the device camera.
*   **Font Awesome:** For icons.
*   **Google Fonts (Poppins):** For typography.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please feel free to:
*   Open an issue to report a bug or suggest a feature.
*   Fork the repository and submit a pull request with your improvements.

*(Consider adding more specific contribution guidelines if needed, e.g., coding standards, setup instructions for development.)*

## 📜 License

This project is currently unlicensed. (Or specify your license, e.g., MIT License)

---
*Share files seamlessly and securely with ShareWave!*
