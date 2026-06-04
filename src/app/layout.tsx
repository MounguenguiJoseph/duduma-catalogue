import type { Metadata } from 'next'
import './globals.css'
import WhatsAppButton from '@/components/WhatsAppButton'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Duduma'

export const metadata: Metadata = {
  title: `${storeName} — Catalogue`,
  description: `Découvrez la collection ${storeName} et commandez facilement via WhatsApp.`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900 min-h-screen">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  )
}
