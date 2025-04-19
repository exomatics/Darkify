import styled from 'styled-components';

export const StyledAuth = styled.div`
  height: 100dvh;
  background: linear-gradient(180deg, #09421d, #000);
  display: flex;
  justify-content: center;
  align-items: center;

  .body {
    width: 650px;
    height: 700px;
    background-color: ${({ theme }) => theme.colors.bg.primary};
    border-radius: 10px;
    padding: 10px 10px 10px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .logo {
    display: flex;
    align-items: center;

    svg path {
      stroke: ${({ theme }) => theme.colors.primary};
    }

    span {
      color: ${({ theme }) => theme.colors.primary};
      font-weight: bold;
      font-size: 30px;
    }
  }

  .form {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .input {
    display: flex;
    flex-direction: column;

    label {
      font-weight: 500;
    }

    input {
      background: transparent;
      border: 1px solid ${({ theme }) => theme.colors.fg.secondary};
      padding: 12px 10px;
      width: 300px;
      transition: 300ms box-shadow;
      margin-top: 5px;
      color: ${({ theme }) => theme.colors.fg.primary};
      font-size: 15px;
      font-weight: 500;
      border-radius: 10px;

      &[data-focus] {
        box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.fg.primary};
        outline: none;
      }
    }
  }

  .button {
    padding: 10px 20px;
    border-radius: 100px;
    font-size: 14px;
    outline: none;
    border: none;
    background-color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    margin-top: 5px;
  }

  .subtext {
    margin-top: 50px;
    color: ${({ theme }) => theme.colors.fg.secondary};

    a {
      color: ${({ theme }) => theme.colors.fg.primary};
      font-weight: 700;
      text-decoration: underline;
      text-decoration-thickness: 2px;
      cursor: pointer;
    }
  }
`;
