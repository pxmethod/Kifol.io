'use client';

import { PortfolioTemplateProps } from '@/types/template';
import BaseTemplate from './BaseTemplate';
import { getTemplateConfig } from '@/config/templates';

export default function AdlerTemplate({ portfolio, previewMode }: PortfolioTemplateProps) {
  const config = getTemplateConfig('adler');

  return <BaseTemplate portfolio={portfolio} config={config} previewMode={previewMode} />;
} 