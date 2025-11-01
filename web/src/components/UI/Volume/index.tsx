import { Slider } from '@/components/UI/slider.tsx';
import { useAudioStore } from '@/features/hls-stream/store.ts';

export const Volume = () => {
  const volume = useAudioStore((store) => store.volume);
  const setVolume = useAudioStore((store) => store.setVolume);

  return (
    <div>
      <Slider
        min={0}
        max={1}
        step={0.01}
        defaultValue={[volume]}
        onValueChange={(value) => setVolume(value[0])}
        orientation="vertical"
      />
    </div>
  );
};
