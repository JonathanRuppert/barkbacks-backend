import { Link } from 'react-router-dom';
import './public.css';

export default function HomePage() {
  return (
    <main className="public-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Personalized pet stories</span>
          <h1>Turn daycare moments into unforgettable dog videos.</h1>
          <p>
            BarkBacks helps pet parents create joyful, personalized videos from
            their dog's day with cinematic storytelling and easy sharing.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/app/register">Get Started</Link>
            <Link className="secondary-button" to="/for-businesses">For Businesses</Link>
          </div>
        </div>
        <div className="hero-card" aria-label="Video preview summary">
          <div className="video-placeholder">BB</div>
          <h2>Bella's Big Adventure</h2>
          <p>Happy tail wags, tunnel runs, and a heartfelt message home.</p>
        </div>
      </section>

      <section className="feature-grid">
        <article>
          <h3>Made for pet parents</h3>
          <p>Simple flows guide customers from daycare portal to finished video.</p>
        </article>
        <article>
          <h3>Emotion-led storytelling</h3>
          <p>Choose the feeling, activities, and pet details that make each story personal.</p>
        </article>
        <article>
          <h3>Easy sharing</h3>
          <p>Completed videos are available from a dedicated status page.</p>
        </article>
      </section>

      <section className="cta-band">
        <h2>Ready to bring your pet's story to life?</h2>
        <Link className="primary-button light" to="/app/register">Create your account</Link>
      </section>
    </main>
  );
}
