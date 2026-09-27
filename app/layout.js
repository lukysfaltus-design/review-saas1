import './globals.css';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  variable: '--font-display'
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body'
});

export const metadata = {
  title: 'Recenzní systém',
  description: 'Hvězdičky, které jdou buď na Google, nebo rovnou majiteli.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
