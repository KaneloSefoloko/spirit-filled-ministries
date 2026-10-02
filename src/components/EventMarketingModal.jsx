import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EventMarketingModal() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpen(true);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (!open) return null;

    const closeModal = () => {
        setOpen(false);
    };

    const handlePosterClick = () => {
        setOpen(false);
        navigate("/events");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

            {/* Dark overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={closeModal}
            />

            {/* Modal wrapper */}
            <div className="relative z-10 w-full max-w-md">

                {/* Close instruction */}
                <div
                    className="
                        absolute
                        -right-1
                        -top-16
                        z-30
                        flex
                        flex-col
                        items-end
                        gap-1
                        text-white
                        animate-pulse
                    "
                >
                    <span className="text-sm font-semibold tracking-wide drop-shadow-lg">
                        Tap × to close
                    </span>

                    <ArrowUpRight
                        size={22}
                        className="mr-3 rotate-[-45deg]"
                    />
                </div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close event announcement"
                    className="
                        absolute
                        -right-2
                        -top-2
                        z-40
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-white/100
                        text-black
                        shadow-xl
                        ring-2
                        ring-white/30
                        transition
                        duration-200
                        hover:scale-110
                        hover:bg-black
                    "
                >
                    <X size={20} />
                </button>

                {/* Event Poster */}
                <button
                    type="button"
                    onClick={handlePosterClick}
                    className="
                        block
                        w-full
                        overflow-hidden
                        rounded-2xl
                        shadow-2xl
                        transition
                        duration-300
                        hover:scale-[1.01]
                        focus:outline-none
                    "
                >
                    <img
                        src="https://res.cloudinary.com/dkwfi3iku/image/upload/v1790968403/ca8fd0fc-5982-4b97-97d9-c16124cfa146_sg0run.jpg"
                        alt="Spirit Filled Ministries 10th Year Mega Revival Anniversary"
                        className="block h-auto w-full object-contain"
                    />
                </button>

            </div>
        </div>
    );
}