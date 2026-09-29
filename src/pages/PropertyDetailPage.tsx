import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Users, Bed, Bath, ChevronLeft, ChevronRight,
  Shield, Check, Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, calculatePricing } from '@/lib/pricing';
import { useAuth } from '@/contexts/AuthContext';
import type { Property, Review, PricingRule } from '@/types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('properties').select('*, host:profiles!properties_host_id_fkey(*)').eq('id', id).maybeSingle(),
      supabase.from('reviews').select('*, guest:profiles!reviews_guest_id_fkey(*)').eq('property_id', id).order('created_at', { ascending: false }),
      supabase.from('pricing_rules').select('*').eq('property_id', id),
    ]).then(([propRes, revRes, priceRes]) => {
      setProperty(propRes.data);
      setReviews(revRes.data || []);
      setPricingRules(priceRes.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-section-tight sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="h-6 w-64 bg-surface-alt animate-pulse" />
          <div className="aspect-[2/1] bg-surface-alt animate-pulse" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="font-display text-heading-2 text-ink">Property not found</h2>
        <button onClick={() => navigate('/properties')} className="poet-btn-primary mt-6">Browse Properties</button>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const pricing = checkIn && checkOut ? calculatePricing(property.base_price, checkIn, checkOut, pricingRules) : null;
  const cancellationLabel: Record<string, string> = {
    flexible: 'Free cancellation up to 24 hours before check-in',
    moderate: 'Free cancellation up to 5 days before check-in',
    strict: 'Non-refundable after booking confirmation',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="poet-overline mb-2 capitalize">{property.property_type}</p>
          <h1 className="font-display text-heading-1 text-ink">{property.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-body-sm text-ink-subtle">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" strokeWidth={1.5} />{property.city}{property.state ? `, ${property.state}` : ''}, {property.country}</span>
            {reviews.length > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setLiked(!liked)} className={`p-2 border transition-colors duration-sharp ${liked ? 'border-danger bg-danger/5 text-danger' : 'border-line text-ink-subtle hover:border-line-strong'}`}>
          <Heart className={`h-5 w-5 ${liked ? 'fill-danger' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Gallery */}
      <div className="relative mb-10 overflow-hidden border border-line">
        <div className="aspect-[2/1]">
          <img src={property.images[imageIndex] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} alt={property.title} className="h-full w-full object-cover" />
        </div>
        {property.images.length > 1 && (
          <>
            <button onClick={() => setImageIndex((i) => (i - 1 + property.images.length) % property.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-surface/90 p-2 border border-line backdrop-blur-sm transition-colors duration-fast hover:bg-surface">
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button onClick={() => setImageIndex((i) => (i + 1) % property.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface/90 p-2 border border-line backdrop-blur-sm transition-colors duration-fast hover:bg-surface">
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {property.images.map((_, i) => (
                <button key={i} onClick={() => setImageIndex(i)} className={`h-1.5 transition-all duration-sharp ${i === imageIndex ? 'w-6 bg-surface' : 'w-1.5 bg-surface/50 hover:bg-surface/70'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 border-b border-line pb-8">
            {[
              { icon: Users, label: `${property.max_guests} guests` },
              { icon: Bed, label: `${property.bedrooms} bedroom${property.bedrooms !== 1 ? 's' : ''}` },
              { icon: Bath, label: `${property.bathrooms} bathroom${property.bathrooms !== 1 ? 's' : ''}` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-body-sm text-ink-muted">
                <Icon className="h-4 w-4 text-ink-subtle" strokeWidth={1.5} />{label}
              </div>
            ))}
          </div>

          {/* Host */}
          {property.host && (
            <div className="flex items-center gap-4 border border-line p-5">
              <div className="flex h-12 w-12 items-center justify-center bg-surface-alt font-display text-lg text-ink">
                {property.host.full_name?.charAt(0) || 'H'}
              </div>
              <div>
                <p className="text-body-sm font-semibold text-ink">Hosted by {property.host.full_name}</p>
                <p className="text-overline text-ink-subtle">Member since {formatDate(property.host.created_at)}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="font-display text-heading-2 text-ink mb-4">About this property</h2>
            <p className="text-body text-ink-muted leading-relaxed poet-prose-wide">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-display text-heading-2 text-ink mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 border border-line">
              {property.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 bg-surface px-4 py-3 text-body-sm text-ink-muted">
                  <Check className="h-4 w-4 text-accent" strokeWidth={2} />{a}
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation */}
          <div className="border-l-2 border-ink px-4 py-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 mt-0.5 text-ink" strokeWidth={1.5} />
              <div>
                <p className="text-body-sm font-semibold text-ink capitalize">{property.cancellation_policy} Cancellation</p>
                <p className="mt-1 text-body-sm text-ink-subtle">{cancellationLabel[property.cancellation_policy]}</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-display text-heading-2 text-ink mb-4">
              Reviews {reviews.length > 0 && <span className="text-ink-subtle font-sans text-body-sm font-normal">({reviews.length})</span>}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-body-sm text-ink-subtle">No reviews yet. Be the first to review this property.</p>
            ) : (
              <div className="space-y-0 border border-line divide-y divide-line">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-surface p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center bg-surface-alt text-body-sm font-semibold text-ink-muted">
                          {r.guest?.full_name?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <p className="text-body-sm font-semibold text-ink">{r.guest?.full_name || 'Guest'}</p>
                          <p className="text-overline text-ink-subtle">{formatDate(r.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-warning text-warning' : 'text-line'}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-3 text-body-sm text-ink-muted leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 border border-line bg-surface p-6">
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-heading-2 text-ink">{formatCurrency(property.base_price)}</span>
              <span className="text-body-sm text-ink-subtle">/ night</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="poet-overline mb-1 block">Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="poet-input !py-2.5 !text-body-sm" />
                </div>
                <div>
                  <label className="poet-overline mb-1 block">Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="poet-input !py-2.5 !text-body-sm" />
                </div>
              </div>
              <div>
                <label className="poet-overline mb-1 block">Guests</label>
                <input type="number" min="1" max={property.max_guests} value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} className="poet-input !py-2.5 !text-body-sm" />
              </div>
            </div>

            {pricing && pricing.nights > 0 && (
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                <div className="flex justify-between text-body-sm">
                  <span className="text-ink-subtle">{formatCurrency(property.base_price)} x {pricing.nights} night{pricing.nights !== 1 ? 's' : ''}</span>
                  <span className="text-ink">{formatCurrency(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-ink-subtle">Service fee</span>
                  <span className="text-ink">{formatCurrency(pricing.fees)}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-ink-subtle">Taxes</span>
                  <span className="text-ink">{formatCurrency(pricing.taxes)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-body-sm text-accent-ink">
                    <span>Discount</span>
                    <span>-{formatCurrency(pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2 text-body font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(pricing.total)}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (!user) { navigate('/login'); return; }
                if (!checkIn || !checkOut) return;
                navigate(`/checkout/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
              }}
              className="poet-btn-accent mt-4 w-full !py-3.5"
              disabled={!checkIn || !checkOut}
            >
              {!checkIn || !checkOut ? 'Select dates to book' : user ? 'Reserve Now' : 'Sign in to Book'}
            </button>

            <p className="mt-3 text-center text-overline text-ink-subtle">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
