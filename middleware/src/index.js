import axios from 'axios'

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

module.exports = function(options) {
  if (!options || !options.url) {
    throw new Error('Must set url.')
  }

  let rendererUrl = options.url

  const userAgentPattern = options.userAgentPattern || new RegExp(botUserAgents.join('|'), 'i')
  const excludeUrlPattern =
    options.excludeUrlPattern || new RegExp(`\\.(${staticFileExtensions.join('|')})$`, 'i')
  const timeout = options.timeout || 10 * 1000

  return (req, res, next) => {
    if (!userAgentPattern.test(req.headers['user-agent']) || excludeUrlPattern.test(req.path)) {
      return next()
    }

    const requestUrl = encodeURIComponent(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    let renderUrl = `${rendererUrl}?url=${requestUrl}`

    axios
      .get(renderUrl, { timeout })
      .then(({ data }) => res.send(data))
      .catch(e => next(e))
  }
}

exports.botUserAgents = botUserAgents
exports.staticFileExtensions = staticFileExtensions
