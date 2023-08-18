const jwt = require('jsonwebtoken')
const TokenModel = require('../models/token-model')
require('dotenv').config()

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '30m',
        }) //Создаем accessToken который живет 30 минут и создаем при помощи секретного ключа и отсортированных данных
        const refreshToken = jwt.sign(payload, '123', {
            expiresIn: '30d',
        }) //Создаем refreshToken который живет 30 дней и создаем при помощи секретного ключа и отсортированных данных
        return { accessToken, refreshToken } //Возращаем токены
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await TokenModel.findOne({ user: userId }) // Находим в колекции token по userId
        if (tokenData) {
            //Проверка на то нашли или нет там что-то
            tokenData.refreshToken = refreshToken //Если нашли то прошлый токен меняем на текущий
            return tokenData.save() //Сохраняем изменения
        }
        const token = await TokenModel.create({
            user: userId,
            refreshToken,
        }) //Если не нашли то создаем токены и возращаем их
        return token
    }

    async removeToken(token) {
        const tokenData = await TokenModel.deleteOne({ token }) //Удаляем токен
        return tokenData //Возвращаем удаленный токен
    }

    validateRefreshToken(refreshToken) {
        // try {
            console.log(refreshToken)
            const userData = jwt.verify(refreshToken, '123')
            console.log(userData)
            return userData
        // } catch (e) {
            // return null
        // }
    }

    validateAccessToken(accessToken) {
        try {
            const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    async findToken(token) {
        const tokenData = await TokenModel.findOne({token})
        return token
    }
}

module.exports = new TokenService()
