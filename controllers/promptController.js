exports.generatePrompt = (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Temporary response for testing
  res.json({ result: `You submitted: ${prompt}` });
};
