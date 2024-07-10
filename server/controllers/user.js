const User = require("../models/Users");
const Posts = require("../models/Post");
const { sendEmail } = require("../middleware/sendEmail");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: "", url: "" },
    });
    const token = await user.generateToken();
    return res
      .status(201)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .json({ success: true, user, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    const isMatch = await user.matchPass(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Password" });
    const token = await user.generateToken();
    return res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .json({ success: true, user, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    return res
      .status(201)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const usertoFollow = await User.findById(req.user._id);
    const loggedinUser = await User.findById(req.user._id);
    if (!loggedinUser)
      return res
        .status(404)
        .json({ success: false, message: "User not Found" });
    if (loggedinUser.following.includes(usertoFollow._id)) {
      const indexfollowing = loggedinUser.following.indexOf(usertoFollow._id);
      const indexfollower = usertoFollow.followers.indexOf(loggedinUser._id);
      usertoFollow.followers.splice(indexfollower, 1);
      loggedinUser.following.splice(indexfollowing, 1);
      await loggedinUser.save();
      await usertoFollow.save();
      return res
        .status(201)
        .json({ success: true, message: "User Unfollowed" });
    } else {
      loggedinUser.following.push(usertoFollow._id);
      usertoFollow.followers.push(loggedinUser._id);
      await loggedinUser.save();
      await usertoFollow.save();
      return res.status(201).json({ success: true, message: "User followed" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatepass = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldpass, newpass } = req.body;
    if (!oldpass || !newpass) {
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    }
    const isMatch = await user.matchPass(oldpass);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Old Password" });
    user.password = newpass;
    await user.save();
    return res.status(200).json({ success: true, message: "Password Updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email } = req.body;
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    await user.save();
    return res.status(200).json({ success: true, message: "Profile Updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followers = user.followers;
    const followings = user.following;
    const posts = user.posts;
    await user.remove();
    for (let i = 0; i < posts.length; ++i) {
      const post = await Posts.findById(posts[i]);
      await post.remove();
    }
    for (let i = 0; i < followers.length; ++i) {
      const follower = await User.findById(followers[i]);
      const index = follower.following.indexOf(user._id);
      follower.following.splice(index, 1);
      await follower.remove();
    }
    for (let i = 0; i < followings.length; ++i) {
      const following = await User.findById(followings[i]);
      const index = following.followers.indexOf(user._id);
      following.followers.splice(index, 1);
      await following.remove();
    }
    return res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({ success: true, message: "Profile deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.AllUsers = async (req, res) => {
  try {
    const user = await User.find();
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPass = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const resetpassToken = user.getResetPassToken();
    await user.save();
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetpassToken}`;
    const message = `Reset your Password by clicking on this link below:\n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });
      return res
        .status(200)
        .json({ success: true, mess: `Email sent to ${user.email}` });
    } catch (error) {
      user.resetPassToken = undefined;
      user.resetPassExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: error.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPass = async (req, res) => {
  try {
    const resetPassToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPassToken,
      resetPassExpire: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Token is invalid or has expired" });
    user.password = req.body.password;
    user.resetPassToken = undefined;
    user.resetPassExpire = undefined;
    await user.save();
    return res.status(200).json({success: true, message:"Password Updated"})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
