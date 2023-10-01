/**
 * Takes a twos complement representation of a number and returns the signed number
 * it represents
 */
export function convertTwosComplementToSignedJsValue(val: number, max: 127 | 32767): number {
  if (val <= max) {
    return val;
  } else {
    return val - 2 * (max + 1);
  }
}
