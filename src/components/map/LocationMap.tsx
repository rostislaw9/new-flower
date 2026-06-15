"use client";

import { cn } from "@/lib/utils";

export interface Location {
  name: string;
  embedUrl: string;
}

interface LocationMapProps {
  location: Location;
  className?: string;
}

export function LocationMap({ location, className }: LocationMapProps) {
  return (
    <div
      className={cn(
        "relative h-80 w-full overflow-hidden border border-border bg-secondary sm:h-96 lg:h-[28rem]",
        className,
      )}
    >
      <iframe
        key={location.name}
        src={location.embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map location: ${location.name}`}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

// Pre-configured locations for New Flower Tattoo
export const DEFAULT_LOCATIONS: Location[] = [
  {
    name: "New Flower Tattoo Shop",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7904.06445151813!2d98.29680814695037!3d7.89169739577559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30503b68d56bde55%3A0x4d261e8d7482d820!2sNew%20Flower%20Tattoo%20Shop!5e0!3m2!1sen!2sth!4v1781692149953!5m2!1sen!2sth",
  },
  {
    name: "New Flower Tattoo Shop III",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7904.06445151813!2d98.29680814695037!3d7.89169739577559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30503bf43b895063%3A0x461a3218411c1960!2sNew%20flower%20tattoo%20shop%20lll!5e0!3m2!1sen!2sth!4v1781692160201!5m2!1sen!2sth",
  },
];

export default LocationMap;
