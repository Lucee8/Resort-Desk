import React from 'react';
import { MapPin, Clock, Info } from 'lucide-react';

interface PulseCardProps {
  propertyName: string;
  location: string;
  address: string;
  checkInTime: string;
  checkOutTime: string;
  bannerImage?: string;
}

export default function PulseCard({
  propertyName,
  location,
  address,
  checkInTime,
  checkOutTime
}: PulseCardProps) {
  return (
    <div
      id="pulse-card"
      className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3.5 sm:px-5 shadow-2xs font-sans flex flex-col md:flex-row md:items-center justify-between gap-3"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-teal-800 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-[#a64b2a]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800">
              {propertyName}
            </span>
            <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              {location}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            {address}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 font-medium">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Check-in {checkInTime} • Check-out {checkOutTime}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-[10px] text-slate-500 font-medium">
          <Info className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Live local weather &amp; event feeds not connected</span>
        </div>
      </div>
    </div>
  );
}
