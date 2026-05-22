import './globals.css';

export const metadata = {
  title: '✦ Chogan Hub',
  description: 'Votre espace consultant Chogan tout-en-un',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
  themeColor: '#07070f',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
