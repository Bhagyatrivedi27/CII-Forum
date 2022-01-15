const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const User = require("../../models/User");
const Tags = require("../../models/Tags");

// @Route  GET api/posts
// @desc   Test route
// @access Public

// Get Post
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({});
    if (!posts) {
      return res.status(400).json({ msg: "No Posts" });
    } else {
      return res.status(400).json(posts);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Create Post
router.post("/post", auth, async (req, res) => {
  const { title, body, tags } = req.body;

  const postField = {};

  postField.user = req.user.id;
  if (title) postField.title = title;
  if (body) postField.body = body;
  if (tags) {
    postField.tags = tags.split(",").map((tags) => tags.trim());
  }

  // Creating Post
  const newPost = new Post(postField);
  try {
    const savedPost = await newPost.save();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }

  const tagObject = {
    id: newPost.id
  }
  const newTag = new Tags({name:"WER",  $push :{posts:tagObject}});
  const savedTag = await newTag.save();

  newTag.posts.unshift(tagObject);
  res.status(300).send("Created");

});

// Update Post
router.put("/update/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const { title, body, tags } = req.body;

    const postUpdated = post;

    if (title) postUpdated.title = title;
    if (body) postUpdated.body = body;
    if (tags) postUpdated.tags = tags.split(",").map((tags) => tags.trim());

    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: {
          title: postUpdated.title,
          body: postUpdated.body,
          tags: postUpdated.tags,
        },
      });

      await post.updateOne({
        $set: { updated: true },
      });

      res.status(200).json(post);
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete Post
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.deleteOne({ _id: req.params.id });
      res.status(200).json("Post has been delete");
    } else {
      res.status(403).json("Error During Deleting Post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like and Dislike
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.user.id)) {
      await post.updateOne({ $push: { likes: req.user.id } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Get Comments
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

// Post Comment
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
    res.status(200).json(savedPost.comments);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

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

    console.log(post.comments);
    res.status(200).json(post.comments);

    // if (post.comments.includes(commentObj.commentid)) {
    //   await post.updateOne({ $push: { likes: req.user.id } });
    //   res.status(200).json("The post has been liked");
    // } else {
    //   await post.updateOne({ $pull: { likes: req.user.id } });
    //   res.status(200).json("The post has been disliked");
    // }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Posts under hashtag
router.get("/tags", auth, async (req, res) => {
  try {
    const hashtag = await Tags.find({});
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

module.exports = router;
