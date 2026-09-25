import './globals.css';

export const metadata = {
  title: 'Recenzní systém',
  description: 'Hvězdičky, které jdou buď na Google, nebo rovnou majiteli.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
