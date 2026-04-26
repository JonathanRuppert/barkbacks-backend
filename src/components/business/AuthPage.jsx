import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext.jsx';

function AuthPage() {
  const [params] = useSearchParams();
  const mode = useMemo(() => params.get('mode') || (window.location.pathname.includes('register') ? 'register' : 'login'), [params]);
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const { login, register } = useBusinessAuth();
  const [form, setForm] = useState({ daycareName: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
      navigate('/business/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Business dashboard</p>
        <h1>{isRegister ? 'Start your BarkBacks trial' : 'Welcome back'}</h1>
        <p>{isRegister ? 'Create a daycare account and launch your customer video portal.' : 'Sign in to manage videos, customers, and analytics.'}</p>
        <form onSubmit={handleSubmit} className="stacked-form">
          {isRegister && (
            <input name="daycareName" value={form.daycareName} onChange={updateField} placeholder="Daycare name" required />
          )}
          <input name="email" value={form.email} onChange={updateField} type="email" placeholder="Email" required />
          <input name="password" value={form.password} onChange={updateField} type="password" placeholder="Password" required minLength={6} />
          {isRegister && (
            <>
              <input name="phone" value={form.phone} onChange={updateField} placeholder="Phone (optional)" />
              <input name="address" value={form.address} onChange={updateField} placeholder="Address (optional)" />
            </>
          )}
          {error && <div className="alert error">{error}</div>}
          <button className="primary-button" disabled={loading}>{loading ? 'Please wait...' : isRegister ? 'Create business account' : 'Sign in'}</button>
        </form>
        <p className="muted">
          {isRegister ? 'Already have an account?' : 'New to BarkBacks?'}{' '}
          <Link to={isRegister ? '/business/login' : '/business/register'}>{isRegister ? 'Sign in' : 'Register your daycare'}</Link>
        </p>
      </section>
    </main>
  );
}

export default AuthPage;
