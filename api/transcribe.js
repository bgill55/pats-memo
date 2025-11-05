// api/transcribe.js
import { SpeechClient } from '@google-cloud/speech';

export default async function handler(req, res) {
  // Set CORS headers for all responses, including OPTIONS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Initialize credentials and client inside the handler
    const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);
    const client = new SpeechClient({ credentials });

    const { recordDataBase64 } = req.body;
    if (!recordDataBase64) {
      res.status(400).send('Missing audio data');
      return;
    }

    const audioBuffer = Buffer.from(recordDataBase64, 'base64');
    
    const audio = {
      content: audioBuffer.toString('base64'),
    };
    
    const config = {
      languageCode: 'en-US',
      model: 'default',
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.status(200).json({ transcription: transcription });

  } catch (error) {
    console.error("Detailed transcription error:", error);
    res.status(500).json({ error: `Transcription failed: ${error.message}` });
  }
};
