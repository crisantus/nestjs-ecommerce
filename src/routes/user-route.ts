
import {Router} from 'express'
import { AsyncErrorHandler } from '../utils/error-asyn'
import { addAddressController, deleteAddressController, getSingleUser, listAddressController, showCurrentUser, updateUser, updateUserPassword } from '../controllers/user-controller'
import { authenticateUser } from '../middlewares/authentication'
const userRoute:Router = Router()

userRoute.get('/userprofile', authenticateUser, AsyncErrorHandler(getSingleUser))
userRoute.get('/showme',authenticateUser ,  AsyncErrorHandler( getSingleUser ))
userRoute.patch('/updateprofile', authenticateUser, AsyncErrorHandler(updateUser))
userRoute.patch('/updatepassword', authenticateUser, AsyncErrorHandler(updateUserPassword))
userRoute.post('/address',authenticateUser, AsyncErrorHandler(addAddressController,))
userRoute.delete('/address/:id',authenticateUser, AsyncErrorHandler(deleteAddressController))
userRoute.get('/address', authenticateUser,AsyncErrorHandler(listAddressController))

export default userRoute;