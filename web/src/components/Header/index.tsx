import { StyledHeader } from './styles';
import { Actions } from './ui/Actions';
import { BigHeaderButton } from './ui/BigHeaderButton';
import { LibraryButton } from './ui/LibraryButton';
import { HeaderSearch } from './ui/Search';

export const Header = () => {
  return (
    <StyledHeader>
      <LibraryButton />
      <div className="primary-buttons">
        <BigHeaderButton icon="Home" activeIcon="HomeFilled" label="Home" active />
        <BigHeaderButton
          icon="Discover"
          activeIcon="DiscoverFilled"
          label="Discover"
          active={false}
        />
      </div>
      <HeaderSearch />
      <Actions />
    </StyledHeader>
  );
};
