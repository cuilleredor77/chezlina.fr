import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/la-carte', label: 'La carte' },
  { to: '/notre-histoire', label: 'L’histoire de Mama Lina' },
  { to: '/galerie', label: 'La maison en images' },
  { to: '/contact', label: 'Nous trouver' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <img className="brand-mark" src="/favicon.png" alt="" />
          <span>
            <span className="brand-name">Chezlina.fr</span>
            <span className="brand-tagline">Restaurant franco-africain · Brunoy</span>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Navigation principale">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/reservation" className="button button-primary header-cta">
          Réserver ou commander →
        </NavLink>

        <button className="nav-toggle" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
      </div>

      {open && (
        <div className="shell" style={{ paddingBottom: 18 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/reservation" className="button button-primary" onClick={() => setOpen(false)}>
              Réserver ou commander →
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}
