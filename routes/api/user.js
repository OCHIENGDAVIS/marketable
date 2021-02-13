const expres = require('express');
const router = expres.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

//@route    POST api/user
// @desc    Register a new User
// @acess   Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 characters').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }
      // get users gravatar
      const avatar = gravatar.url(email, { s: '200', r: 'pg', s: 'mm' });
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      const salt = await brcypt.genSalt(10);
      user.password = await brcypt.hash(password, salt);
      await user.save();
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get('JWTSECRET'),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) {
            throw err;
          }
          return res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      return res.status(500).send('server error');
    }
  }
);

module.exports = router;
