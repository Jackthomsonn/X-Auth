const env = require('../environment/env')

const ForgottenPasswordTemplate = `
  <div class='container'
       style='display: flex;
              font-family: sans-serif;
              font-size: 12px;
              justify-content: center;
              align-items: center;
              height: 100vh;'>
    <div class='inner' style='display: flex;
                              flex-flow: column wrap;
                              width: 50%;
                              background: #FFF;
                              border: 1px solid #EEE;
                              padding: 24px;
                              border-radius: 4px;'>
      <label style='font-weight: 700; font-size: 14px;'>Email</label>
      <input type='text' id='email' style='font-size: 12px; padding: 12px 0; margin-bottom: 20px; border: none; outline: none' placeholder='Your email' />

      <label style='font-weight: 700; font-size: 14px;'>New password</label>
      <input type='password' style='font-size: 12px; padding: 12px 0; margin-bottom: 20px; border: none; outline: none' id='password' placeholder='New password' />

      <button style='padding: 10px;
                     border-radius: 4px;
                     border: none;
                     outline: none;
                     background: ${env.THEME_COLOUR};
                     font-weight: 500;
                     color: #FFF;
                     text-align: center;'>Change password</button>
    </div>
  </div>
`

module.exports = ForgottenPasswordTemplate