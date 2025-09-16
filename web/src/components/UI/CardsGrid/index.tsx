import { Card } from '../Card';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useRef } from 'react';
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
    <Swiper className="w-full" ref={swiperRef} spaceBetween={11} slidesPerView="auto">
      {elements.map((element, index) => (
        <SwiperSlide className="w-auto!" key={`${element.title}-${index}`}>
          <Card title={element.title} type={element.type} />
        </SwiperSlide>
      ))}
    </Swiper>
  );

  const renderGridContent = () => (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(160px,_1fr))] gap-3">
      {elements.map((element, index) => (
        <Card key={`${element.title}-${index}`} type={element.type} title={element.title} />
      ))}
    </div>
  );

  return (
    <div className="grid">
      <div className="mt-5 flex justify-between">
        <h3 className="text-h3 font-h3">{title}</h3>
        {type === CardGridType.Slider && (
          <div className="flex gap-4">
            <IconButton iconScale={1.4} icon="ArrowLeft" onClick={() => handleSlide('prev')} />
            <IconButton iconScale={1.4} icon="ArrowRight" onClick={() => handleSlide('next')} />
          </div>
        )}
      </div>
      {type === CardGridType.Slider ? renderSliderContent() : renderGridContent()}
    </div>
  );
};
