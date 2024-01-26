const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const port = 3000
app.use(express.json())
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
})
app.get('/about', (req, res) => {
	res.sendFile(__dirname + '/views/about.html')
})
app.get('/contact', (req, res) => {
	res.sendFile(__dirname + '/views/contact.html')
})
app.get('/destination', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'destinations.html'))
})
app.get('/registration', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'registration.html'))
})
app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'login.html'))
})
app.post('/login', (req, res) => {
	try {
		const { email, password } = req.body
		if (!email || !password) {
			throw 'Empty inputs'
		}
		const existingUsers = getUsersFromFile()
		const user = existingUsers.users.find(
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

app.post('/registration', (req, res) => {
	try {
		const { email, password, password2} = req.body
		const role = 'authorized'
		if (!email || !password || !password2) {
			throw 'Empty inputs'
		}
		if (password !== password2) {
			throw 'Passwords do not match'
		}

		const existingUsers = getUsersFromFile()
		if (existingUsers.users.some(user => user.email === email)) {
			throw 'User already exists'
		}
		

		const newUser = {
			email,
			password,
			role,
		}
		console.log(newUser)
		existingUsers.users.push(newUser)
		writeUsersToFile(existingUsers)
		res.json({ message: 'Registration successful', role: newUser.role })
	} catch (error) {
		console.error('Error during registration:', error)
		res.status(400).json({ error: 'Error during registration: ' + error })
	}
})

app.get('/api/tours', (req, res) => {
	const tours = getToursFromFile()
	const { country, cityName, minPrice, maxPrice,id } = req.query
	let filteredTours = tours.tours

	if (id) {
		const foundTour = tours.tours.find(tour => tour.id == id)

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
app.get('/admin', (req, res) => {
	res.sendFile(__dirname + '/views/admin.html')
})
app.get('/tour/:id', (req, res) => {
	const tourId = parseInt(req.params.id)
	const toursData = getToursFromFile()

	if (!toursData) {
		return res.status(500).send('Internal Server Error')
	}
	const selectedTour = toursData.tours.find(tour => tour.id == tourId)
	if (!selectedTour) {
		return res.status(404).send('Tour not found')
	}
	const tourHtmlPath = path.join(__dirname, 'views', 'tour.html')
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
app.get('/mytours', (req, res) => {
	res.sendFile(__dirname + '/views/mytours.html')
})
app.put('/admin', (req, res) => {
	const updatedTour = req.body
	const { key, ...tour } = updatedTour;
	const toursData = getToursFromFile()
	const { tours } = toursData
	if (key >= 0 && key < tours.length) {
		const updatedTourData = { ...tours[key], ...tour }
		tours[key] = updatedTourData
		writeToursToFile(toursData)
		res.json({ success: true, message: 'Tour updated successfully' })
	} else {
		res.status(404).json({ error: 'Tour not found' })
	}
})
app.post('/admin', (req, res) => {
    try {
        const toursData = getToursFromFile()
		
        const newTour = {
            id: toursData.tours.length + 1,
            country: req.body.country || '',
            city: req.body.city || '',
            hotel: req.body.hotel || '',
            dateArrival: req.body.dateArrival || '',
            dateDeparture: req.body.dateDeparture || '',
            adults: req.body.adults || '',
            children: req.body.children || '',
            price: req.body.price || '',
            img: req.body.img || '',
        };
        toursData.tours.push(newTour);
        writeToursToFile(toursData);
    } catch (error) {
        console.error('Error adding tour:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.delete('/admin/:id', (req, res) => {
	const tourId = parseInt(req.params.id)
	deleteTour(tourId)
	res.json({ success: true, message: 'Tour deleted successfully' })
})
function getUsersFromFile() {
	try {
		const fileContent = fs.readFileSync(
			path.join(__dirname, 'users.json'),
			'utf8'
		)
		const jsonData = JSON.parse(fileContent)
		return jsonData
	} catch (error) {
		console.error('Error reading the file:', error.message)
		return { users: [], admins: [] }
	}
}
function getToursFromFile() {
	try {
		const fileContent = fs.readFileSync(__dirname + '/tours.json', 'utf8')
		const jsonData = JSON.parse(fileContent)
		return jsonData
	} catch (error) {
		console.error('Error reading the file:', error.message)
	}
}
function writeToursToFile(tours) {
	try {
		const filePath = path.join(__dirname, 'tours.json')
		const data =  tours 
		const jsonContent = JSON.stringify(data, null, 2)
		fs.writeFileSync(filePath, jsonContent, 'utf8')
	} catch (error) {
		console.error('Error writing to the file:', error.message)
	}
}
function writeUsersToFile(users) {
	try {
		const filePath = path.join(__dirname, 'users.json')
		const jsonContent = JSON.stringify(users, null, 2)
		fs.writeFileSync(filePath, jsonContent, 'utf8')
	} catch (error) {
		console.error('Error writing to the file:', error.message)
	}
}
function deleteTour(tourId) {
	try {
		const toursData = getToursFromFile()
		const { tours } = toursData
		console.log(tourId)
		const updatedTours = tours.filter(tour => tour.id != tourId)
		console.log(updatedTours)
		const updatedToursData = { ...toursData, tours: updatedTours }
		writeToursToFile(updatedToursData)
	} catch (error) {
		console.error('Error deleting tour:', error.message)
	}
}

app.get('/api/weather', async (req, res) => {
	try {
		let apiKey = 'f0b917381c4240aaa45111118241701'
		let city = req.query.city 

		let link = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=no&alerts=no`
		console.log(link)
		const response = await axios.get(
			link
		)
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
	}catch (error) {
		console.error('Error fetching weather data:', error.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})


app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
