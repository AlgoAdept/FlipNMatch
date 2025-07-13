export default function Card({ color, show, onClick }) {
  return (
    <div
      className={`card ${show ? "flipped" : ""}`}
      style={show ? { background: color } : null}
      onClick={onClick}
    />
  );
}
