"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface SpotGalleryProps {
  images: string[];
}

export default function SpotGallery({ images }: SpotGalleryProps) {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync thumbnail when main carousel changes
  useEffect(() => {
    if (!mainApi) return;

    const onSelect = () => {
      const index = mainApi.selectedScrollSnap();
      setCurrentIndex(index);
      thumbApi?.scrollTo(index);
    };

    mainApi.on("select", onSelect);
    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, thumbApi]);

  const handleThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index);
      thumbApi?.scrollTo(index);
      setCurrentIndex(index);
    },
    [mainApi, thumbApi]
  );

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center">
        <MapPin className="h-16 w-16 text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main carousel */}
      <div className="relative">
        <Carousel setApi={setMainApi} opts={{ loop: false }}>
          <CarouselContent className="-ml-0">
            {images.map((src, index) => (
              <CarouselItem key={index} className="pl-0">
                <div
                  className="aspect-[16/9] w-full rounded-xl bg-cover bg-center bg-slate-100"
                  style={{ backgroundImage: `url(${src})` }}
                  role="img"
                  aria-label={`图片 ${index + 1}`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {images.length > 1 && (
            <>
              <button
                onClick={() => mainApi?.scrollPrev()}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-50"
                disabled={!mainApi?.canScrollPrev()}
                aria-label="上一张"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
              <button
                onClick={() => mainApi?.scrollNext()}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-50"
                disabled={!mainApi?.canScrollNext()}
                aria-label="下一张"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            </>
          )}
        </Carousel>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <Carousel setApi={setThumbApi} opts={{ containScroll: "keepSnaps", dragFree: true }}>
          <CarouselContent className="-ml-2">
            {images.map((src, index) => (
              <CarouselItem
                key={index}
                className="basis-1/5 pl-2 cursor-pointer"
                onClick={() => handleThumbClick(index)}
              >
                <div
                  className={`aspect-[4/3] rounded-md bg-cover bg-center bg-slate-100 transition-all ${
                    currentIndex === index
                      ? "ring-2 ring-blue-700 ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundImage: `url(${src})` }}
                  role="button"
                  aria-label={`缩略图 ${index + 1}`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}
