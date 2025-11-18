// api/transcribe.js


const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const credentials = JSON.parse(credentialsJson);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { recordDataBase64, mimeType } = req.body;
    if (!recordDataBase64) {
      res.status(400).send('Missing audio data');
      return;
    }

    const audioBuffer = Buffer.from(recordDataBase64, 'base64');

    const speech = await import('@google-cloud/speech');
    const client = new speech.default.SpeechClient({ credentials });
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    // Determine encoding based on MIME type
    let encoding = 'WEBM_OPUS';
    let sampleRateHertz = 48000;

    if (mimeType) {
      console.log('Received MIME type:', mimeType);
      if (mimeType.includes('audio/mp4')) {
        // MP4 usually uses AAC codec
        encoding = 'MP3'; // Google Cloud uses MP3 for most MP4/AAC content
        sampleRateHertz = 48000;
      } else if (mimeType.includes('audio/webm')) {
        encoding = 'WEBM_OPUS';
        sampleRateHertz = 48000;
      } else if (mimeType.includes('audio/ogg')) {
        encoding = 'OGG_OPUS';
        sampleRateHertz = 48000;
      }
    }

    console.log('Using encoding:', encoding, 'at', sampleRateHertz, 'Hz');

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: 'en-US',
      model: 'default',
      enableAutomaticPunctuation: true,
    };

    const request = {
      audio: audio,
      config: config,
    };

    // Use standard recognize for most cases (faster and more format-compatible)
    // longRunningRecognize is for audio longer than 1 minute
    console.log('Audio size:', audioBuffer.length, 'bytes');

    let response;
    if (audioBuffer.length > 10 * 1024 * 1024) { // > 10MB, likely a long recording
      console.log('Using longRunningRecognize for large audio file');
      const [operation] = await client.longRunningRecognize(request);
      [response] = await operation.promise();
    } else {
      console.log('Using standard recognize for normal-sized audio');
      [response] = await client.recognize(request);
    }
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.status(200).json({ transcription: transcription });

  } catch (error) {
    console.error("Detailed transcription error:", error);
    res.status(500).json({ error: `Transcription failed: ${error.message}` });
  }
};