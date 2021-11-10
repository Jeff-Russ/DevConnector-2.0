const express = require('express');
const router = express.Router();
const gravatar = require('gravatar'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [ // Validate user registration submission:
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
    	.isLength({ min: 6 })
  ],
  async (req, res) => {
    // First, we respond to any validation errors:
    const errors = validationResult(req);
    if (!errors.isEmpty()) { 
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body; // (for cleaner code)

    try {
      // a) See if user exists in DB by email
      let user = await User.findOne({ email });
      if (user) { // if so, send error b/c we don't want multiple emails
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }
      // b) Get user's gravatar from their email
      const avatar = gravatar.url(email, {
        s: '200', // default size
        r: 'pg',  // rating, so we don't get naughty pix
        d: 'mm'   // gives default user image if not found.
      });

      // c) Create the user with bcryptjs Encrypted password
      user = new User({
        name,
        email,
        avatar,
        password
      });
      // hash the password:
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save(); // save the user

      // d) give user a jsonwebtoken
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
      res.status(500).send('User registered');
    }
  }
);
module.exports = router;
