import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: string[]
  selected: string[]
  onToggle: (tag: string) => void
  onClear: () => void
}

/** Multi-select chips for the user's own tags (AND logic, same as the feature chips). */
export function TagFilter({ tags, selected, onToggle, onClear }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by your tags"
    >
      <span className="text-xs font-medium text-zinc-500 uppercase">Your tags</span>
      {tags.map((tag) => {
        const isOn = selected.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(tag)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              isOn
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
            )}
          >
            #{tag}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-white"
        >
          Clear tags
        </button>
      )}
    </div>
  )
}
