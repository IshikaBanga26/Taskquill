const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  try {
    const userExists = await User.findOne({ email })
    if (userExists) return res.status(400).json({ message: 'Email already in use' })

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)

    const user = new User({ name, email, password: hashed })
    await user.save()

    res.status(201).json({ message: 'Account created successfully' })

  } catch (err) {
    console.log('register error:', err.message)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (err) {
    console.log('login error:', err.message)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

module.exports = router