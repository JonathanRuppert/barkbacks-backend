import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

function LandingPage() {
  const { daycareId } = useParams();
  const [daycare, setDaycare] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    apiGet(`/api/daycare/${daycareId}`)
      .then((data) => {
        if (isMounted) setDaycare(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [daycareId]);

  if (error) {
    return (
      <main className="portal-page centered">
        <h1>Daycare not found</h1>
        <p>{error}</p>
        <Link className="button secondary" to="/">
          Back home
        </Link>
      </main>
    );
  }

  const brandColor = daycare?.brandingConfig?.brandColor || '#667eea';

  return (
    <main className="portal-page daycare-landing" style={{ '--brand-color': brandColor }}>
      <section className="portal-card hero-card">
        <span className="eyebrow">BarkBacks Portal</span>
        <h1>{daycare ? `${daycare.daycareName} video stories` : 'Loading daycare portal...'}</h1>
        <p>
          Turn daycare moments into personalized keepsake videos your family can replay forever.
        </p>
        <div className="action-row">
          <Link className="button" to={`/app/create/${daycareId}`}>
            Create a video
          </Link>
          <Link className="button secondary" to="/app/register">
            Create account
          </Link>
        </div>
      </section>

      <section className="grid three">
        <article className="portal-card">
          <h3>1. Pick a package</h3>
          <p>Choose a single video or a bundle that gives your daycare credits to create more stories.</p>
        </article>
        <article className="portal-card">
          <h3>2. Add pet details</h3>
          <p>Share your pet's name, breed or photo, favorite activities, and the feeling for the story.</p>
        </article>
        <article className="portal-card">
          <h3>3. Watch it come alive</h3>
          <p>Track generation progress and receive a finished BarkBacks video when it is ready.</p>
        </article>
      </section>
    </main>
  );
}

export default LandingPage;
