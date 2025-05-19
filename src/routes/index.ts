import {Router } from 'express'
import authRoute from './auth-route'
import userRoute from './user-route'
import productRoutes from './product-route'
import cartRoutes from './cart-route'
import orderRoutes from './order-route'

const rootRouter: Router = Router()

rootRouter.use('/auth', authRoute)
rootRouter.use('/user', userRoute)
rootRouter.use('/products', productRoutes)
rootRouter.use('/carts', cartRoutes)
rootRouter.use('/orders', orderRoutes)


export default rootRouter