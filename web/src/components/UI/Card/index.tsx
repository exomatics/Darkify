import { StyledCard } from './styles';
import Backdrop from './assets/backdrop.svg?react';
import mockCover from './mock.png';
import mockArtist from './mockArtist.png';
import { TextSmall, TextSub } from '../Text';
import { CardGridElementType } from '../CardsGrid/types';

export const Card = ({ title, type }: { title: string; type?: CardGridElementType }) => {
  return (
    <StyledCard $type={type}>
      <Backdrop className="backdrop" />
      <div className="cover">
        <img src={type === CardGridElementType.Artist ? mockArtist : mockCover} />
      </div>
      <div className="content">
        <div className="header">
          <div className="title">{title}</div>
          <TextSub className="number">50</TextSub>
        </div>
        <p className="description">
          <TextSmall>Linkin Park, System Of A Down, Coal Chamber...</TextSmall>
        </p>
      </div>
    </StyledCard>
  );
};
