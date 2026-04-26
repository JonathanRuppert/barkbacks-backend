import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext';

export default function CustomerDetail() {
  const { customerId } = useParams();
  const { token } = useBusinessAuth();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/api/daycare/customer/${customerId}`, { token })
      .then(setDetail)
      .catch((err) => setError(err.message));
  }, [customerId, token]);

  if (error) {
    return <section className="panel"><p className="error-text">{error}</p></section>;
  }

  if (!detail) {
    return <section className="panel"><p>Loading customer...</p></section>;
  }

  return (
    <div className="stack">
      <Link to="/business/customers" className="text-link">&larr; Back to customers</Link>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Customer profile</p>
            <h1>{detail.customer.name}</h1>
            <p>{detail.customer.email}</p>
          </div>
        </div>
        <div className="metric-grid">
          <div className="metric-card">
            <span>Total spent</span>
            <strong>${((detail.stats.totalSpent || 0) / 100).toFixed(2)}</strong>
          </div>
          <div className="metric-card">
            <span>Credits left</span>
            <strong>{detail.stats.remainingCredits}</strong>
          </div>
          <div className="metric-card">
            <span>Videos</span>
            <strong>{detail.stats.totalVideos}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Purchase history</h2>
        <div className="table-list">
          {detail.payments.map((payment) => (
            <div className="table-row" key={payment.id}>
              <div>
                <strong>{payment.productType}</strong>
                <span>{new Date(payment.date).toLocaleDateString()}</span>
              </div>
              <span>${((payment.amount || 0) / 100).toFixed(2)}</span>
              <span>{payment.creditsLeft} left</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Videos</h2>
        <div className="cards-grid">
          {detail.videos.map((video) => (
            <article className="video-card" key={video.jobId}>
              <h3>{video.petName}</h3>
              <p>{video.status}</p>
              {video.videoUrl && (
                <a href={video.videoUrl} target="_blank" rel="noreferrer">Open video</a>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
