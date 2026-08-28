export default function EmptyMovements({title, description, image}) {
  return (
    <div className="empty-state-container">
      <img
        src={image}
        alt="Empty State"
        className="empty-state-image"
      />
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-text">
        {description}
      </p>
    </div>
  );
}
