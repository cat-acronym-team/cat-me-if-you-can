import { interpolateHcl } from "d3-interpolate";

export function generateHclGradient(a: string, b: string) {
  const interpolate = interpolateHcl(a, b);
  const colors: string[] = [];
  for (let i = 0; i <= 10; i++) {
    colors.push(interpolate(i / 10));
  }
  return `linear-gradient(90deg, ${colors.join(", ")})`;
}
