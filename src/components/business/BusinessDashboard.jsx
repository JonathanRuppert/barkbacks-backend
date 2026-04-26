import { Link } from 'react-router-dom';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext';

function BusinessDashboard() {
  const { daycare } = useBusinessAuth();

  return (
    <main className="page-shell">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Business dashboard</p>
          <h1>Welcome back, {daycare?.daycareName || 'BarkBacks partner'}.</h1>
          <p>Manage customer videos, review performance, and keep pet parents delighted.</p>
        </div>
        <Link className="primary-button" to="/business/videos">
          Create a Video
        </Link>
      </section>

      <section className="card-grid">
        <Link className="feature-card clickable-card" to="/business/videos">
          <span>Videos</span>
          <h3>Create and review pet stories</h3>
          <p>Submit new videos and track generated content for your daycare.</p>
        </Link>
        <Link className="feature-card clickable-card" to="/business/analytics">
          <span>Analytics</span>
          <h3>Measure revenue and usage</h3>
          <p>See customers, credits, orders, and video status breakdowns.</p>
        </Link>
        <Link className="feature-card clickable-card" to="/business/customers">
          <span>Customers</span>
          <h3>Understand pet parent activity</h3>
          <p>Review customer purchase history and completed videos.</p>
        </Link>
      </section>
    </main>
  );
}

export default BusinessDashboard;
