/**
 * Submitted endorsement for display on achievement cards.
 * Only includes fields safe to show publicly.
 */
export interface SubmittedEndorsement {
  id: string;
  instructorName: string;
  instructorTitle: string | null;
  organization: string | null;
  comment: string;
  submittedAt: string | null;
}
