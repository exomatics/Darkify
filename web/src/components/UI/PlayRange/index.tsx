import React from 'react';
import clsx from 'clsx';

export const PlayRange = ({
  currentPercent,
  currentTime,
  totalTime,
  onSeek,
  className,
}: {
  currentPercent: number;
  currentTime: string;
  totalTime: string;
  onSeek: (percent: number) => void;
  className?: string;
}) => {
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent);
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="text-small text-fg-secondary ">{currentTime}</span>
      <div
        onClick={handleProgressClick}
        className="w-[317px] h-[3px] rounded-full bg-[#89898955] cursor-pointer"
      >
        <div
          className="bg-fg-primary h-[3px] rounded-full transition-all"
          style={{ width: currentPercent * 100 + '%' }}
        ></div>
      </div>
      <span className="text-small text-fg-secondary">{totalTime}</span>
    </div>
  );
};
