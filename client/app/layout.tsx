import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trello Clone - Project Management',
  description: 'A Kanban-style project management tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
