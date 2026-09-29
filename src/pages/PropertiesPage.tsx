import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/PropertyCard';
import type { Property } from '@/types';

const TYPES = ['resort', 'villa', 'cabin', 'hotel', 'apartment', 'cottage'];
const AMENITY_OPTIONS = ['Hot Tub', 'Fireplace', 'Ski-in/Ski-out', 'Mountain Views', 'Sauna', 'Hiking Trails', 'Lake Access', 'Chef Kitchen', 'Heated Pool', 'Forest Setting', 'Wine Cellar', 'EV Charger'];

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProperties(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let results = [...properties];
    if (location) {
      const q = location.toLowerCase();
      results = results.filter((p) =>
        p.city.toLowerCase().includes(q) || (p.state?.toLowerCase().includes(q)) || p.country.toLowerCase().includes(q)
      );
    }
    if (selectedType) results = results.filter((p) => p.property_type === selectedType);
    if (guests) results = results.filter((p) => p.max_guests >= parseInt(guests));
    if (minPrice) results = results.filter((p) => p.base_price >= parseFloat(minPrice));
    if (maxPrice) results = results.filter((p) => p.base_price <= parseFloat(maxPrice));
    if (selectedAmenities.length > 0) results = results.filter((p) => selectedAmenities.every((a) => p.amenities.includes(a)));
    return results;
  }, [properties, location, selectedType, guests, minPrice, maxPrice, selectedAmenities]);

  const paginated = filtered.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  function clearFilters() {
    setLocation(''); setGuests(''); setSelectedType(''); setMinPrice(''); setMaxPrice(''); setSelectedAmenities([]);
  }

  const activeFilterCount = [location, selectedType, guests, minPrice, maxPrice].filter(Boolean).length + selectedAmenities.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-section-tight sm:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="poet-overline mb-2">Discover</p>
        <h1 className="font-display text-heading-1 text-ink">Properties</h1>
      </div>

      {/* Search + Filters bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="poet-input !pl-10"
          />
        </div>
        <input type="number" min="1" placeholder="Guests" value={guests} onChange={(e) => setGuests(e.target.value)} className="poet-input w-24" />
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`poet-btn-outline relative ${filtersOpen ? '!border-line-strong' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center bg-accent text-accent-ink text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <div className="mb-6 animate-slide-up border border-line bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-body-sm font-semibold text-ink">Filter Properties</p>
            <button onClick={clearFilters} className="text-overline font-semibold text-accent-ink underline underline-offset-2 hover:text-ink transition-colors duration-fast">Clear all</button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="poet-overline mb-2">Property Type</p>
              <div className="flex flex-wrap gap-1">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(selectedType === t ? '' : t)}
                    className={`px-3 py-1.5 text-overline uppercase tracking-wider font-semibold transition-colors duration-fast ${
                      selectedType === t ? 'bg-ink text-canvas' : 'bg-surface-alt text-ink-muted hover:bg-line'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="poet-overline mb-2">Price Range</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="poet-input !py-2 !text-body-sm" />
                <span className="text-ink-subtle">&ndash;</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="poet-input !py-2 !text-body-sm" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="poet-overline mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1">
                {AMENITY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])}
                    className={`px-3 py-1.5 text-overline uppercase tracking-wider font-semibold transition-colors duration-fast ${
                      selectedAmenities.includes(a) ? 'bg-ink text-canvas' : 'bg-surface-alt text-ink-muted hover:bg-line'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="mb-4 text-body-sm text-ink-subtle">
        {filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'} found
      </p>

      {/* Results */}
      {loading ? (
        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 border border-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface">
              <div className="aspect-[4/3] bg-surface-alt animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-surface-alt animate-pulse" />
                <div className="h-3 w-1/2 bg-surface-alt animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-line bg-surface py-20 text-center">
          <MapPin className="mx-auto h-8 w-8 text-ink-subtle" strokeWidth={1.5} />
          <h3 className="mt-4 font-display text-heading-3 text-ink">No properties found</h3>
          <p className="mt-1 text-body-sm text-ink-subtle">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="poet-btn-primary mt-4">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 border border-line">
            {paginated.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button onClick={() => setPage((prev) => prev + 1)} className="poet-btn-outline">
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
