const ApiError = require('../exceptions/api-error')
const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const UserDto = require('../dto/user-dto')
const TokenService = require('../service/tokenService')
const MailService = require('./mailService')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email }) //Ищем ннету ли пользователей с таким email
        if (candidate) {
            //Проверка на совподения
            throw ApiError.BadRequest('Такой email уже зарегестрирован')
        }
        const hashPassword = await bcrypt.hash(password, 3) //Хешируем пароль
        const activationLink = uuid.v4() //Создаем ссылку активации давая ей случайную строку
        const user = await UserModel.create({
            //Создаем пользователя
            email,
            password: hashPassword,
            activationLink,
        })
        await MailService.SendActiovationLink(email, `${process.env.API_URL}/api/activate/${activationLink}`)//Отправляем письмо для подтверждения регистрации
        const userDto = new UserDto(user) //Убираем не нужные данные и сохраняем в переменной userDto
        const tokens = TokenService.generateToken({ ...userDto }) //Создаем токены
        await TokenService.saveToken(userDto.id, tokens.refreshToken) //Сохраняем refreshToken и отсортированную информацию в колекции


        return { ...tokens, user: userDto } //Возвращаем токены и отсортированные данные
    }
    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})//Находим пользователя
        if (!user) {//Если не нашли пользователя то пробрасываем ошибку
            throw ApiError.BadRequest('Не коректная ссылка')
        }
        user.isActivated = true//Меняем флаг isActivated на true
        await user.save()//Сохроняем изменения
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})//Ищем польщователя
        if (!user) {//Если не нашли пробрасываем ошибку
            throw ApiError.UnauthorizedError('Пользователь не был найден')
        }
        const isPassEqual = bcrypt.compare(password, user.password)//Сравниваем пароли
        if (!isPassEqual) {//Если сравнение вернуло false то пробрасываем ошибку
            throw ApiError.BadRequest('Не верный пароль')
        }
        const userDto = new UserDto(user)//Отбрасываем лишние данные
        const tokens = TokenService.generateToken({...userDto})//Генерируем новую пару токенов
        await TokenService.saveToken(userDto.id, tokens.refreshToken)//Сохраняем новую токен
        return {...tokens, user: userDto}//Возращаем токены и userDto
    }

    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken)//Удаляем токен
        return token//Возвращаем удаленный токен
    }

    async refresh(refreshToken) {
        if(!refreshToken){
            console.log(1)
            throw ApiError.UnauthorizedError()
        }
        console.log(refreshToken)
        const userData = TokenService.validateRefreshToken(refreshToken)
        console.log(userData)
        const tokenFromDb = await TokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            console.log(2, tokenFromDb)
            console.log(3, userData)
            throw ApiError.UnauthorizedError()
        }
        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = TokenService.generateToken({...userDto})
        await TokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }
}

module.exports = new UserService()
