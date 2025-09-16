import { Icons } from '../Icons';

export const PlayButton = ({ played, onClick }: { played: boolean; onClick: () => void }) => {
  return (
    <button className="w-10 h-10 border-none bg-transparent cursor-pointer" onClick={onClick}>
      {played ? (
        <Icons.Big.Pause className="w-10 h-10" />
      ) : (
        <Icons.Big.Play className="w-10 h-10" />
      )}
    </button>
  );
};
