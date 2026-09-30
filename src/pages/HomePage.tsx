import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight, Star, Shield, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/PropertyCard';
import type { Property } from '@/types';

const PROPERTY_TYPES = [
  { label: 'Lodges & Resorts', value: 'resort' },
  { label: 'Mountain Villas', value: 'villa' },
  { label: 'Cabins & Chalets', value: 'cabin' },
  { label: 'Historic Inns', value: 'hotel' },
  { label: 'Lofts & Apartments', value: 'apartment' },
  { label: 'Forest Cottages', value: 'cottage' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('base_price', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setFeatured(data || []);
        setLoading(false);
      });
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/properties?${params.toString()}`);
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <img
            src="/image.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
          <div className="max-w-3xl">
            <p className="poet-overline text-accent mb-6">Mountain retreats across the American West & New England</p>
            <h1 className="poet-display text-display-lg text-surface">
              Seek safer<br />
              <span className="italic">ground</span>
            </h1>
            <p className="mt-6 text-body-lg text-line max-w-xl" style={{ lineHeight: 1.7 }}>
              Handpicked cabins, lodges, and mountain estates in Colorado, the Pacific Northwest, Northern California, and New England.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-12 border border-line/30 bg-surface p-1.5 sm:flex sm:items-end sm:gap-0"
          >
            <div className="flex-1 px-3 py-2 sm:py-3">
              <label className="poet-overline mb-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />Location
              </label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-0 bg-transparent p-0 text-body-sm text-ink placeholder:text-ink-subtle focus:outline-none"
              />
            </div>
            <div className="hidden sm:block h-10 w-px bg-line" />
            <div className="flex-1 px-3 py-2 sm:py-3">
              <label className="poet-overline mb-1 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />Check In
              </label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full border-0 bg-transparent p-0 text-body-sm text-ink placeholder:text-ink-subtle focus:outline-none" />
            </div>
            <div className="hidden sm:block h-10 w-px bg-line" />
            <div className="flex-1 px-3 py-2 sm:py-3">
              <label className="poet-overline mb-1 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />Check Out
              </label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full border-0 bg-transparent p-0 text-body-sm text-ink placeholder:text-ink-subtle focus:outline-none" />
            </div>
            <div className="hidden sm:block h-10 w-px bg-line" />
            <div className="flex-1 px-3 py-2 sm:py-3">
              <label className="poet-overline mb-1 flex items-center gap-1.5">
                <Users className="h-3 w-3" strokeWidth={1.5} />Guests
              </label>
              <input type="number" min="1" max="20" placeholder="Add guests" value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full border-0 bg-transparent p-0 text-body-sm text-ink placeholder:text-ink-subtle focus:outline-none" />
            </div>
            <button type="submit" className="poet-btn-accent mt-2 w-full sm:mt-0 sm:w-auto !px-6 !py-3.5">
              <Search className="h-4 w-4" strokeWidth={2} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-section-tight sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="poet-overline mb-2">Browse</p>
            <h2 className="font-display text-heading-1 text-ink">By type</h2>
          </div>
          <button onClick={() => navigate('/properties')} className="poet-btn-ghost text-body-sm group">
            View all <ArrowRight className="h-4 w-4 transition-transform duration-sharp group-hover:translate-x-0.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-6 border border-line">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => navigate(`/properties?type=${type.value}`)}
              className="group flex flex-col items-center justify-center bg-surface px-4 py-8 transition-colors duration-sharp hover:bg-surface-alt"
            >
              <span className="text-body-sm font-semibold text-ink-muted group-hover:text-ink transition-colors duration-sharp">
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-section-tight sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="poet-overline mb-2">Curated</p>
            <h2 className="font-display text-heading-1 text-ink">Featured Properties</h2>
          </div>
          <button onClick={() => navigate('/properties')} className="poet-btn-ghost text-body-sm group">
            View all <ArrowRight className="h-4 w-4 transition-transform duration-sharp group-hover:translate-x-0.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 border border-line">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface">
                  <div className="aspect-[4/3] bg-surface-alt animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-surface-alt animate-pulse" />
                    <div className="h-3 w-1/2 bg-surface-alt animate-pulse" />
                  </div>
                </div>
              ))
            : featured.map((p) => <PropertyCard key={p.id} property={p} />)
          }
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-line bg-surface py-section-tight">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'Personally Vetted', desc: 'Every property is visited by our team to ensure it meets Alpine standards for quality and setting.' },
              { icon: Star, title: 'Summit-Level Stays', desc: 'Our guests consistently rate their mountain experiences five stars across every region we serve.' },
              { icon: Globe, title: 'Four Iconic Regions', desc: 'Colorado peaks, Pacific Northwest forests, Northern California volcanics, and New England ridgelines.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto h-6 w-6 text-ink" strokeWidth={1.5} />
                <h3 className="mt-4 text-heading-3 font-display text-ink">{title}</h3>
                <p className="mt-2 text-body-sm text-ink-subtle leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
