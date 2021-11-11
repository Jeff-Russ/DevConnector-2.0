const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User'); // still works w/o this!?

// @route    GET api/auth
// @desc     Test route
// @access   Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id) // query by user id
      .select('-password'); // don't show password
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  [ // Validate user login:
    check('email', 'Please include a valid email').isEmail(),
  	check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // First, we respond to any validation errors:
    const errors = validationResult(req);
    if (!errors.isEmpty()) { 
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // (for cleaner code)

    try {
      // a) See if user exists in DB by email:
      let user = await User.findOne({ email });
      if (!user) { // 1. if they don't, invalid sign in:
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
  
      // b) check if user provided password matches DB:
      const isMatch = await bcrypt.compare(password, user.password); 
      if (!isMatch) { // if they don't match, invalid sign in:
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

     
      // c) give user a jsonwebtoken:
      // Make token's payload, which includes the user's ID:
      const payload = { user: { id: user.id } };  
      // Now we sign the token, where we...
      jwt.sign(
        payload, // pass in the payload,
        config.get('jwtSecret'),// pass in the secret,
        { expiresIn: 360000 },  // set expiration (optional but recommended),
        (err, token) => {       // callback to token,
          if (err) throw err;   // throw error if we failed to make token
          res.json({ token });  // or pass token back to user if succeeded.
        }
      );
    } catch(error) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
