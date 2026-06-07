'use client'
import { useGraph } from '@/lib/graph-store'
import { exportJSON, importJSON } from '@/lib/storage'

export function Controls() {
  const { nodes, edges, setAll, removeNode } = useGraph()

  // 그래프 전체 비우기 (되돌릴 수 없으니 confirm 한 번)
  function clearAll() {
    if (confirm('그래프를 모두 비울까요? 되돌릴 수 없어요.')) setAll([], [])
  }

  // JSON 내보내기: 현재 그래프를 파일로 다운로드
  function download() {
    const blob = new Blob([exportJSON({ nodes, edges })], { type: 'application/json' })
    const url = URL.createObjectURL(blob) // 그 파일을 가리키는 임시 주소
    const link = document.createElement('a')
    link.href = url
    link.download = 'my-graph.json'
    link.click() // 보이지 않는 링크를 코드로 눌러 다운로드 시작

    // 다운로드가 시작된 뒤(다음 tick) 정리. click 직후 바로 해제하면 다운로드가 경쟁에서 져 실패/0바이트가 될 수 있음
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  // JSON 가져오기: 올린 파일을 읽어 그래프로 복원
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const graph = importJSON(await file.text()) // 입구(바깥 데이터) → try/catch로 감쌈
      setAll(graph.nodes, graph.edges)
    } catch {
      alert('올바른 그래프 JSON이 아니에요')
    }
    event.target.value = '' // 같은 파일을 또 올려도 onChange가 다시 불리도록 초기화
  }

  return (
    <div className="flex items-center gap-2">
      <button className="border px-2" onClick={clearAll}>
        비우기
      </button>
      <button className="border px-2" onClick={download}>
        JSON 내보내기
      </button>

      {/* 파일 input은 못생겨서 숨기고, label을 버튼처럼 보이게 (label 누르면 숨은 input이 눌림) */}
      <label className="cursor-pointer border px-2">
        JSON 가져오기
        <input type="file" accept=".json" className="hidden" onChange={upload} />
      </label>

      {/* 점 삭제: 고른 점을 removeNode (스토어가 연결선도 함께 정리) */}
      <select className="border" value="" onChange={(event) => event.target.value && removeNode(event.target.value)}>
        <option value="">점 삭제</option>
        {nodes.map((node) => (
          <option key={node.id} value={node.id}>
            {node.label}
          </option>
        ))}
      </select>
    </div>
  )
}
