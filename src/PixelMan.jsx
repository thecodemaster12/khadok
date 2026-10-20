// Pixel-art eater that gets rounder with each badge level (0 = skinny, 4 = legend).
const SKIN = '#e0a370', SHIRT = '#d9480f', BELLY = '#f59f00', PANTS = '#3b5bdb', DARK = '#2a211a', GOLD = '#fcc419'

export default function PixelMan({ level }) {
  const px = []
  const put = (x, y, w, h, c) => px.push(<rect key={px.length} x={x} y={y} width={w} height={h} fill={c} />)
  const bw = 4 + level * 2 // body width: 4 → 12
  const bx = 8 - bw / 2

  if (level === 4) { put(5, 0, 6, 1, GOLD); put(5, -1, 1, 1, GOLD); put(7, -1, 2, 1, GOLD); put(10, -1, 1, 1, GOLD) } // crown
  put(5, 1, 6, 5, SKIN) // head
  put(6, 3, 1, 1, DARK); put(9, 3, 1, 1, DARK) // eyes
  level >= 2 ? put(7, 5, 2, 1, DARK) : put(7, 5, 2, 0.5, DARK) // mouth gets wider/open
  if (level >= 3) put(5, 5, 1, 1, '#f08c8c'), put(10, 5, 1, 1, '#f08c8c') // cheeks
  put(bx, 6, bw, 7, SHIRT) // body
  if (level >= 1) put(bx + 1, 9, bw - 2, 3, BELLY) // belly
  put(bx - 1, 7, 1, 4, SKIN); put(bx + bw, 7, 1, 4, SKIN) // arms
  const lw = level >= 3 ? 3 : 2 // legs
  put(8 - lw - 1, 13, lw, 3, PANTS); put(9, 13, lw, 3, PANTS)
  put(8 - lw - 2, 16, lw + 1, 1, DARK); put(9, 16, lw + 1, 1, DARK) // shoes

  return (
    <svg className="pixel-man" key={level} viewBox="0 -1 16 18" shapeRendering="crispEdges" aria-hidden="true">
      {px}
    </svg>
  )
}
