import { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../../lib/api';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext';

function Analytics() {
  const { token } = useBusinessAuth();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/daycare/analytics', { token })
      .then(setAnalytics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <main className="dashboard-shell"><p>Loading analytics...</p></main>;
  }

  const overview = analytics?.overview || {};
  const videoStatus = analytics?.videos?.byStatus || {};
  const revenueByMonth = analytics?.revenue?.byMonth || {};

  return (
    <main className="dashboard-shell">
      <div className="section-heading">
        <span>Analytics</span>
        <h1>Business performance</h1>
        <p>Revenue, customer, credit, and video generation metrics.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="metric-grid">
        <div className="metric-card">
          <span>Total revenue</span>
          <strong>{formatCurrency(overview.totalRevenue || 0)}</strong>
        </div>
        <div className="metric-card">
          <span>Customers</span>
          <strong>{overview.totalCustomers || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Videos created</span>
          <strong>{overview.totalVideosCreated || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Credits remaining</span>
          <strong>{overview.creditsRemaining || 0}</strong>
        </div>
      </div>

      <div className="two-column">
        <section className="panel">
          <h2>Video status</h2>
          <ul className="simple-list">
            <li><span>Completed</span><strong>{videoStatus.completed || 0}</strong></li>
            <li><span>Processing</span><strong>{videoStatus.processing || 0}</strong></li>
            <li><span>Failed</span><strong>{videoStatus.failed || 0}</strong></li>
          </ul>
        </section>

        <section className="panel">
          <h2>Revenue by month</h2>
          <ul className="simple-list">
            {Object.entries(revenueByMonth).length === 0 && <li>No revenue yet.</li>}
            {Object.entries(revenueByMonth).map(([month, amount]) => (
              <li key={month}>
                <span>{month}</span>
                <strong>{formatCurrency(amount)}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

export default Analytics;
