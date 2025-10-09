const express = require('express');
const router = express.Router();

router.post('/api/submit', async (req, res) => {
  const { prompt, image, animation } = req.body;

  console.log('Received /api/submit payload:', req.body);

  if (!prompt || !image || !animation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const submissionId = 'barkbacks_' + Date.now();
    res.json({ success: true, id: submissionId });
  } catch (error) {
    console.error('Submission error:', error.message);
    res.status(500).json({ error: 'Submission failed' });
  }
});

module.exports = router;
