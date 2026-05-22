import type { Metadata } from 'next'
import { Anton, DM_Sans, Fira_Code, Caveat, Montserrat } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-fira-code',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-caveat',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ARCHIVO VIVO — Ideas. Visión. Legado.',
  description:
    'Archivo Vivo. Ideas. Visión. Legado. Cine, moda y cultura desde Puerto Rico.',
  keywords: ['Puerto Rico', 'cine', 'cortometrajes', 'moda', 'cultura', 'Archivo Vivo', 'AV'],
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'ARCHIVO VIVO — Ideas. Visión. Legado.',
    description: 'Ideas. Visión. Legado.',
    type: 'website',
    siteName: 'Archivo Vivo',
  },
  twitter: {
    card: 'summary',
    title: 'ARCHIVO VIVO',
    description: 'Ideas. Visión. Legado.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${dmSans.variable} ${firaCode.variable} ${caveat.variable} ${montserrat.variable}`}
    >
      <body className="antialiased overflow-x-hidden">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
