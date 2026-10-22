import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/accounts', label: 'Accounts' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/orders', label: 'Orders' },
];

export function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span className="brand-name">Contoso CRM</span>
        </div>
        <nav aria-label="Main">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="nav-link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <p className="sidebar-note">Demo data · resets on reload</p>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
