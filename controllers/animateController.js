exports.animateVideo = (req, res) => {
  const { image_url, voice_script, animation_notes } = req.body;

  const output_video_url = `https://mock.barkbacks.ai/video/${Date.now()}.mp4`;

  res.status(200).json({
    message: 'Animation complete!',
    image_url,
    voice_script,
    animation_notes,
    output_video_url
  });
};
