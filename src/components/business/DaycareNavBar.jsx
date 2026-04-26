import { NavLink } from 'react-router-dom';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext.jsx';

export default function DaycareNavBar() {
  const { daycare, logout } = useBusinessAuth();

  return (
    <aside className="business-sidebar">
      <div>
        <p className="eyebrow">BarkBacks Business</p>
        <h2>{daycare?.daycareName || 'Daycare'}</h2>
      </div>

      <nav>
        <NavLink to="/business/dashboard">Dashboard</NavLink>
        <NavLink to="/business/videos">Videos</NavLink>
        <NavLink to="/business/analytics">Analytics</NavLink>
        <NavLink to="/business/customers">Customers</NavLink>
      </nav>

      <button className="secondary-button" type="button" onClick={logout}>
        Log out
      </button>
    </aside>
  );
}
