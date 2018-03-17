const express = require('express')
const instantiateApplication = require('./app')

const app = new express()

instantiateApplication(app)