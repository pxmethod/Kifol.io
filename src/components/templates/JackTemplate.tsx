'use client';

import { PortfolioTemplateProps } from '@/types/template';
import BaseTemplate from './BaseTemplate';
import { getTemplateConfig } from '@/config/templates';

export default function JackTemplate({ portfolio }: PortfolioTemplateProps) {
  const config = getTemplateConfig('jack');
  
  return <BaseTemplate portfolio={portfolio} config={config} />;
} 