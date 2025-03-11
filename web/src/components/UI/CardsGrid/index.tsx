import { StyledCardsGrid } from './styles';
import { Card } from '../Card';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useRef } from 'react';
import { TextH3 } from '../Text';
import { IconButton } from '../IconButton';
import { CardGridType, CardsGridElement } from './types';

export const CardsGrid = ({
  title,
  type = CardGridType.Slider,
  elements = [],
}: {
  title: string;
  type?: CardGridType;
  elements?: CardsGridElement[];
}) => {
  const swiperRef = useRef<SwiperRef | null>(null);

  const handleSlide = (direction: 'prev' | 'next') => {
    if (!swiperRef.current?.swiper) return;
    return direction === 'prev'
      ? swiperRef.current.swiper.slidePrev()
      : swiperRef.current.swiper.slideNext();
  };

  const renderSliderContent = () => (
    <Swiper ref={swiperRef} spaceBetween={11} slidesPerView="auto">
      {elements.map((element, index) => (
        <SwiperSlide key={`${element.title}-${index}`}>
          <Card title={element.title} type={element.type} />
        </SwiperSlide>
      ))}
    </Swiper>
  );

  const renderGridContent = () => (
    <div className="grid">
      {elements.map((element, index) => (
        <Card key={`${element.title}-${index}`} type={element.type} title={element.title} />
      ))}
    </div>
  );

  return (
    <StyledCardsGrid>
      <div className="header">
        <TextH3>{title}</TextH3>
        {type === CardGridType.Slider && (
          <div className="right">
            <IconButton iconScale={1.4} icon="ArrowLeft" onClick={() => handleSlide('prev')} />
            <IconButton iconScale={1.4} icon="ArrowRight" onClick={() => handleSlide('next')} />
          </div>
        )}
      </div>
      {type === CardGridType.Slider ? renderSliderContent() : renderGridContent()}
    </StyledCardsGrid>
  );
};
