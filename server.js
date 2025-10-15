const express = require('express');
const cors = require('cors');
const app = express();

// ✅ Apply CORS middleware FIRST
app.use(cors({
  origin: 'https://barkbacks-dashboard.vercel.app',
  credentials: true,
}));

app.options('*', cors()); // ✅ Handle preflight requests

app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Minimal CORS test server running on port ${PORT}`);
});
