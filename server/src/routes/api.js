const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')

// Define a GET route
router.get('/data', (req, res) => {
  // Perform some operation (e.g., fetch data from a database)
  // Send a JSON response to the client
  res.json({ message: 'Data from the server' });
});
router.get('/login', (req, res) => {
  res.json({ message: 'login page'})
})

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    })
    res.status(201).json({ message: 'User created successfully', user })
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error })
  }
})

module.exports = router;
