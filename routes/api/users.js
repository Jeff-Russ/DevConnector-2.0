const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
    	.isLength({ min: 6 })
  ],
  (req, res) => {
    // set errors to validation result, which takes in the request:
    const errors = validationResult(req);
    // now we want to check for errors
    if (!errors.isEmpty()) { // if there are errors:
     	// send a response with 404 (bad request), not 200 (all OK)
      // and we want the error message visible in response so we
      // send the array we get from errors.array():
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('users route')
  }
);
module.exports = router;
