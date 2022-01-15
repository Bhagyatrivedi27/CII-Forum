const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const User = require("../../models/User");
const Tags = require("../../models/Tags");



// @Route  GET api/posts/
// @desc   Get all Posts
// @access Public
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({});

    if (!posts) {
      return res.status(400).json({ msg: "No Posts" });
    } else {
      return res.status(200).json(posts);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @Route  GET api/posts/post
// @desc   Create Post
// @access Private
router.post("/post", auth, async (req, res) => {
  try{
    const { title, body, imageUrl, tags } = req.body;

    const postField = {};

    // User Details
    postField.userId = req.user.id;
    postField.username = req.user.username;

    // Post Details
    if (title) postField.title = title;
    if (body) postField.body = body;
    if (imageUrl) postField.imageUrl = imageUrl;
    if (tags) postField.tags = tags.split(",").map((tags) => tags.trim()); 
    

    // Creating Post
    const newPost = new Post(postField);
    const savedPost = await newPost.save();

    // Creating or Inserting into Tags
    postField.tags.forEach(async (tag) => {
      const tagField = await Tags.find({name: tag})
      
      if(tagField){
        tagField.posts.unshift(savedPost.id);
        const savedTag = await tag.save();
      } else {

        const newTag = new Tag({name: tag})
        const savedTag = await newTag.save();

        newTag.posts.unshift(savedPost.id);
      }
    });

    res.status(200).json(savedPost);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({msg:"Server Error"});
  }
});

// @Route  GET api/posts/update/:id
// @desc   Update Post
// @access Private
router.put("/update/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const { title, body, imageUrl, tags } = req.body;

    const postUpdated = post;

    if (title) postUpdated.title = title;
    if (body) postUpdated.body = body;
    if (imageUrl) postUpdated.imageUrl = imageUrl;
    if (tags) postUpdated.tags = tags.split(",").map((tags) => tags.trim());

    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: {
          title: postUpdated.title,
          body: postUpdated.body,
          tags: postUpdated.tags,
          imageUrl: postUpdated.imageUrl,
          updated: true
        },
      });

      // Updating Tag Schema
      postUpdated.tags.forEach(async (tag) => {
        const tagField = await Tags.find({ name: tag });

        if (tagField) {
          tag.posts.unshift(savedPost.id);
          const savedTag = await tag.save();
        } else {
          const newTag = new Tag({ name: tag });
          const savedTag = await newTag.save();

          newTag.posts.unshift(savedPost.id);
        }
      });

      res.status(200).json(post);
  
    } else {
      res.status(403).json({ msg: "You can update only your post" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// @Route  delete api/posts/delete/:id
// @desc   Delete Post
// @access Private
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.deleteOne({ _id: req.params.id });
      res.status(200).json({ msg: "Post deleted" });

    } else {
      res.status(403).json({ msg: "Error during deleting post" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// @Route  PUT api/posts/:id/like
// @desc   Like/Dislike Post
// @access Private
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.user.id)) {
      await post.updateOne({ $push: { likes: req.user.id } });
      res.status(200).json({msg: "Post liked"});
    } else {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.status(200).json({msg: "Post Disliked"});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// @Route  GET api/posts/comment/:id
// @desc   Get Post Comments
// @access Private
router.get("/comment/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.comments) {
      return res.status(400).json({ msg: "No Comments" });
    } else {
      return res.status(400).json(post.comments);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @Route  POST api/posts/comment/post/:id
// @desc   Post Comments
// @access Private
router.post("/comment/post/:id", auth, async (req, res) => {
  try {
    const commentObj = {
      user: req.user.id,
      text: req.body.text,
      name: req.body.name,
    };

    const post = await Post.findById(req.params.id);
    post.comments.unshift(commentObj);

    const savedPost = await post.save();
    res.status(200).json(savedPost);
  } catch (err) {

    console.log(err);
    res.status(500).json(err);
  }
});

// @Route  POST api/posts/comment/update/:id
// @desc   Update Post Comments
// @access Private
router.post("/comment/update/:id", auth, async (req, res) => {
  try {
    const commentObj = {
      text: req.body.text,
      commentid: req.body.commentid,
    };

    const post = await Post.findById(req.params.id);

    const comment = post.comments.find(
      (comment) => comment.id === commentObj.commentid
    );

    comment.edited = true;
    comment.text = commentObj.text;

    post.updateOne({ $push: { comment: commentObj.commentid } });

    const savedPost = await post.save();
    res.status(200).json(savedPost);
  } catch (err) {

    console.log(err);
    res.status(500).json(err);
  }
});

// @Route DELETE api/posts/comment/delete/:id
// @desc Delete Post Comments
// @access Private
router.post("/comment/update/:id", auth, async (req, res) => {
  try {
    const commentObj = {
      commentid: req.body.commentid,
    };

    const post = await Post.findById(req.params.id);

    const comment = post.comments.find(
      (comment) => comment.id === commentObj.commentid
    );

    post.updateOne({ $pull: { comment: commentObj.commentid } });

    const savedPost = await post.save();
    res.status(200).json(savedPost);
  } catch (err) {

    console.log(err);
    res.status(500).json(err);
  }
});

// @Route GET api/posts/tags/:name
// @desc Get Posts under Tag
// @access Private
router.get("/tags/:name", auth, async (req, res) => {
  try {
    const hashtag = await Tags.find({name:name});
    if (hashtag) {
      return res.status(400).json(hashtag);
    } else {
      return res.status(400).json(hashtag.posts);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @Route POST api/posts/tags/:name
// @desc Get Posts under Tag
// @access Private

module.exports = router;


    // if (post.comments.includes(commentObj.commentid)) {
    //   await post.updateOne({ $push: { likes: req.user.id } });
    //   res.status(200).json("The post has been liked");
    // } else {
    //   await post.updateOne({ $pull: { likes: req.user.id } });
    //   res.status(200).json("The post has been disliked");
    // }