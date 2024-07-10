const { createPost, likeandunlikePost, deletePost, getPostFollowing, addComment, deleteComment } = require('../controllers/post')
const { isAuthenticated } = require('../middleware/auth')

const router=require('express').Router()
router.route('/post/upload').post(isAuthenticated,createPost)
router.route('/post/:id').get(isAuthenticated,likeandunlikePost).delete(isAuthenticated,deletePost)
router.route('/posts').get(isAuthenticated, getPostFollowing)
router.route('/post/comment/:id').put(isAuthenticated, addComment).delete(isAuthenticated, deleteComment)

module.exports = router