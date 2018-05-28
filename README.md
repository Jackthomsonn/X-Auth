# X-Auth

X-Auth is a plugin built for the Dynamic Route Generator that gives you a fully fledged login system for your web applications. This is a plug and play plugin with a few lines of configuration setup.

#### Features
- Login
- Register
- Two Factor Login
- Forgot Password
- Change Password
- Email verifications
- SMS Integration for two factor authentication (Optional, will need to pay; current client configured is Text Magic)

This plugin is in beta and **SHOULD NOT** be used in a production environment as of yet. There is a lot of work and testing that needs to be carried out to prove this system is secure

#### Example Setup

```
const app = require('express')()
const mongoose = require('mongoose')

const RouteGenerator = require('dynamic-route-generator')

const { XAuth, CheckAuthentication } = require('x-auth')

const GameModel = require('./game.model')

mongoose.connect('mongodb://localhost/test')

XAuth.setupProps({
  appName: 'XAuth Test',
  authSecretKey: '12345',
  authSecretKeyForgottenPassword: '12345',
  cookieName: 'xauth-test',
  cookieNameForgottenPassword: 'xauth-forgotten-password-test',
  domainEmail: 'hello@email.com',
  jwtTokenExpiration: 300000, // 5 minutes (Applied to cookie expiration also)
  saltWorkFactor: 10,
  databaseUri: 'mongodb://localhost/test',
  themeColour: '#4096EE',
  emailVerification: true
})

new RouteGenerator({
  routes: [{
    uri: '/list/games',
    model: GameModel,
    handlers: [CheckAuthentication],
    methods: [{
      name: 'get'
    }]
  }],
  app,
  plugins: {
    pre: [XAuth]
    post: []
  }
})

app.listen(process.env.PORT || 8080)
```
