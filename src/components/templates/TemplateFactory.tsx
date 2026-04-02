'use client';

import { PortfolioTemplateProps } from '@/types/template';
import RenTemplate from './RenTemplate';
import MaeveTemplate from './MaeveTemplate';
import JackTemplate from './JackTemplate';
import AdlerTemplate from './AdlerTemplate';

export default function TemplateFactory({ portfolio, previewMode }: PortfolioTemplateProps) {
  const shared = { portfolio, previewMode };
  switch (portfolio.template) {
    case 'ren':
      return <RenTemplate {...shared} />;
    case 'maeve':
      return <MaeveTemplate {...shared} />;
    case 'jack':
      return <JackTemplate {...shared} />;
    case 'adler':
      return <AdlerTemplate {...shared} />;
    default:
      return <RenTemplate {...shared} />;
  }
} 