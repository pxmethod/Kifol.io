import type { HighlightFormData } from '@/types/achievement';
import { compareDateStrings } from '@/lib/highlightDates';

export function validateYmd(dateString: string): { isValid: boolean; error?: string } {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Please enter a valid month (1-12)' };
  }
  if (day < 1 || day > 31) {
    return { isValid: false, error: 'Please enter a valid day (1-31)' };
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear + 10;
  if (year < minYear || year > maxYear) {
    return { isValid: false, error: `Please enter a date between ${minYear} and ${maxYear}` };
  }

  const futureLimit = new Date();
  futureLimit.setFullYear(currentYear + 10);
  if (date > futureLimit) {
    return { isValid: false, error: 'Date cannot be more than 10 years in the future' };
  }

  return { isValid: true };
}

/** Returns field keys with errors for highlight metadata (type, dates, custom label). */
export function validateHighlightMetadata(
  formData: Pick<HighlightFormData, 'type' | 'date' | 'dateEnd' | 'ongoing' | 'customTypeLabel'>
): Record<string, string> {
  const newErrors: Record<string, string> = {};

  if (!formData.type) {
    newErrors.type = 'Please select a highlight type';
  }

  if (formData.type === 'custom' && !formData.customTypeLabel.trim()) {
    newErrors.customTypeLabel = 'Please enter a custom type name';
  }

  if (!formData.date) {
    newErrors.date = 'Start date is required';
  } else {
    const startVal = validateYmd(formData.date);
    if (!startVal.isValid && startVal.error) {
      newErrors.date = startVal.error;
    }
  }

  if (!formData.ongoing) {
    if (!formData.dateEnd) {
      newErrors.dateEnd = 'End date is required (or check “Currently working on it”)';
    } else {
      const endVal = validateYmd(formData.dateEnd);
      if (!endVal.isValid && endVal.error) {
        newErrors.dateEnd = endVal.error;
      } else if (formData.date && endVal.isValid) {
        if (compareDateStrings(formData.date, formData.dateEnd) > 0) {
          newErrors.dateEnd = 'End date must be on or after start date';
        }
      }
    }
  }

  return newErrors;
}
