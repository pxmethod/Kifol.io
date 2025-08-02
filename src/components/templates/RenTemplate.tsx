'use client';

import { PortfolioTemplateProps } from '@/types/template';
import BaseTemplate from './BaseTemplate';
import { getTemplateConfig } from '@/config/templates';

export default function RenTemplate({ portfolio }: PortfolioTemplateProps) {
  const config = getTemplateConfig('ren');
  
  return <BaseTemplate portfolio={portfolio} config={config} />;
} 