import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useCustomerAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page customer-auth-page">
      <section className="auth-card">
        <Link to="/" className="eyebrow-link">Back to BarkBacks</Link>
        <h1>Create your customer account</h1>
        <p>Save your video history and manage BarkBacks credits across your favorite daycare.</p>

        <form onSubmit={handleSubmit} className="stacked-form">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength="6"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button full-width" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/app/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
