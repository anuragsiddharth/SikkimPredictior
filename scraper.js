const axios = require('axios');
const cheerio = require('cheerio');
const { encodeColor } = require('./predictor');

// Scrape latest results from Sikkim color game website
async function scrapeLatestResults() {
  try {
    const response = await axios.get('https://sikkimlotteryresults.in/color-prediction', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Parse results table - adjust selectors based on actual site
    $('.result-table tbody tr').each((i, row) => {
      const columns = $(row).find('td');
      if (columns.length >= 3) {
        const number = parseInt($(columns[0]).text().trim());
        const color = $(columns[1]).text().trim();
        const size = $(columns[2]).text().trim();
        
        if (!isNaN(number) && ['Red', 'Green', 'Violet'].includes(color)) {
          results.push({
            number,
            color,
            size,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
    
    return results.reverse(); // Return oldest first
  } catch (error) {
    console.error('Scraping error:', error.message);
    return null;
  }
}

module.exports = { scrapeLatestResults };