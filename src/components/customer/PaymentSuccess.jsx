import { Link, useSearchParams } from 'react-router-dom';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const daycareId = searchParams.get('daycareId') || '';
  const sessionId = searchParams.get('session_id');

  return (
    <main className="auth-shell">
      <section className="auth-card center-card">
        <p className="eyebrow">Payment complete</p>
        <h1>You are ready to create BarkBacks videos.</h1>
        <p className="muted">
          Your video credits are being attached to your account. Stripe session: {sessionId || 'confirmed'}.
        </p>
        {daycareId ? (
          <Link className="btn primary" to={`/app/create/${daycareId}`}>Create a video</Link>
        ) : (
          <Link className="btn secondary" to="/app/dashboard">Go to dashboard</Link>
        )}
      </section>
    </main>
  );
}

export default PaymentSuccess;
