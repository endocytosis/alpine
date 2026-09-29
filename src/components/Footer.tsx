import { Link } from 'react-router-dom';
import { Mountain } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-surface">
      <div className="mx-auto max-w-7xl px-4 py-section-tight sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Mountain className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <span className="font-display text-lg text-surface">Alpine</span>
            </Link>
            <p className="mt-4 text-body-sm leading-relaxed text-ink-subtle" style={{ color: '#6B6B6B' }}>
              Discover and book extraordinary resorts, villas, and unique stays around the world.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="poet-overline" style={{ color: '#6B6B6B' }}>Explore</p>
            <ul className="mt-4 space-y-3 text-body-sm">
              {[
                { label: 'All Properties', to: '/properties' },
                { label: 'Resorts', to: '/properties?type=resort' },
                { label: 'Villas', to: '/properties?type=villa' },
                { label: 'Cabins', to: '/properties?type=cabin' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-line transition-colors duration-sharp hover:text-surface">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="poet-overline" style={{ color: '#6B6B6B' }}>Company</p>
            <ul className="mt-4 space-y-3 text-body-sm">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <span className="text-line cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="poet-overline" style={{ color: '#6B6B6B' }}>Contact</p>
            <ul className="mt-4 space-y-3 text-body-sm text-line">
              <li>hello@alpine.com</li>
              <li>+1 (555) 123-4567</li>
              <li>San Francisco, CA</li>
            </ul>
          </div>
        </div>

        <div className="poet-divider mt-12 pt-8 text-center" style={{ borderColor: '#3D3D3D' }}>
          <p className="text-overline tracking-wider" style={{ color: '#6B6B6B' }}>
            &copy; {new Date().getFullYear()} Alpine. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
