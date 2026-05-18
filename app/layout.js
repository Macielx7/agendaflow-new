import { Inter, Poppins, Outfit } from 'next/font/google';
import './globals.css';
import { SITE } from '@/utils/constants';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: SITE.title,
  description: SITE.description,
  keywords: [
    'lentes de contato dental',
    'implantes dentários',
    'odontologia estética',
    'clínica dental premium',
    'Dr João Silva',
    'sorriso perfeito',
    'clareamento dental',
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f2d4a',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} ${outfit.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
