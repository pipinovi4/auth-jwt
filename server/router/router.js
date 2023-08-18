const Router = require('express')
const postController = require('../controller/post-controller')
const router = new Router()
const {body} = require('express-validator')
const UserController = require('../controller/user-controller')
const authMiddleware = require('../middlewares/auth-middleware')

router.get('/get-posts', postController.getPosts)
router.get('/get-post/:_id', postController.getPost)
router.post('/create-post', postController.createPost)
router.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 33 }),
    UserController.registration
)
router.post('/login', UserController.login)
router.post('/logout', UserController.logout)
router.get('/activate/:link', UserController.activate)
router.get('/refresh', UserController.refresh)
router.get('/users',authMiddleware, UserController.getUsers)
router.get('/cookie', UserController.getCookie)

module.exports = router
