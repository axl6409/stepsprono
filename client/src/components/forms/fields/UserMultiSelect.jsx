import React, { useEffect, useMemo, useRef, useState } from "react";

export default function UserMultiSelect({
    items = [], // [{ id, username, img, ... }]
    value = [], // [ids]
    onChange,   // (ids) => void
    getLabel = (u) => u.username ?? u.label ?? "",
    getAvatar,  // (u) => url | undefined
    placeholder = "Sélectionner des utilisateurs",
    className = ""
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter(u => getLabel(u).toLowerCase().includes(q)) : items;
  }, [items, query, getLabel]);

  const toggle = (id) => {
    const next = value.includes(id) ? value.filter(v => v !== id) : [...value, id];
    onChange(next);
  };

  const selectAllFiltered = () => onChange(Array.from(new Set([...value, ...filtered.map(u => u.id)])));
  const clearAll = () => onChange([]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full border border-black rounded-md shadow-flat-black-adjust py-1 px-2 text-left"
      >
        {value.length ? `${value.length} sélectionné(s)` : placeholder}
      </button>

      <div className={`relative z-20 mt-1 transition-all duration-300 ease-in-out ${open ? "max-h-250 shadow-lg border border-gray-300" : "max-h-0"} w-full bg-white rounded-md overflow-hidden`}>
        <div className="p-2 border-b">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full font-roboto text-xxs border rounded px-2 py-1"
          />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={selectAllFiltered} className="px-2 py-1 font-roboto text-xxs border rounded">
              Tout sélectionner (filtré)
            </button>
            <button type="button" onClick={clearAll} className="px-2 py-1 font-roboto text-xxs border rounded">
              Effacer
            </button>
          </div>
        </div>

        <ul role="listbox" aria-multiselectable="true" className="max-h-56 overflow-auto">
          {filtered.map(u => {
            const selected = value.includes(u.id);
            return (
              <li
                key={u.id}
                role="option"
                aria-selected={selected}
                onClick={() => toggle(u.id)}
                className={`cursor-pointer p-2 flex items-center ${selected ? "bg-blue-medium text-white" : "hover:bg-gray-50"}`}
              >
                {getAvatar && (
                  <img
                    src={getAvatar(u)}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover object-center mr-3"
                  />
                )}
                <span>{getLabel(u)}</span>
                {selected && <span className="ml-auto font-bold">✔</span>}
              </li>
            );
          })}
          {!filtered.length && <li className="p-2 text-sm text-gray-500">Aucun résultat</li>}
        </ul>
      </div>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.filter(u => value.includes(u.id)).map(u => (
            <span key={u.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border">
              {getAvatar && <img src={getAvatar(u)} alt="" className="w-4 h-4 rounded-full" />}
              <span>{getLabel(u)}</span>
              <button
                type="button"
                onClick={() => toggle(u.id)}
                aria-label={`Retirer ${getLabel(u)}`}
                className="ml-1"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
