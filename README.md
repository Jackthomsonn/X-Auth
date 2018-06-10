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

## Access Api
The api with the example above when run with node will be hosted on port 8080. The endpoints are as follows:

**/auth/login** - Used for the login process

```json
{
  "username": "admin",
  "password": "password"
}
```

**/auth/login/authenticate** - Handles two factor authentication

For this, you must provide the username as a query param that you are trying to authenticate and the token is part of the POST request, for example:

`/auth/login/authenticate?q=username=admin`

```json
{
  "token": "5135"
}
```

***[Internal]*** **/auth/verify** - Handles the update of a password (This is handled for you from the email template. If you provide your own email template, X-Auth will inject the required code to suffice the request)

**/auth/register** - Used for the registration process

```json
{
  "username": "admin",
  "password": "password",
  "email": "hello@email.com",
  "phoneNumber": "00112233445",
  "twoFactorAuthEnabled": false // Optional,
  "properties": {} // Custom properties you may want store for the user for example home address, age etc (Optional)
}
```

**/auth/reset-password-request** - Used for an initial reset password request

```json
{
  "email": "hello@email.com" // This will trigger an email to be sent to the user
}
```

***[Internal]*** **/auth/update-password** - Handles the update of a password (This is handled for you from the email template. If you provide your own email template, X-Auth will inject the required code to suffice the request)

***[Internal]*** **/auth/forgotten-password** - Handles the change of a password (This is handled for you from the email template. If you provide your own email template, X-Auth will inject the required code to suffice the request)

**/auth/change-password** - Used for changing a password

```json
{
  "email": "hello@email.com",
  "password": "password",
  "newPassword": "Passw0rD"
}
```
