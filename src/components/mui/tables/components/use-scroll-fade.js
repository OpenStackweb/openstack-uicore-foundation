import * as React from "react";

const useScrollFade = () => {
  const containerRef = React.useRef(null);
  const [showLeftFade, setShowLeftFade] = React.useState(false);
  const [showRightFade, setShowRightFade] = React.useState(false);

  const updateFades = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 0);
    setShowRightFade(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth);
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    updateFades();
    el.addEventListener("scroll", updateFades);

    return () => el.removeEventListener("scroll", updateFades);
  }, [updateFades]);

  return { containerRef, showLeftFade, showRightFade };
};

export default useScrollFade;
