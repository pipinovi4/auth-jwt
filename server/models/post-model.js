const { Schema, model } = require('mongoose')

const PostSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    date: {type: Date, default: Date.now},
    position: {type: Number, default: 0}
})

module.exports = model('Post', PostSchema)