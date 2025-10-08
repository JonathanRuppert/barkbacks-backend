exports.submitStory = (req, res) => {
  const { creator_id, pet_profile_id, story_id, voice_id, campaign_tags } = req.body;

  const submission_id = `sub_${Date.now()}`;
  const content_hash = Math.random().toString(36).substring(2, 10);

  res.status(200).json({
    message: 'Story submitted!',
    submission_id,
    creator_id,
    campaign_tags,
    ip_metadata: {
      claim_reference: `CLAIM-${submission_id}`,
      submission_timestamp: new Date().toISOString(),
      content_hash
    },
    status: 'submitted'
  });
};
