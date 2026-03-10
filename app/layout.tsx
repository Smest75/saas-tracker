import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SubTracker',
  description: 'Hold oversikt over abonnementer og lisenskostnader',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  )
}
