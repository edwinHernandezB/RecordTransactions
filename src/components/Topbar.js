export default function TopBar({ title, onBack, showBackButton = true }) {
  return (
    <div className="topbar">
      {showBackButton && (
        <button className="back-btn" onClick={onBack}>
          <img
            src="/assets/atras.png"
            alt="Back"
            style={{ width: "22px", height: "22px" }}
          />

        </button>
      )}

      <h2 className="topbar-title">{title}</h2>
    </div>
  );
}
