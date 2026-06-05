'use client'

export function SearchFilter({
  query,
  onQuery,
  topics,
  active,
  onToggle,
}: {
  query: string
  onQuery: (query: string) => void
  topics: string[]
  active: string[]
  onToggle: (topic: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input className="border px-2" placeholder="개념 검색" value={query} onChange={(event) => onQuery(event.target.value)} />
      {topics.map((topic) => (
        <button key={topic} className={active.includes(topic) ? 'font-bold' : 'opacity-50'} onClick={() => onToggle(topic)}>
          {topic}
        </button>
      ))}
    </div>
  )
}
