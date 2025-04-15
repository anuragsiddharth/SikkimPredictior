require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { predictNextColor } = require('./predictor');
const { scrapeLatestResults } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Store historical data
let historicalData = [];
let modelAccuracy = 0;

// Update data every 5 minutes
setInterval(async () => {
  const newResults = await scrapeLatestResults();
  if (newResults && newResults.length > 0) {
    historicalData = [...newResults, ...historicalData].slice(0, 1000); // Keep last 1000 games
    console.log(`Updated historical data. Total records: ${historicalData.length}`);
  }
}, 5 * 60 * 1000);

// Prediction endpoint
app.get('/predict', async (req, res) => {
  try {
    if (historicalData.length < 50) {
      return res.status(400).json({ error: 'Insufficient data for prediction' });
    }

    const prediction = await predictNextColor(historicalData);
    res.json({
      predictedColor: prediction.color,
      probability: prediction.probability,
      accuracy: modelAccuracy,
      lastUpdated: new Date().toISOString(),
      recentResults: historicalData.slice(0, 20)
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Initialize
(async () => {
  historicalData = await scrapeLatestResults();
  console.log('Initial data loaded');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();