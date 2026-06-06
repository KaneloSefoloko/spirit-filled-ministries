import { useEffect, useRef, useState } from "react";

export default function ImageSlideshow({
                                           images = [],
                                           interval = 6000, // 6 seconds per slide
                                       }) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearTimeout(timerRef.current);
    }, [index, images.length, interval]);

    if (!images.length) return null;

    return (
        <div
            className="relative mt-12 overflow-hidden rounded-3xl shadow-xl"
            onMouseEnter={() => clearTimeout(timerRef.current)}
            onMouseLeave={() =>
                (timerRef.current = setTimeout(() => {
                    setIndex((prev) => (prev + 1) % images.length);
                }, interval))
            }
        >
            {/* Image */}
            <img
                key={index}
                src={images[index]}
                alt="Church gallery"
                className="w-full h-[260px] sm:h-[360px] object-cover transition-opacity duration-1000 ease-in-out"
            />

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/30">
                <div
                    key={index} // restart animation
                    className="h-full bg-white animate-progress"
                    style={{ animationDuration: `${interval}ms` }}
                />
            </div>
        </div>
    );
}