// server.js
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static files (audio files)
app.use('/audio', express.static('audio'));

// Create audio directory if it doesn't exist
if (!fs.existsSync('audio')) {
  fs.mkdirSync('audio');
}

app.post('/synthesize', async (req, res) => {
  const { text, voice = '21m00Tcm4TlvDq8ikWAM', voice_settings = {} } = req.body;
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: voice_settings.stability || 0.5,
          similarity_boost: voice_settings.similarity_boost || 0.75
        }
      })
    });

    const audioBuffer = await response.arrayBuffer();
    
    // Save audio to file
    const fileName = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
    const filePath = path.join('audio', fileName);
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));
    
    // Return the URL to the audio file
    const audioUrl = `https://elevenlabstest-production.up.railway.app/audio/${fileName}`;
    
    res.json({ audioUrl });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
