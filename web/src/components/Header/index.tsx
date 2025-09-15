import { Actions } from './ui/Actions';
import { BigHeaderButton } from './ui/BigHeaderButton';
import { LibraryButton } from './ui/LibraryButton';
import { HeaderSearch } from './ui/Search';

export const Header = () => {
  return (
    <div style={{ gridArea: 'header' }} className="flex items-center">
      <LibraryButton />
      <div className="flex items-center gap-2.5">
        <BigHeaderButton to="/home" icon="Home" activeIcon="HomeFilled" label="Home" />
        <BigHeaderButton
          to="/discover"
          icon="Discover"
          activeIcon="DiscoverFilled"
          label="Discover"
        />
      </div>
      <HeaderSearch />
      <Actions />
    </div>
  );
};
