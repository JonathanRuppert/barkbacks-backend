import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { apiRequest } from '../../lib/api';

function Dashboard() {
  const { user, token, logout } = useCustomerAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await apiRequest('/api/customer/auth/payments', { token });
        setPayments(data.payments || []);
        setSummary(data.summary || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, [token]);

  return (
    <main className="portal-page">
      <section className="portal-card wide">
        <div className="portal-header">
          <div>
            <p className="eyebrow">Customer portal</p>
            <h1>Welcome back, {user?.name || 'pet parent'}.</h1>
            <p>Track credits, review purchases, and jump back into creating a BarkBacks story.</p>
          </div>
          <button className="secondary-button" type="button" onClick={logout}>
            Log out
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="stats-grid">
          <article className="stat-card">
            <span>Credits available</span>
            <strong>{summary?.available ?? 0}</strong>
          </article>
          <article className="stat-card">
            <span>Videos purchased</span>
            <strong>{summary?.totalPurchased ?? 0}</strong>
          </article>
          <article className="stat-card">
            <span>Videos used</span>
            <strong>{summary?.totalUsed ?? 0}</strong>
          </article>
        </div>

        <div className="section-heading">
          <h2>Recent purchases</h2>
          <Link to="/app/settings">Account settings</Link>
        </div>

        {loading ? (
          <p>Loading account history...</p>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <p>No purchases yet. Visit your daycare's BarkBacks portal to buy a video package.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Credits left</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.productType?.replaceAll('_', ' ')}</td>
                    <td>{payment.status}</td>
                    <td>{payment.creditsLeft}</td>
                    <td>${((payment.amount || 0) / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
