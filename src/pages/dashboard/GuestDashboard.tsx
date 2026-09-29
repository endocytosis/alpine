import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/pricing';
import type { Booking, Property } from '@/types';

type BookingWithProperty = Booking & { property: Property };

export default function GuestDashboard() {
  const { user, profile, updateProfile } = useAuth();
  const [bookings, setBookings] = useState<BookingWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bookings')
      .select('*, property:properties!bookings_property_id_fkey(*)')
      .eq('guest_id', user.id)
      .order('check_in', { ascending: false })
      .then(({ data }) => {
        setBookings((data || []) as BookingWithProperty[]);
        setLoading(false);
      });
  }, [user]);

  const now = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter((b) => b.check_in >= now && b.status !== 'cancelled');
  const past = bookings.filter((b) => b.check_in < now || b.status === 'cancelled');

  async function cancelBooking(id: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
  }

  async function saveProfile() {
    await updateProfile({ full_name: name, phone: phone || null });
    setEditingProfile(false);
  }

  const statusBadge: Record<string, string> = {
    confirmed: 'poet-badge-accent',
    pending: 'poet-badge-warning',
    cancelled: 'poet-badge-danger',
    completed: 'poet-badge-neutral',
    declined: 'poet-badge-danger',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-section-tight sm:px-6 lg:px-8 animate-fade-in">
      <p className="poet-overline mb-2">Dashboard</p>
      <h1 className="font-display text-heading-1 text-ink">Welcome back, {profile?.full_name?.split(' ')[0]}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* Profile */}
        <div className="lg:col-span-1">
          <div className="border border-line bg-surface p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center bg-surface-alt font-display text-xl text-ink">
                {profile?.full_name?.charAt(0) || 'G'}
              </div>
              <div>
                <p className="text-body font-semibold text-ink">{profile?.full_name}</p>
                <p className="text-body-sm text-ink-subtle">{profile?.email}</p>
              </div>
            </div>

            {editingProfile ? (
              <div className="mt-4 space-y-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="poet-input" placeholder="Full Name" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="poet-input" placeholder="Phone" />
                <div className="flex gap-2">
                  <button onClick={() => setEditingProfile(false)} className="poet-btn-outline flex-1">Cancel</button>
                  <button onClick={saveProfile} className="poet-btn-primary flex-1">Save</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditingProfile(true)} className="poet-btn-ghost mt-4 w-full">Edit Profile</button>
            )}

            <div className="mt-4 border-t border-line pt-4 space-y-2 text-body-sm">
              <div className="flex justify-between"><span className="text-ink-subtle">Total Bookings</span><span className="font-semibold text-ink">{bookings.length}</span></div>
              <div className="flex justify-between"><span className="text-ink-subtle">Member Since</span><span className="font-semibold text-ink">{profile?.created_at ? formatDate(profile.created_at) : '-'}</span></div>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="lg:col-span-2">
          <div className="flex border border-line mb-6">
            {([['upcoming', upcoming.length], ['past', past.length]] as const).map(([t, count]) => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`flex-1 py-2.5 text-body-sm font-medium capitalize transition-colors duration-sharp ${
                  tab === t ? 'bg-ink text-canvas' : 'bg-surface text-ink-muted hover:bg-surface-alt'
                }`}
              >
                {t} ({count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-ink border-t-transparent animate-spin" />
            </div>
          ) : (tab === 'upcoming' ? upcoming : past).length === 0 ? (
            <div className="border border-line bg-surface py-16 text-center">
              <Clock className="mx-auto h-8 w-8 text-ink-subtle" strokeWidth={1.5} />
              <p className="mt-4 text-body-sm text-ink-subtle">No {tab} bookings</p>
              <Link to="/properties" className="poet-btn-primary mt-4 inline-flex">Browse Properties</Link>
            </div>
          ) : (
            <div className="space-y-0 border border-line divide-y divide-line">
              {(tab === 'upcoming' ? upcoming : past).map((b) => (
                <div key={b.id} className="bg-surface p-5">
                  <div className="flex gap-4">
                    <Link to={`/properties/${b.property_id}`}>
                      <img src={b.property?.images?.[0]} alt="" className="h-20 w-28 object-cover" />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/properties/${b.property_id}`} className="font-display text-heading-3 text-ink hover:text-ink-muted transition-colors duration-sharp">{b.property?.title}</Link>
                          <p className="mt-0.5 flex items-center gap-1 text-body-sm text-ink-subtle"><MapPin className="h-3 w-3" strokeWidth={1.5} />{b.property?.city}, {b.property?.country}</p>
                        </div>
                        <span className={`${statusBadge[b.status] || 'poet-badge-neutral'} capitalize`}>{b.status}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-body-sm text-ink-subtle">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />{formatDate(b.check_in)} &ndash; {formatDate(b.check_out)}</span>
                        <span className="font-semibold text-ink">{formatCurrency(b.total_price)}</span>
                      </div>
                      {tab === 'upcoming' && b.status !== 'cancelled' && (
                        <button onClick={() => cancelBooking(b.id)} className="poet-btn-danger mt-2 !px-0 !py-0 text-overline">
                          <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} /> Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
