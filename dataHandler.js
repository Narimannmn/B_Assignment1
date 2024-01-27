const path = require('path')
const fs = require('fs')

const filePath = path.join(__dirname, 'data.json')

function readFile() {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf8')
		return JSON.parse(fileContent)
	} catch (error) {
		console.error('Error reading the file:', error.message)
		return {
			tours: [],
			destinations: {},
			users: [],
			history: [],
			recentlyDeleted: [], 
		}
	}
}

function writeFile(data) {
	try {
		const jsonContent = JSON.stringify(data, null, 2)
		fs.writeFileSync(filePath, jsonContent, 'utf8')
	} catch (error) {
		console.error('Error writing to the file:', error.message)
	}
}

function getTours() {
	const data = readFile()
	return data.tours
}

function getDestinations() {
	const data = readFile()
	return data.destinations
}

function getUsers() {
	const data = readFile()
	return data.users
}
function writeTours(tours) {
	const data = readFile()
	data.tours = tours
	writeFile(data)
}

function writeDestinations(destinations) {
	const data = readFile()
	data.destinations = destinations
	writeFile(data)
}

function writeUsers(users) {
	const data = readFile()
	data.users = users
	writeFile(data)
}
function readRecentlyWatched() {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf8')
		const data = JSON.parse(fileContent)
		return data.recentlyWatched || []
	} catch (error) {
		console.error('Error reading recently watched data:', error.message)
		return []
	}
}

function addToRecentlyWatched(tour) {
	try {
		const recentlyWatched = readRecentlyWatched()
		const timestamp = new Date().toISOString()
		recentlyWatched.push({ tour, timestamp })
		const data = readFile()
		data.recentlyWatched = recentlyWatched
		writeFile(data)
	} catch (error) {
		console.error('Error adding to recently watched:', error.message)
	}
}
function readRecentlyDeletedTours() {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf8')
		const data = JSON.parse(fileContent)
		return data.recentlyDeleted || []
	} catch (error) {
		console.error('Error reading recently deleted data:', error.message)
		return []
	}
}

function addToRecentlyDeleted(tour) {
	try {
		const recentlyDeleted = readRecentlyDeletedTours()
		const timestamp = new Date().toISOString()
		recentlyDeleted.push({ tour, timestamp })
		const data = readFile()
		data.recentlyDeleted = recentlyDeleted
		writeFile(data)
	} catch (error) {
		console.error('Error adding to recently deleted:', error.message)
	}
}
module.exports = {
	getTours,
	getDestinations,
	getUsers,
	readRecentlyDeletedTours,
	writeTours,
	writeDestinations,
	writeUsers,
	addToRecentlyDeleted,
	readRecentlyWatched,
	addToRecentlyWatched,
}