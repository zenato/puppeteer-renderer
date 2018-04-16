'use strict'

const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk')
const signingSecret = process.env.SIGNING_SECRET || ''
const ssmNamespace = process.env.SSM_NAMESPACE || 'data-platform-pod0-dev.centrify.io'
const ssmKey = process.env.SSM_KEY || 'jwt-secret-signing'

let secret = null
class Authentication {
  syncSecret() {
    if (signingSecret) {
      secret = signingSecret
    } else {
      AWS.config.update({
        region: 'us-west-2',
      })
      var ssm = new AWS.SSM()
      var params = {
        Names: [ssmNamespace + '.' + ssmKey],
        WithDecryption: true,
      }
      ssm.getParameters(params, function(err, data) {
        if (err) {
          console.log(err)
        } else {
          secret = data['Parameters'][0]['Value']
        }
      })
    }
  }

  authToken(token, res) {
    if (!token) res.status(401).send('No token provided.' + err.message)
    if (!secret) {
      res.status(401).send('Failed to authenticate token.' + err.message)
    }
    jwt.verify(token, secret, function(err, verifiedJwt) {
      if (err) {
        console.log(err)
        res.status(401).send('Failed to authenticate token.' + err.message)
      }
    })
  }
}

module.exports = Authentication
