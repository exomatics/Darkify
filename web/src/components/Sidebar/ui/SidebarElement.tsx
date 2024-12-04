import styled from 'styled-components';
import { Icons } from '../../UI/Icons';
import { TextSub } from '../../UI/Text';
import React, { useState } from 'react';
import { IconButton } from '../../UI/IconButton';
import { SidebarElementDataBase } from '..';

const SidebarElementContainer = styled.div`
  .expanded-list {
    padding-left: 10px;
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const StyledSidebarElement = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: 100ms all;
  .expand {
    margin-left: auto;
    transition: 200ms transform;
  }
  .label {
    color: ${({ theme }) => theme.colors.fg.secondary};
  }
  &:hover {
    background: ${({ theme }) => theme.colors.bg.secondary};
    .label {
      color: ${({ theme }) => theme.colors.fg.primary};
    }
    svg path,
    svg rect,
    svg circle {
      stroke: ${({ theme }) => theme.colors.fg.primary} !important;
    }
  }
`;

const InnerStyledSidebarElement = styled(StyledSidebarElement)`
  height: 24px;
  .icon {
    width: 28px;
    height: 28px;
  }
`;

export const SidebarElement = ({
  icon,
  children,
  expandable,
  expandedElements,
}: {
  icon: keyof typeof Icons.Big;
  children: React.ReactNode;
  expandable?: boolean;
  expandedElements?: SidebarElementDataBase[];
}) => {
  const IconComponent = Icons.Big[icon];
  const [expanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (expandable) {
      setIsExpanded(!expanded);
    }
  };

  return (
    <SidebarElementContainer>
      <StyledSidebarElement onClick={handleClick}>
        <IconComponent />
        <TextSub className="label">{children}</TextSub>
        {expandable && (
          <div
            className="expand"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <IconButton icon="Expand" onClick={() => console.log('test')} />
          </div>
        )}
      </StyledSidebarElement>
      {expanded && (
        <div className="expanded-list">
          {expandedElements?.map((element) => {
            const Icon = Icons.Big[element.icon];
            return (
              <InnerStyledSidebarElement onClick={handleClick}>
                <Icon className="icon" />
                <TextSub className="label">{element.label}</TextSub>
              </InnerStyledSidebarElement>
            );
          })}
        </div>
      )}
    </SidebarElementContainer>
  );
};
