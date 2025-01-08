// cd "C:\Users\Katherine A. Tiu\OneDrive\Documents\DADC"
const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const secretKey = 'your-jwt-secret';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(
    session({
        secret: 'your-session-secret', // Replace with a secure secret key
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set `true` for HTTPS
    })
);

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'TestDB', // Replace with your PostgreSQL database name
    password: '041404', // Replace with your PostgreSQL password
    port: 5432,
});

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/image', express.static(path.join(__dirname, 'image')));

// Serve login.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve dashboard.html (after login)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/saved', (req, res) => {
    res.sendFile(path.join(__dirname, 'saved.html'));
});

// Registration route
app.post('/register', async (req, res) => {
    const { username, firstname, lastname, password } = req.body;

    console.log('Received data:', req.body); // Log the incoming data to check username

    try {
        // Step 1: Check if the username already exists
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        // If username already exists, return an error
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Step 2: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 3: Insert the new user into the database
        const insertQuery = 'INSERT INTO users (username, firstname, lastname, password) VALUES ($1, $2, $3, $4)';
        await pool.query(insertQuery, [username, firstname, lastname, hashedPassword]);

        // Step 4: Return success response
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username exists
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Compare password with the stored hash
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Set the userId in the session
        req.session.userId = user.rows[0].id;

        // Successful login
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Fetch all recipes or search by name
app.get('/recipes', async (req, res) => {
    const { search } = req.query; // Search query from user input

    try {
        let query = 'SELECT * FROM recipes';
        let params = [];

        if (search) {
            query += ' WHERE LOWER(name) LIKE LOWER($1)';
            params.push(`%${search}%`);
        }

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.post('/save-food', (req, res) => {
    const userId = req.session.userId; // Retrieve userId from the session
    const { foodId } = req.body;

    if (!userId) {
        console.error('User not logged in');
        return res.status(401).json({ error: 'User not logged in' });
    }

    // Check if the food is already saved by the user
    const checkQuery = `
        SELECT * FROM saved_food_items
        WHERE user_id = $1 AND food_id = $2;
    `;

    pool.query(checkQuery, [userId, foodId])
        .then((checkResult) => {
            if (checkResult.rows.length > 0) {
                // Food already saved
                return res.status(400).json({ message: 'Food item already saved' });
            }

            // If the food is not saved, proceed to save it
            const saveQuery = `
                INSERT INTO saved_food_items (user_id, food_id)
                VALUES ($1, $2)
                RETURNING *;
            `;

            pool.query(saveQuery, [userId, foodId])
                .then((result) => {
                    console.log('Food item saved:', result.rows[0]); // Log the saved item
                    res.json({ message: 'Food item saved', savedItem: result.rows[0] });
                })
                .catch((error) => {
                    console.error('Error saving food item:', error); // Log the error
                    res.status(500).json({ error: 'Failed to save food item', details: error.message });
                });
        })
        .catch((error) => {
            console.error('Error checking if food item is already saved:', error);
            res.status(500).json({ error: 'Failed to check food item', details: error.message });
        });
});






app.get('/saved-foods', async (req, res) => {
    const userId = req.session.userId; // Get the userId from session
    if (!userId) {
        return res.status(401).json({ error: 'User not logged in' });
    }

    try {
        // Join saved_food_items with recipes to fetch full details
        const result = await pool.query(
            `SELECT r.id, r.name, r.description, r.image_url, r.recipe, r.ingredients, r.procedure, r.good_for, sf.food_id
             FROM saved_food_items sf
             JOIN recipes r ON r.id  = sf.food_id
             WHERE sf.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(200).json([]); // Return empty array if no saved items
        }

        // Update the image_url to include the correct static path
        result.rows.forEach(row => {
            row.image_url = `/image/${row.image_url.trim()}`;
        });

        res.status(200).json(result.rows); // Return the full saved food items data with all recipe details
    } catch (error) {
        console.error('Error fetching saved food items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Unsave food (delete saved food item)
app.delete('/unsave-food/:foodId', async (req, res) => {
    const userId = req.session.userId; // Get the userId from session
    const { foodId } = req.params; // Get the foodId from the URL params

    if (!userId) {
        return res.status(401).json({ error: 'User not logged in' });
    }

    try {
        // Delete the saved food item for the user
        const result = await pool.query(
            `DELETE FROM saved_food_items
             WHERE user_id = $1 AND food_id = $2
             RETURNING *`,
            [userId, foodId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Food item not found in saved list' });
        }

        res.status(200).json({ message: 'Food item unsaved successfully' });
    } catch (error) {
        console.error('Error unsaving food item:', error);
        res.status(500).json({ error: 'Failed to unsave food item', details: error.message });
    }
});







app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
