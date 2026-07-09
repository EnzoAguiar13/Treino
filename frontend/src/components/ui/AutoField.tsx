'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Campo com auto save: dispara `onSave` com debounce a cada alteração.
 * Não existe botão salvar — o valor é persistido em tempo real.
 */
export function AutoField({
  label,
  value,
  onSave,
  type = 'text',
  textarea,
  placeholder,
  disabled,
  rows = 4,
}: {
  label: string;
  value: string | number;
  onSave: (value: string) => Promise<unknown> | void;
  type?: 'text' | 'number';
  textarea?: boolean;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  const [local, setLocal] = useState(String(value ?? ''));
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setLocal(String(value ?? ''));
  }, [value]);

  function handleChange(v: string) {
    editing.current = true;
    setLocal(v);
    setState('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await onSave(v);
        setState('saved');
      } catch {
        setState('idle');
      } finally {
        editing.current = false;
        setTimeout(() => setState('idle'), 1500);
      }
    }, 600);
  }

  const cls = 'input';
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-400">
        {label}
        <span
          className={`text-[10px] transition ${
            state === 'saving'
              ? 'text-neutral-500'
              : state === 'saved'
                ? 'text-brand'
                : 'text-transparent'
          }`}
        >
          {state === 'saving' ? 'Salvando…' : 'Salvo ✓'}
        </span>
      </span>
      {textarea ? (
        <textarea
          value={local}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          type={type}
          value={local}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}
