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
  title: 'Archivo Vivo — Ideas. Visión. Legado.',
  description:
    'Archivo Vivo es una marca puertorriqueña dedicada al cine, la moda y la cultura. Cortometrajes, ropa y máquinas expendedoras.',
  keywords: ['Puerto Rico', 'cine', 'cortometrajes', 'moda', 'cultura', 'Archivo Vivo'],
  openGraph: {
    title: 'Archivo Vivo',
    description: 'Ideas. Visión. Legado.',
    type: 'website',
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
