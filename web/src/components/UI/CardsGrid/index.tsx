import { StyledCardsGrid } from './styles';
import { Card } from '../Card';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
// @ts-expect-error skip
import 'swiper/css';
import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    console.log(swiperRef);
  }, [swiperRef]);

  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  return (
    <StyledCardsGrid>
      <div className="header">
        <TextH3>{title}</TextH3>
        {type === CardGridType.Slider && (
          <div className="right">
            <IconButton iconScale={1.4} icon="ArrowLeft" onClick={handlePrev} />
            <IconButton iconScale={1.4} icon="ArrowRight" onClick={handleNext} />
          </div>
        )}
      </div>
      {type === CardGridType.Slider && (
        <Swiper ref={swiperRef} spaceBetween={11} slidesPerView="auto">
          {elements?.map((element) => (
            <SwiperSlide>
              <Card title={element.title} type={element.type} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {type === CardGridType.Grid && (
        <div className="grid">
          {elements?.map((element) => <Card type={element.type} title={element.title} />)}
        </div>
      )}
    </StyledCardsGrid>
  );
};
