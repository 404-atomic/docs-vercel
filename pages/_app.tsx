import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { PasswordProtection } from '../components/PasswordProtection'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PasswordProtection>
      <Component {...pageProps} />
    </PasswordProtection>
  )
}