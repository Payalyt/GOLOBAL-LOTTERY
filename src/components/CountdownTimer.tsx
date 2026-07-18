import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const { language } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let targetTime = targetDate.getTime();

      // If the target date is in the past, roll it forward dynamically so a countdown is always active
      if (targetTime < now) {
        const diffMs = now - targetTime;
        // Roll forward in intervals of 1 day (86400000 ms) until it is in the future
        const oneDayMs = 24 * 60 * 60 * 1000;
        const daysToAddToFuture = Math.ceil(diffMs / oneDayMs) + 1;
        targetTime = targetTime + daysToAddToFuture * oneDayMs;
      }

      const distance = targetTime - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const labels = {
    DAYS: language === 'en' ? 'DAYS' : 'দিন',
    HOURS: language === 'en' ? 'HOURS' : 'ঘণ্টা',
    MINS: language === 'en' ? 'MINS' : 'মিনিট',
    SECS: language === 'en' ? 'SECS' : 'সেকেন্ড',
  };

  return (
    <div className="flex gap-1 sm:gap-2 justify-center text-white">
      {[
        { label: labels.DAYS, value: timeLeft.days },
        { label: labels.HOURS, value: timeLeft.hours },
        { label: labels.MINS, value: timeLeft.mins },
        { label: labels.SECS, value: timeLeft.secs },
      ].map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="self-center text-white/50 text-[10px] sm:text-xs font-bold -mt-2.5 sm:-mt-3.5">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-black/25 text-white font-black px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm font-mono min-w-[28px] sm:min-w-[38px] tracking-wide border border-white/5 shadow-inner">
              {String(item.value).padStart(2, '0')}
            </div>
            <span className="text-[6.5px] sm:text-[7.5px] font-bold mt-1 text-white/70 uppercase tracking-widest">{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
export default CountdownTimer;
