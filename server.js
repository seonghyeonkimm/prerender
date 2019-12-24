const express = require('express');
const puppeteer = require('puppeteer');
const ssr = require('./ssr');

const app = express();

let browserWSEndpoint = null;
app.use(express.static('public'));
app.get('/cache', async (req, res, next) => {
  if (!browserWSEndpoint) {
    const browser = await puppeteer.launch();
    browserWSEndpoint = await browser.wsEndpoint();
  }

  const {html, ttRenderMs} = await ssr(`${req.protocol}://${req.get('host')}/index.html`, browserWSEndpoint);
  // Add Server-Timing! See https://w3c.github.io/server-timing/.
  res.set('Server-Timing', `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`);
  return res.status(200).send(html); // Serve prerendered page as response.
});

app.listen(8080, () => console.log('Server started. Press Ctrl+C to quit'));