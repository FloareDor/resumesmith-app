import { Html, Head, Main, NextScript } from "next/document";
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/react"

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <Main />
          <NextScript />
          </ThemeProvider>
      </body>
    </Html>
  );
}
