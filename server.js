
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const dataHandler = require('./dataHandler')
const travelRoutes = require('./routes/Travelroutes')

const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static(__dirname + '/public'))

app.use('/', travelRoutes)

app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
