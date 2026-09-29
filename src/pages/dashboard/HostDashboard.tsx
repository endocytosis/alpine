import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Home, BarChart3, Calendar, Trash2, Eye,
  MapPin, DollarSign, TrendingUp, Check, X as XIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/pricing';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Property, Booking } from '@/types';

type BookingWithProp = Booking & { property: Property };

export default function HostDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'properties' | 'bookings' | 'revenue' | 'add'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<BookingWithProp[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [propType, setPropType] = useState('resort');
  const [basePrice, setBasePrice] = useState('');
  const [maxGuests, setMaxGuests] = useState('4');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('1');
  const [amenities, setAmenities] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('properties').select('*').eq('host_id', user.id).order('created_at', { ascending: false })
      .then(({ data: props }) => {
        const p = props || [];
        setProperties(p);
        if (p.length > 0) {
          supabase.from('bookings').select('*, property:properties!bookings_property_id_fkey(*)')
            .in('property_id', p.map((x) => x.id))
            .order('created_at', { ascending: false })
            .then(({ data }) => setBookings((data || []) as BookingWithProp[]));
        }
        setLoading(false);
      });
  }, [user]);

  async function addProperty(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('properties').insert({
      title, description, city, state: state || null, country, property_type: propType,
      base_price: parseFloat(basePrice), max_guests: parseInt(maxGuests),
      bedrooms: parseInt(bedrooms), bathrooms: parseInt(bathrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
      images: imageUrls.split('\n').map((u) => u.trim()).filter(Boolean),
    });
    setSaving(false);
    if (!error) {
      setTab('properties');
      setTitle(''); setDescription(''); setCity(''); setState(''); setBasePrice('');
      const { data } = await supabase.from('properties').select('*').eq('host_id', user!.id).order('created_at', { ascending: false });
      setProperties(data || []);
    }
  }

  async function deleteProperty(id: string) {
    if (!confirm('Delete this property?')) return;
    await supabase.from('properties').delete().eq('id', id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }

  async function updateBookingStatus(id: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: status as any } : b)));
  }

  const totalRevenue = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').reduce((s, b) => s + b.total_price, 0);

  const monthlyData = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, b) => {
      const month = b.check_in.slice(0, 7);
      const existing = acc.find((a) => a.month === month);
      if (existing) { existing.revenue += b.total_price; existing.bookings += 1; }
      else acc.push({ month, revenue: b.total_price, bookings: 1 });
      return acc;
    }, [] as { month: string; revenue: number; bookings: number }[])
    .sort((a, b) => a.month.localeCompare(b.month));

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: BarChart3 },
    { id: 'add', label: 'Add Property', icon: Plus },
  ] as const;

  if (loading) return <div className="flex items-center justify-center py-32"><div className="h-6 w-6 border-2 border-ink border-t-transparent animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-section-tight sm:px-6 lg:px-8 animate-fade-in">
      <p className="poet-overline mb-2">Host</p>
      <h1 className="font-display text-heading-1 text-ink">Dashboard</h1>

      {/* Stats */}
      <div className="mt-8 mb-8 grid gap-px bg-line sm:grid-cols-4 border border-line">
        {[
          { label: 'Properties', value: properties.length, icon: Home },
          { label: 'Total Bookings', value: bookings.length, icon: Calendar },
          { label: 'Revenue', value: formatCurrency(totalRevenue), icon: DollarSign },
          { label: 'Active', value: bookings.filter((b) => b.status === 'confirmed').length, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="bg-surface p-5">
            <s.icon className="h-5 w-5 text-ink-subtle mb-3" strokeWidth={1.5} />
            <p className="font-display text-heading-2 text-ink">{s.value}</p>
            <p className="poet-overline mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border border-line mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-medium whitespace-nowrap transition-colors duration-sharp ${
              tab === t.id ? 'bg-ink text-canvas' : 'bg-surface text-ink-muted hover:bg-surface-alt'
            }`}
          >
            <t.icon className="h-4 w-4" strokeWidth={1.5} />{t.label}
          </button>
        ))}
      </div>

      {/* Properties */}
      {tab === 'properties' && (
        properties.length === 0 ? (
          <div className="border border-line bg-surface py-16 text-center">
            <Home className="mx-auto h-8 w-8 text-ink-subtle" strokeWidth={1.5} />
            <p className="mt-4 font-display text-heading-3 text-ink">No properties yet</p>
            <p className="mt-1 text-body-sm text-ink-subtle">Add your first property to start hosting</p>
            <button onClick={() => setTab('add')} className="poet-btn-primary mt-4"><Plus className="h-4 w-4" strokeWidth={1.5} /> Add Property</button>
          </div>
        ) : (
          <div className="space-y-0 border border-line divide-y divide-line">
            {properties.map((p) => (
              <div key={p.id} className="flex gap-4 bg-surface p-5">
                <img src={p.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} alt="" className="h-24 w-32 object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-heading-3 text-ink">{p.title}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-body-sm text-ink-subtle"><MapPin className="h-3 w-3" strokeWidth={1.5} />{p.city}, {p.country}</p>
                    </div>
                    <span className={`${p.status === 'active' ? 'poet-badge-accent' : 'poet-badge-neutral'} capitalize`}>{p.status}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-body-sm text-ink-subtle">
                    <span className="font-semibold text-ink">{formatCurrency(p.base_price)}/night</span>
                    <span>{p.bedrooms} bed &middot; {p.bathrooms} bath &middot; {p.max_guests} guests</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/properties/${p.id}`} className="poet-btn-ghost !px-2 !py-1 text-overline"><Eye className="h-3 w-3" strokeWidth={1.5} /> View</Link>
                    <button onClick={() => deleteProperty(p.id)} className="poet-btn-danger !px-2 !py-1 text-overline"><Trash2 className="h-3 w-3" strokeWidth={1.5} /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        bookings.length === 0 ? (
          <div className="border border-line bg-surface py-16 text-center">
            <Calendar className="mx-auto h-8 w-8 text-ink-subtle" strokeWidth={1.5} />
            <p className="mt-4 text-body-sm text-ink-subtle">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-0 border border-line divide-y divide-line">
            {bookings.map((b) => (
              <div key={b.id} className="bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-heading-3 text-ink">{b.property?.title}</p>
                    <p className="text-body-sm text-ink-subtle">
                      {formatDate(b.check_in)} &ndash; {formatDate(b.check_out)} &middot; {b.guests_count} guest{b.guests_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink">{formatCurrency(b.total_price)}</p>
                    <span className={`inline-block mt-1 ${b.status === 'confirmed' ? 'poet-badge-accent' : b.status === 'pending' ? 'poet-badge-warning' : 'poet-badge-danger'} capitalize`}>{b.status}</span>
                  </div>
                </div>
                {b.status === 'pending' && (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="poet-btn-primary !py-1.5 !px-3 text-overline"><Check className="h-3 w-3" strokeWidth={2} /> Approve</button>
                    <button onClick={() => updateBookingStatus(b.id, 'declined')} className="poet-btn-outline !py-1.5 !px-3 text-overline text-danger"><XIcon className="h-3 w-3" strokeWidth={2} /> Decline</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Revenue */}
      {tab === 'revenue' && (
        <div className="space-y-6">
          <div className="border border-line bg-surface p-6">
            <p className="poet-overline mb-4">Revenue Overview</p>
            {monthlyData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--poet-color-line)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--poet-color-ink-subtle)' }} stroke="var(--poet-color-line)" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--poet-color-ink-subtle)' }} stroke="var(--poet-color-line)" tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ border: '1px solid var(--poet-color-line)', borderRadius: 0, background: 'var(--poet-color-surface)' }} />
                    <Bar dataKey="revenue" fill="var(--poet-color-ink)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-body-sm text-ink-subtle">No revenue data yet.</p>
            )}
          </div>
          <div className="border border-line bg-surface p-6">
            <p className="poet-overline mb-4">Revenue by Property</p>
            <div className="space-y-0 divide-y divide-line">
              {properties.map((p) => {
                const rev = bookings.filter((b) => b.property_id === p.id && (b.status === 'confirmed' || b.status === 'completed')).reduce((s, b) => s + b.total_price, 0);
                const count = bookings.filter((b) => b.property_id === p.id && (b.status === 'confirmed' || b.status === 'completed')).length;
                return (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-body-sm font-medium text-ink">{p.title}</p>
                      <p className="text-overline text-ink-subtle">{count} booking{count !== 1 ? 's' : ''}</p>
                    </div>
                    <p className="font-semibold text-ink">{formatCurrency(rev)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Property */}
      {tab === 'add' && (
        <form onSubmit={addProperty} className="border border-line bg-surface p-6">
          <p className="poet-overline mb-4">Add New Property</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="poet-overline mb-1 block">Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="poet-input" placeholder="Beautiful Beachfront Resort" />
            </div>
            <div className="sm:col-span-2">
              <label className="poet-overline mb-1 block">Description</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="poet-input resize-none" placeholder="Describe your property..." />
            </div>
            <div>
              <label className="poet-overline mb-1 block">City</label>
              <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="poet-input" />
            </div>
            <div>
              <label className="poet-overline mb-1 block">State/Region</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="poet-input" />
            </div>
            <div>
              <label className="poet-overline mb-1 block">Country</label>
              <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="poet-input" />
            </div>
            <div>
              <label className="poet-overline mb-1 block">Type</label>
              <select value={propType} onChange={(e) => setPropType(e.target.value)} className="poet-input">
                {['resort','villa','cabin','hotel','apartment','cottage'].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="poet-overline mb-1 block">Base Price / Night</label>
              <input type="number" required min="1" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="poet-input" placeholder="$250" />
            </div>
            <div>
              <label className="poet-overline mb-1 block">Max Guests</label>
              <input type="number" required min="1" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className="poet-input" />
            </div>
            <div>
              <label className="poet-overline mb-1 block">Bedrooms</label>
              <input type="number" required min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="poet-input" />
            </div>
            <div>
              <label className="poet-overline mb-1 block">Bathrooms</label>
              <input type="number" required min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="poet-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="poet-overline mb-1 block">Amenities <span className="normal-case tracking-normal font-normal text-ink-subtle">(comma separated)</span></label>
              <input type="text" value={amenities} onChange={(e) => setAmenities(e.target.value)} className="poet-input" placeholder="WiFi, Pool, Spa, Kitchen" />
            </div>
            <div className="sm:col-span-2">
              <label className="poet-overline mb-1 block">Image URLs <span className="normal-case tracking-normal font-normal text-ink-subtle">(one per line)</span></label>
              <textarea value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} rows={3} className="poet-input resize-none" placeholder="https://images.unsplash.com/..." />
            </div>
          </div>
          <button type="submit" disabled={saving} className="poet-btn-primary mt-6">
            {saving ? 'Saving...' : 'Add Property'}
          </button>
        </form>
      )}
    </div>
  );
}
