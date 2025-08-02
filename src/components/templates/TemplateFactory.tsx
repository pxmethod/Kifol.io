'use client';

import { PortfolioTemplateProps } from '@/types/template';
import RenTemplate from './RenTemplate';
import MaeveTemplate from './MaeveTemplate';
import JackTemplate from './JackTemplate';
import AdlerTemplate from './AdlerTemplate';

export default function TemplateFactory({ portfolio }: PortfolioTemplateProps) {
  switch (portfolio.template) {
    case 'ren':
      return <RenTemplate portfolio={portfolio} />;
    case 'maeve':
      return <MaeveTemplate portfolio={portfolio} />;
    case 'jack':
      return <JackTemplate portfolio={portfolio} />;
    case 'adler':
      return <AdlerTemplate portfolio={portfolio} />;
    default:
      return <RenTemplate portfolio={portfolio} />;
  }
} 