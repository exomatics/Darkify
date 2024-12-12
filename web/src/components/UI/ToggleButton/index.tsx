import styled, { css } from 'styled-components';

const StyledButton = styled.button<{ $active: boolean }>`
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  background-color: rgba(32, 32, 32, 0.5);
  color: ${({ theme }) => theme.colors.fg.primary};
  cursor: pointer;
  ${({ $active, theme }) =>
    $active &&
    css`
      background-color: ${theme.colors.fg.primary};
      color: ${theme.colors.bg.primary};
    `}
`;

export const ToggleButton = ({ label, active }: { label: string; active?: boolean }) => {
  return <StyledButton $active={!!active}>{label}</StyledButton>;
};
