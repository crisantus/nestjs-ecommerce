import {Router} from 'express'
import { logInController, signUpController } from '../controllers/auth_controller'
import { AsyncErrorHandler } from '../utils/error-asyn'
const authRoute:Router = Router()

authRoute.post('/signup', AsyncErrorHandler(signUpController))
authRoute.post('/login', AsyncErrorHandler(logInController))

export default authRoute;