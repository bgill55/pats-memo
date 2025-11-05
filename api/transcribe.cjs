// netlify/functions/transcribe.js


const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const credentials = JSON.parse(credentialsJson);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { recordDataBase64 } = req.body;
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