import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };
  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        zIndex: 1000,
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={handleOverlayClick}
    >
      <div style={{
        maxHeight: '90vh',
        overflowY: 'auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {children}
      </div>
    </div>
  );
}
