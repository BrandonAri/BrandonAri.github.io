type ArrowDirection = "down" | "down-right" | "right" | "up" | "up-right";

export function Arrow({ direction }: { direction: ArrowDirection }) {
  return (
    <span
      className={`ui-arrow ui-arrow--${direction}`}
      aria-hidden="true"
    />
  );
}
