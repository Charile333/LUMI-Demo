import React from 'react'

function DynamicBackground() {
  // 生成 200 个三角形元素
  const count = 200
  const triangles = Array.from({ length: count }, (_, i) => (
    <div key={i} className="tri"></div>
  ))

  return <div className="wrap">{triangles}</div>
}

export default DynamicBackground

