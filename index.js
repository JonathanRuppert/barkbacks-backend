const app = require('./app');
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`BarkBacks backend running on http://localhost:${PORT}`);
});
