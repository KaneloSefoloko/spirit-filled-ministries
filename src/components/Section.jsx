export default function Section({ children, className = "" }) {
    return (
        <section className={`w-full px-4 sm:px-6 md:px-10`}>
            <div className={`mx-auto w-full max-w-6xl ${className}`}>
                {children}
            </div>
        </section>
    );
}