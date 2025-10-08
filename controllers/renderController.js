exports.renderVideo = (req, res) => {
  const { submission_id, delivery_targets } = req.body;

  const video_url = `https://mock.barkbacks.ai/final/${submission_id}.mp4`;
  const archive_location = `/archive/${submission_id}`;

  res.status(200).json({
    message: 'Video rendered and delivered!',
    submission_id,
    video_url,
    archive_location,
    delivery_targets,
    timestamp: new Date().toISOString()
  });
};
