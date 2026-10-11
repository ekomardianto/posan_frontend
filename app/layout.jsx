import '../src/index.css'

export const metadata = {
  title: 'POSAN Admin',
  description: 'POSAN administration dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
