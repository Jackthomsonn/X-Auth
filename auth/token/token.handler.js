const jwt = require('jsonwebtoken')

class TokenHandler {
  static verifyToken(authToken, req, res, next) {
    if (req.headers['authorization']) {
      req.token = req.headers['authorization']

      jwt.verify(req.token, authToken, err => {
        if (err) {
          return res.status(403).send({
            dev_message: 'invalid token',
            user_message: 'Invalid token provided',
            status: 403
          })
        } else {
          next()
        }
      })
    } else {
      return res.status(403).send({
        dev_message: 'no token',
        user_message: 'No token provided',
        status: 403
      })
    }
  }

  static signToken(data, secretKey, expiry) {
    return jwt.sign({ data }, secretKey, {
      expiresIn: expiry ? expiry / 1000 : 86400
    })
  }
}

module.exports = TokenHandler