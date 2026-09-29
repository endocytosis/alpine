import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, MapPin, Calendar, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/pricing';
import type { Booking, Property } from '@/types';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<(Booking & { property: Property }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    supabase
      .from('bookings')
      .select('*, property:properties!bookings_property_id_fkey(*)')
      .eq('id', bookingId)
      .maybeSingle()
      .then(({ data }) => {
        setBooking(data as any);
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="h-6 w-6 border-2 border-ink border-t-transparent animate-spin" /></div>;

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="font-display text-heading-2 text-ink">Booking not found</h2>
        <Link to="/properties" className="poet-btn-primary mt-6">Browse Properties</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-section-tight sm:px-6 animate-fade-in">
      <div className="text-center mb-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-accent">
          <Check className="h-6 w-6 text-accent-ink" strokeWidth={2} />
        </div>
        <h1 className="mt-6 font-display text-heading-1 text-ink">Booking Confirmed</h1>
        <p className="mt-2 text-body text-ink-subtle">Your reservation has been successfully placed.</p>
      </div>

      <div className="border border-line bg-surface">
        {/* ID + Status */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <p className="poet-overline">Booking ID</p>
            <p className="mt-0.5 font-mono text-body-sm font-semibold text-ink">{booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <span className={`poet-badge-${booking.status === 'confirmed' ? 'accent' : 'warning'} capitalize`}>
            {booking.status}
          </span>
        </div>

        {/* Property */}
        <div className="p-5 border-b border-line">
          <div className="flex gap-4">
            <img src={booking.property?.images?.[0]} alt="" className="h-20 w-28 object-cover" />
            <div>
              <h3 className="font-display text-heading-3 text-ink">{booking.property?.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-body-sm text-ink-subtle">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                {booking.property?.city}, {booking.property?.country}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-px bg-line border-b border-line">
          {[
            { icon: Calendar, label: 'Check-in', value: formatDate(booking.check_in) },
            { icon: Calendar, label: 'Check-out', value: formatDate(booking.check_out) },
            { icon: Users, label: 'Guests', value: String(booking.guests_count) },
          ].map((item) => (
            <div key={item.label} className="bg-surface-alt p-4 flex items-start gap-2">
              <item.icon className="h-4 w-4 mt-0.5 text-ink-subtle" strokeWidth={1.5} />
              <div>
                <p className="poet-overline">{item.label}</p>
                <p className="text-body-sm font-medium text-ink">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="p-5 space-y-2">
          {booking.base_total != null && (
            <div className="flex justify-between text-body-sm"><span className="text-ink-subtle">Subtotal</span><span className="text-ink">{formatCurrency(booking.base_total)}</span></div>
          )}
          <div className="flex justify-between text-body-sm"><span className="text-ink-subtle">Fees</span><span className="text-ink">{formatCurrency(booking.fees)}</span></div>
          <div className="flex justify-between text-body-sm"><span className="text-ink-subtle">Taxes</span><span className="text-ink">{formatCurrency(booking.taxes)}</span></div>
          {booking.discount > 0 && (
            <div className="flex justify-between text-body-sm text-accent-ink"><span>Discount</span><span>-{formatCurrency(booking.discount)}</span></div>
          )}
          <div className="poet-divider-strong my-2" />
          <div className="flex justify-between text-body font-semibold"><span>Total Paid</span><span>{formatCurrency(booking.total_price)}</span></div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/dashboard/guest" className="poet-btn-outline flex-1 justify-center">My Bookings</Link>
        <Link to="/properties" className="poet-btn-primary flex-1 justify-center">Continue Exploring</Link>
      </div>
    </div>
  );
}
