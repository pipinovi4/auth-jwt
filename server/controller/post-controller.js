const PostModel = require('../models/post-model');

class PostController {
    async getPosts(req, res, next) {
        try {
            const posts = await PostModel.find();
            console.log(posts)
            return res.json(posts);
        } catch (error) {
            return next(error);
        }
    }

    async getPost(req, res, next) {
        try {
            const postId = req.params._id;
    
            const post = await PostModel.findById(postId);
    
            if (!post) {
                return res.status(404).json({ error: 'Такого поста не существует' });
            }

            const totalPosts = await PostModel.countDocuments();
    
            return res.json({ post, position: totalPosts });
        } catch (error) {
            return next(error);
        }
    }

    async createPost(req, res, next) {
        try {
            const post = req.body;
            const position = await PostModel.countDocuments();
            if (position === null) {
                throw new Error('zalupa typaya')
            }
            req.body.position = position

            if (!post) {
                return res.status(400).json({ error: 'Вы ввели некорректные данные' });
            }
            const createdPost = await PostModel.create(post);
            return res.json(createdPost);
        } catch (error) {
            return next(error);
        }
    }
};

module.exports = new PostController()