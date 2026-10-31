// A screen's index as the board and the screens list show it: 01, 02… for a design's screens, and
// B, C… for its explorations, the directions set aside beside the one it kept, A.
export function indexOf(i: number, kind: 'screen' | 'exploration') {
  return kind === 'screen' ? String(i + 1).padStart(2, '0') : String.fromCharCode(66 + i)
}
