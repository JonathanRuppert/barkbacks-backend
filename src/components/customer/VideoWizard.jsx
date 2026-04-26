import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

const packages = [
  { id: 'single_video', name: 'Single Video', price: '$5', description: 'Perfect for one special moment.' },
  { id: 'video_3pack', name: '3-Video Pack', price: '$12', description: 'Capture a week of daycare adventures.' },
  { id: 'video_10pack', name: '10-Video Pack', price: '$35', description: 'Best value for frequent daycare visits.' },
];

function VideoWizard() {
  const { daycareId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('details');
  const [daycare, setDaycare] = useState(null);
  const [credits, setCredits] = useState(0);
  const [form, setForm] = useState({
    petName: '',
    breed: '',
    emotion: 'happy',
    activities: '',
    customerEmail: '',
    productType: 'single_video',
  });
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest(`/api/daycare/${daycareId}`),
      apiRequest(`/api/payment/credits/${daycareId}`).catch(() => ({ totalCredits: 0 })),
    ])
      .then(([daycareData, creditsData]) => {
        setDaycare(daycareData);
        setCredits(creditsData.totalCredits || 0);
      })
      .catch((err) => setError(err.message));
  }, [daycareId]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const uploadPhoto = async () => {
    if (!photo) return '';

    const data = new FormData();
    data.append('photo', photo);
    const response = await fetch(`${process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/customer/photos/upload`, {
      method: 'POST',
      body: data,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload photo');
    }
    setPhotoUrl(result.fileUrl);
    return result.fileUrl;
  };

  const startCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const checkout = await apiRequest('/api/payment/create-checkout-session', {
        method: 'POST',
        body: {
          productType: form.productType,
          daycareId,
          customerEmail: form.customerEmail,
          metadata: {
            petName: form.petName,
            breed: form.breed,
            emotion: form.emotion,
          },
        },
      });

      window.location.href = checkout.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const createVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const uploadedPhotoUrl = photoUrl || await uploadPhoto();
      const result = await apiRequest('/api/customer/videos/create', {
        method: 'POST',
        body: {
          daycareId,
          petName: form.petName,
          breed: form.breed,
          photoUrl: uploadedPhotoUrl,
          emotion: form.emotion,
          activities: form.activities
            .split(',')
            .map((activity) => activity.trim())
            .filter(Boolean),
        },
      });

      navigate(`/app/video/${result.jobId}`);
    } catch (err) {
      if (err.status === 402 || err.data?.requiresPayment) {
        setStep('payment');
        setError('Purchase a video package to continue.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="portal-page">
      <section className="auth-card wide-card">
        <p className="eyebrow">Create a BarkBack</p>
        <h1>{daycare ? `For ${daycare.daycareName}` : 'Build your pet video'}</h1>
        <p className="muted">Available daycare credits: {credits}</p>
        {error && <div className="error-box">{error}</div>}

        {step === 'details' ? (
          <form className="stacked-form" onSubmit={(event) => { event.preventDefault(); createVideo(); }}>
            <label>
              Pet name
              <input name="petName" value={form.petName} onChange={updateField} required />
            </label>
            <label>
              Breed
              <input name="breed" value={form.breed} onChange={updateField} placeholder="Golden Retriever" />
            </label>
            <label>
              Pet photo
              <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
            </label>
            <label>
              Story emotion
              <select name="emotion" value={form.emotion} onChange={updateField}>
                <option value="happy">Happy</option>
                <option value="playful">Playful</option>
                <option value="cozy">Cozy</option>
                <option value="adventurous">Adventurous</option>
              </select>
            </label>
            <label>
              Daycare activities
              <input name="activities" value={form.activities} onChange={updateField} placeholder="fetch, nap time, cuddle break" />
            </label>
            <button className="primary-button" disabled={loading}>{loading ? 'Creating...' : 'Create video'}</button>
          </form>
        ) : (
          <form className="stacked-form" onSubmit={(event) => { event.preventDefault(); startCheckout(); }}>
            <label>
              Email for receipt
              <input type="email" name="customerEmail" value={form.customerEmail} onChange={updateField} required />
            </label>
            <div className="package-grid">
              {packages.map((pkg) => (
                <label key={pkg.id} className={`package-card ${form.productType === pkg.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="productType"
                    value={pkg.id}
                    checked={form.productType === pkg.id}
                    onChange={updateField}
                  />
                  <strong>{pkg.name}</strong>
                  <span>{pkg.price}</span>
                  <small>{pkg.description}</small>
                </label>
              ))}
            </div>
            <button className="primary-button" disabled={loading}>{loading ? 'Redirecting...' : 'Continue to payment'}</button>
          </form>
        )}
      </section>
    </main>
  );
}

export default VideoWizard;
