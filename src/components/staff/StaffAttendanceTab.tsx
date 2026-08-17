import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  Filter,
  Sparkles,
  Download,
  Users,
  Search
} from 'lucide-react';
import { StaffMember, AttendanceStatus, StaffDepartment } from '../../types';

interface StaffAttendanceTabProps {
  staffList: StaffMember[];
  onOpenBulkAttendance: () => void;
  onSelectStaff: (staff: StaffMember) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffAttendanceTab({
  staffList,
  onOpenBulkAttendance,
  onSelectStaff,
  triggerToast
}: StaffAttendanceTabProps) {
  const [currentMonth, setCurrentMonth] = useState('August 2024');
  const [selectedDate, setSelectedDate] = useState<number>(24);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [automateBiometric, setAutomateBiometric] = useState(true);

  const daysInMonth = 31;
  const startDayOffset = 3; // Thursday is Aug 1st

  // Generate calendar dates
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      // Mock realistic stats for dates
      const isToday = i === 24;
      const isPast = i <= 24;
      const isSunday = (i + startDayOffset - 1) % 7 === 0;

      let presentCount = isPast ? (isSunday ? 10 : 12) : 12;
      let onLeaveCount = isPast ? (i >= 24 && i <= 29 ? 2 : 1) : 1;
      let lateCount = isPast ? (i % 4 === 0 ? 1 : 0) : 0;
      let absentCount = isPast ? (i === 14 ? 1 : 0) : 0;

      days.push({
        dateNumber: i,
        isToday,
        isPast,
        isSunday,
        presentCount,
        onLeaveCount,
        lateCount,
        absentCount
      });
    }
    return days;
  }, [daysInMonth]);

  // Selected date breakdown
  const selectedDayStaff = useMemo(() => {
    return staffList.map(staff => {
      let status: AttendanceStatus = 'Present';
      let checkIn = '08:55 AM';
      let checkOut = '06:05 PM';
      let overtime = staff.overtimeHours > 0 ? `${staff.overtimeHours / 4}h` : undefined;

      if (staff.name === 'Sneha Patil' && selectedDate >= 24 && selectedDate <= 29) {
        status = 'On Leave';
        checkIn = '---';
        checkOut = '---';
      } else if (staff.name === 'Tanvi Joshi' && selectedDate === 28) {
        status = 'On Leave';
        checkIn = '---';
        checkOut = '---';
      } else if (staff.name === 'Amit Sawant' && (selectedDate === 26 || selectedDate === 27)) {
        status = 'On Leave';
        checkIn = '---';
        checkOut = '---';
      } else if (staff.name === 'Rahul Bhosale' && selectedDate === 22) {
        status = 'Late';
        checkIn = '02:40 PM';
        checkOut = '11:10 PM';
      } else if (staff.status === 'Off Duty') {
        checkIn = staff.todayShift.split(' - ')[0] || '02:00 PM';
        checkOut = staff.todayShift.split(' - ')[1] || '11:00 PM';
      }

      return {
        ...staff,
        dayStatus: status,
        dayCheckIn: checkIn,
        dayCheckOut: checkOut,
        dayOvertime: overtime
      };
    }).filter(s => selectedDeptFilter === 'All' || s.department === selectedDeptFilter);
  }, [staffList, selectedDate, selectedDeptFilter]);

  const presentTotal = selectedDayStaff.filter(s => s.dayStatus === 'Present').length;
  const leaveTotal = selectedDayStaff.filter(s => s.dayStatus === 'On Leave').length;
  const lateTotal = selectedDayStaff.filter(s => s.dayStatus === 'Late').length;
  const absentTotal = selectedDayStaff.filter(s => s.dayStatus === 'Absent').length;

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* Top Banner & Control Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-900">Attendance Console</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-100">
              Live Biometric Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric punch logs, geofenced mobile check-ins, and automated leave deductions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-2 px-3 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAutomateBiometric(!automateBiometric);
                triggerToast(`Biometric Geofence sync ${!automateBiometric ? 'Activated' : 'Paused'}`);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                automateBiometric ? 'bg-teal-800' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  automateBiometric ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-700">Auto Attendance</span>
          </div>

          <button
            id="btn-mark-bulk-att-page"
            onClick={onOpenBulkAttendance}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-teal-200" />
            <span>Mark Bulk Attendance</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Calendar on Left, Date Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MONTHLY CALENDAR (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-800" />
              <h4 className="font-bold text-base text-slate-900">{currentMonth}</h4>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => triggerToast("Viewing July 2024 Archive")}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">August 2024</span>
              <button 
                onClick={() => triggerToast("Viewing September 2024 Schedule")}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span className="text-rose-400">Sun</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank leading days */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 bg-slate-50/40 rounded-xl border border-dashed border-slate-100" />
            ))}

            {/* Actual Days */}
            {calendarDays.map((day) => {
              const isSelected = selectedDate === day.dateNumber;
              return (
                <button
                  key={day.dateNumber}
                  onClick={() => setSelectedDate(day.dateNumber)}
                  className={`h-16 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all cursor-pointer relative border ${
                    isSelected
                      ? 'bg-teal-900 text-white border-teal-950 shadow-md shadow-teal-950/20 ring-2 ring-teal-600/40'
                      : day.isToday
                        ? 'bg-teal-50/60 text-slate-900 border-teal-200'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black ${isSelected ? 'text-white' : day.isSunday ? 'text-rose-600' : 'text-slate-900'}`}>
                      {day.dateNumber}
                    </span>
                    {day.isToday && (
                      <span className={`text-[8px] font-black uppercase px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-teal-700 text-white'}`}>
                        Today
                      </span>
                    )}
                  </div>

                  {/* Attendance Indicators */}
                  <div className="flex items-center gap-1 mt-auto">
                    <span 
                      className={`text-[9px] font-bold px-1 rounded ${
                        isSelected ? 'bg-white/20 text-teal-100' : 'bg-emerald-50 text-emerald-700'
                      }`}
                      title={`${day.presentCount} Present`}
                    >
                      {day.presentCount}P
                    </span>
                    {day.onLeaveCount > 0 && (
                      <span 
                        className={`text-[9px] font-bold px-1 rounded ${
                          isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-50 text-amber-700'
                        }`}
                        title={`${day.onLeaveCount} on Leave`}
                      >
                        {day.onLeaveCount}L
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> On Leave
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Late Arrival
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent
              </span>
            </div>
            <button
              onClick={() => triggerToast("Monthly attendance report compiled.")}
              className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Monthly Log</span>
            </button>
          </div>
        </div>

        {/* DATE INSPECTOR & ATTENDANCE ROSTER (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-base text-slate-900">
                Aug {selectedDate}, 2024 Daily Roster
              </h4>
              <p className="text-xs text-slate-500">
                {selectedDate === 24 ? "Today's Live Attendance Status" : `Historical Log for Aug ${selectedDate}`}
              </p>
            </div>
            
            {/* Department Filter */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Front Desk">Front Desk</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Security">Security</option>
            </select>
          </div>

          {/* Quick Metrics for the selected date */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center">
              <span className="text-base font-black text-emerald-800">{presentTotal}</span>
              <span className="block text-[10px] font-bold text-emerald-700 uppercase">Present</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-center">
              <span className="text-base font-black text-amber-800">{leaveTotal}</span>
              <span className="block text-[10px] font-bold text-amber-700 uppercase">On Leave</span>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 text-center">
              <span className="text-base font-black text-orange-800">{lateTotal}</span>
              <span className="block text-[10px] font-bold text-orange-700 uppercase">Late</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-center">
              <span className="text-base font-black text-rose-800">{absentTotal}</span>
              <span className="block text-[10px] font-bold text-rose-700 uppercase">Absent</span>
            </div>
          </div>

          {/* Scrollable list of staff for selected date */}
          <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
            {selectedDayStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => onSelectStaff(staff)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-xs shrink-0`}>
                    {staff.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition-colors">
                      {staff.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {staff.role} • {staff.department}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {staff.dayStatus === 'Present' ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                        Present
                      </span>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        In: {staff.dayCheckIn}
                      </p>
                    </div>
                  ) : staff.dayStatus === 'On Leave' ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-100">
                        On Leave
                      </span>
                      <p className="text-[9px] text-amber-700 font-semibold mt-0.5">
                        Approved Leave
                      </p>
                    </div>
                  ) : staff.dayStatus === 'Late' ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-100">
                        Late (40m)
                      </span>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        In: {staff.dayCheckIn}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-150 text-slate-600 border border-slate-200">
                        Off Duty
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Mark selected day punch button */}
          <button
            onClick={() => triggerToast(`Attendance verified and locked for Aug ${selectedDate}, 2024.`)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Lock & Verify Aug {selectedDate} Timesheet
          </button>
        </div>

      </div>
    </div>
  );
}
