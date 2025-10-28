// App.tsx
// Force re-deploy
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from '@lgicc/capacitor-voice-recorder';

// --- Helper Icon Components (Keep these as they are) ---
const MicIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1V11c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 6.2c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 3.53 2.84 6.42 6.25 6.92V21h1.5v-3.08c3.41-.5 6.25-3.39 6.25-6.92h-1.9z"/></svg> );
const StopIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg> );
const VoiceCommandIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1V11c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 6.2c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 3.53 2.84 6.42 6.25 6.92V21h1.5v-3.08c3.41-.5 6.25-3.39 6.25-6.92h-1.9z"/></svg> );
const SaveIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg> );
const ClearIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> );
const ShareIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 2.99-1.34 2.99-3S19.66 3 18 3s-3 1.34-3 3c0 .24.04.47.09.7L8.04 8.81C7.5 8.31 6.79 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/></svg> );
const TrashIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> );

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [error, setError] = useState('');
  const [memos, setMemos] = useState([]);
  const [commandFeedback, setCommandFeedback] = useState('');

useEffect(() => { console.log("Forcing a new build hash."); 
  },[]
);

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
          mimeType: audioData.mimeType,
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
          await VoiceRecorder.startRecording();
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
  
  const handleToggleListener = () => setIsListening(p => !p);
  const handleSaveMemo = () => { if (currentTranscription) { setMemos(prev => [{id: Date.now(), text: currentTranscription, createdAt: new Date().toISOString()}, ...prev]); setCurrentTranscription(''); } };
  const handleClear = () => setCurrentTranscription('');
  const handleShareMemo = (text) => alert(`Sharing memo: "${text}"`);
  const handleDeleteMemo = (id) => setMemos(prev => prev.filter(memo => memo.id !== id));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col max-w-2xl mx-auto p-4 md:p-6 relative">
      <header className="flex justify-between items-center text-center mb-6">
         <div className="w-10"></div>
         <div className="flex-1">
            <h1 className="text-3xl font-bold text-cyan-400">Pat's Voice Memo</h1>
            <p className="text-gray-400">Tap to speak.</p>
         </div>
         <div className="w-10">
            <button onClick={handleToggleListener} className={`p-2 rounded-full transition-colors ${isListening ? 'text-cyan-400 bg-cyan-900/50' : 'text-gray-500 hover:text-cyan-400'}`} title="Toggle Voice Commands">
                <VoiceCommandIcon className="w-6 h-6" />
            </button>
         </div>
      </header>
      <main className="flex-grow flex flex-col">
        <div className="relative flex-grow bg-gray-800 rounded-xl shadow-lg p-4 mb-6 min-h-[200px] flex flex-col justify-between">
          <p className="flex-grow whitespace-pre-wrap text-lg font-medium leading-relaxed">
            {currentTranscription || <span className="text-gray-500">{isListening ? 'Listening for "start recording"...' : 'Your transcribed text will appear here...'}</span>}
          </p>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
           {!isRecording && currentTranscription && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <button onClick={handleSaveMemo} className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200">
                <SaveIcon className="w-5 h-5" /><span>Save</span>
              </button>
              <button onClick={handleClear} className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200">
                <ClearIcon className="w-5 h-5" /><span>Clear</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-center my-4">
          <button onClick={handleToggleRecording} className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-xl focus-outline-none focus:ring-4 focus:ring-opacity-50 ${isRecording ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400'}`} disabled={isListening}>
            {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            {isRecording ? <StopIcon className="w-8 h-8 text-white" /> : <MicIcon className="w-8 h-8 text-white" />}
          </button>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-4">Saved Memos</h2>
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {memos.length > 0 ? ( memos.map(memo => ( <div key={memo.id} className="bg-gray-800 rounded-lg p-4 shadow-md transition-transform hover:scale-[1.02]"><p className="text-gray-300 mb-3">{memo.text}</p><div className="flex justify-between items-center text-xs text-gray-500"><span>{new Date(memo.createdAt).toLocaleString()}</span><div className="flex items-center space-x-3"><button onClick={() => handleShareMemo(memo.text)} className="hover:text-cyan-400 transition-colors"><ShareIcon className="w-5 h-5" /></button><button onClick={() => handleDeleteMemo(memo.id)} className="hover:text-red-400 transition-colors"><TrashIcon className="w-5 h-5" /></button></div></div></div> )) ) : ( <p className="text-center text-gray-500 py-8">No saved memos yet.</p> )}
          </div>
        </div>
      </main>
      {commandFeedback && ( <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-sm py-2 px-4 rounded-full shadow-lg animate-pulse">{commandFeedback}</div> )}
    </div>
  );
}