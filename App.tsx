// App.tsx
import '@khmyznikov/pwa-install';
import React, { useState, useEffect, useRef, useCallback } from 'react';

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
const VoiceCommandIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1V11c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 6.2c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 3.53 2.84 6.42 6.25 6.92V21h1.5v-3.08c3.41-.5 6.25-3.39 6.25-6.92h-1.9z"/></svg> );
const SaveIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg> );
const ClearIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> );
const ShareIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 2.99-1.34 2.99-3S19.66 3 18 3s-3 1.34-3 3c0 .24.04.47.09.7L8.04 8.81C7.5 8.31 6.79 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/></svg> );
const TrashIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> );

const SunIcon = () => (
  <svg className="sun-icon" viewBox="0 0 24 24" fill="white" width="20px" height="20px">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="21" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="1" y1="12" x2="3" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="21" y1="12" x2="23" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="moon-icon" viewBox="0 0 24 24" fill="var(--primary)" width="20px" height="20px">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="var(--primary)"/>
  </svg>
);

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <label className="theme-toggle" title="Toggle Theme">
      <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
      <span className="slider">
        <span className="icon-container">
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </label>
  );
};

export default function App() {
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(isRecording);
  const memosRef = useRef(memos);
  const currentTranscriptionRef = useRef(currentTranscription);

  useEffect(() => {
    isRecordingRef.current = isRecording;
    memosRef.current = memos;
    currentTranscriptionRef.current = currentTranscription;
  }, [isRecording, memos, currentTranscription]);

  // Ref for the speech recognition instance
  const recognitionRef = useRef<any>(null);
  const lastCommandTimeRef = useRef<number>(0);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const transcribeAudio = async (base64Data: string, mimeType: string = 'audio/webm') => {
    setCurrentTranscription("Transcribing...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setCurrentTranscription(`Transcription timed out after 5 minutes.`);
    }, 300000); // 5 minutes timeout

    try {
      const url = "/api/transcribe";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordDataBase64: base64Data,
          mimeType: mimeType,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      if (e.name === 'AbortError') {
        console.error("Transcription request timed out.");
      } else {
        console.error("Transcription error:", e);
        setError("Failed to transcribe audio.");
        setCurrentTranscription(`Transcription failed: ${e.message}`);
      }
    }
  };

  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechRecognitionSupported(!!SpeechRecognition);
  }, []);

  const handleToggleListener = () => setIsListening(p => !p);

  // Play audio feedback for voice commands
  const playCommandSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.error("Error playing command sound:", e);
    }
  }, []);

  // Show command feedback and auto-dismiss
  const showCommandFeedback = useCallback((message: string) => {
    setCommandFeedback(message);
    playCommandSound();
    setTimeout(() => setCommandFeedback(''), 2000);
  }, [playCommandSound]);

  const handleToggleRecording = useCallback(async (isVoiceCommand = false) => {
    if (isRecordingRef.current) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        if (isVoiceCommand) {
          // If this is a voice command, discard the last 2-3 chunks (1-1.5 seconds)
          // This ensures we remove the entire "stop recording" phrase
          audioChunksRef.current.pop();
          audioChunksRef.current.pop();
          if (audioChunksRef.current.length > 0) {
            audioChunksRef.current.pop();
          }
        }
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        // The 'stop' event handler will process the audio
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const options = { mimeType: '' };
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
          try {
            const base64String = await blobToBase64(audioBlob);
            transcribeAudio(base64String, options.mimeType);
          } catch (e) {
            console.error("Error converting blob to base64", e);
            setError("Failed to process audio.");
          }
          // Clean up the stream
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(500); // Record in 500ms chunks
        setIsRecording(true);
        setCurrentTranscription("Listening...");
        setError('');
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone permission is required to record audio.");
        alert("Microphone permission was denied or an error occurred.");
      }
    }
  }, []);

  // Setup speech recognition
  useEffect(() => {
    if (isSpeechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event:any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.trim().toLowerCase();
        const confidence = result[0].confidence;

        console.log('Recognized speech:', transcript, 'Confidence:', confidence);

        // Only process commands with reasonable confidence (if available)
        if (confidence !== undefined && confidence < 0.5) {
          console.log('Low confidence, ignoring command');
          return;
        }

        // Debounce: prevent same command from being processed within 1 second
        const now = Date.now();
        if (now - lastCommandTimeRef.current < 1000) {
          console.log('Command too soon after last command, ignoring');
          return;
        }

        // Improved command matching with priority order
        // Use more specific patterns to reduce false positives

        // Recording commands
        if (transcript === 'start recording' || transcript === 'begin recording' || transcript === 'start') {
          if (!isRecordingRef.current) {
            lastCommandTimeRef.current = now;
            showCommandFeedback('🎙️ Starting recording...');
            handleToggleRecording();
          }
        } else if (transcript === 'stop recording' || transcript === 'end recording' || transcript === 'stop') {
          if (isRecordingRef.current) {
            lastCommandTimeRef.current = now;
            showCommandFeedback('⏹️ Stopping recording...');
            handleToggleRecording(true);
          }
        }
        // Save command
        else if (transcript === 'save' || transcript === 'save memo' || transcript === 'save that') {
          if (currentTranscriptionRef.current && !isRecordingRef.current) {
            lastCommandTimeRef.current = now;
            showCommandFeedback('💾 Saving memo...');
            handleSaveMemo();
          }
        }
        // Clear command
        else if (transcript === 'clear' || transcript === 'clear text' || transcript === 'clear that') {
          if (currentTranscriptionRef.current && !isRecordingRef.current) {
            lastCommandTimeRef.current = now;
            showCommandFeedback('🗑️ Clearing text...');
            handleClear();
          }
        }
        // Delete last memo command
        else if (transcript === 'delete' || transcript === 'delete memo' || transcript === 'delete last memo' || transcript === 'delete that') {
          if (memosRef.current.length > 0) {
            lastCommandTimeRef.current = now;
            const lastMemoId = memosRef.current[0].id;
            showCommandFeedback('🗑️ Deleting last memo...');
            handleDeleteMemo(lastMemoId);
          }
        }
        // Share command
        else if (transcript === 'share' || transcript === 'share memo' || transcript === 'share that') {
          if (memosRef.current.length > 0) {
            lastCommandTimeRef.current = now;
            showCommandFeedback('📤 Sharing memo...');
            handleShareMemo(memosRef.current[0].text);
          } else if (currentTranscriptionRef.current && !isRecordingRef.current) {
            lastCommandTimeRef.current = now;
            showCommandFeedback('📤 Sharing text...');
            handleShareMemo(currentTranscriptionRef.current);
          }
        }
      };

      recognition.onerror = (event:any) => {
        console.error('Speech recognition error:', event.error);

        // Provide user-friendly error messages
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
        } else if (event.error === 'audio-capture') {
          setError('Microphone not accessible. Please check permissions.');
          setIsListening(false);
        } else if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please enable it in your browser settings.');
          setIsListening(false);
        } else if (event.error === 'network') {
          setError('Network error during voice recognition. Please check your connection.');
        } else {
          console.log('Voice recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still supposed to be listening
        if (isListening) {
          console.log('Speech recognition ended, restarting...');
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isSpeechRecognitionSupported, handleToggleRecording, showCommandFeedback]); // Re-run if dependencies change

  // Start/stop listening
  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.start();
        console.log('Voice command recognition started.');
      } else {
        recognitionRef.current.stop();
        console.log('Voice command recognition stopped.');
      }
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

      
    
      
    
        return (
    
          <div className="app-container">
    
            <header>
    
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    
              <h1>Pat's Memo Pad</h1>
    
              <div className="header-controls">
                <pwa-install></pwa-install>
    
                {isSpeechRecognitionSupported && (
                  <button onClick={handleToggleListener} title="Toggle Voice Commands" className="voice-command-button">
                    <VoiceCommandIcon />
                    <span>Hands-Free</span>
                  </button>
                )}

          </div>

        </header>

        <main>

          <div className="transcription-section">

            <textarea
              className="transcription-text"
              value={currentTranscription}
              onChange={(e) => setCurrentTranscription(e.target.value)}
              placeholder={isListening ? 'Listening for "start recording"...' : 'Your transcribed text will appear here...'}
            />

            {error && <p className="error-message">{error}</p>}

            {!isRecording && currentTranscription && (

              <div className="transcription-actions">

                <button onClick={handleSaveMemo}>

                  <SaveIcon /><span>Save</span>

                </button>

                <button onClick={handleClear}>

                  <ClearIcon /><span>Clear</span>

                </button>

                <button onClick={() => handleShareMemo(currentTranscription)}>

                  <ShareIcon /><span>Share</span>

                </button>

              </div>

            )}

          </div>

  

          <div className="recording-section">

            <p className="recording-instructions">Tap the microphone to start recording</p>

            <button className="mic-button" onClick={() => handleToggleRecording(false)} disabled={isListening}>

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