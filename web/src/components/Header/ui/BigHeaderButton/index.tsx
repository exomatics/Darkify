import { BigIconNameType, Icons } from '../../../UI/Icons';
import { TextSub } from '../../../UI/Text';
import { StyledBigHeaderButton } from './styles';

export const BigHeaderButton = ({
  icon,
  activeIcon,
  active,
  label,
}: {
  icon: BigIconNameType;
  activeIcon: BigIconNameType;
  active: boolean;
  label: string;
}) => {
  const Icon = Icons.Big[icon];
  const IconActive = Icons.Big[activeIcon];

  return (
    <StyledBigHeaderButton $active={active}>
      <div className="icon">{active ? <IconActive /> : <Icon />}</div>{' '}
      <TextSub className="label">{label}</TextSub>
    </StyledBigHeaderButton>
  );
};
