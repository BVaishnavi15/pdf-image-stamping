//SignatureOverlay.jxs
import { useEffect, useRef, useState } from "react";

export default function SignatureOverlay({ signature, onChange, onDelete, showDelete = false }) {
  const [mode, setMode] = useState(null);
  const start = useRef({});

  useEffect(() => {
    function onMouseMove(e) {
      if (!mode) return;

      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;

      if (mode === "drag") {
        onChange(signature.id, {
          x: start.current.xPos + dx,
          y: start.current.yPos + dy,
        });
      }

      if (mode === "resize") {
        onChange(signature.id, {
          width: Math.max(20, start.current.w + dx),
          height: Math.max(20, start.current.h + dy),
        });
      }
    }

    function onMouseUp() {
      setMode(null);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [mode, onChange, signature.id]);

  return (
    <div
      className="signature"
      style={{
        left: signature.x,
        top: signature.y,
        width: signature.width,
        height: signature.height,
      }}
      onMouseDown={(e) => {
        // Don't start dragging when clicking delete button
        if (e.target.closest(".signature-delete")) return;
        e.preventDefault();
        start.current = {
          x: e.clientX,
          y: e.clientY,
          xPos: signature.x,
          yPos: signature.y,
          w: signature.width,
          h: signature.height,
        };
        setMode("drag");
      }}
    >
      {showDelete && (
        <button
          type="button"
          className="signature-delete"
          title="Delete this signature"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(signature.id);
          }}
        >
          ✕
        </button>
      )}
      <img src={signature.preview} alt="signature" />

      <div
        className="resize-handle"
        onMouseDown={(e) => {
          e.stopPropagation();
          start.current = {
            x: e.clientX,
            y: e.clientY,
            w: signature.width,
            h: signature.height,
          };
          setMode("resize");
        }}
      />
    </div>
  );
}
