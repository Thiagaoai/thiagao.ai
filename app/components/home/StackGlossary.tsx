'use client';

import { useState } from 'react';

export type StackItem = { name: string; about: string };
export type StackGroup = { title: string; items: StackItem[] };

type Props = { groups: StackGroup[]; cardClass: string; chipClass: string };

const HINT = 'Toque ou passe o mouse em uma ferramenta para ver o que é e para que eu uso.';

// The "Stack completo" cards. Each chip is a button: hovering previews its
// explanation, tapping pins it (one per card), so phones get the same text
// as desktops without a tooltip that would be hard to reach.
export default function StackGlossary({ groups, cardClass, chipClass }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {groups.map((group) => (
        <StackCard key={group.title} group={group} cardClass={cardClass} chipClass={chipClass} />
      ))}
    </div>
  );
}

function StackCard({ group, cardClass, chipClass }: { group: StackGroup; cardClass: string; chipClass: string }) {
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const shownName = hovered ?? pinned;
  const shown = group.items.find((item) => item.name === shownName) ?? null;
  const panelId = `stack-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className={`${cardClass} flex flex-col p-5`}>
      <p className="mb-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">{group.title}</p>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item) => {
          const active = shown?.name === item.name;
          return (
            <button
              key={item.name}
              type="button"
              aria-expanded={pinned === item.name}
              aria-controls={panelId}
              onClick={() => setPinned((current) => (current === item.name ? null : item.name))}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(item.name)}
              onBlur={() => setHovered(null)}
              className={`${chipClass} cursor-pointer transition-colors ${
                active ? 'border-glow/60 bg-glow/10 text-foreground' : 'hover:border-white/30'
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      <p
        id={panelId}
        aria-live="polite"
        className="mt-5 min-h-[5.5rem] border-t border-white/10 pt-4 text-sm leading-relaxed text-muted-foreground"
      >
        {shown ? (
          <>
            <span className="font-medium text-foreground">{shown.name}:</span> {shown.about}
          </>
        ) : (
          HINT
        )}
      </p>
    </div>
  );
}
