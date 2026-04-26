import { useEffect, useState } from 'react';
import { request } from '../../lib/api';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext';

function VideoGallery() {
  const { token } = useBusinessAuth();
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/api/videos', { token })
      .then((data) => setVideos(data.videos || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="page-card">Loading videos...</div>;
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Video management</p>
          <h1>Generated videos</h1>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="gallery-grid">
        {videos.length === 0 && <p>No videos have been generated yet.</p>}
        {videos.map((video) => (
          <article className="video-card" key={video.jobId}>
            <div className={`status-pill ${video.status}`}>{video.status}</div>
            <h3>{video.petName}</h3>
            <p>{video.breed} • {video.emotion}</p>
            {video.videoUrl ? (
              <a className="button secondary" href={video.videoUrl} target="_blank" rel="noreferrer">
                Watch video
              </a>
            ) : (
              <p className="muted">Video URL will appear when complete.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default VideoGallery;
