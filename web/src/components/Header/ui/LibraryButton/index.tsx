import { Icons } from '../../../UI/Icons';
import { IconButton } from '../../../UI/IconButton';
import { NavLink } from 'react-router';

export const LibraryButton = () => {
  return (
    <NavLink
      className="group h-14 flex py-3.5 px-6 items-center cursor-pointer rounded-xl w-[248px] bg-transparent border-none"
      to="/library"
    >
      <div className="w-5">
        <Icons.Big.Library className="transition-colors group-hover:text-fg-primary text-fg-secondary" />
      </div>
      <span className="text-sub transition-colors group-hover:text-fg-primary text-fg-secondary ml-5">
        My Library
      </span>
      <div className="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton className="w-9 h-9" iconScale={1.3} icon="More" onClick={() => {}} />
        <IconButton className="w-9 h-9" iconScale={1.3} icon="Add" onClick={() => {}} />
      </div>
    </NavLink>
  );
};
