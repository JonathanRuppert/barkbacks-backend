import { Link, NavLink } from 'react-router-dom';

function PublicNavBar() {
  return (
    <header className="public-nav">
      <Link className="brand" to="/">
        <span className="brand-mark">B</span>
        BarkBacks
      </Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/for-businesses">For Businesses</NavLink>
        <Link className="nav-button secondary" to="/app/login">Customer Login</Link>
        <Link className="nav-button" to="/business/login">Business Login</Link>
      </nav>
    </header>
  );
}

export default PublicNavBar;
