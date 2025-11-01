import { BACKEND_BASE } from '@/api/api.ts';
import { Icons } from '@/components/UI/Icons';

export const TrackCover = ({ coverUrl }: { coverUrl?: string }) => {
  return coverUrl ? (
    <img
      src={coverUrl?.startsWith('/') ? BACKEND_BASE + coverUrl : coverUrl}
      alt=""
      className="w-14 h-14 rounded-md object-cover"
    />
  ) : (
    <div className="bg-bg-secondary size-14 flex justify-center items-center rounded-md">
      <Icons.Big.Note className="text-fg-secondary size-7" />
    </div>
  );
};
