import type { Metadata } from 'next'
import { Outfit, Instrument_Serif } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300','400','500','600','700','800'],
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'The Way Back',
  description: 'Your chronic pain coaching portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${instrumentSerif.variable}`}>
      <body style={{ fontFamily: "var(--font-outfit, 'Outfit', system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  )
}
