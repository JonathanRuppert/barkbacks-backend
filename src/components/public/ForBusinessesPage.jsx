import { Link } from 'react-router-dom';

const benefits = [
  'Generate branded keepsake videos in minutes',
  'Offer customer-paid video packages with simple credit tracking',
  'Manage customers, purchases, and video history from one dashboard',
];

function ForBusinessesPage() {
  return (
    <main className="page public-page">
      <section className="hero split-hero">
        <div>
          <p className="eyebrow">For daycares and pet businesses</p>
          <h1>Turn everyday daycare moments into a premium customer experience.</h1>
          <p className="hero-copy">
            BarkBacks helps pet care teams create personalized stories, track revenue,
            and keep customers engaged with videos they want to share.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/business/register">Start free trial</Link>
            <Link className="button secondary" to="/business/login">Business login</Link>
          </div>
        </div>
        <div className="hero-card metric-card">
          <span>Revenue share</span>
          <strong>80 / 20</strong>
          <p>Keep the majority of customer video revenue while BarkBacks handles generation.</p>
        </div>
      </section>

      <section className="section">
        <h2>Built for pet care teams</h2>
        <div className="feature-grid">
          {benefits.map((benefit) => (
            <article className="feature-card" key={benefit}>
              <h3>{benefit}</h3>
              <p>Use your BarkBacks dashboard to keep every request and result organized.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section pricing-card">
        <div>
          <p className="eyebrow">Simple launch plan</p>
          <h2>Start with 10 included videos per month.</h2>
          <p>
            Use the free plan to validate customer demand, then upgrade as your video
            program grows.
          </p>
        </div>
        <Link className="button primary" to="/business/register">Create business account</Link>
      </section>
    </main>
  );
}

export default ForBusinessesPage;
