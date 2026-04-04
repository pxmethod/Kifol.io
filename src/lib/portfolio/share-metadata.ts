import { createClient } from '@/lib/supabase/server';

const DEFAULT_OG_IMAGE = 'https://kifol.io/kifolio_logo_dark.svg';

export type PortfolioShareMeta = {
  child_name: string;
  portfolio_title: string;
  photo_url: string | null;
  is_private: boolean;
};

/**
 * Server-only fetch for OG / Twitter cards. Uses anon Supabase (same access as public /p/ page).
 */
export async function getPortfolioShareMetadata(
  shortId: string
): Promise<PortfolioShareMeta | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolios')
    .select('child_name, portfolio_title, photo_url, is_private')
    .eq('short_id', shortId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    child_name: data.child_name,
    portfolio_title: data.portfolio_title,
    photo_url: data.photo_url,
    is_private: data.is_private,
  };
}

export function resolveOgImage(meta: PortfolioShareMeta | null): string {
  if (meta && !meta.is_private && meta.photo_url?.startsWith('http')) {
    return meta.photo_url;
  }
  return DEFAULT_OG_IMAGE;
}
