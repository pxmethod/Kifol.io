import { Inter, Lato, Montserrat, Open_Sans } from 'next/font/google';

/** Loaded once; pick by portfolio `template` id for public portfolio pages. */
const inter = Inter({ subsets: ['latin'], display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' });
const lato = Lato({ weight: ['400', '700'], subsets: ['latin'], display: 'swap' });
const openSans = Open_Sans({ subsets: ['latin'], display: 'swap' });

const byTemplateId: Record<string, typeof inter> = {
  adler: inter,
  maeve: montserrat,
  ren: lato,
  jack: openSans,
};

export function getTemplateNextFont(templateId: string) {
  return byTemplateId[templateId] ?? inter;
}
