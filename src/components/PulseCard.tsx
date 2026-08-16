import React from 'react';
import { MapPin, Sun, Calendar, Navigation } from 'lucide-react';

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
      className="relative rounded-3xl overflow-hidden shadow-lg h-[240px] font-sans group border border-slate-200/20"
    >
      {/* Background Image with elegant overlay */}
      <img 
        src={bannerImage} 
        alt="Resort Surroundings" 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

      {/* Content layout on top of the gradient */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        {/* Location Badge */}
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border border-white/25">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>{location}</span>
        </div>

        {/* Pulse Title */}
        <h3 className="text-lg font-bold mt-3 font-serif tracking-wide text-white drop-shadow-sm">
          Local Area Pulse
        </h3>

        {/* Weather & Event description */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Today's weather: <strong className="text-white">{weather}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
            <Calendar className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span>Event: <strong className="text-white">{event}</strong></span>
          </div>
        </div>
      </div>

      {/* Tiny explore button top right */}
      <button 
        id="pulse-explore-btn"
        onClick={() => alert(`Exploring sights in ${location}: \n- 2km from historic Bhatye Beach\n- 4km from Ratnadurg Fort\n- Mango farms local tours available at reception.`)}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full border border-white/20 text-white transition-all cursor-pointer group/btn"
        title="Explore area guide"
      >
        <Navigation className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
