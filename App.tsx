// App.tsx
import '@khmyznikov/pwa-install';
import React, { useState, useEffect, useRef } from 'react';

// Helper function to convert a Blob to a base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // result is in the format "data:audio/webm;base64,..."
        // We only want the part after the comma
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    };
    reader.readAsDataURL(blob);
  });
};


const MicIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1V11c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 6.2c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 3.53 2.84 6.42 6.25 6.92V21h1.5v-3.08c3.41-.5 6.25-3.39 6.25-6.92h-1.9z"/></svg> );
const StopIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg> );
const VoiceCommandIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1V11c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 6.2c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 3.53 2.84 6.42 6.25 6.92V21h1.5v-3.08c3.41-.5 6.25-3.39 6.25-6.92h-1.9z"/></svg> );
const SaveIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg> );
const ClearIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> );
const ShareIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 2.99-1.34 2.99-3S19.66 3 18 3s-3 1.34-3 3c0 .24.04.47.09.7L8.04 8.81C7.5 8.31 6.79 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/></svg> );
const TrashIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> );

export default function App() {
  console.log("Hello from App.tsx!");
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [error, setError] = useState('');
  const [memos, setMemos] = useState<any[]>([]);

  // Load memos from localStorage on initial render
  useEffect(() => {
    try {
      const savedMemos = localStorage.getItem('pats-memos');
      if (savedMemos) {
        setMemos(JSON.parse(savedMemos));
      }
    } catch (e) {
      console.error("Failed to load memos from localStorage", e);
    }
  }, []);

  // Save memos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pats-memos', JSON.stringify(memos));
    } catch (e) {
      console.error("Failed to save memos to localStorage", e);
    }
  }, [memos]);
  const [commandFeedback, setCommandFeedback] = useState('');
  const [theme, setTheme] = useState('light');

  // Refs for the MediaRecorder and audio chunks
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const transcribeAudio = async (base64Data: string) => {
    setCurrentTranscription("Transcribing...");
    try {
      const url = "https://pats-memo-pad.netlify.app/.netlify/functions/transcribe";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordDataBase64: base64Data,
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

    } catch (e: any) {
      console.error("Transcription error:", e);
      setError("Failed to transcribe audio.");
      setCurrentTranscription(`Transcription failed: ${e.message}`);
    }
  };

  const handleToggleListener = () => setIsListening(p => !p);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error('Speech recognition not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log('Recognized speech:', transcript);

        if (transcript.includes('start recording')) {
          handleToggleRecording();
        } else if (transcript.includes('stop recording')) {
          handleToggleRecording();
        } else if (transcript.includes('share')) {
          // Assuming the user wants to share the most recent memo
          if (memos.length > 0) {
            handleShareMemo(memos[0].text);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      if (isListening) {
        recognition.start();
        console.log('Voice command recognition started.');
      } else {
        recognition.stop();
        console.log('Voice command recognition stopped.');
      }

      return () => {
        recognition.stop();
      };
    }
  }, [isListening]);
  const handleSaveMemo = () => { if (currentTranscription) { setMemos(prev => [{id: Date.now(), text: currentTranscription, createdAt: new Date().toISOString()}, ...prev]); setCurrentTranscription(''); } };
  const handleClear = () => setCurrentTranscription('');
  const handleShareMemo = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Memo',
          text: text,
        });
        console.log('Memo shared successfully');
      } catch (error) {
        console.error('Error sharing memo:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(text);
        alert('Memo copied to clipboard');
      } catch (error) {
        console.error('Error copying memo to clipboard:', error);
        alert('Could not copy memo to clipboard');
      }
    }
  };
  const handleDeleteMemo = (id: number) => setMemos(prev => prev.filter(memo => memo.id !== id));

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        // The 'stop' event handler will process the audio
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            const base64String = await blobToBase64(audioBlob);
            transcribeAudio(base64String);
          } catch (e) {
            console.error("Error converting blob to base64", e);
            setError("Failed to process audio.");
          }
          // Clean up the stream
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setCurrentTranscription("Listening...");
        setError('');
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone permission is required to record audio.");
        alert("Microphone permission was denied or an error occurred.");
      }
    }
  };

      
    
      
    
        return (
    
          <div className="app-container">
    
            <header>
    
              <h1>Pat's Memo Pad</h1>
    
              <div className="header-controls">
                <pwa-install></pwa-install>
    
                
    
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