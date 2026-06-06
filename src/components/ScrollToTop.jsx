import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // reset immediately
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // ensure DOM paint is finished
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
        });
    }, [pathname]);

    return null;
}