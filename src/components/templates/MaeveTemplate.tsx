'use client';

import { PortfolioTemplateProps } from '@/types/template';
import BaseTemplate from './BaseTemplate';
import { getTemplateConfig } from '@/config/templates';

export default function MaeveTemplate({ portfolio }: PortfolioTemplateProps) {
  const config = getTemplateConfig('maeve');
  
  return <BaseTemplate portfolio={portfolio} config={config} />;
} 