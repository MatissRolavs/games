const http = require('http');
const mysql = require('mysql');
const fs = require('fs');
const url = require('url');

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Replace with your MySQL username
  password: '',  // Replace with your MySQL password
  database: 'flappy_bird'  // Replace with your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database!");
});

// Create HTTP server
const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;

  if (pathname === '/leaderboard') {
    // Fetch top 3 players from database
    db.query("SELECT * FROM players ORDER BY score DESC LIMIT 3", (err, results) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Database error');
        return;
      }

      // Check if there are players
      if (results.length === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));  // No players
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));  // Return results as JSON
      }
    });
  } else if (pathname === '/') {
    // Serve the index.html or other files like leaderboard.html
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading HTML file');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    // Handle other routes or assets (CSS, JS, etc.)
    fs.readFile(pathname.slice(1), (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }

      const extname = pathname.split('.').pop();
      let contentType = 'text/html';

      if (extname === 'js') {
        contentType = 'application/javascript';
      } else if (extname === 'css') {
        contentType = 'text/css';
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
