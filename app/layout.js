import { Noto_Sans_Arabic } from "next/font/google"
const noto = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400","700"] })

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={noto.className}>{children}</body>
    </html>
  )
}
