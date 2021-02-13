const expres = require('express');
const { check, validationResult } = require('express-validator');
const router = expres.Router();


const auth = require('../../middlewares/auth')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

//@route    POST api/post
// @desc    Create a Post
// @acess   Private
router.post('/', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
try {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }
  const user = await User.findById(req.user.id).select('-password')
  const newPost = {
    text : req.body.text,
    name: user.name, 
    avatar: user.avatar,
    user: req.user.id
  }
  const post = await Post(newPost).save()
  return res.json(post)
} catch (error) {
  console.log(error)
  return res.status(500).send('Server Error')
}
  
});

//@route    GET api/post
// @desc    Get all posts
// @acess   Private
router.get('/', auth, async (req, res)=>{
  try {
    const posts = await Post.find().sort({date: -1})
    return res.json(posts)
  } catch (error) {
    console.log(error)
    return res.status(500).send('Server Error')
  }

})


//@route    GET api/posts/post_id
// @desc    Get a single post using the post_id
// @acess   Private
router.get('/:post_id', auth, async (req, res)=>{
  try {
    const post = await Post.findById(req.params.post_id)
    if(!post){
      return res.status(404).send({msg: 'post not found'})
    }
    return res.json(post)
  } catch (error) {
    console.log(error)
    if(error.kind == "ObjectId"){
      return res.status(404).send({msg: 'post not found'})
    }
    return res.status(500).send('Server Error')
  }
})

//@route    DELETE api/posts/post_id
// @desc    Delete a single post using the post_id
// @acess   Private
router.delete('/:post_id', auth, async (req, res)=>{
  try {
    const post = await Post.findById(req.params.post_id)
    if(!post){
      return res.status(404).send({msg: 'post not found'})
    }
    // check if the user owns the post
    if(post.user.toString() !== req.user.id.toString()){
      return res.status(401).json({msg: 'You are not authorised to delete this post'})
    }
    await post.remove()
    return res.json({msg: 'post deleted'})
  } catch (error) {
    console.log(error)
    if(error.kind == "ObjectId"){
      return res.status(404).send({msg: 'post not found'})
    }
    return res.status(500).send('Server Error')
  }
})


//@route    PUT api/posts/like/:post_id
// @desc    Like a particular post
// @acess   Private
router.put('/like/:post_id', auth, async(req, res)=>{
try {
  const post = await Post.findById(req.params.post_id)
  // check if the post have already been liked by this user
  if(post.likes.filter((like)=>like.user.toString() === req.user.id).length > 0){
    return res.status(400).json({msg: 'Post already liked'})
  }
  post.likes.unshift({user:req.user.id})
  await post.save()
  return res.json(post.likes)
} catch (error) {
  console.log(error)
  res.status(500).send('server error')
}
})



//@route    PUT api/posts/unlike/:post_id
// @desc    Unlike a particular post
// @acess   Private
router.put('/unlike/:post_id', auth, async(req, res)=>{
try {
  const post = await Post.findById(req.params.post_id)
  // check if the post have already been unliked by this user
  if(post.likes.filter((like)=>like.user.toString() === req.user.id).length === 0){
    return res.status(400).json({msg: 'Post has not yet been liked'})
  }
  // get the remove index
  const removeIndex = post.likes.map(like=>like.user.toString()).indexOf(req.user.id)
  post.likes.splice(removeIndex, 1)
  await post.save()
  return res.json(post.likes)
} catch (error) {
  console.log(error)
  res.status(500).send('server error')
}
})

//@route    POST api/post/comment/:post_id
// @desc    Comment on a post
// @acess   Private
router.post('/comment/:post_id', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
try {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }
  const user = await User.findById(req.user.id).select('-password')
  const post = await Post.findById(req.params.post_id)
  if(!post){
    return res.status(404).json({msg: 'post not found'})
  }

  const newComment = {
    text : req.body.text,
    name: user.name, 
    avatar: user.avatar,
    user: req.user.id
  }
  post.comments.unshift(newComment)
  await post.save()
  return res.json(post.comments )
} catch (error) {
  console.log(error)
  return res.status(500).send('Server Error')
}
  
});


//@route    DELETE api/post/comment/:post_id/:comment_id
// @desc    Delete the comment
// @acess   Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res)=>{
try {
  const post = await Post.findById(req.params.post_id)
  if(!post){
    res.status(400).json({msg: 'post not found'})
  }
  // pull the comments from this post
  const comment = post.comments.find(comment=>comment.id === req.params.comment_id)
  // make sure comment exists
  if(!comment){
    return res.status(404).json({msg: 'comment not found'})
  }
  // Check if the user owns the comment they are trying to delete
  if(comment.user.toString() !== req.user.id){
    return res.status(401).json({msg: 'User not allowed to delete the comment'})
  }
  // Get the remove index
  const removeIndex = post.comments.map((comment)=>comment.user.toString()).indexOf(req.user.id)
  console.log(removeIndex)
  post.comments.splice(removeIndex, 1)
  await post.save()
  return res.json(post.comments)  
} catch (error) {
  console.log(error)
  return res.status(500).send('server error') 
  
}
})


module.exports = router;
