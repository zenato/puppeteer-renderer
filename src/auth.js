'use strict'

const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk')
const signingSecret = process.env.SIGNING_SECRET || ''
const name = process.env.NAMES || 'data-platform-pod0-dev.centrify.io.jwt-secret-signing'

let secret = null
class Authentication {
  syncSecret() {
    if (signingSecret) {
      secret = signingSecret
      console.log('local secret key:', secret)
    } else {
      AWS.config.update({
        region: 'us-west-2',
      })
      var ssm = new AWS.SSM()
      var params = {
        Names: [name],
        WithDecryption: true,
      }
      ssm.getParameters(params, function(err, data) {
        if (err) {
          console.log(err, err.stack)
        } else {
          secret = data['Parameters'][0]['Value']
          console.log('ssm secret key:', secret)
        }
      })
    }
  }

  authToken(token, res) {
    if (!token)
      return res.status(401).send({
        auth: false,
        message: 'No token provided.',
      })
    console.log('jwt authentication secret:', secret)
    jwt.verify(token, secret, function(err, verifiedJwt) {
      if (err) {
        console.log(err)
        return res.status(401).send({
          auth: false,
          message: 'Failed to authenticate token.',
        })
      } else {
        console.log(verifiedJwt)
      }
    })
  }
}

module.exports = Authentication
