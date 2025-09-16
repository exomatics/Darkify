import { BigIconNameType, Icons } from '../../../UI/Icons';
import { NavLink, useLocation } from 'react-router';
import { useEffect, useState } from 'react';

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
  const [active, setActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setActive(location.pathname === to);
  }, [location.pathname, to]);

  const Icon = Icons.Big[icon];
  const IconActive = Icons.Big[activeIcon];

  return (
    <NavLink
      className="group h-12 pl-5 pr-24 flex items-center bg-transparent border-none cursor-pointer rounded-xl gap-5 no-underline "
      to={to}
    >
      {active ? (
        <div className="w-7">
          <IconActive />
        </div>
      ) : (
        <div className="w-7">
          <Icon className="text-fg-secondary group-hover:text-fg-primary transition-colors" />
        </div>
      )}
      <span className="text-sub text-fg-secondary transition-colors group-hover:text-fg-primary">
        {label}
      </span>
    </NavLink>
  );
};
