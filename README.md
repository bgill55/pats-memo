# Pat's Memo Pad

Pat's Memo Pad is a modern, voice-powered note-taking application designed for simplicity and efficiency. It allows you to record voice memos, transcribe them into text using powerful AI, and save them for later. The app is a Progressive Web App (PWA), so you can install it on your device for a native-like experience.

## Features

*   **Voice Recording:** Easily record voice memos with a single tap.
*   **AI-Powered Transcription:** Transcribe your voice memos into text using Google Cloud's Speech-to-Text API.
*   **Editable Transcriptions:** Correct and refine your transcriptions before saving them.
*   **Saved Memos:** Store your transcriptions as memos for later reference.
*   **Hands-Free Mode:** Use voice commands like "start recording" and "stop recording" for a completely hands-free experience.
*   **Share and Delete:** Easily share your memos with others or delete them when they're no longer needed.
*   **PWA Support:** Install the app on your desktop or mobile device for easy access.
*   **Light/Dark Theme:** Choose between a light or dark theme for your comfort.

## Tech Stack

*   **Frontend:**
    *   **React:** A JavaScript library for building user interfaces.
    *   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
    *   **Vite:** A modern frontend build tool that significantly improves the development experience.
*   **Backend:**
    *   **Vercel Serverless Functions:** For hosting the backend logic that powers the transcription service.
    *   **Google Cloud Speech-to-Text API:** For converting audio to text.
*   **Deployment:**
    *   **Vercel:** A platform for deploying modern web applications.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   **Node.js:** Make sure you have Node.js and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
*   **Google Cloud Credentials:** You will need a Google Cloud account and a service account with the Speech-to-Text API enabled. You will need to create a `GOOGLE_CREDENTIALS_BASE64` environment variable.

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/your-username/voice-memo-ai.git
    ```
2.  Install NPM packages:
    ```sh
    npm install
    ```
3.  Create a `.env.local` file in the root of the project and add your Google Cloud credentials:
    ```
    GOOGLE_CREDENTIALS_BASE64=your-base64-encoded-credentials
    ```
4.  Start the development server:
    ```sh
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) (or the port specified in the console) to view it in the browser.

