// netlify/functions/transcribe.js
const speech = require('@google-cloud/speech');

const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const credentials = JSON.parse(credentialsJson);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed', headers: CORS_HEADERS };
  }

  try {
    const { recordDataBase64, mimeType } = JSON.parse(event.body);
    if (!recordDataBase64) {
      return { statusCode: 400, body: 'Missing audio data', headers: CORS_HEADERS };
    }

    const audioBuffer = Buffer.from(recordDataBase64, 'base64');
    
    const mm = await import('music-metadata');
    // --- Your brilliant dynamic detection ---
    const metadata = await mm.parseBuffer(audioBuffer, mimeType);
    const sampleRateHertz = metadata.format.sampleRate;

    const client = new speech.SpeechClient({ credentials });
    const audio = {
      content: recordDataBase64, // The raw base64 data
    };
    
    const config = {
      encoding: 'AAC',
      sampleRateHertz: sampleRateHertz,
      languageCode: 'en-US',
      model: 'latest_short',
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    // --- The one critical change: use the simpler 'recognize' method ---
    const [response] = await client.recognize(request);
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ transcription: transcription }),
    };

  } catch (error) {
    console.error("Error during transcription:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Transcription failed: ${error.message}` }),
    };
  }
};