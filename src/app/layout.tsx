import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Navigation from '@/components/Navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Xeno Mini CRM',
  description: 'A powerful CRM platform for customer segmentation and campaign management',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
