import { Icons } from '../../UI/Icons';
import React, { useState } from 'react';
import { IconButton } from '../../UI/IconButton';
import { SidebarElementDataBase } from '..';
import { NavLink } from 'react-router';

export const SidebarElement = ({
  icon,
  children,
  expandable,
  expandedElements,
  to,
}: {
  icon: keyof typeof Icons.Big;
  children: React.ReactNode;
  expandable?: boolean;
  expandedElements?: SidebarElementDataBase[];
  to: string;
}) => {
  const IconComponent = Icons.Big[icon];
  const [expanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (expandable) {
      setIsExpanded(!expanded);
    }
  };

  return (
    <>
      <NavLink
        className="group h-10 flex items-center gap-3 cursor-pointer rounded-xl no-underline"
        to={to}
        onClick={handleClick}
      >
        <IconComponent className="transition-colors text-fg-secondary group-hover:text-fg-primary" />
        <span className="transition-colors text-sub text-fg-secondary group-hover:text-fg-primary">
          {children}
        </span>
        {expandable && (
          <div
            className="ml-auto transition-transform"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <IconButton
              className="text-fg-secondary group-hover:text-fg-primary"
              icon="Expand"
              onClick={() => console.log('test')}
            />
          </div>
        )}
      </NavLink>
      {expanded && (
        <div className="pl-3 pt-2 flex flex-col gap-3">
          {expandedElements?.map((element) => {
            const Icon = Icons.Big[element.icon];
            return (
              <NavLink
                to={element.to ?? '/fjsdkjfklsdjfkl'}
                onClick={handleClick}
                className="group h-6 flex items-center gap-3 cursor-pointer rounded-xl no-underline"
              >
                <Icon className="w-7 h-7" />
                <span className="text-fg-secondary group-hover:text-fg-primary transition-colors">
                  {element.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      )}
    </>
  );
};
