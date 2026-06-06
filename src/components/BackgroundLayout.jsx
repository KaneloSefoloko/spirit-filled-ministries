export default function BackgroundLayout({ children }) {
    return (
        <div className="relative min-h-screen">
            {/* Overlay */}
            <div className="fixed inset-0 -z-10 bg-gray-200" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}