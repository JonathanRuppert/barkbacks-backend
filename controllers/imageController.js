exports.generateImage = (req, res) => {
  const { image_prompt } = req.body;

  const output_image_url = `https://mock.barkbacks.ai/generated/${Date.now()}.jpg`;

  res.status(200).json({
    message: 'Image generated successfully!',
    image_prompt,
    output_image_url
  });
};
