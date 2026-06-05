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
    <div className="flex flex-col gap-2">
      <input
        className="w-fit border px-2"
        placeholder="개념 검색"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
      />
      <div className="flex w-fit flex-col">
        {topics.map((topic) => (
          <button key={topic} className={active.includes(topic) ? 'font-bold' : 'opacity-50'} onClick={() => onToggle(topic)}>
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
