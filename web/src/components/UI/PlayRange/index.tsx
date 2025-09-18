import clsx from 'clsx';
import { Slider } from '@/components/ui/slider';

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
  const onValueChange = (value: [number]) => {
    onSeek(value[0] / 100);
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="text-small text-fg-secondary tabular-nums">
        {currentTime.length ? currentTime : '0:00'}
      </span>
      <div className="w-[300px]">
        <Slider onValueChange={onValueChange} value={[currentPercent * 100]} max={100} step={1} />
      </div>
      <span className="text-small text-fg-secondary tabular-nums">{totalTime}</span>
    </div>
  );
};
