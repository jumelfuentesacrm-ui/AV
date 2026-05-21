import type { Metadata } from 'next'
import { Barlow_Condensed, Barlow } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AV — Archivo Vivo',
  description:
    'Archivo Vivo. Ideas. Visión. Legado. Cine, moda y cultura desde Puerto Rico.',
  keywords: ['Puerto Rico', 'cine', 'cortometrajes', 'moda', 'cultura', 'Archivo Vivo', 'AV'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'AV — Archivo Vivo',
    description: 'Ideas. Visión. Legado.',
    type: 'website',
    siteName: 'Archivo Vivo',
  },
  twitter: {
    card: 'summary',
    title: 'AV — Archivo Vivo',
    description: 'Ideas. Visión. Legado.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body className="bg-cream text-charcoal font-body antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
