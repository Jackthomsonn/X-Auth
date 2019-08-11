# IMPORTANT
When I first started this and the Dynamic Route Generator project, I had a limited understanding of the tools available to myself that achieve the same (and better) goal. These projects were built as my interest in back-end development rose & as a result I now have a better understanding of the tools and best practices that are out there. Not only did I learn that there are tools that achieve the same goals but I also learnt that sometimes, tools are out there to help us developers save time and money and from a business perspective, we would rather not have to deal with sensitve data and rather offload that responsibility to field experts. All this being said, I am still very proud of both projects. They taught me a lot about node itself & taught me to think in a different way. This project is now no longer maintained and **SHOULD NOT** be used in a production environment.

# X-Auth

X-Auth is a plugin built for the Dynamic Route Generator that gives you a fully fledged login system for your web applications. This is a plug and play plugin with a few lines of configuration setup.

#### Features
- Login (Complete)
- Register (Complete)
- Two Factor Login (In progress)
- Forgot Password (Complete)
- Change Password (Complete)
- Email Verifications (Complete)
- SMS Integration for two factor authentication (Optional, will need to pay; current client configured is Text Magic)

This plugin is in beta and **SHOULD NOT** be used in a production environment as of yet. There is a lot of work and testing that needs to be carried out to prove this system is secure

#### Example Setup

```
const app = require('express')()
const mongoose = require('mongoose')

const { RouteGenerator } = require('dynamic-route-generator')

const { XAuth, CheckAuthentication } = require('x-auth')

const GameModel = require('./game.model')

mongoose.connect('mongo_uri')

XAuth.setupProps({
  appName: 'Application Name',
  authSecretKey: process.env.AUTH_SECRET_KEY,
  authSecretKeyForgottenPassword: process.env.AUTH_SECRET_KEY_FORGOTTEN_PASSWORD,
  cookieName: 'cookie-name',
  cookieNameForgottenPassword: 'cookie-forgotten-password-name',
  domainEmail: 'hello@youremail.com',
  baseUri: 'api',
  jwtTokenExpiration: 120000, // 2 minutes
  saltWorkFactor: 10,
  databaseUri: 'mongo_uri',
  themeColour: '#449DD1',
  emailVerification: true,
  passwordStrength: '1', // 1 includes special chracters and 0 does not
  refreshTokenExpiration: 3600000, // 1 hour
  refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
  refreshTokenCookieName: 'cookie-refresh-name'
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
    pre: [XAuth],
    post: []
  }
})

app.listen(process.env.PORT || 8080)
```

## Access Api
The example above will be hosted on port 8080. The endpoints are as follows:

**/auth/login** - Used for the login process

When a user logs in, an access token is generated and set as a cookie on the client machine with the name specified in the XAuth options above `cookieName`. Your application will need to get the values from this cookie and send them with every request. Make sure you are using an SSL encryption otherwise these values will be transferred over the wire in plain text, SSL will make sure to serialize the values so if anyone is sniffing the traffic, it will make it a lot harder for them to gain access to the users account

```js
{
  "username": "admin",
  "password": "password"
}
```

**/auth/login/authenticate** - Handles two factor authentication

For this, you must provide the username as a query param that you are trying to authenticate and the token is part of the POST request. The token code will be sent to the users mobile

`/auth/login/authenticate?q=username=admin`

```js
{
  "token": "5135"
}
```

**/auth/register** - Used for the registration process

This request is made when adding a user to the service. If you wish to add any custom values to the user object you can populate the property, `properties` with any custom values you like. Be mindful that this data is stored as part of the JWT so refrain from storing any personal data here

```js
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

If a valid email is supplied, the user will recieve an email with a link that points to `/auth/forgotten-password`. You must create a page which lives on this url and has both an email and new password input and makes a call to the /auth/update-password endpoint

```js
{
  "email": "hello@email.com"
}
```

**/auth/update-password** - Used to reset a password

When a call is made to this endpoint a check will be made to make sure the password strength matches the services rules. If successful, the password will be changed and the user will be redirected to the login page

```js
{
  "email": "hello@email.com",
  "password": "newPassword"
}
```

**/auth/change-password** - Used for changing a password

```js
{
  "email": "hello@email.com",
  "password": "password",
  "newPassword": "Passw0rD"
}
```
