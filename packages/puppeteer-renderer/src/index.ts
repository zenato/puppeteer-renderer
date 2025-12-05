import qs from 'qs'
import express, { Request, Response } from 'express'
import createRenderer from './lib/renderer'
import router from './router'
import { errorHandler } from './middleware/error-handler'

const port = process.env.PORT || 3000

const app = express()

// 기본 설정
app.disable('x-powered-by')
app.set('query parser', (s: string) => qs.parse(s, { allowDots: true }))

// JSON body 파싱
app.use(express.json({ limit: '1mb' }))

// 헬스체크
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 라우트
app.use(router)

// 인덱스 페이지
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'puppeteer-renderer',
    version: '4.0.0',
    endpoints: {
      html: {
        methods: ['GET', 'POST'],
        description: 'Render page HTML',
      },
      screenshot: {
        methods: ['GET', 'POST'],
        description: 'Capture page screenshot',
      },
      pdf: {
        methods: ['GET', 'POST'],
        description: 'Generate PDF from page',
      },
    },
    documentation: 'https://github.com/zenato/puppeteer-renderer#readme',
  })
})

// 404 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  })
})

// 에러 핸들러
app.use(errorHandler)

// 서버 시작
async function start() {
  try {
    await createRenderer({
      ignoreHTTPSErrors: !!process.env.IGNORE_HTTPS_ERRORS,
      args: parseArgs(process.env.PUPPETEER_ARGS),
    })

    app.listen(port, () => {
      console.info(`[Server] Listening on port ${port}`)
    })
  } catch (e) {
    console.error('[Server] Failed to initialize:', e)
    process.exit(1)
  }
}

function parseArgs(argsString?: string): string[] {
  if (!argsString) return []
  return argsString
    .split('--')
    .filter(Boolean)
    .map((v) => `--${v.trim()}`)
}

start()

// Graceful shutdown
process.on('SIGINT', () => {
  console.info('[Server] Shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.info('[Server] Shutting down...')
  process.exit(0)
})
