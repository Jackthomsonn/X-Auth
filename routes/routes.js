const UserModel = require('../models/user.model').getModel()
const TwoFactorModel = require('../models/two-factor.model').getModel()
const RefreshTokenModel = require('../models/refresh-token.model').getModel()

const AuthHandler = require('../auth/auth-handler')

const env = require('../environment/env')

const routes = [
  {
    uri: '/auth/login', // Handles login at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.handleLogin]
    }]
  }, {
    uri: '/auth/login/authenticate', // Handles two factor login at the API level
    model: TwoFactorModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.handleTwoFactorAuthentication]
    }]
  }, {
    uri: '/auth/verify', // Handles verification from email
    model: UserModel,
    methods: [{
      name: 'get',
      handlers: [AuthHandler.verifyEmail]
    }]
  }, {
    uri: '/auth/register', // Handles registration at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.handleRegistration]
    }]
  }, {
    uri: '/auth/reset-password-request', // Handles reset password request at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.initiatePasswordResetRequest]
    }]
  }, {
    uri: '/auth/update-password', // Handles update password at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.checkAuthenticationForPasswordReset, AuthHandler.updatePassword]
    }]
  },
  {
    uri: '/auth/refreshtoken', // Gets a refresh token
    model: RefreshTokenModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.getRefreshToken]
    }]
  },
  {
    uri: '/auth/forgotten-password', // Handles at the VIEW level
    model: UserModel,
    methods: [{
      name: 'get',
      handlers: [(req, res, next) => {
        let template = env.FORGOTTEN_PASSWORD_PAGE_TEMPLATE
          ? env.FORGOTTEN_PASSWORD_PAGE_TEMPLATE
          : require('../templates/forgotten-password')

        template += `
          <script>
            const token = 'Bearer ' + window.location.search.split('&')[1]
            const email = window.location.search.split('q')[1].split('=')[2].split('&')[0]
        
            const button = document.querySelector('button')
            document.querySelector('#email').value = email
        
            button.addEventListener('click', changePassword)
        
            function changePassword() {
              fetch(window.location.protocol + 'update-password', {
                body: JSON.stringify({
                  email: email,
                  password: document.querySelector('#password').value
                }),
                headers: {
                  'authorization': token,
                  'Content-Type': 'application/json'
                },
                method: 'POST'
              })
            }
          </script>`
          next()
      }]
    }]
  },
  {
    uri: '/auth/change-password', // Handles change password at the API level
    model: UserModel,
    methods: [{
      name: 'post',
      handlers: [AuthHandler.changePassword]
    }]
  }
]

module.exports = routes