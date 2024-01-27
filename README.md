Travel Agency Web Server

Description
This web server is designed for a travel agency website, providing features such as tour management, user registration, login, and weather information retrieval.

Installation
Clone the repository:
git clone https://github.com/Narimannmn/B_Assignment1
cd your-repository

Install dependencies:
npm install

Running the Application
Start the server:
npm start

The server will run on http://localhost:3000 by default.

NPM Packages Used

axios: Promise-based HTTP client for making requests to external APIs.
body-parser: Middleware to parse incoming request bodies.
express: Web application framework for building robust web applications.
fs: File system module for interacting with the file system.
path: Module for handling file paths.
Dependencies

Node.js
Usage
Visit http://localhost:3000 in your web browser to access the travel agency website.
Explore different routes, such as /about, /contact, /destination, /registration, /login, etc.

API Endpoints

/api/tours: Get information about tours (supports query parameters for filtering).
/api/weather: Get weather information for a specific city.
/api/destinations: Get information about destinations.
/api/recent: Get recently watched and deleted data.
Admin Routes

/travelagency: Access the admin panel for managing tours.
/recents: View recently watched and deleted data.
Tour Management

To add a new tour, make a POST request to /travelagency with the required parameters.
To update a tour, make a PUT request to /travelagency with the updated data.
To delete a tour, make a DELETE request to /travelagency/:id with the tour ID.
User Authentication

To register a new user, make a POST request to /registration.
To log in, make a POST request to /login.
Recently Watched and Deleted

Access recently watched and deleted data at /api/recent and /recents, respectively.
Fetching Weather

Use the /api/weather endpoint with the city query parameter to get weather information for a specific city.

Author
Nariman Aimgambetov