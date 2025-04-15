const http = require('http');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',    
    password: 'root',  
    database: 'flappy_bird'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname === '/leaderboard' && req.method === 'GET') {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query('SELECT name, score FROM players ORDER BY score DESC LIMIT 10', 
                (err, results) => err ? reject(err) : resolve(results));
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        } catch (err) {
            console.error('Database error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
        }
        return;
    }
    if (pathname === '/save-score' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (!data.name || data.score === undefined) {
                    throw new Error('Missing name or score');
                }

                const playerName = data.name.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50);
                const playerScore = parseInt(data.score, 10);

                const result = await new Promise((resolve, reject) => {
                    db.query(
                        'INSERT INTO players (name, score) VALUES (?, ?)',
                        [playerName, playerScore],
                        (err, result) => err ? reject(err) : resolve(result)
                    );
                });

                console.log('Score saved:', playerName, playerScore);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, insertedId: result.insertId }));
            } catch (e) {
                console.error('Save score error:', e);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    const filePath = path.join(
        __dirname,
        pathname === '/' ? 'index.html' : 
        pathname.startsWith('/assets/') ? pathname.substring(1) : 
        pathname.startsWith('/public/') ? pathname.substring(1) : 
        pathname
    );

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            const extname = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.jpg': 'image/jpeg',
                '.png': 'image/png'
            }[extname] || 'text/plain';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test the API endpoints:`);
    console.log(`- http://localhost:${PORT}/leaderboard`);
    console.log(`- POST to http://localhost:${PORT}/save-score`);
});
