import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Tiny save API for the game. The browser can't write files, so in dev the
 * app POSTs here and we write game/progress.json and game/choices.json.
 * Both are in .gitignore: your saves never end up in your commits.
 */
function studioSaves(): Plugin {
  const dir = path.resolve(__dirname, 'game')
  const files = { progress: 'progress.json', choices: 'choices.json' } as const
  return {
    name: 'studio-saves',
    configureServer(server) {
      server.middlewares.use('/api/save', (req, res) => {
        const name = (req.url ?? '').replace(/^\//, '').split('?')[0]
        if (req.method === 'POST' && name === 'reset') {
          for (const f of Object.values(files)) fs.rmSync(path.join(dir, f), { force: true })
          res.end('{}')
          return
        }
        const file = files[name as keyof typeof files]
        if (!file) {
          res.statusCode = 404
          res.end()
          return
        }
        const full = path.join(dir, file)
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => (body += chunk))
          req.on('end', () => {
            try {
              fs.writeFileSync(full, JSON.stringify(JSON.parse(body), null, 2) + '\n')
              res.end('{"ok":true}')
            } catch {
              res.statusCode = 400
              res.end('{"ok":false}')
            }
          })
          return
        }
        res.setHeader('Content-Type', 'application/json')
        // No save yet means a fresh game: the app fills in defaults.
        res.end(fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '{}')
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), studioSaves()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    // Saving progress shouldn't trigger a page reload.
    watch: { ignored: ['**/game/progress.json', '**/game/choices.json'] },
  },
})
