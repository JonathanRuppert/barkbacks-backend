import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext';

function Customers() {
  const { token } = useBusinessAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/daycare/customers', { token })
      .then((data) => setCustomers(data.customers || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <main className="dashboard-page"><p>Loading customers...</p></main>;
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">CRM</p>
          <h1>Customers</h1>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="card">
        {customers.length === 0 ? (
          <p className="muted">Customers appear here after purchases.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Spent</th>
                  <th>Videos</th>
                  <th>Credits</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>${((customer.totalSpent || 0) / 100).toFixed(2)}</td>
                    <td>{customer.totalVideos || 0}</td>
                    <td>{customer.creditsRemaining || 0}</td>
                    <td>
                      <Link to={`/business/customers/${customer.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Customers;
