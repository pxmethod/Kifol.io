import { TemplateConfig } from '@/types/template';

export const templates: TemplateConfig[] = [
  {
    id: 'adler',
    name: 'Adler',
    description: 'Pink to indigo gradient with Inter.',
    pageBackground: 'linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)',
    fontLabel: 'Inter',
  },
  {
    id: 'maeve',
    name: 'Maeve',
    description: 'Purple to soft blue with Montserrat.',
    pageBackground: 'linear-gradient(90deg, #3F2B96 0%, #A8C0FF 100%)',
    fontLabel: 'Montserrat',
  },
  {
    id: 'ren',
    name: 'Ren',
    description: 'Rose to gold with Lato.',
    pageBackground: 'linear-gradient(90deg, #d53369 0%, #daae51 100%)',
    fontLabel: 'Lato',
  },
  {
    id: 'jack',
    name: 'Jack',
    description: 'Blue to navy with Open Sans.',
    pageBackground: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
    fontLabel: 'Open Sans',
  },
];

export const getTemplateConfig = (templateId: string): TemplateConfig => {
  return templates.find((t) => t.id === templateId) || templates[0];
};
