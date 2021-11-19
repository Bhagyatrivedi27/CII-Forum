const express = require('express')

const router = express.Router();

const auth = require("../../middleware/auth");

const Post = require('../../models/Post');

// @Route  GET api/posts
// @desc   Test route
// @access Public

// Get Post
router.get("/", auth, async(req, res) => {
  try {
      const posts = await Post.find({});
        if(!posts){
            return res.status(400).json({msg: 'No Posts'});
        } else {
          return res.status(400).json(posts);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// Create Post
router.post("/post", auth, async (req,res) => {
  const {
    title,
    body,
  } = req.body;

  const postField = {}

  postField.user = req.user.id;
  if(title) postField.title = title;
  if(body) postField.body = body;

  const newPost = new Post(postField)
  try{

    const savedPost = await newPost.save();
    res.status(200).json(savedPost);

  } catch(err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})

// Update Post
router.put("/update/:id", auth, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);

    if(post.userId === req.body.userId){
      await post.updateOne({$set:req.body});
      res.status(200).json("The post has been updated");

    } else {
      res.status(403).json("you can update only your post");
    }
  }catch(err){
    res.status(500).json(err);
  }
});

// Delete
router.delete("/delete/:id", auth, async (req, res) =>{
  try {
    const post = await Post.findById(req.params.id);

    if(post.userId === req.body.userId){
      await post.deleteOne({$set:req.body});
      res.status(200).json("Post has been delete");

    } else {
      res.status(403).json("you can update only your post");
    }
  } catch(err) {
    res.status(500).json(err);
  }
})


// Like and Dislike
router.put("/:id/like", auth, async (req, res) =>{
  try {
    const post = await Post.findById(req.params.id);

    if(!post.likes.includes(req.user.id)){
      await post.updateOne({ $push: { likes: req.user.id }});
      res.status(200).json("The post has been liked");

    } else {
      await post.updateOne({ $pull: { likes: req.user.id }});
      res.status(200).json("The post has been disliked");
    }

  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
})


module.exports = router;
