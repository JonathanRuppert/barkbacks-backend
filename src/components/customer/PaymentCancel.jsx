import { Link } from 'react-router-dom';

export default function PaymentCancel() {
  return (
    <main className="center-page">
      <section className="card narrow">
        <p className="eyebrow">Payment canceled</p>
        <h1>No worries.</h1>
        <p>Your card was not charged. You can return to your daycare portal whenever you are ready.</p>
        <Link className="btn primary" to="/">Back to BarkBacks</Link>
      </section>
    </main>
  );
}
