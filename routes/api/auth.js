const expres = require('express');
const router = expres.Router();
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const brcrypt = require('bcryptjs');

const auth = require('../../middlewares/auth');
const User = require('../../models/User');

//@route    GET api/auth
// @desc    Test Route
// @acess   Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-pasword');
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server error');
  }
});
//@route    POST api/auth
// @desc    Authenticate the user and get the token
// @acess   Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      const isMatch = await brcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
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
