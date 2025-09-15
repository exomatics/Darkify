import { BigIconNameType, Icons } from '../Icons';

export const IconButton = ({
  icon,
  onClick,
  className,
  iconScale,
}: {
  icon: BigIconNameType;
  onClick: () => void;
  className?: string;
  iconScale?: number;
}) => {
  const IconComponent = Icons.Big[icon];
  return (
    <button
      className={
        className +
        ' w-8 h-8 flex justify-center items-center bg-transparent border-none cursor-pointer'
      }
      onClick={onClick}
    >
      <IconComponent
        className="w-[40%] h-[40%] object-contain"
        style={{ transform: `scale(${String(iconScale ?? 1)}` }}
      />
    </button>
  );
};
