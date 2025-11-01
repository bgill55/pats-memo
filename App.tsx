// App.tsx
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorVoiceRecorder as VoiceRecorder } from '@lgicc/capacitor-voice-recorder';

const MicIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1V11c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 6.2c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 3.53 2.84 6.42 6.25 6.92V21h1.5v-3.08c3.41-.5 6.25-3.39 6.25-6.92h-1.9z"/></svg> );
const StopIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg> );
const VoiceCommandIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1V11c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 6.2c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 3.53 2.84 6.42 6.25 6.92V21h1.5v-3.08c3.41-.5 6.25-3.39 6.25-6.92h-1.9z"/></svg> );
const SaveIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg> );
const ClearIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> );
const ShareIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 2.99-1.34 2.99-3S19.66 3 18 3s-3 1.34-3 3c0 .24.04.47.09.7L8.04 8.81C7.5 8.31 6.79 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/></svg> );
const TrashIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> );

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [error, setError] = useState('');
  const [memos, setMemos] = useState([]);
  const [commandFeedback, setCommandFeedback] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const transcribeAudio = async (audioData) => {
    setCurrentTranscription("Transcribing...");
    try {
      const url = "https://pats-memo-pad.netlify.app/.netlify/functions/transcribe";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordDataBase64: audioData.recordDataBase64,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Server responded with status: ${response.status} - ${errorBody}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setCurrentTranscription(result.transcription);

    } catch (e) {
      console.error("Transcription error:", e);
      setError("Failed to transcribe audio.");
      setCurrentTranscription(`Transcription failed: ${e.message}`);
    }
  };

  const handleToggleListener = () => setIsListening(p => !p);
  const handleSaveMemo = () => { if (currentTranscription) { setMemos(prev => [{id: Date.now(), text: currentTranscription, createdAt: new Date().toISOString()}, ...prev]); setCurrentTranscription(''); } };
  const handleClear = () => setCurrentTranscription('');
  const handleShareMemo = (text) => alert(`Sharing memo: "${text}"`);
  const handleDeleteMemo = (id) => setMemos(prev => prev.filter(memo => memo.id !== id));

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        const result = await VoiceRecorder.stopRecording();
        setIsRecording(false);
        if (result.value && result.value.recordDataBase64) {
          transcribeAudio(result.value);
        }
      } else {
        const permission = await VoiceRecorder.requestAudioRecordingPermission();
        if (permission.value) {
          await VoiceRecorder.startRecording({ format: 'wav' });
          setIsRecording(true);
          setCurrentTranscription("Listening...");
          setError('');
        } else {
          setError("Microphone permission is required.");
          alert("Microphone permission was denied.");
        }
      }
    } catch (e) {
      console.error("Voice recorder error", e);
      setError("An error occurred with the voice recorder.");
    }
  };

    return (

      <div className="app-container">

        <header>

          <h1>Pat's Memo Pad</h1>

          <div className="header-controls">

            <button onClick={toggleTheme} title="Toggle Theme" className="theme-switcher">

              {theme === 'light' ? '🌙' : '☀️'}

            </button>

            <button onClick={handleToggleListener} title="Toggle Voice Commands">

              <VoiceCommandIcon />

            </button>

          </div>

        </header>

        <main>

          <div className="transcription-section">

            <p className="transcription-text">

              {currentTranscription || <span className="placeholder">{isListening ? 'Listening for "start recording"...' : 'Your transcribed text will appear here...'}</span>}

            </p>

            {error && <p className="error-message">{error}</p>}

            {!isRecording && currentTranscription && (

              <div className="transcription-actions">

                <button onClick={handleSaveMemo}>

                  <SaveIcon /><span>Save</span>

                </button>

                <button onClick={handleClear}>

                  <ClearIcon /><span>Clear</span>

                </button>

              </div>

            )}

          </div>

  

          <div className="recording-section">

            <p className="recording-instructions">Tap the microphone to start recording</p>

            <button className="mic-button" onClick={handleToggleRecording} disabled={isListening}>

              {isRecording && <span className="recording-indicator"></span>}

              {isRecording ? <StopIcon /> : <MicIcon />}

            </button>

          </div>

  

          <div className="memos-section">

            <h2>Saved Memos</h2>

            <div className="memos-list">

              {memos.length > 0 ? (

                memos.map(memo => (

                  <div key={memo.id} className="memo-card">

                    <p className="memo-text">{memo.text}</p>

                    <div className="memo-footer">

                      <span className="memo-timestamp">{new Date(memo.createdAt).toLocaleString()}</span>

                      <div className="memo-actions">

                        <button onClick={() => handleShareMemo(memo.text)}><ShareIcon /></button>

                        <button onClick={() => handleDeleteMemo(memo.id)}><TrashIcon /></button>

                      </div>

                    </div>

                  </div>

                ))

              ) : (

                <p className="no-memos">No saved memos yet.</p>

              )}

            </div>

          </div>

        </main>

        {commandFeedback && ( <div className="command-feedback">{commandFeedback}</div> )}

      </div>

    );

  }

  
