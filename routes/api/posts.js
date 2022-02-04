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
    console.log(res.header);
    const posts = await Post.find({});
    if (!posts) {
      return res.status(403).json({ msg: "No Posts" });
    } else {
      return res.status(200).json(posts);
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
    postField.tags = tags.split(",").map((tag) => tag.trim());
  }

  // Creating Post
  const newPost = new Post(postField);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//TODO: Updated is not showing proper boolean.

// Update Post
router.put("/update/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "No Post Found" });

    const { title, body, tags } = req.body;

    const postUpdated = post;

    if (title) postUpdated.title = title;
    if (body) postUpdated.body = body;
    if (tags) {
      postUpdated.tags = tags.split(",").map((tag) => tag.trim());
    }

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

      post.save();
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
      res.status(200).json({ msg: "Post Deleted" });
    } else {
      res.status(403).json({ msg: "Error During Deleting Post" });
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
      res.status(200).json({ msg: "The post has been liked" });
    } else {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.status(200).json({ msg: "The post has been disliked" });
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
      name: req.user.name,
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

// Update Command.
router.post("/comment/update/:id", auth, async (req, res) => {
  Post.findById(req.params.id, async (err, result) => {
    if (!err) {
      if (!result) {
        res.status(404).send("Post not found");
      } else {
        result.comments.id(req.body.commentid).text = req.body.text;
        result.comments.id(req.body.commentid).edited = true;
        result.markModified("comments");
        result.save(function (saveerr, saveresult) {
          if (!saveerr) {
            res.status(200).send(saveresult.comments);
          } else {
            res.status(400).send(saveerr.message);
          }
        });
      }
    } else {
      res.status(400).send(err.message);
    }
  });
});

router.post("/comment/delete/:id", auth, async (req, res) => {
  Post.findById(req.params.id, function (err, result) {
    if (!err) {
      if (!result) {
        res.status(404).send("User was not found");
      } else {
        result.comments.id(req.body.commentid).remove(function (removeerr, removresult) {
          if (removeerr) {
            res.status(400).send(removeerr.message);
          }
        });
        result.markModified("comments");
        result.save(function (saveerr, saveresult) {
          if (!saveerr) {
            res.status(200).send(saveresult);
          } else {
            res.status(400).send(saveerr.message);
          }
        });
      }
    } else {
      res.status(400).send(err.message);
    }
  });
});

// @Route  GET api/posts
// @desc   Test route
// @access Public

// Get post under tag
router.get("/tag/:name", auth, async (req, res) => {
  try {
    const posts = await Post.find({
      tags: { $regex: `${req.params.name}`, $options: "i" },
    });
    if (!posts) {
      return res.status(403).json({ msg: "No Posts under this tag" });
    } else {
      return res.status(200).json(posts);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

// Timeline Post
// router.get("/timeline", async (res, req) => {
//   let postArray = [];

//   try {
//     const currentUser = await User.findById(req.user.id);
//     const userPost = await Post.find({ user: req.user });
//     // const hashtagPost
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//   const post = await Post.findOne({ id: req.params.id });
//   const comment = post.comments.id(req.body.commentid)

//   comment.text = "mama";
//   comment.edited = "false";

//   await comment.save();
//   // await Post.findOneAndUpdate(
//   //   { "_id": req.params.id, "comments.id": req.body.commentid },
//   //   {
//   //     $set: { "comments.$.text": req.body.text, "comments.$.edited": true },
//   //   }
//   // );

//   res.status(200).json(post.comments);

//   // if (post.comments.includes(commentObj.commentid)) {
//   //   await post.updateOne({ $push: { likes: req.user.id } });
//   //   res.status(200).json("The post has been liked");
//   // } else {
//   //   await post.updateOne({ $pull: { likes: req.user.id } });
//   //   res.status(200).json("The post has been disliked");
//   // }

// } catch (err) {
//   console.log(err);
//   res.status(500).json(err);
// }
