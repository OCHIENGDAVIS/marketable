const expres = require('express');
const router = expres.Router();
const { check, validationResult } = require('express-validator');
const axios = require('axios')
const config = require('config')

const auth = require('../../middlewares/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { response } = require('express');
// const Pofile = require('../../models/Profile');
// const User = require('../../models/User');

//@route    GET api/profile/me
// @desc    GET current user profile
// @acess   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name, avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    return res.json(profile);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server error');
  }
});

//@route    POST api/profile/me
// @desc    Create or Update a user profile
// @acess   Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    // Build a profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (bio) {
      profileFields.bio = bio;
    }
    if (status) {
      profileFields.status = status;
    }
    if (githubusername) {
      profileFields.githubusername = githubusername;
    }
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }
    profileFields.social = {};
    if (youtube) {
      profileFields.social.youtube = youtube;
    }
    if (twitter) {
      profileFields.social.twitter = twitter;
    }
    if (facebook) {
      profileFields.social.facebook = facebook;
    }
    if (instagram) {
      profileFields.social.instagram = instagram;
    }
    if (linkedin) {
      profileFields.social.linkedin = linkedin;
    }
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // update the profile
        profile = await Profile.findOne({ user: req.user.id });

        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      // create a new profile
      profile = new Profile(profileFields);
      await profile.save();

      return res.json(profile);
    } catch (error) {
      console.log(error);
      req.status(500).send('Server error');
    }
  }
);

//@route    GET api/profile
// @desc    GET all profiles
// @acess   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    return res.json(profiles);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Server error');
  }
});

//@route    GET api/profile/user/:user_id
// @desc    GET profile by user ID
// @acess   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(404).json({ msg: 'profile not found' });
    }
    return res.json(profile);
  } catch (error) {
    console.log(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'profile not found' });
    }
    return res.status(500).json('Server error');
  }
});

//@route    DELETE api/profile
// @desc    delete a profile user and posts
// @acess   Private
router.delete('/', auth, async (req, res) => {
  try {
    // remove the profile
    // @todo remove users posts
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    // remove the user
    await User.findOneAndRemove({ _id: req.user.id });
    return res.json({ msg: 'User deleted' });
  } catch (error) {
    console.log(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'profile not found' });
    }
    return res.status(500).json('Server error');
  }
});

//@route    PUT api/profile/experience
// @desc    Add profile experience
// @acess   Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'title is required').not().isEmpty(),
      check('company', 'company is required').not().isEmpty(),
      check('from', 'from is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }
    const { title, company, location, to, current, description } = req.body;
    const newExp = { title, company, location, to, current, description };
    try {
      console.log(req.user.id)
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp); 
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.log(error);
      return res.status(500).send('Server error');
    }
  }
);

//@route    DELETE api/profile/experience/:exp_id
// @desc    Delete experience from a profile
// @acess   Private
router.delete('/experience/:exp_id', auth, async(req, res)=>{
  try {
    const profile = await Profile.findOne({user: req.user.id})
    // get the remove index
    const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id)
    profile.experience.splice(removeIndex, 1)
    await profile.save()
    return res.json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).send('Server Error')
  }
})

//@route    PUT api/profile/education
// @desc    Add profile education
// @acess   Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty(),
      check('from', 'from is required').not().isEmpty(),
      check('fieldOfStudy', 'field of study is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }
    const { school, degree, fieldOfStudy, from, to, current, description } = req.body;
    const newEdu = { school, degree, fieldOfStudy, from, to, current, description };
    try {

      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu); 
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.log(error);
      return res.status(500).send('Server error');
    }
  }
);

//@route    DELETE api/profile/education/:edu_id
// @desc    Delete education from a profile
// @acess   Private
router.delete('/education/:edu_id', auth, async(req, res)=>{
  try {
    const profile = await Profile.findOne({user: req.user.id})
    // get the remove index
    const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id)
    profile.education.splice(removeIndex, 1)
    await profile.save()
    return res.json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).send('Server Error')
  }
})

//@route    GET api/profile/github/:username
// @desc    Get user repos from github
// @acess   Public
router.get('/github/:username', async(req, res)=>{
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('GITHUB_CLIENT_ID')}&client_secret=${config.get('GITHUB_SECRET')}`
    }
    const response = await axios.get(options.uri, {
      headers: {
          'user-agent': 'node.js'
      }
    } )
    return res.json(response.data)
  } catch (error) {
    console.log(error)
    return res.status(500).send('Server Error')
  }
})

module.exports = router;

