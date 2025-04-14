const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

//@route    post/api/post
//@desc     create a post
//@access   Private

router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id).select('-password');

    try {
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    get/api/post
//@desc     get all post
//@access   Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    get/api/post/:id
//@desc     get a post by id
//@access   Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('Server Error');
  }
});

//@route    delete/api/post/:id
//@desc     delete post
//@access   Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }
    if (post.user.toString() != req.user.id) {
      return res.status(401).json({ msg: 'user not authorized' });
    }

    await post.deleteOne();

    res.json({ msg: 'post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
