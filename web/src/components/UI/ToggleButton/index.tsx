import clsx from 'clsx';

export const ToggleButton = ({ label, active }: { label: string; active?: boolean }) => {
  return (
    <button
      className={clsx(
        'py-2 px-4 border-none rounded-xl bg-[#202020BB] cursor-pointer',
        active && 'bg-fg-primary text-bg-primary',
      )}
    >
      {label}
    </button>
  );
};
