const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')

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
app.get('/tour', (req, res) => {
	res.sendFile(__dirname + '/views/tour.html')
})
app.get('/admin', (req, res) => {
	res.sendFile(__dirname + '/views/admin.html')
})
app.get('/tour/:id', (req, res) => {
	const toursData = getToursFromFile()

	if (!toursData) {
		return res.status(500).send('Internal Server Error')
	}

	const tourId = parseInt(req.params.id)
	const selectedTour = toursData.tours.find(tour => tour.id === tourId)

	if (!selectedTour) {
		return res.status(404).send('Tour not found')
	}
	const tourHtmlPath = path.join(__dirname, 'views', 'tour.html')
	fs.readFile(tourHtmlPath, 'utf8', (err, fileContent) => {
		if (err) {
			console.error('Error reading the file:', err.message)
			return res.status(500).send('Internal Server Error')
		}

		// Replace placeholders in the HTML with dynamic data
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
		// Send the updated HTML to the client
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
		console.log(newTour)
        toursData.tours.push(newTour);
		console.log(toursData)
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


function addTour(newTour) {
	const tours = readToursFromFile()
	newTour.id = tours.length + 1
	tours.push(newTour)
	writeToursToFile(tours)
}

function deleteTour(tourId) {
	try {
		const toursData = getToursFromFile()
		const { tours } = toursData
		const updatedTours = tours.filter(tour => tour.id !== tourId)
		const updatedToursData = { ...toursData, tours: updatedTours }
		writeToursToFile(updatedToursData)
	} catch (error) {
		console.error('Error deleting tour:', error.message)
	}
}



app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
