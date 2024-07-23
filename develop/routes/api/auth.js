const router = require('express').Router();
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const withAuth = require('../../utils/auth');

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { username: req.body.username } });

    if (!userData) {
      res.status(400).json({ message: 'Incorrect username, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: 'Incorrect password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.json({ message: 'Login successful' }); // Sending success message
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ where: { username: req.body.username } });

    if (existingUser) {
      res.status(400).json({ message: 'Username already taken, please choose another' });
      return;
    }

    const existingPassword = await User.findAll();
    const passwordMatch = existingPassword.some(user => bcrypt.compareSync(req.body.password, user.password));

    if (passwordMatch) {
      res.status(400).json({ message: 'Password already taken, please choose another' });
      return;
    }

    const userData = await User.create({
      username: req.body.username,
      password: req.body.password,
    });

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.json({ message: 'Signup successful' }); // Sending success message
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/logout', withAuth, (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
