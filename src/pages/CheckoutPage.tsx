import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, CreditCard, MapPin, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { calculatePricing, formatCurrency, formatDate } from '@/lib/pricing';
import type { Property, PricingRule, PromoCode } from '@/types';

export default function CheckoutPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsCount = parseInt(searchParams.get('guests') || '1');

  const [property, setProperty] = useState<Property | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState(profile?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!propertyId || !checkIn || !checkOut) { navigate('/properties'); return; }
    Promise.all([
      supabase.from('properties').select('*').eq('id', propertyId).maybeSingle(),
      supabase.from('pricing_rules').select('*').eq('property_id', propertyId),
    ]).then(([propRes, priceRes]) => {
      if (!propRes.data) { navigate('/properties'); return; }
      setProperty(propRes.data);
      setPricingRules(priceRes.data || []);
      setLoading(false);
    });
  }, [propertyId, checkIn, checkOut, user]);

  const pricing = property
    ? calculatePricing(property.base_price, checkIn, checkOut, pricingRules, appliedPromo ? { type: appliedPromo.discount_type, value: appliedPromo.discount_value } : undefined)
    : null;

  async function applyPromo() {
    setPromoError('');
    if (!promoCode.trim()) return;
    const { data } = await supabase.from('promo_codes').select('*').eq('code', promoCode.trim().toUpperCase()).maybeSingle();
    if (!data) { setPromoError('Invalid promo code'); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setPromoError('This code has expired'); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { setPromoError('Usage limit reached'); return; }
    setAppliedPromo(data);
  }

  async function handleBooking() {
    if (!property || !pricing || !user) return;
    setSubmitting(true);
    const { data: booking, error } = await supabase.from('bookings').insert({
      property_id: property.id,
      check_in: checkIn, check_out: checkOut,
      guests_count: guestsCount,
      total_price: pricing.total, base_total: pricing.subtotal,
      fees: pricing.fees, taxes: pricing.taxes, discount: pricing.discount,
      status: property.booking_mode === 'instant' ? 'confirmed' : 'pending',
      promo_code_id: appliedPromo?.id || null,
      special_requests: specialRequests || null,
    }).select().single();
    if (error) { setSubmitting(false); alert('Booking failed. Please try again.'); return; }
    if (appliedPromo) {
      await supabase.from('promo_codes').update({ used_count: appliedPromo.used_count + 1 }).eq('id', appliedPromo.id);
    }
    navigate(`/booking-confirmation/${booking.id}`);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="h-6 w-6 border-2 border-ink border-t-transparent animate-spin" /></div>;
  }
  if (!property || !pricing) return null;

  const steps = [{ num: 1, label: 'Review' }, { num: 2, label: 'Details' }, { num: 3, label: 'Payment' }];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="poet-btn-ghost mb-4 -ml-2">
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Back
      </button>

      <h1 className="font-display text-heading-1 text-ink">Complete your booking</h1>

      {/* Steps */}
      <div className="mt-6 mb-8 flex items-center gap-3">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center text-overline font-bold transition-colors duration-sharp ${step >= s.num ? 'bg-ink text-canvas' : 'bg-surface-alt text-ink-subtle'}`}>
              {step > s.num ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : s.num}
            </div>
            <span className={`text-body-sm font-medium ${step >= s.num ? 'text-ink' : 'text-ink-subtle'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`mx-2 h-px w-10 ${step > s.num ? 'bg-ink' : 'bg-line'}`} />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-slide-up space-y-6">
              <div className="border border-line bg-surface p-6">
                <p className="poet-overline mb-4">Booking Summary</p>
                <div className="flex gap-4">
                  <img src={property.images[0]} alt="" className="h-24 w-32 object-cover" />
                  <div>
                    <h3 className="font-display text-heading-3 text-ink">{property.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-body-sm text-ink-subtle"><MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />{property.city}, {property.country}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-px bg-line border border-line">
                  {[
                    { label: 'Check-in', value: formatDate(checkIn) },
                    { label: 'Check-out', value: formatDate(checkOut) },
                    { label: 'Guests', value: String(guestsCount) },
                  ].map((item) => (
                    <div key={item.label} className="bg-surface-alt p-3">
                      <p className="poet-overline">{item.label}</p>
                      <p className="mt-0.5 text-body-sm font-medium text-ink">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-line bg-surface p-6">
                <p className="poet-overline mb-3">Promo Code</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.5} />
                    <input type="text" placeholder="Enter code" value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }} className="poet-input !pl-10" disabled={!!appliedPromo} />
                  </div>
                  {appliedPromo ? (
                    <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="poet-btn-outline">Remove</button>
                  ) : (
                    <button onClick={applyPromo} className="poet-btn-primary">Apply</button>
                  )}
                </div>
                {promoError && <p className="mt-2 text-body-sm text-danger">{promoError}</p>}
                {appliedPromo && (
                  <p className="mt-2 flex items-center gap-1 text-body-sm text-accent-ink">
                    <Check className="h-4 w-4 text-accent" strokeWidth={2} />
                    {appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}% off` : `${formatCurrency(appliedPromo.discount_value)} off`} applied
                  </p>
                )}
              </div>
              <button onClick={() => setStep(2)} className="poet-btn-primary w-full">Continue to Guest Details</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="animate-slide-up space-y-6">
              <div className="border border-line bg-surface p-6">
                <p className="poet-overline mb-4">Guest Details</p>
                <div className="space-y-4">
                  <div>
                    <label className="poet-overline mb-1 block">Full Name</label>
                    <input type="text" value={profile?.full_name || ''} disabled className="poet-input !bg-surface-alt !text-ink-subtle" />
                  </div>
                  <div>
                    <label className="poet-overline mb-1 block">Email</label>
                    <input type="email" value={profile?.email || user?.email || ''} disabled className="poet-input !bg-surface-alt !text-ink-subtle" />
                  </div>
                  <div>
                    <label className="poet-overline mb-1 block">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="poet-input" />
                  </div>
                  <div>
                    <label className="poet-overline mb-1 block">Special Requests <span className="normal-case tracking-normal font-normal text-ink-subtle">(optional)</span></label>
                    <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Any special requests..." rows={3} className="poet-input resize-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="poet-btn-outline flex-1">Back</button>
                <button onClick={() => setStep(3)} className="poet-btn-primary flex-1">Continue to Payment</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="animate-slide-up space-y-6">
              <div className="border border-line bg-surface p-6">
                <p className="poet-overline mb-4">Payment</p>
                <div className="poet-alert-warning mb-4">
                  <strong>Demo Mode:</strong> Payment processing is simulated. In production, Stripe Elements would appear here.
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="poet-overline mb-1 block">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.5} />
                      <input type="text" placeholder="4242 4242 4242 4242" className="poet-input !pl-10" maxLength={19} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="poet-overline mb-1 block">Expiry</label><input type="text" placeholder="MM/YY" className="poet-input" maxLength={5} /></div>
                    <div><label className="poet-overline mb-1 block">CVC</label><input type="text" placeholder="123" className="poet-input" maxLength={4} /></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="poet-btn-outline flex-1">Back</button>
                <button onClick={handleBooking} disabled={submitting} className="poet-btn-accent flex-1">
                  {submitting ? 'Processing...' : `Pay ${formatCurrency(pricing.total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 border border-line bg-surface p-6">
            <p className="poet-overline mb-4">Price Breakdown</p>
            <div className="space-y-2.5">
              <div className="flex justify-between text-body-sm"><span className="text-ink-subtle">{formatCurrency(property.base_price)} x {pricing.nights} night{pricing.nights !== 1 ? 's' : ''}</span><span className="text-ink">{formatCurrency(pricing.subtotal)}</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-ink-subtle">Service fee (12%)</span><span className="text-ink">{formatCurrency(pricing.fees)}</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-ink-subtle">Taxes (8%)</span><span className="text-ink">{formatCurrency(pricing.taxes)}</span></div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-body-sm font-medium text-accent-ink"><span>Discount</span><span>-{formatCurrency(pricing.discount)}</span></div>
              )}
              <div className="poet-divider-strong my-2" />
              <div className="flex justify-between text-body font-semibold"><span>Total (USD)</span><span>{formatCurrency(pricing.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
