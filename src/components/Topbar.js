import { FiChevronLeft } from "react-icons/fi";

export default function TopBar({ title, onBack, showBackButton = true }) {
  return (
    <div className="topbar">
      {showBackButton && (
        <button className="back-btn" onClick={onBack}>
          <FiChevronLeft />
        </button>
      )}

      <h2 className="topbar-title">{title}</h2>
    </div>
  );
}
