import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Bed } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import type { Property } from '@/types';

interface Props {
  property: Property;
  avgRating?: number;
  reviewCount?: number;
}

export default function PropertyCard({ property, avgRating, reviewCount }: Props) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="group poet-card poet-card-interactive flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-sharp ease-poet group-hover:scale-[1.02]"
          loading="lazy"
        />
        <span className="poet-badge-neutral absolute left-3 top-3 capitalize">
          {property.property_type}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-heading-3 text-ink line-clamp-1 group-hover:text-ink-muted transition-colors duration-sharp">
            {property.title}
          </h3>
          {avgRating !== undefined && (
            <span className="flex items-center gap-1 text-body-sm font-medium text-ink-muted whitespace-nowrap">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {avgRating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="flex items-center gap-1 text-body-sm text-ink-subtle">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          {property.city}{property.state ? `, ${property.state}` : ''}, {property.country}
        </p>

        <div className="mt-auto pt-2 border-t border-line flex items-center justify-between">
          <div className="flex items-center gap-3 text-overline text-ink-subtle uppercase tracking-wider">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" strokeWidth={1.5} />{property.max_guests}</span>
            <span className="flex items-center gap-1"><Bed className="h-3 w-3" strokeWidth={1.5} />{property.bedrooms}</span>
          </div>
          <p className="text-body-sm font-semibold text-ink">
            {formatCurrency(property.base_price)}<span className="font-normal text-ink-subtle"> / night</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
