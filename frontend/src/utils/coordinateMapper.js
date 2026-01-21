export function mapToPdfCoords(sig, scale) {
  return {
    x: sig.x / scale,
    y: sig.y / scale,
    width: sig.width / scale,
    height: sig.height / scale,
  };
}
