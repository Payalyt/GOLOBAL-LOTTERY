import React, { useState, useEffect } from 'react';

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-2 justify-center text-white">
      {[
        { label: 'DAYS', value: timeLeft.days },
        { label: 'HOURS', value: timeLeft.hours },
        { label: 'MINS', value: timeLeft.mins },
        { label: 'SECS', value: timeLeft.secs },
      ].map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <span className="self-center text-white/50 text-xs font-bold -mt-3.5">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-black/25 text-white font-black px-2.5 py-1.5 rounded-xl text-center text-sm font-mono min-w-[38px] tracking-wide border border-white/5 shadow-inner">
              {String(item.value).padStart(2, '0')}
            </div>
            <span className="text-[7.5px] font-bold mt-1 text-white/70 uppercase tracking-widest">{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
export default CountdownTimer;
