import { useEffect, useState } from 'react';
import {
  Users as UsersIcon, Home, Calendar, Tag, BarChart3,
  Shield, Trash2, DollarSign, TrendingUp, Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/pricing';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import type { Profile, Property, Booking, PromoCode } from '@/types';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'users' | 'properties' | 'bookings' | 'promos'>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<(Booking & { property?: Property; guest?: Profile })[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*, property:properties!bookings_property_id_fkey(*), guest:profiles!bookings_guest_id_fkey(*)').order('created_at', { ascending: false }),
      supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
    ]).then(([u, p, b, pr]) => {
      setUsers(u.data || []);
      setProperties(p.data || []);
      setBookings((b.data || []) as any);
      setPromos(pr.data || []);
      setLoading(false);
    });
  }, []);

  const totalGMV = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').reduce((s, b) => s + b.total_price, 0);
  const activeBookings = bookings.filter((b) => b.status === 'confirmed').length;

  const monthlyBookings = bookings.reduce((acc, b) => {
    const m = b.created_at.slice(0, 7);
    const existing = acc.find((a) => a.month === m);
    if (existing) existing.count += 1;
    else acc.push({ month: m, count: 1 });
    return acc;
  }, [] as { month: string; count: number }[]).sort((a, b) => a.month.localeCompare(b.month));

  async function updateUserRole(userId: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: role as any } : u)));
  }

  async function deleteProperty(id: string) {
    if (!confirm('Delete this property?')) return;
    await supabase.from('properties').delete().eq('id', id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }

  async function createPromo(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from('promo_codes').insert({
      code: newCode.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt || null,
    }).select().single();
    if (!error && data) {
      setPromos((prev) => [data, ...prev]);
      setNewCode(''); setDiscountValue(''); setMaxUses(''); setExpiresAt('');
    }
  }

  async function deletePromo(id: string) {
    await supabase.from('promo_codes').delete().eq('id', id);
    setPromos((prev) => prev.filter((p) => p.id !== id));
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'promos', label: 'Promo Codes', icon: Tag },
  ] as const;

  if (loading) return <div className="flex items-center justify-center py-32"><div className="h-6 w-6 border-2 border-ink border-t-transparent animate-spin" /></div>;

  const roleBadge: Record<string, string> = {
    admin: 'bg-danger/10 text-danger',
    host: 'poet-badge-accent',
    guest: 'poet-badge-neutral',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-section-tight sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-5 w-5 text-ink" strokeWidth={1.5} />
        <div>
          <p className="poet-overline">Administration</p>
          <h1 className="font-display text-heading-1 text-ink">Platform Overview</h1>
        </div>
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

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4 border border-line">
            {[
              { label: 'Total GMV', value: formatCurrency(totalGMV), icon: DollarSign },
              { label: 'Total Users', value: users.length, icon: UsersIcon },
              { label: 'Total Properties', value: properties.length, icon: Home },
              { label: 'Active Bookings', value: activeBookings, icon: Activity },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-5">
                <s.icon className="h-5 w-5 text-ink-subtle mb-3" strokeWidth={1.5} />
                <p className="font-display text-heading-2 text-ink">{s.value}</p>
                <p className="poet-overline mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-line bg-surface p-6">
              <p className="poet-overline mb-4">Bookings Over Time</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--poet-color-line)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--poet-color-ink-subtle)' }} stroke="var(--poet-color-line)" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--poet-color-ink-subtle)' }} stroke="var(--poet-color-line)" />
                    <Tooltip contentStyle={{ border: '1px solid var(--poet-color-line)', borderRadius: 0, background: 'var(--poet-color-surface)' }} />
                    <Line type="monotone" dataKey="count" stroke="var(--poet-color-ink)" strokeWidth={2} dot={{ r: 3, fill: 'var(--poet-color-ink)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-line bg-surface p-6">
              <p className="poet-overline mb-4">Top Properties by Revenue</p>
              <div className="divide-y divide-line">
                {properties
                  .map((p) => ({
                    ...p,
                    revenue: bookings.filter((b) => b.property_id === p.id && (b.status === 'confirmed' || b.status === 'completed')).reduce((s, b) => s + b.total_price, 0),
                  }))
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center bg-surface-alt text-overline font-semibold text-ink">{i + 1}</span>
                        <span className="text-body-sm font-medium text-ink line-clamp-1">{p.title}</span>
                      </div>
                      <span className="text-body-sm font-semibold text-ink">{formatCurrency(p.revenue)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="border border-line bg-surface p-6">
            <p className="poet-overline mb-4">Promo Code Usage</p>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="pb-2 pr-4 poet-overline">Code</th>
                    <th className="pb-2 pr-4 poet-overline">Type</th>
                    <th className="pb-2 pr-4 poet-overline">Value</th>
                    <th className="pb-2 pr-4 poet-overline">Used</th>
                    <th className="pb-2 poet-overline">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="py-2 pr-4 font-mono font-semibold text-ink">{p.code}</td>
                      <td className="py-2 pr-4 capitalize text-ink-muted">{p.discount_type}</td>
                      <td className="py-2 pr-4 text-ink">{p.discount_type === 'percentage' ? `${p.discount_value}%` : formatCurrency(p.discount_value)}</td>
                      <td className="py-2 pr-4 text-ink-muted">{p.used_count}{p.max_uses ? `/${p.max_uses}` : ''}</td>
                      <td className="py-2 text-ink-muted">{p.expires_at ? formatDate(p.expires_at) : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left">
                  <th className="px-5 py-3 poet-overline">User</th>
                  <th className="px-5 py-3 poet-overline">Role</th>
                  <th className="px-5 py-3 poet-overline">Joined</th>
                  <th className="px-5 py-3 poet-overline">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0 hover:bg-surface-alt/50 transition-colors duration-sharp">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center bg-surface-alt font-display text-sm text-ink">{u.full_name?.charAt(0) || '?'}</div>
                        <div>
                          <p className="font-medium text-ink">{u.full_name}</p>
                          <p className="text-overline text-ink-subtle">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 text-overline font-semibold capitalize ${roleBadge[u.role] || 'poet-badge-neutral'}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-subtle">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      <select value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)} className="poet-input !py-1 !px-2 text-overline">
                        <option value="guest">Guest</option>
                        <option value="host">Host</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Properties */}
      {tab === 'properties' && (
        <div className="border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left">
                  <th className="px-5 py-3 poet-overline">Property</th>
                  <th className="px-5 py-3 poet-overline">Location</th>
                  <th className="px-5 py-3 poet-overline">Price</th>
                  <th className="px-5 py-3 poet-overline">Status</th>
                  <th className="px-5 py-3 poet-overline">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-alt/50 transition-colors duration-sharp">
                    <td className="px-5 py-3 font-medium text-ink">{p.title}</td>
                    <td className="px-5 py-3 text-ink-subtle">{p.city}, {p.country}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{formatCurrency(p.base_price)}/night</td>
                    <td className="px-5 py-3"><span className={`${p.status === 'active' ? 'poet-badge-accent' : 'poet-badge-neutral'} capitalize`}>{p.status}</span></td>
                    <td className="px-5 py-3"><button onClick={() => deleteProperty(p.id)} className="text-danger hover:text-danger/70 transition-colors duration-sharp"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div className="border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left">
                  <th className="px-5 py-3 poet-overline">ID</th>
                  <th className="px-5 py-3 poet-overline">Property</th>
                  <th className="px-5 py-3 poet-overline">Guest</th>
                  <th className="px-5 py-3 poet-overline">Dates</th>
                  <th className="px-5 py-3 poet-overline">Amount</th>
                  <th className="px-5 py-3 poet-overline">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-alt/50 transition-colors duration-sharp">
                    <td className="px-5 py-3 font-mono text-overline text-ink-subtle">{b.id.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-ink">{b.property?.title}</td>
                    <td className="px-5 py-3 text-ink-subtle">{b.guest?.full_name || b.guest?.email}</td>
                    <td className="px-5 py-3 text-ink-subtle">{formatDate(b.check_in)} &ndash; {formatDate(b.check_out)}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{formatCurrency(b.total_price)}</td>
                    <td className="px-5 py-3"><span className={`${b.status === 'confirmed' ? 'poet-badge-accent' : b.status === 'pending' ? 'poet-badge-warning' : 'poet-badge-danger'} capitalize`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Promos */}
      {tab === 'promos' && (
        <div className="space-y-6">
          <form onSubmit={createPromo} className="border border-line bg-surface p-6">
            <p className="poet-overline mb-4">Create New Promo Code</p>
            <div className="grid gap-4 sm:grid-cols-5">
              <input type="text" required value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="CODE" className="poet-input font-mono" />
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="poet-input">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              <input type="number" required min="1" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === 'percentage' ? '10%' : '$50'} className="poet-input" />
              <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Max uses" className="poet-input" />
              <button type="submit" className="poet-btn-primary">Create</button>
            </div>
          </form>
          <div className="border border-line bg-surface overflow-hidden">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left">
                  <th className="px-5 py-3 poet-overline">Code</th>
                  <th className="px-5 py-3 poet-overline">Discount</th>
                  <th className="px-5 py-3 poet-overline">Used</th>
                  <th className="px-5 py-3 poet-overline">Expires</th>
                  <th className="px-5 py-3 poet-overline">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-mono font-semibold text-ink">{p.code}</td>
                    <td className="px-5 py-3 text-ink">{p.discount_type === 'percentage' ? `${p.discount_value}%` : formatCurrency(p.discount_value)}</td>
                    <td className="px-5 py-3 text-ink-muted">{p.used_count}{p.max_uses ? `/${p.max_uses}` : ''}</td>
                    <td className="px-5 py-3 text-ink-muted">{p.expires_at ? formatDate(p.expires_at) : 'Never'}</td>
                    <td className="px-5 py-3"><button onClick={() => deletePromo(p.id)} className="text-danger hover:text-danger/70 transition-colors duration-sharp"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
