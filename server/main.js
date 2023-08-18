require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/router')
const ErrorMiddleware = require('./middlewares/error-middleware')
const app = express()

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5174'
}))
app.use(cookieParser())
app.use('/api', router)
app.use(ErrorMiddleware)


const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }),
        app.listen(process.env.PORT, () => console.log(`Started on port ${process.env.PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()