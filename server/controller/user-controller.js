const ApiError = require('../exceptions/api-error')
const { validationResult } = require('express-validator')
const UserService = require('../service/userService')
const userModel = require('../models/user-model')

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req) //При помощи express-validator проверяем корекность почты и пароля
            if (!errors.isEmpty()) {
                //Если валидатор что-то вернул то мы пробрасываем ошибку
                return next(
                    ApiError.BadRequest('Ошибка при валидации', errors.array())
                )
            }
            const { email, password } = req.body //Вытягиваем с body email и password
            const userData = await UserService.registration(email, password) //функция регистрации пользователя
            if (!userData) {
                return next(
                    ApiError.BadRequest(
                        'Пользователь не прошел регистрации так как не были сгенерированные токены и userDto '
                    )
                )
            }
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                SameSite: 'lax',
            }) //Создаем cookie в котором будет refreshToken который будет жить 30дней
            return res.json(userData) //возвращаем на клиент userData
        } catch (e) {
            next(e) // Если словили ошибку то обрабатываем ее
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link//Берем link из ссылки 
            await UserService.activate(activationLink)//Активируем аккаунт
            return res.redirect(`${process.env.CLIENT_URL}/${activationLink}`)//Редиректим по ссылке
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body//Берем из поля body email и password
            const userData = await UserService.login(email, password)//Логинимся
            await res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, SameSite: "lax"})//Устанавливаем cookie refreshToken и длительность жизни cookie
            const myCookie = req.cookies.refreshToken
            console.log(myCookie)
            return res.json(userData)//Возвращаем userData
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies//Получаем refreshToken с куков
            const token = await UserService.logout(refreshToken)//Разлогиниваемся
            res.clearCookie('refreshToken')//Очищаем куки
            return res.json(token)//Отпровляем ответ на клиент
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            const userData = await UserService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, SameSite: "lax"})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userModel.find()
            return res.json(users)
        } catch (e) {
            next(e)
        }
    }

    async getCookie(req, res, next) {
        try {
            const myCookie = req.cookies.refreshToken//Запрос на куки refreshToken
            console.log('1', myCookie)//Выводим в консоль куки
            return res.json(myCookie)//Возвращаем на сервер куки
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()
