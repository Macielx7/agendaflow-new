import { Inter } from 'next/font/google';
import Providers from '@/components/Providers/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata = {
  title: 'AgendaPro | Gestão de Agendamentos',
  description: 'Sistema profissional de gestão de agendamentos',
  robots: { index: false, follow: false },
};

const themeScript = `(function(){try{var t=localStorage.getItem('agendaflow-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t||'dark');document.documentElement.style.colorScheme=t||'dark';}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
