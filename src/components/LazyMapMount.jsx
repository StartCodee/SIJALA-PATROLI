import { useEffect, useRef, useState } from "react";

const OBSERVER_ROOT_MARGIN = "300px 0px";

export default function LazyMapMount({
    children,
    lang = "ID",
    className = "h-full w-full",
}) {
    const containerRef = useRef(null);
    const [shouldRender, setShouldRender] = useState(
        () => typeof window === "undefined" || !("IntersectionObserver" in window)
    );

    useEffect(() => {
        if (shouldRender) {
            return undefined;
        }

        const target = containerRef.current;

        if (!target) {
            return undefined;
        }

        const observer = new window.IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { rootMargin: OBSERVER_ROOT_MARGIN }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [shouldRender]);

    return (
        <div ref={containerRef} className={className}>
            {shouldRender ? (
                children
            ) : (
                <div className="relative h-full w-full overflow-hidden bg-slate-950/30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_42%),linear-gradient(180deg,rgba(3,7,18,0.08),rgba(3,7,18,0.5))]" />
                    <div className="absolute inset-0 animate-pulse bg-white/[0.03]" />
                    <div className="absolute inset-x-0 bottom-5 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
                        {lang === "EN" ? "Loading map" : "Memuat peta"}
                    </div>
                </div>
            )}
        </div>
    );
}
