const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const dataHandler = require('../dataHandler')

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/index.html'))
})

router.get('/about', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/about.html'))
})

router.get('/contact', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/contact.html'))
})

router.get('/destination', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/destinations.html'))
})

router.get('/registration', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/registration.html'))
})

router.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/login.html'))
})

router.post('/login', (req, res) => {
	try {
		const { email, password } = req.body
		const existingUsers = dataHandler.getUsers()
		const user = existingUsers.find(
			user => user.email === email && user.password === password
		)

		if (user) {
			res.json({ message: 'Login successful', role: user.role })
		} else {
			throw 'Incorrect email or password'
		}
	} catch (error) {
		console.error('Error during login:', error)
		res.status(401).json({ error: 'Error during login: ' + error })
	}
})

router.post('/registration', (req, res) => {
	try {
		const { email, password, password2 } = req.body
		const role = 'authorized'

		if (!email || !password || !password2) {
			throw 'Empty inputs'
		}
		if (password !== password2) {
			throw 'Passwords do not match'
		}

		const existingUsers = dataHandler.getUsers()
		if (existingUsers.some(user => user.email === email)) {
			throw 'User already exists'
		}

		const newUser = {
			email,
			password,
			role,
		}
		existingUsers.push(newUser)
		dataHandler.writeUsers(existingUsers)
		res.json({ message: 'Registration successful', role: newUser.role })
	} catch (error) {
		console.error('Error during registration:', error)
		res.status(400).json({ error: 'Error during registration: ' + error })
	}
})

router.get('/api/tours', (req, res) => {
	const tours = dataHandler.getTours()
	const { country, cityName, minPrice, maxPrice, id } = req.query
	let filteredTours = tours

	if (id) {
		const foundTour = tours.find(tour => tour.id == id)

		if (foundTour) {
			res.json(foundTour)
		} else {
			res.status(404).json({ error: 'Tour not found' })
		}
	} else {
		if (country) {
			filteredTours = filteredTours.filter(tour =>
				tour.country.toLowerCase().includes(country.toLowerCase())
			)
		}

		if (id) {
			const foundTour = filteredTours.find(
				tour => tour.id.toString() === id.toString()
			)
			if (foundTour) {
				res.json({ tours: [foundTour] })
			} else {
				res.json({ tours: [] })
			}
			return
		}

		if (cityName) {
			filteredTours = filteredTours.filter(tour =>
				tour.city.toLowerCase().includes(cityName.toLowerCase())
			)
		}

		if (minPrice) {
			filteredTours = filteredTours.filter(
				tour => tour.price >= parseInt(minPrice, 10)
			)
		}

		if (maxPrice) {
			filteredTours = filteredTours.filter(
				tour => tour.price <= parseInt(maxPrice, 10)
			)
		}
		res.json({ tours: filteredTours })
	}
})

router.get('/travelagency', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/admin.html'))
})
router.get('/recents', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/recent.html'))
})
router.get('/api/recent', (req, res) => {
	try {
		const recentlyWatched = dataHandler.readRecentlyWatched()
		const recentlyDeleted = dataHandler.readRecentlyDeletedTours()
		const recentData = { recentlyWatched, recentlyDeleted }
		res.json(recentData)
	} catch (error) {
		console.error(
			'Error fetching recently watched or deleted data:',
			error.message
		)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

router.get('/tour/:id', (req, res) => {
	const tourId = parseInt(req.params.id)
	const toursData = dataHandler.getTours()

	if (!toursData) {
		return res.status(500).send('Internal Server Error')
	}

	const selectedTour = toursData.find(tour => tour.id == tourId)

	if (!selectedTour) {
		return res.status(404).send('Tour not found')
	}

	dataHandler.addToRecentlyWatched(selectedTour)

	const tourHtmlPath = path.join(__dirname, '../views/tour.html')

	fs.readFile(tourHtmlPath, 'utf8', (err, fileContent) => {
		if (err) {
			console.error('Error reading the file:', err.message)
			return res.status(500).send('Internal Server Error')
		}

		const updatedHtml = fileContent
			.replace('{{img}}', selectedTour.img)
			.replace('{{country}}', selectedTour.country)
			.replace('{{city}}', selectedTour.city)
			.replace('{{hotel}}', selectedTour.hotel)
			.replace('{{dateArrival}}', selectedTour.dateArrival)
			.replace('{{dateDeparture}}', selectedTour.dateDeparture)
			.replace('{{adults}}', selectedTour.adults)
			.replace('{{children}}', selectedTour.children)
			.replace('{{price}}', selectedTour.price)
			.replace('{{id}}', selectedTour.id)

		res.send(updatedHtml)
	})
})

router.get('/mytours', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/mytours.html'))
})

router.put('/travelagency', (req, res) => {
	const updatedTour = req.body
	const { key, ...tour } = updatedTour
	const toursData = dataHandler.getTours()
	if (key >= 0 && key < toursData.length) {
		const updatedTourData = { ...toursData[key], ...tour }
		toursData[key] = updatedTourData
		dataHandler.writeTours(toursData)
		res.json({ success: true, message: 'Tour updated successfully' })
	} else {
		res.status(404).json({ error: 'Tour not found' })
	}
})

router.post('/travelagency', (req, res) => {
	try {
		const toursData = dataHandler.getTours()

		const newTour = {
			id: toursData.length + 1,
			country: req.body.country || '',
			city: req.body.city || '',
			hotel: req.body.hotel || '',
			dateArrival: req.body.dateArrival || '',
			dateDeparture: req.body.dateDeparture || '',
			adults: req.body.adults || '',
			children: req.body.children || '',
			price: req.body.price || '',
			img: req.body.img || '',
		}
		toursData.push(newTour)
		dataHandler.writeTours(toursData)
		res.json({ message: 'Tour added successfully' })
	} catch (error) {
		console.error('Error adding tour:', error)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

router.delete('/travelagency/:id', (req, res) => {
	const tourId = parseInt(req.params.id)
	const toursData = dataHandler.getTours()
	const recentlyDeletedTours = dataHandler.readRecentlyDeletedTours()
	const deletedTour = toursData.find(tour => tour.id === tourId)

	if (deletedTour) {
		recentlyDeletedTours.push({
			tour: deletedTour,
			timestamp: new Date().toISOString(),
		})
		const updatedTours = toursData.filter(tour => tour.id !== tourId)
		dataHandler.writeTours(updatedTours)
		dataHandler.addToRecentlyDeleted(recentlyDeletedTours)
		console.log(recentlyDeletedTours)

		res.json({ success: true, message: 'Tour deleted successfully' })
	} else {
		res.status(404).json({ success: false, message: 'Tour not found' })
	}
})

router.get('/api/weather', async (req, res) => {
	try {
		let apiKey = 'f0b917381c4240aaa45111118241701'
		let city = req.query.city

		let link = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=no&alerts=no`
		const response = await axios.get(link)
		const weatherData = {
			location: response.data.location.name,
			country: response.data.location.country,
			current: {
				tempC: response.data.current.temp_c,
				condition: response.data.current.wind_kph,
			},
			sunrise: response.data.forecast.forecastday[0].astro.sunrise,
			sunset: response.data.forecast.forecastday[0].astro.sunset,
		}
		res.json(weatherData)
	} catch (error) {
		console.error('Error fetching weather data:', error.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

router.get('/api/destinations', (req, res) => {
	try {
		const destinations = dataHandler.getDestinations()
		res.json(destinations)
	} catch (error) {
		console.error('Error fetching destinations:', error.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})
module.exports = router
