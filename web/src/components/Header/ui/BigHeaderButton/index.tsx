import { BigIconNameType, Icons } from '../../../UI/Icons';
import { TextSub } from '../../../UI/Text';
import { StyledBigHeaderButton } from './styles';

export const BigHeaderButton = ({
  icon,
  activeIcon,
  label,
  to,
}: {
  icon: BigIconNameType;
  activeIcon: BigIconNameType;
  label: string;
  to: string;
}) => {
  const Icon = Icons.Big[icon];
  const IconActive = Icons.Big[activeIcon];

  return (
    <StyledBigHeaderButton to={to}>
      <div className="icon">
        <Icon />
      </div>
      <div className="icon-active">
        <IconActive />
      </div>{' '}
      <TextSub className="label">{label}</TextSub>
    </StyledBigHeaderButton>
  );
};
