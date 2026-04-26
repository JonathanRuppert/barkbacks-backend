import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

function VideoStatus() {
  const { jobId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const data = await apiFetch(`/api/customer/videos/${jobId}`);
        if (!cancelled) {
          setVideo(data);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };

    loadStatus();
    const interval = window.setInterval(loadStatus, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [jobId]);

  return (
    <main className="portal-page">
      <section className="portal-card status-card">
        <p className="eyebrow">Video status</p>
        <h1>{video?.petName || 'Your BarkBack'}</h1>
        {error && <p className="alert error">{error}</p>}
        {!video ? (
          <p>Loading status...</p>
        ) : (
          <>
            <div className={`status-pill status-${video.status}`}>{video.status}</div>
            {video.status === 'complete' && video.videoUrl ? (
              <video controls src={video.videoUrl} className="video-player">
                <track kind="captions" />
              </video>
            ) : (
              <p>
                Your video is {video.status}. This page refreshes automatically while n8n and the
                video workflow finish processing.
              </p>
            )}
            {video.errorMessage && <p className="alert error">{video.errorMessage}</p>}
          </>
        )}
        <Link className="secondary-link" to="/app/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}

export default VideoStatus;
