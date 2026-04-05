'use client';

import { FormFieldError, FormFieldErrorList } from '@/components/forms/FormFieldError';
import { HIGHLIGHT_TYPES, type HighlightFormData, type HighlightType } from '@/types/achievement';
import { HighlightTypeIcon } from '@/lib/highlightTypeIcons';

export interface HighlightMetadataSectionProps {
  formData: HighlightFormData;
  errors: Record<string, string>;
  isTypeDropdownOpen: boolean;
  setIsTypeDropdownOpen: (open: boolean) => void;
  onChange: (field: keyof HighlightFormData, value: string | File[] | boolean) => void;
}

export default function HighlightMetadataSection({
  formData,
  errors,
  isTypeDropdownOpen,
  setIsTypeDropdownOpen,
  onChange,
}: HighlightMetadataSectionProps) {
  const getSelectedType = () => HIGHLIGHT_TYPES.find((t) => t.id === formData.type);

  return (
    <>
      <div>
        <label htmlFor="type" className="block text-md font-medium text-discovery-black mb-2 text-left">
          Type *
        </label>
        <FormFieldError id="highlight-type-error" message={errors.type} />
        <div className="type-dropdown relative">
          <button
            type="button"
            id="type"
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className={`w-full px-4 py-3 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors cursor-pointer text-discovery-black ${
              errors.type ? 'border border-red-500' : ''
            } ${isTypeDropdownOpen ? 'ring-2 ring-discovery-primary border-transparent' : ''}`}
            style={
              !errors.type && !isTypeDropdownOpen
                ? { border: '1px solid #DDDDE1', backgroundColor: '#ffffff' }
                : {}
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                {formData.type ? (
                  <HighlightTypeIcon
                    type={formData.type as HighlightType}
                    className="w-5 h-5 shrink-0 text-discovery-black"
                  />
                ) : null}
                <span
                  className={`ml-2 truncate ${formData.type ? 'text-discovery-black' : 'text-discovery-grey'}`}
                >
                  {getSelectedType()?.name || 'Select a type...'}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-discovery-grey transition-transform shrink-0 ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isTypeDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-discovery-white-100 border border-discovery-grey-300 rounded-lg shadow-lg max-h-[min(70vh,28rem)] overflow-y-auto">
              {HIGHLIGHT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    onChange('type', type.id);
                    setIsTypeDropdownOpen(false);
                  }}
                  className="w-full px-3 py-3 text-left hover:bg-discovery-beige-100 first:rounded-t-lg last:rounded-b-lg flex items-center transition-colors"
                >
                  <div className="flex items-center">
                    <HighlightTypeIcon type={type.id} className="w-5 h-5 shrink-0 text-discovery-black" />
                    <div className="ml-3 min-w-0">
                      <div className="text-base font-medium text-discovery-black">{type.name}</div>
                      <div className="text-xs text-discovery-grey">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {formData.type === 'custom' && (
        <div>
          <label htmlFor="customTypeLabel" className="block text-md font-medium text-discovery-black mb-2 text-left">
            Custom type *
          </label>
          <FormFieldError id="highlight-custom-type-error" message={errors.customTypeLabel} />
          <input
            type="text"
            id="customTypeLabel"
            value={formData.customTypeLabel}
            onChange={(e) => onChange('customTypeLabel', e.target.value)}
            placeholder="Add custom type..."
            maxLength={80}
            aria-invalid={!!errors.customTypeLabel}
            aria-describedby={errors.customTypeLabel ? 'highlight-custom-type-error' : undefined}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black ${
              errors.customTypeLabel ? 'border-red-500' : 'border-discovery-grey-300'
            }`}
          />
        </div>
      )}

      <div>
        <p className="block text-md font-medium text-discovery-black mb-2 text-left">Dates *</p>
        <FormFieldErrorList id="highlight-dates-errors" messages={[errors.date, errors.dateEnd]} />
        {/* One row on md+: labels align; inputs share fixed height; checkbox aligns to input row */}
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="min-w-0 w-full max-w-full md:w-[9.25rem] md:max-w-[9.25rem] md:flex-none md:shrink-0">
            <label htmlFor="dateStart" className="block text-sm font-medium text-discovery-grey mb-1.5 leading-tight text-left">
              Start date
            </label>
            <input
              type="date"
              id="dateStart"
              value={formData.date}
              onChange={(e) => onChange('date', e.target.value)}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date || errors.dateEnd ? 'highlight-dates-errors' : undefined}
              className={`h-11 w-full min-w-0 box-border px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black cursor-pointer ${
                errors.date ? 'border-red-500' : 'border-discovery-grey-300'
              }`}
            />
          </div>

          <div className="min-w-0 w-full max-w-full md:w-[9.25rem] md:max-w-[9.25rem] md:flex-none md:shrink-0">
            <label htmlFor="dateEnd" className="block text-sm font-medium text-discovery-grey mb-1.5 leading-tight text-left">
              End date
            </label>
            <input
              type="date"
              id="dateEnd"
              value={formData.dateEnd}
              disabled={formData.ongoing}
              onChange={(e) => onChange('dateEnd', e.target.value)}
              aria-invalid={!!errors.dateEnd}
              aria-describedby={errors.date || errors.dateEnd ? 'highlight-dates-errors' : undefined}
              className={`h-11 w-full min-w-0 box-border px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black cursor-pointer disabled:bg-discovery-beige-100 disabled:text-discovery-grey disabled:cursor-not-allowed ${
                errors.dateEnd ? 'border-red-500' : 'border-discovery-grey-300'
              }`}
            />
          </div>

          <div className="shrink-0 pb-px md:pl-1">
            <label className="checkbox checkbox--sm cursor-pointer select-none md:whitespace-nowrap">
              <input
                type="checkbox"
                checked={formData.ongoing}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onChange('ongoing', checked);
                  if (checked) {
                    onChange('dateEnd', '');
                  }
                }}
                className="checkbox__input mt-0"
              />
              <span className="checkbox__label text-discovery-black">Currently working on it</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
