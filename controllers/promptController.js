exports.generatePrompt = (req, res) => {
  const { voice_pack, story_template, activity_data } = req.body;

  const structured_prompt = {
    image_prompt: `Photorealistic image of pet with ${voice_pack.tone} tone and ${story_template.title} theme`,
    voice_script: `Hi, I'm your pet! Here's my story: ${story_template.script_blocks.join(' ')}`,
    animation_notes: `Use eye-level framing and subtle emotional reactions based on ${voice_pack.tone}`
  };

  res.status(200).json({ structured_prompt });
};
