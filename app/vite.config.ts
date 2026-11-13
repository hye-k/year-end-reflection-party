import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Link previews need absolute URLs, and the address is only known once the site is deployed,
// so these tags are added from VITE_SITE_URL (e.g. https://name.github.io/year-end-party) and skipped without it.
function shareImage(siteUrl: string | undefined): Plugin {
  return {
    name: 'share-image',
    transformIndexHtml() {
      if (!siteUrl) return []
      const base = siteUrl.replace(/\/+$/, '')
      const image = `${base}/og.png`
      return [
        { tag: 'meta', injectTo: 'head', attrs: { property: 'og:url', content: `${base}/` } },
        { tag: 'meta', injectTo: 'head', attrs: { property: 'og:image', content: image } },
        { tag: 'meta', injectTo: 'head', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', injectTo: 'head', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', injectTo: 'head', attrs: { property: 'og:image:alt', content: '픽셀 바다 위에 쓴 2026 DIVE LOG' } },
        { tag: 'meta', injectTo: 'head', attrs: { name: 'twitter:image', content: image } },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = env.VITE_SITE_URL?.trim() || undefined
  // A project site lives under a path (https://name.github.io/repo/), so the built files must be addressed from there.
  const base = siteUrl ? `${new URL(siteUrl).pathname.replace(/\/+$/, '')}/` : '/'
  return {
    base,
    plugins: [react(), shareImage(siteUrl)],
  }
})
