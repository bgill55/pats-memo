// netlify/functions/transcribe.js

const speech = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');

const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const credentials = JSON.parse(credentialsJson);

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;

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
    const { recordDataBase64 } = JSON.parse(event.body);
    if (!recordDataBase64) {
      return { statusCode: 400, body: 'Missing audio data', headers: CORS_HEADERS };
    }

    const storage = new Storage({ credentials });
    const audioBuffer = Buffer.from(recordDataBase64, 'base64');
    const fileName = `recording-${Date.now()}.m4a`;
    const file = storage.bucket(BUCKET_NAME).file(fileName);
    await file.save(audioBuffer);
    const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;

    const client = new speech.SpeechClient({ credentials });
    const audio = {
      uri: gcsUri,
    };
    
    // --- THE FINAL, CORRECTED CONFIGURATION ---
    const config = {
      encoding: 'AAC',
      // This is the critical change. Modern phones record at higher sample rates.
      sampleRateHertz: 48000, 
      languageCode: 'en-US',
      model: 'latest_short', 
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    await file.delete();

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
