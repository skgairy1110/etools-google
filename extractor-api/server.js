const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors()); // Allows your Vite app (port 5173) to talk to this server (port 3001)
app.use(express.json());

app.post('/api/extract-video', async (req, res) => {
  const { targetUrl } = req.body;

  try {
    console.log(`Extracting: ${targetUrl}`);
    // yt-dlp fetches the raw metadata
    const videoData = await youtubedl(targetUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true
    });

    // Format the data perfectly for our React UI
    const result = {
      id: Date.now(),
      type: videoData.extractor === 'youtube' ? 'youtube' : videoData.extractor === 'vimeo' ? 'vimeo' : 'direct',
      title: videoData.title || 'Unknown Video',
      source: targetUrl,
      quality: videoData.resolution || 'Auto',
      size: 'Dynamic',
      thumbnail: videoData.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop',
      downloadUrl: videoData.url // The raw MP4 link!
    };

    res.json({ results: [result] });
  } catch (error) {
    console.error("Extraction error:", error.message);
    res.status(500).json({ error: "Failed to extract video." });
  }
});

app.listen(3001, () => console.log('Extractor API running on http://localhost:3001'));