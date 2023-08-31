import axios from 'axios'
import { Router, NextFunction, Request, Response } from 'express'

const botUserAgents = [
  'W3C_Validator',
  'baiduspider',
  'bingbot',
  'embedly',
  'facebookexternalhit',
  'linkedinbo',
  'outbrain',
  'pinterest',
  'quora link preview',
  'rogerbo',
  'showyoubot',
  'slackbot',
  'twitterbot',
  'vkShare',
]

const staticFileExtensions = [
  'ai',
  'avi',
  'css',
  'dat',
  'dmg',
  'doc',
  'doc',
  'exe',
  'flv',
  'gif',
  'ico',
  'iso',
  'jpeg',
  'jpg',
  'js',
  'less',
  'm4a',
  'm4v',
  'mov',
  'mp3',
  'mp4',
  'mpeg',
  'mpg',
  'pdf',
  'png',
  'ppt',
  'psd',
  'rar',
  'rss',
  'svg',
  'swf',
  'tif',
  'torrent',
  'ttf',
  'txt',
  'wav',
  'wmv',
  'woff',
  'xls',
  'xml',
  'zip',
]

interface Options {
  url: string
  userAgentPattern?: RegExp
  excludeUrlPattern?: RegExp
  timeout?: number
}

export default function (options: Options) {
  if (!options || !options.url) {
    throw new Error('Must set url.')
  }

  const userAgentPattern = options.userAgentPattern || new RegExp(botUserAgents.join('|'), 'i')
  const excludeUrlPattern =
    options.excludeUrlPattern || new RegExp(`\\.(${staticFileExtensions.join('|')})$`, 'i')

  const middleware = async (req: Request, res: Response, next: NextFunction) => {
    if (
      userAgentPattern.test(req.headers['user-agent'] as string) ||
      excludeUrlPattern.test(req.path)
    ) {
      return next()
    }

    try {
      const { data } = await axios.get(`${options.url}${req.url}`, {
        timeout: options.timeout || 10 * 1000,
      })
      res.send(data)
    } catch (e) {
      next(e)
    }
  }

  const router = Router()

  router.get(['/html', '/pdf', '/screenshot'], middleware)

  return router
}
