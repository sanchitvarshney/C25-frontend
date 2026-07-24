import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface SlidingPanelProps {
  open: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onClose: () => void;
  title?: string;
  width?: number | string;
  container?: HTMLElement | (() => HTMLElement | null);
  children: ReactNode;
}

const TRANSITION_MS = 280;
const COLLAPSED_WIDTH = 40;

export default function SlidingPanel({
  open,
  collapsed,
  onCollapsedChange,
  onClose,
  title,
  width = 220,
  container,
  children,
}: SlidingPanelProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timeout: ReturnType<typeof setTimeout>;
    if (open) {
      setMounted(true);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      timeout = setTimeout(() => setMounted(false), TRANSITION_MS);
    }
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  const effectiveWidth = collapsed ? COLLAPSED_WIDTH : width;

  const content = collapsed ? (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        padding: "12px 0",
        gap: 20,
      }}
    >
      {/* <IconButton onClick={onClose} disabled size="small" aria-label="Close">
            <CloseIcon fontSize="small"  />
          </IconButton> */}
      <IconButton
        size="small"
        onClick={() => onCollapsedChange(false)}
        aria-label="Collapse"
      >
        <ArrowForwardIcon
          fontSize="small"
          style={{ transform: "rotate(180deg)" }}
        />
      </IconButton>
    </div>
  ) : (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconButton
            size="small"
            onClick={() => onCollapsedChange(true)}
            aria-label="Collapse"
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>

          {/* <IconButton onClick={onClose} disabled size="small" aria-label="Close">
            <CloseIcon fontSize="small"  />
          </IconButton> */}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>{children}</div>
    </>
  );

  const target = typeof container === "function" ? container() : container;

  if (target) {
    const node = (
      <div
        style={{
          width: visible ? effectiveWidth : 0,
          flexShrink: 0,
          height: "100%",
          overflow: "hidden",
          borderLeft: visible ? "1px solid #f0f0f0" : "none",
          boxShadow: visible ? "-2px 0 8px rgba(0, 0, 0, 0.06)" : "none",
          transition: `width ${TRANSITION_MS}ms ease`,
          background: "#fff",
        }}
      >
        <div
          ref={panelRef}
          role="region"
          aria-label={title}
          tabIndex={-1}
          style={{
            width: effectiveWidth,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            outline: "none",
          }}
        >
          {content}
        </div>
      </div>
    );
    return createPortal(node, target);
  }

  // Fallback: no host container given, so behave like a normal full-viewport
  // drawer overlay with a backdrop.
  const node = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.45)",
          opacity: visible && !collapsed ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease`,
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: effectiveWidth,
          maxWidth: "100%",
          background: "#fff",
          boxShadow: "-6px 0 20px rgba(0, 0, 0, 0.15)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: `transform ${TRANSITION_MS}ms ease, width ${TRANSITION_MS}ms ease`,
          display: "flex",
          flexDirection: "column",
          outline: "none",
        }}
      >
        {content}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
