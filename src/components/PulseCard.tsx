import React from 'react';
import { MapPin, Sun, Waves, Anchor, ExternalLink } from 'lucide-react';

interface PulseCardProps {
  location: string;
  weather: string;
  event: string;
  bannerImage: string;
}

export default function PulseCard({ location, weather, event, bannerImage }: PulseCardProps) {
  return (
    <div 
      id="pulse-card" 
      className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/60 bg-slate-900 text-white font-sans group min-h-[110px]"
    >
      {/* Background Image with subdued, elegant darkening overlay */}
      <img 
        src={bannerImage} 
        alt="Tarkarli Coastline" 
        className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-teal-950/70" />

      {/* Content layout: Compact horizontal strip */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-800/80 border border-teal-700 text-teal-200 flex items-center justify-center shrink-0 mt-0.5">
            <Anchor className="w-4 h-4 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/60 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                {location}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">
                Destination Pulse
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1">
              Coastal Tide & Watersports Operating Status
            </h4>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5 leading-snug">
              Sindhudurg Fort boat ferry operating normally • Low tide ideal for scuba diving & snorkeling at Tarkarli beach
            </p>
          </div>
        </div>

        {/* Real-time Coastal Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start md:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-slate-200 font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{weather}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800/50 backdrop-blur-xs border border-teal-600/30 text-xs text-teal-200 font-medium">
            <Waves className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span className="text-white font-semibold">Calm Sea</span>
          </div>
        </div>
      </div>
    </div>
  );
}
