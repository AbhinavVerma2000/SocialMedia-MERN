const Post = require("../models/Post");
const User = require("../models/Users");
exports.createPost = async (req, res) => {
  try {
    const newPost = await Post.create({
      caption: req.body.caption,
      image: {
        public_id: req.body.public_id,
        url: req.body.url,
      },
      owner: req.user._id,
    });
    const user = await User.findById(req.user._id);
    user.posts.push(newPost._id);
    await user.save();
    return res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.likeandunlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);
      post.likes.splice(index, 1);
      await post.save();
      return res.status(201).json({ success: true, message: "Post unliked" });
    } else {
      post.likes.push(req.user._id);
      await post.save();
      return res.status(201).json({ success: true, message: "Post liked" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    if (post.owner.toString() !== req.user._id.toString())
      return res.status(401).json({ success: false, message: "Unauthorized" });
    await post.remove();
    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);
    await user.save();
    return res.status(201).json({ success: true, message: "Post Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPostFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    });
    return res.status(201).json({ success: true, following: user.following });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    let commentindex = -1;
    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString())
        commentexist = index;
    });
    if (commentindex !== -1) {
      post.comments[commentindex].comment = req.body.comment;
      await post.save();
      return res
        .status(200)
        .json({ success: true, message: "Comment Updated" });
    } else {
      post.comments.push({ user: req.user._id, comment: req.body.comment });
      await post.save();
      return res.status(200).json({ success: true, message: "Comment added" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    if (post.owner.toString() === req.user._id.toString()) {
        if (req.body.commentid==undefined) {
            return res.status(400).json({success:false, message:"Invalid Action"})
        }
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentid.toString())
          post.comments.splice(index, 1);
      });
      await post.save();
      return res
        .status(201)
        .json({ success: true, message: "Comment Deleted" });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString())
          post.comments.splice(index, 1);
      });
      await post.save();
      return res
        .status(201)
        .json({ success: true, message: "Comment Deleted" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
