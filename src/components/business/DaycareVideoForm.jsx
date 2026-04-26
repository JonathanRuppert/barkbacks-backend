import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext';

const ACTIVITY_OPTIONS = ['playtime', 'snack time', 'nap time', 'walks', 'training', 'cuddles'];
const EMOTION_OPTIONS = ['happy', 'playful', 'cozy', 'proud', 'silly', 'loved'];

export default function DaycareVideoForm() {
  const navigate = useNavigate();
  const { token, daycare } = useBusinessAuth();
  const [form, setForm] = useState({
    petName: '',
    breed: '',
    emotion: 'happy',
    daycare_activities: [],
    number_of_dogs: 1,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const toggleActivity = (activity) => {
    setForm((current) => ({
      ...current,
      daycare_activities: current.daycare_activities.includes(activity)
        ? current.daycare_activities.filter((item) => item !== activity)
        : [...current.daycare_activities, activity],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await apiFetch('/api/videos/create', {
        method: 'POST',
        token,
        body: {
          ...form,
          number_of_dogs: Number(form.number_of_dogs),
        },
      });
      navigate(`/business/videos?jobId=${data.jobId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="dashboard-shell">
      <section className="panel two-column">
        <div>
          <p className="eyebrow">Create for customers</p>
          <h1>Generate a BarkBack for today&apos;s daycare moments</h1>
          <p className="muted">
            Submit a pet story from {daycare?.daycareName || 'your daycare'} and track it in the
            video gallery.
          </p>
          <Link className="text-link" to="/business/videos">
            View generated videos
          </Link>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <label>
            Pet name
            <input name="petName" value={form.petName} onChange={updateField} required />
          </label>
          <label>
            Breed
            <input name="breed" value={form.breed} onChange={updateField} required />
          </label>
          <label>
            Story emotion
            <select name="emotion" value={form.emotion} onChange={updateField}>
              {EMOTION_OPTIONS.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
          </label>
          <label>
            Number of dogs
            <select name="number_of_dogs" value={form.number_of_dogs} onChange={updateField}>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </label>
          <div className="choice-group">
            <span>Activities</span>
            <div className="pill-grid">
              {ACTIVITY_OPTIONS.map((activity) => (
                <button
                  type="button"
                  className={form.daycare_activities.includes(activity) ? 'pill active' : 'pill'}
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
          <button className="primary-button full-width" type="submit" disabled={submitting}>
            {submitting ? 'Starting video...' : 'Create video'}
          </button>
        </form>
      </section>
    </main>
  );
}
