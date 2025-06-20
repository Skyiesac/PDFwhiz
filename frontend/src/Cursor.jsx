import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

function Cursor() {
  const cursorRef = useRef();
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power4.out",
        });
      }
    };
    const handleDown = () => setIsDown(true);
    const handleUp = () => setIsDown(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  // Theme detection (body class)
  const isDark = document.body.classList.contains("dark-theme");

  return (
    <div
      ref={cursorRef}
      id="cursor"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: isDown ? 36 : 28,
        height: isDown ? 36 : 28,
        borderRadius: "50%",
        border: `2.5px solid ${isDark ? "#fff" : "#181b23"}`,
        background: "transparent",
        boxShadow: isDark
          ? "0 0 12px 2px rgba(41,121,255,0.15)"
          : "0 0 12px 2px rgba(41,121,255,0.10)",
        pointerEvents: "none",
        mixBlendMode: "difference",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
        transition: "border 0.2s, width 0.15s, height 0.15s, box-shadow 0.2s",
      }}
    />
  );
}

export default Cursor;