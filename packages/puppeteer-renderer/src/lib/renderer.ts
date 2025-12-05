import puppeteer, { Browser, Page, PuppeteerLaunchOptions, KnownDevices } from 'puppeteer'
import type {
  CommonOptions,
  HtmlOptions,
  ScreenshotOptions,
  PdfOptions,
  RenderResult,
} from './types'
import { Errors } from './errors'
import waitForAnimations from './wait-for-animations'

export class Renderer {
  private browser: Browser

  constructor(browser: Browser) {
    this.browser = browser
  }

  /**
   * HTML 렌더링
   */
  async html(options: HtmlOptions): Promise<RenderResult<string>> {
    const startTime = Date.now()

    return this.withPage(options, async (page) => {
      const html = await page.content()
      return {
        data: html,
        duration: Date.now() - startTime,
      }
    })
  }

  /**
   * 스크린샷 생성
   */
  async screenshot(
    options: ScreenshotOptions,
  ): Promise<RenderResult<{ buffer: Buffer; type: 'png' | 'jpeg' | 'webp' }>> {
    const startTime = Date.now()

    return this.withPage(options, async (page) => {
      const {
        type = 'png',
        quality,
        fullPage,
        clip,
        omitBackground,
        encoding,
        animationTimeout = 0,
        viewport,
      } = options

      // Viewport 설정
      if (viewport) {
        await page.setViewport(viewport)
      }

      // 애니메이션 대기
      if (animationTimeout > 0) {
        await waitForAnimations(page, { type, fullPage, clip, omitBackground }, animationTimeout)
      }

      const buffer = await page.screenshot({
        type,
        quality: type === 'png' ? undefined : quality,
        fullPage,
        clip,
        omitBackground,
        encoding: encoding === 'base64' ? 'base64' : 'binary',
      })

      return {
        data: {
          buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer, 'base64'),
          type,
        },
        duration: Date.now() - startTime,
      }
    })
  }

  /**
   * PDF 생성
   */
  async pdf(options: PdfOptions): Promise<RenderResult<Buffer>> {
    const startTime = Date.now()

    // PDF는 기본적으로 print 미디어 타입 사용
    const pdfOptions: PdfOptions = {
      ...options,
      emulateMediaType: options.emulateMediaType || 'print',
    }

    return this.withPage(pdfOptions, async (page) => {
      const {
        scale,
        displayHeaderFooter,
        headerTemplate,
        footerTemplate,
        printBackground,
        landscape,
        pageRanges,
        format,
        paperWidth,
        paperHeight,
        margin,
        preferCSSPageSize,
        viewport,
      } = options

      // Viewport 적용
      if (viewport) {
        await page.setViewport(viewport)
      }

      const pdfData = await page.pdf({
        scale,
        displayHeaderFooter,
        headerTemplate,
        footerTemplate,
        printBackground,
        landscape,
        pageRanges,
        format,
        width: paperWidth,
        height: paperHeight,
        margin,
        preferCSSPageSize,
      })

      return {
        data: Buffer.from(pdfData),
        duration: Date.now() - startTime,
      }
    })
  }

  /**
   * 페이지 생성 및 설정 (핵심 로직)
   */
  private async withPage<T>(
    options: CommonOptions,
    callback: (page: Page) => Promise<T>,
  ): Promise<T> {
    let page: Page | undefined

    try {
      page = await this.browser.newPage()

      page.on('error', (error) => {
        throw Errors.browser(error.message)
      })

      await this.configurePage(page, options)
      await this.navigateToUrl(page, options)

      return await callback(page)
    } catch (e) {
      if (e instanceof Error) {
        console.error('[Renderer Error]', e.message)
      }
      throw e
    } finally {
      await this.closePage(page)
    }
  }

  /**
   * 페이지 설정 적용
   */
  private async configurePage(page: Page, options: CommonOptions): Promise<void> {
    const {
      headers,
      credentials,
      cookies,
      userAgent,
      viewport,
      device,
      emulateMediaType,
      disableCache = true,
    } = options

    // 디바이스 에뮬레이션 (device가 있으면 viewport, userAgent 자동 설정)
    if (device) {
      const deviceDescriptor = KnownDevices[device as keyof typeof KnownDevices]
      if (deviceDescriptor) {
        await page.emulate(deviceDescriptor)
      }
    } else {
      // 수동 viewport 설정
      if (viewport) {
        await page.setViewport(viewport)
      }

      // 수동 userAgent 설정
      if (userAgent) {
        await page.setUserAgent(userAgent)
      }
    }

    // HTTP 헤더 설정
    if (headers && typeof headers === 'object') {
      await page.setExtraHTTPHeaders(headers)
    }

    // 인증 정보
    if (credentials) {
      await page.authenticate(credentials)
    }

    // 쿠키 설정
    if (cookies && cookies.length > 0) {
      await page.setCookie(...cookies)
    }

    // 미디어 타입 에뮬레이션
    if (emulateMediaType) {
      await page.emulateMediaType(emulateMediaType)
    }

    // 캐시 설정
    await page.setCacheEnabled(!disableCache)
  }

  /**
   * URL 탐색
   */
  private async navigateToUrl(page: Page, options: CommonOptions): Promise<void> {
    const {
      url,
      timeout = 30000,
      waitUntil = 'networkidle2',
      waitForSelector,
      waitForSelectorTimeout = 30000,
    } = options

    try {
      await page.goto(url, { timeout, waitUntil })
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes('timeout') || e.message.includes('Timeout')) {
          throw Errors.timeout(timeout)
        }
        throw Errors.navigation(e.message, url)
      }
      throw e
    }

    // waitForSelector 처리
    if (waitForSelector) {
      try {
        await page.waitForSelector(waitForSelector, { timeout: waitForSelectorTimeout })
      } catch {
        throw Errors.selectorNotFound(waitForSelector)
      }
    }
  }

  /**
   * 페이지 닫기
   */
  private async closePage(page?: Page): Promise<void> {
    try {
      if (page && !page.isClosed()) {
        await page.close()
      }
    } catch {
      // ignore
    }
  }

  /**
   * 브라우저 종료
   */
  async close(): Promise<void> {
    await this.browser.close()
  }
}

// 싱글톤 인스턴스
export let renderer: Renderer | undefined

export default async function createRenderer(
  options: PuppeteerLaunchOptions = {},
): Promise<Renderer> {
  const args = options.args ?? []

  args.push(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disk-cache-size=0',
    '--aggressive-cache-discard',
  )

  const browser = await puppeteer.launch({
    ...options,
    args,
    headless: 'shell',
  })

  renderer = new Renderer(browser)
  console.info('[Renderer] Initialized', { args })

  return renderer
}
