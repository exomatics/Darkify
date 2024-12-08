import { StyledCard } from './styles';
import Backdrop from './assets/backdrop.svg?react';
import mockCover from './mock.png';
import { TextSmall, TextSub } from '../Text';

export const Card = () => {
  return (
    <StyledCard>
      <Backdrop className="backdrop" />
      <div className="cover">
        <img src={mockCover} />
      </div>
      <div className="content">
        <div className="header">
          <div className="title">Daily Mix 1</div>
          <TextSub className="number">50</TextSub>
        </div>
        <p className="description">
          <TextSmall>Linkin Park, System Of A Down, Coal Chamber...</TextSmall>
        </p>
      </div>
    </StyledCard>
  );
};
