import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

export default function Settings() {
  const { user, token, updateProfile, changePassword, logout } = useCustomerAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(profile);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="portal-page">
      <section className="portal-card narrow">
        <div className="portal-header-row">
          <div>
            <p className="eyebrow">Customer settings</p>
            <h1>Account settings</h1>
          </div>
          <button className="link-button" onClick={logout}>Log out</button>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form className="stack-form" onSubmit={saveProfile}>
          <label>
            Name
            <input
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            />
          </label>
          <button className="primary-button" disabled={saving || !token}>
            Save profile
          </button>
        </form>

        <form className="stack-form divider-top" onSubmit={savePassword}>
          <label>
            Current password
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
            />
          </label>
          <button className="secondary-button" disabled={saving || !token}>
            Change password
          </button>
        </form>

        <Link className="text-link" to="/app/dashboard">Back to dashboard</Link>
      </section>
    </main>
  );
}
