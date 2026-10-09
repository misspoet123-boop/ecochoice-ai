import app from './api/index';

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EcoLens Server with Google Search Grounding running at http://0.0.0.0:${PORT}`);
});
