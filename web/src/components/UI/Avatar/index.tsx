import { Icons } from '../Icons';
import { BACKEND_BASE } from '../../../api/api.ts';

export const Avatar = ({ src, size = 15 }: { src?: string; size?: number }) => {
  return (
    <div
      className="rounded-full flex justify-center items-center overflow-hidden cursor-pointer"
      style={{ width: size + 'px', height: size + 'px' }}
    >
      {src ? (
        <img alt="Avatar" className="w-full h-full object-cover" src={BACKEND_BASE + src} />
      ) : (
        <div className="bg-bg-secondary w-full h-full flex justify-center items-center">
          <Icons.Big.UserFilled className="w-1/2 h-1/2" />
        </div>
      )}
    </div>
  );
};
