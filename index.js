const app = require('express')()
const mongoose = require('mongoose')

const routes = require('./routes/routes')
const env = require('./environment/env')

const { RouteGenerator } = require('dynamic-route-generator')

mongoose.connect('mongodb://localhost/test')

new RouteGenerator({ routes, app })

app.listen(env.PORT)