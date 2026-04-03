'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { HIGHLIGHT_TYPES, HighlightType } from '@/types/achievement';
import { HighlightTypeIcon } from '@/lib/highlightTypeIcons';

const ALL_IDS = HIGHLIGHT_TYPES.map((t) => t.id);

/** Same bg/shadow as highlight cards; 1px stroke #e5e7eb (Tailwind neutral-200). */
const CARD_PANEL_BASE =
  'border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200';
const CARD_PANEL_CLASS = `rounded-2xl ${CARD_PANEL_BASE}`;

/** Matches Tailwind `lg:` — mobile / tablet portrait uses modal instead of dropdown. */
function useIsBelowLg() {
  const [isBelowLg, setIsBelowLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const apply = () => setIsBelowLg(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return isBelowLg;
}

export function formatHighlightTypeFilterLabel(applied: HighlightType[] | null): string {
  if (applied === null) return 'All';
  if (applied.length === 0) return 'None';
  if (applied.length === ALL_IDS.length) return 'All';
  if (applied.length <= 2) {
    return applied
      .map((id) => HIGHLIGHT_TYPES.find((t) => t.id === id)?.name ?? id)
      .join(', ');
  }
  return `${applied.length} types`;
}

export function filterAchievementsByTypes<T extends { type: string }>(
  items: T[],
  filter: HighlightType[] | null
): T[] {
  if (filter === null) return items;
  const set = new Set(filter);
  return items.filter((h) => set.has(h.type as HighlightType));
}

export interface HighlightTypeFilterProps {
  /** `null` = show all types (default). */
  value: HighlightType[] | null;
  onChange: (next: HighlightType[] | null) => void;
  /** Optional label color (e.g. template text on public portfolio). */
  labelClassName?: string;
  labelStyle?: CSSProperties;
  className?: string;
  /**
   * `card` — trigger uses the same border/shadow/radius tokens as BaseTemplate highlight cards (same layout size as default).
   */
  surfaceVariant?: 'default' | 'card';
}

function TypeCheckboxList({
  draft,
  toggleType,
  onToggleAll,
  cardSurface,
}: {
  draft: Set<HighlightType>;
  toggleType: (id: HighlightType) => void;
  onToggleAll: () => void;
  /** Match BaseTemplate highlight card neutrals */
  cardSurface?: boolean;
}) {
  const allSelected = ALL_IDS.every((id) => draft.has(id));
  const someSelected = draft.size > 0 && !allSelected;
  const allInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = allInputRef.current;
    if (el) el.indeterminate = someSelected;
  }, [someSelected]);

  const rowClass = cardSurface
    ? 'checkbox items-center px-3 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-900'
    : 'checkbox items-center px-3 py-2.5 rounded-lg hover:bg-discovery-beige-100 transition-colors';

  return (
    <>
      <label className={rowClass}>
        <input
          ref={allInputRef}
          type="checkbox"
          checked={allSelected}
          onChange={onToggleAll}
          className="checkbox__input mt-0"
        />
        <span className="checkbox__label font-medium">All</span>
      </label>
      {HIGHLIGHT_TYPES.map((type) => {
        const checked = draft.has(type.id);
        return (
          <label key={type.id} className={rowClass}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleType(type.id)}
              className="checkbox__input mt-0"
            />
            <span className="checkbox__label font-medium flex items-center gap-2 min-w-0">
              <HighlightTypeIcon
                type={type.id}
                className={`w-4 h-4 shrink-0 ${cardSurface ? 'text-neutral-500' : 'text-discovery-grey/80'}`}
                strokeWidth={1.75}
              />
              {type.name}
            </span>
          </label>
        );
      })}
    </>
  );
}

export default function HighlightTypeFilter({
  value,
  onChange,
  labelClassName = 'text-discovery-black',
  labelStyle,
  className = '',
  surfaceVariant = 'default',
}: HighlightTypeFilterProps) {
  const isCard = surfaceVariant === 'card';
  const isMobile = useIsBelowLg();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<HighlightType>>(() => new Set(ALL_IDS));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const [desktopDropdownBox, setDesktopDropdownBox] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDesktopDropdownPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 4;
    const pad = 8;
    const minW = 260;
    // Card (public template): dropdown matches trigger width exactly for full-width control.
    const width = isCard
      ? Math.min(r.width, window.innerWidth - pad * 2)
      : Math.min(Math.max(r.width, minW), window.innerWidth - pad * 2);
    let left = r.left;
    if (left + width > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - width - pad);
    }
    const spaceBelow = Math.max(0, window.innerHeight - r.bottom - margin - pad);
    const preferredCap = Math.min(window.innerHeight * 0.7, 28 * 16);
    const maxHeight = Math.min(preferredCap, spaceBelow);
    setDesktopDropdownBox({
      top: r.bottom + margin,
      left,
      width,
      maxHeight,
    });
  }, [isCard]);

  useLayoutEffect(() => {
    if (!open || isMobile) {
      setDesktopDropdownBox(null);
      return;
    }
    updateDesktopDropdownPosition();
    const onMove = () => updateDesktopDropdownPosition();
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, isMobile, updateDesktopDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    if (value === null) {
      setDraft(new Set(ALL_IDS));
    } else {
      setDraft(new Set(value));
    }
  }, [open, value]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || isMobile) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        rootRef.current?.contains(t) ||
        desktopDropdownRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, isMobile]);

  const toggleType = (id: HighlightType) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = useCallback(() => {
    setDraft((prev) => {
      if (ALL_IDS.every((id) => prev.has(id))) {
        return new Set<HighlightType>();
      }
      return new Set(ALL_IDS);
    });
  }, []);

  const handleApply = () => {
    const selected = ALL_IDS.filter((id) => draft.has(id));
    if (selected.length === ALL_IDS.length) {
      onChange(null);
    } else {
      onChange(selected as HighlightType[]);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const label = formatHighlightTypeFilterLabel(value);

  return (
    <div
      ref={rootRef}
      className={`highlight-type-filter relative flex flex-wrap gap-2 ${
        isCard ? 'w-full items-center justify-start text-left' : 'items-center'
      } ${className}`}
    >
      <span className={`text-md font-medium ${labelClassName}`} style={labelStyle}>
        Show:
      </span>
      <div
        className={
          isCard
            ? 'relative min-w-0 w-full max-w-full flex-1'
            : 'relative min-w-[10rem] max-w-full flex-1 sm:flex-initial sm:max-w-md'
        }
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(!open)}
          className={
            isCard
              ? `w-full px-4 py-3 text-left text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300/60 cursor-pointer ${CARD_PANEL_CLASS} hover:shadow-md ${
                  open ? 'border-[#e5e7eb] ring-2 ring-neutral-300/45 shadow-md' : ''
                }`
              : `w-full px-4 py-3 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors cursor-pointer text-discovery-black ${
                  open ? 'ring-2 ring-discovery-primary border-transparent' : ''
                }`
          }
          style={
            isCard
              ? undefined
              : open
                ? undefined
                : {
                    border: '1px solid #DDDDE1',
                    backgroundColor: '#ffffff',
                  }
          }
          aria-expanded={open}
          aria-haspopup={isMobile ? 'dialog' : 'listbox'}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate ${isCard ? 'text-neutral-900' : 'text-discovery-black'}`}>{label}</span>
            <svg
              className={`w-5 h-5 shrink-0 transition-transform ${isCard ? 'text-neutral-500' : 'text-discovery-grey'} ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

      </div>

      {mounted &&
        !isMobile &&
        open &&
        desktopDropdownBox &&
        createPortal(
          <div
            ref={desktopDropdownRef}
            className={`fixed z-[100] flex min-h-0 flex-col overflow-hidden ${
              isCard
                ? 'rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md'
                : 'rounded-lg border border-discovery-grey-300 bg-discovery-white-100 shadow-lg'
            }`}
            style={{
              top: desktopDropdownBox.top,
              left: desktopDropdownBox.left,
              width: desktopDropdownBox.width,
              maxHeight: desktopDropdownBox.maxHeight,
              ...(isCard ? { border: '1px solid #e5e7eb' } : {}),
            }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-1">
              <TypeCheckboxList
                draft={draft}
                toggleType={toggleType}
                onToggleAll={toggleAll}
                cardSurface={isCard}
              />
            </div>
            <div
              className={`flex-shrink-0 border-t p-3 ${isCard ? 'border-[#e5e7eb] bg-white' : 'border-discovery-beige-100 bg-discovery-beige-200/50'}`}
            >
              <button
                type="button"
                onClick={handleApply}
                className={
                  isCard
                    ? 'w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800'
                    : 'w-full rounded-lg bg-discovery-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-discovery-orange-light'
                }
              >
                Apply
              </button>
            </div>
          </div>,
          document.body
        )}

      {mounted &&
        isMobile &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="highlight-type-filter-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close"
              onClick={handleCancel}
            />
            <div
              className={`relative w-full max-w-lg max-h-[85vh] flex flex-col mt-auto sm:mt-0 ${
                isCard
                  ? `rounded-t-2xl sm:rounded-2xl ${CARD_PANEL_BASE} hover:shadow-md`
                  : 'rounded-t-2xl sm:rounded-2xl bg-discovery-white-100 border border-discovery-grey-300 shadow-xl'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`px-4 pt-4 pb-2 border-b ${isCard ? 'border-[#e5e7eb]' : 'border-discovery-beige-100'}`}
              >
                <h2
                  id="highlight-type-filter-title"
                  className={`text-lg font-semibold ${isCard ? 'text-neutral-900' : 'text-discovery-black'}`}
                >
                  Highlight types
                </h2>
              </div>
              <div className="overflow-y-auto flex-1 p-2 min-h-0">
                <TypeCheckboxList
                  draft={draft}
                  toggleType={toggleType}
                  onToggleAll={toggleAll}
                  cardSurface={isCard}
                />
              </div>
              <div
                className={`flex gap-3 p-4 border-t ${
                  isCard ? 'border-[#e5e7eb] bg-white' : 'border-discovery-beige-100 bg-discovery-beige-200/50'
                }`}
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  className={
                    isCard
                      ? 'flex-1 px-4 py-3 rounded-xl text-sm font-semibold border border-[#e5e7eb] bg-white text-neutral-900 hover:bg-neutral-50 transition-colors'
                      : 'flex-1 px-4 py-3 rounded-lg text-sm font-semibold border border-discovery-beige-300 bg-discovery-white-100 text-discovery-black hover:bg-discovery-beige-100 transition-colors'
                  }
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className={
                    isCard
                      ? 'flex-1 bg-neutral-900 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-neutral-800 shadow-sm'
                      : 'flex-1 bg-discovery-orange text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-discovery-orange-light shadow-sm'
                  }
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
