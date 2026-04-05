'use client';

import { useState, useEffect, useMemo, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { TemplateConfig, PortfolioTemplateProps } from '@/types/template';
import { getTemplateNextFont } from '@/lib/templateFonts';
import { Achievement, HighlightType, getHighlightTypeDisplayName } from '@/types/achievement';
import HighlightDetailModal from '@/components/HighlightDetailModal';
import EndorsementBlock from '@/components/EndorsementBlock';
import HighlightTypeFilter, { filterAchievementsByTypes } from '@/components/HighlightTypeFilter';
import { HighlightTypeIcon } from '@/lib/highlightTypeIcons';
import { formatTextWithLinks } from '@/utils/text-formatting';
import {
  formatHighlightDateDisplay,
  formatHighlightMonthYearFromSortKey,
  highlightDateToMonthSortKey,
  parseHighlightDateLocal,
} from '@/lib/highlightDates';

interface BaseTemplateProps extends PortfolioTemplateProps {
  config: TemplateConfig;
}

/** Inner content shell (white); page backdrop comes from `config.pageBackground`. */
const surface = {
  /** Recessed section inside the main white shell (e.g. month groups). */
  sectionTray: 'rgb(246, 248, 250)',
  cardBg: '#ffffff',
  text: '#171717',
  textMuted: '#525252',
};

/** Inner padding 20px (p-5) at all breakpoints — matches mobile; desktop no longer uses 32px (p-8). */
const mainShellClass =
  'rounded-[1.75rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_24px_rgba(0,0,0,0.06)] md:shadow-[0_4px_36px_rgba(0,0,0,0.07)]';

export default function BaseTemplate({ portfolio, config, previewMode }: BaseTemplateProps) {
  const templateFont = useMemo(() => getTemplateNextFont(portfolio.template), [portfolio.template]);
  const rawHighlights = portfolio.achievements || [];
  const [highlightTypeFilter, setHighlightTypeFilter] = useState<HighlightType[] | null>(null);
  const highlights = useMemo(
    () => filterAchievementsByTypes(rawHighlights, highlightTypeFilter),
    [rawHighlights, highlightTypeFilter]
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const sortedHighlights = [...highlights].sort(
    (a, b) =>
      parseHighlightDateLocal(b.date).getTime() - parseHighlightDateLocal(a.date).getTime()
  );

  const groupedHighlights = sortedHighlights.reduce(
    (groups: { [key: string]: Achievement[] }, highlight) => {
      const sortKey = highlightDateToMonthSortKey(highlight.date);
      if (!groups[sortKey]) {
        groups[sortKey] = [];
      }
      groups[sortKey].push(highlight);
      return groups;
    },
    {}
  );

  const [selectedHighlight, setSelectedHighlight] = useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const modalFontFamily = templateFont.style.fontFamily;

  /** Onboarding preview: match mobile layout (stacked column) at all sizes. */
  const shellClass = previewMode
    ? 'rounded-[1.75rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_24px_rgba(0,0,0,0.06)]'
    : mainShellClass;
  const heroRowClass = previewMode
    ? 'flex flex-col items-center gap-8 text-center'
    : 'flex flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:gap-12 md:text-left lg:gap-16';
  const heroPhotoColClass = previewMode
    ? 'order-1 shrink-0'
    : 'order-1 shrink-0 md:order-2 md:mx-0';
  const heroTextColClass = previewMode
    ? 'order-2 flex w-full min-w-0 flex-1 flex-col space-y-4'
    : 'order-2 flex w-full min-w-0 flex-1 flex-col space-y-4 md:order-1 md:max-w-xl md:space-y-5 md:pr-4';
  const heroTitleClass = previewMode
    ? 'text-4xl font-semibold tracking-tight text-neutral-900 sm:text-4xl'
    : 'text-4xl font-semibold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.5rem] md:leading-[1.1]';
  const heroSubtitleClass = previewMode
    ? 'mx-auto max-w-md text-lg leading-relaxed text-neutral-600 sm:text-base'
    : 'mx-auto max-w-md text-lg leading-relaxed text-neutral-600 sm:text-base md:mx-0 md:max-w-none';
  const placeholderInitialClass = previewMode
    ? 'flex h-full w-full items-center justify-center bg-neutral-100 text-4xl font-semibold text-neutral-400 sm:text-5xl'
    : 'flex h-full w-full items-center justify-center bg-neutral-100 text-4xl font-semibold text-neutral-400 sm:text-5xl md:text-5xl lg:text-6xl';
  const highlightCardClass = previewMode
    ? 'rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
    : 'cursor-pointer rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md md:p-6';

  const handleViewHighlight = (highlight: Achievement) => {
    setSelectedHighlight(highlight);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedHighlight(null);
  };

  const getMediaIcon = (mediaType: string) => {
    const iconClass = 'w-4 h-4 text-neutral-500';
    switch (mediaType) {
      case 'image':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'video':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case 'pdf':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case 'audio':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${templateFont.className} antialiased ${previewMode ? 'min-h-full w-full' : 'min-h-screen'}`}
      style={{ background: config.pageBackground, color: surface.text }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .sf-animate-in {
          animation: fadeInUp 0.65s ease-out forwards;
        }
      `}</style>

      {/* 560px max column on web; onboarding preview matches phone width, expands to 560px on lg+ (same as live portfolio). */}
      <div
        className={`mx-auto w-full ${
          previewMode
            ? 'max-w-[390px] lg:max-w-[560px] px-2 py-4'
            : 'max-w-[560px] px-2 py-4 md:py-8 lg:py-8'
        }`}
      >
        <div className={shellClass}>
        {/* Hero — mobile: centered stack (photo → name → bio); md+: text left, photo right; no actions */}
        <header
          className={`m-8 ${isLoaded ? 'sf-animate-in' : 'opacity-0'}`}
        >
          <div className={heroRowClass}>
            {/* Photo first on mobile (order-1); right column on desktop */}
            <div className={heroPhotoColClass}>
              <div
                className="relative mx-auto h-[150px] w-[150px] shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-4 ring-white shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              >
                {portfolio.photoUrl ? (
                  <Image
                    src={portfolio.photoUrl}
                    alt={portfolio.childName}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={placeholderInitialClass}>
                    {portfolio.childName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Name + description below photo on mobile; left column on desktop */}
            <div className={heroTextColClass}>
              <h1 className={heroTitleClass}>
                {portfolio.childName}
              </h1>
              <p className={heroSubtitleClass}>
                {portfolio.portfolioTitle}
              </p>
            </div>
          </div>
        </header>

        {!previewMode && (
          <div
            className={`mx-8 mb-8 md:mb-10 ${isLoaded ? 'sf-animate-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.05s' }}
          >
            <HighlightTypeFilter
              value={highlightTypeFilter}
              onChange={setHighlightTypeFilter}
              surfaceVariant="card"
              labelClassName="text-neutral-700"
              labelStyle={{ fontFamily: modalFontFamily }}
            />
          </div>
        )}

        {/* Timeline — month “trays” with cards inside */}
        <div
          className={`${previewMode ? 'space-y-8' : 'space-y-8 md:space-y-10'} ${isLoaded ? 'sf-animate-in' : 'opacity-0'}`}
          style={{ animationDelay: '0.1s' }}
        >
          {rawHighlights.length > 0 && highlights.length === 0 && (
            <div className="rounded-lg border border-[#e5e7eb] bg-neutral-50/80 px-5 py-12 text-center">
              <p className="text-lg text-neutral-600">No highlights match this filter.</p>
            </div>
          )}

          {Object.entries(groupedHighlights)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([sortKey, dateHighlights]) => (
            <section
              key={sortKey}
              className={previewMode ? 'rounded-lg p-6' : 'rounded-lg p-6 sm:p-6 md:p-6'}
              style={{ backgroundColor: surface.sectionTray }}
            >
              <div className={previewMode ? 'mb-6' : 'mb-6 md:mb-8'}>
                <h2 className="text-lg font-semibold text-neutral-700 sm:text-lg">
                  {formatHighlightMonthYearFromSortKey(sortKey)}
                </h2>
              </div>

              <div className={previewMode ? 'flex flex-col gap-4' : 'flex flex-col gap-4 md:gap-5'}>
                {dateHighlights.map((highlight: Achievement) => {
                  const mediaByType = highlight.media.reduce((acc: Record<string, number>, media: { type: string }) => {
                    acc[media.type] = (acc[media.type] || 0) + 1;
                    return acc;
                  }, {});

                  return (
                    <article
                      key={highlight.id}
                      {...(previewMode
                        ? {}
                        : {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => handleViewHighlight(highlight),
                            onKeyDown: (e: KeyboardEvent) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleViewHighlight(highlight);
                              }
                            },
                          })}
                      className={highlightCardClass}
                    >
                      <div className="mb-3 flex flex-col items-stretch gap-2">
                        <div className="flex w-full min-w-0 items-center justify-between gap-3">
                          <span className="inline-flex min-w-0 shrink items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 sm:text-sm">
                            <HighlightTypeIcon
                              type={highlight.type as HighlightType}
                              className="h-3.5 w-3.5 shrink-0 text-neutral-700"
                              strokeWidth={2}
                            />
                            <span className="truncate">{getHighlightTypeDisplayName(highlight)}</span>
                          </span>
                          <div className="flex shrink-0 items-center gap-1.5 text-neutral-500">
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-xs sm:text-sm text-neutral-600">
                              {formatHighlightDateDisplay(highlight)}
                            </span>
                          </div>
                        </div>
                        <h3 className="w-full min-w-0 text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
                          {highlight.title}
                        </h3>
                      </div>

                      {highlight.description && (
                        <p className="mb-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                          {previewMode
                            ? highlight.description
                            : formatTextWithLinks(highlight.description, surface.textMuted)}
                        </p>
                      )}

                      {highlight.media.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {highlight.media.slice(0, 4).map((media: { type: string; url: string }, index: number) => (
                            <div
                              key={index}
                              className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-24"
                            >
                              {media.type === 'image' &&
                              !media.url.includes('.mp4') &&
                              !media.url.includes('.mov') &&
                              !media.url.includes('.avi') ? (
                                <Image
                                  src={media.url}
                                  alt=""
                                  width={96}
                                  height={96}
                                  className="h-full w-full object-cover"
                                />
                              ) : media.type === 'video' ||
                                media.url.includes('.mp4') ||
                                media.url.includes('.mov') ||
                                media.url.includes('.avi') ? (
                                <div className="relative flex h-full w-full items-center justify-center bg-neutral-200">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
                                      <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : media.type === 'pdf' ? (
                                <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                                  <svg className="h-8 w-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              ) : media.type === 'audio' ? (
                                <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                                  <svg className="h-8 w-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                    />
                                  </svg>
                                </div>
                              ) : null}
                            </div>
                          ))}
                          {highlight.media.length > 4 && (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100 sm:h-24 sm:w-24">
                              <span className="text-sm font-medium text-neutral-700">+{highlight.media.length - 4}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {highlight.media.length > 0 && (
                        <div
                          className={`flex flex-wrap items-center justify-start gap-3 ${
                            highlight.endorsements && highlight.endorsements.length > 0 ? 'mb-4' : ''
                          }`}
                        >
                          {Object.entries(mediaByType).map(([type, count]) => (
                            <div key={type} className="flex items-center gap-1 text-neutral-500">
                              {getMediaIcon(type)}
                              <span className="text-xs sm:text-sm">{count as number}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {highlight.endorsements && highlight.endorsements.length > 0 && (
                        <div className="mb-4">
                          <EndorsementBlock
                            endorsements={highlight.endorsements}
                            textColor={surface.text}
                            secondaryColor={surface.textMuted}
                            fontFamily={modalFontFamily}
                            compact
                            publicVariant
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {rawHighlights.length === 0 && (
          <div
            className={`mx-8 rounded-xl border border-[#e5e7eb] bg-neutral-50/80 px-5 py-14 text-center ${isLoaded ? 'sf-animate-in' : 'opacity-0'}`}
          >
            <p className="text-lg text-neutral-600">No highlights yet</p>
          </div>
        )}

        <footer
          className={`mx-8 mt-10 border-t border-[#e5e7eb] ${
            previewMode ? 'pt-8' : 'pt-8 md:mt-12 md:pt-10'
          } ${isLoaded ? 'sf-animate-in' : 'opacity-0'}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-500">
            <span>Created with</span>
            <Image
              src="/kifolio_logo_dark.svg"
              alt="Kifolio"
              width={80}
              height={20}
              className="inline-block opacity-80"
            />
            <span aria-hidden>•</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </footer>
        </div>
      </div>

      <HighlightDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onEdit={() => {}}
        achievement={selectedHighlight}
        showEditButton={false}
        fontFamily={modalFontFamily}
      />
    </div>
  );
}
