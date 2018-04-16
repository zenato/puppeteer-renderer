'use strict'

const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk')
const signingSecret = process.env.SIGNING_SECRET || ''
const ssmNamespace = process.env.SSM_NAMESPACE || ''
const ssmKey = process.env.SSM_KEY || 'jwt-secret-signing'

let secret = null
class Authentication {
  syncSecret() {
    if (signingSecret) {
      secret = signingSecret
    } else {
      var ssm = new AWS.SSM()
      var params = {
        Names: [ssmNamespace + '.' + ssmKey],
        WithDecryption: true,
      }
      ssm.getParameters(params, function(err, data) {
        if (err) {
          console.log(err)
        } else {
          if (data['Parameters'][0]) secret = data['Parameters'][0]['Value']
        }
      })
    }
  }

  authToken(token, res) {
    if (!secret) {
      res.status(500).send('Token authencaiton need valid secret')
      return
    }
    if (!token) {
      res.status(401).send('No token provided')
      return
    }
    jwt.verify(token, secret, function(err) {
      if (err) {
        console.log(err)
        res.status(401).send('Failed to authenticate token: ' + err.message)
      }
    })
  }
}

module.exports = Authentication
