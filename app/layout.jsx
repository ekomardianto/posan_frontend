import '../src/index.css'
import '../src/styles/auth.css'

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
