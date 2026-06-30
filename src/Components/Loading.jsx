import React, { useCallback, useLayoutEffect, useState } from "react";

const CONTENT_ID = "app-content-left-margin";

 function Loading({ size, offsetY = 0, isDrawerLoading = false }) {
  const [box, setBox] = useState({
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
  });

  const syncBox = useCallback(() => {
    const el = document.getElementById(CONTENT_ID);
    if (!el) {
      setBox({
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      });
      return;
    }

    const layoutRect = el.getBoundingClientRect();
    const nav = el.querySelector(".antMenu");
    const navRect = nav?.getBoundingClientRect();
    const topBase =
      navRect && navRect.height > 4 ? navRect.bottom : layoutRect.top;

    const top = topBase + offsetY;

    setBox({
      top,
      left: layoutRect.left,
      width: layoutRect.width,
      height: Math.max(0, window.innerHeight - top),
    });
  }, [offsetY]);

  useLayoutEffect(() => {
 
    syncBox();

    const el = document.getElementById(CONTENT_ID);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncBox())
        : null;
    if (el && ro) {
      ro.observe(el);
    }

    const mo =
      el && typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => syncBox())
        : null;
    if (el && mo) {
      mo.observe(el, { attributes: true, attributeFilter: ["style"] });
    }

    window.addEventListener("resize", syncBox);

    return () => {
      ro?.disconnect();
      mo?.disconnect();
      window.removeEventListener("resize", syncBox);
    };
  }, [syncBox]);

  const dim = size ?? 120;

  return (
    <div
      style={{
        position: "fixed",
        top:  isDrawerLoading ? 0 : box.top,
        left:  isDrawerLoading ? 0 : box.left,
        width: isDrawerLoading ? "100%" : box.width,
        height:  isDrawerLoading ? "100%" : box.height,
        zIndex: 999,
        background: "rgba(255, 255, 255, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(2px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          height: dim,
          width: dim,
          border: "2px solid #d6d1d1",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0px 1px 6px 3px #ccc",
          background: "white",
          zIndex: 99,
          flexShrink: 0,
        }}
      >
        <img
          src="/loading.gif"
          alt="loading"
          style={{ width: Math.round(dim * 0.7), height: "auto" }}
        />
      </div>
    </div>
  );
}

export default React.memo(Loading) ;