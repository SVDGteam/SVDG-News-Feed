import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Dispatch — An SVDG Product',
  description: 'Internal news intelligence platform for Silicon Valley Defense Group',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navigation />
        <main className="max-w-screen-xl mx-auto px-4 py-6 flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
