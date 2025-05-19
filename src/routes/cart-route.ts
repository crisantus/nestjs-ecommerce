import {Router}  from 'express';
import { AsyncErrorHandler } from '../utils/error-asyn';
import { authenticateUser, authorizePermissions, Role } from '../middlewares/authentication';
import { addItemToCart, changeQuantity, deleteItemFromCart, getCart } from '../controllers/cart_controller';

const cartRoutes:Router = Router();

cartRoutes.post('/', [authenticateUser ],AsyncErrorHandler(addItemToCart))
cartRoutes.get('/', [authenticateUser ],AsyncErrorHandler(getCart)) 
cartRoutes.put('/:id', [authenticateUser ],AsyncErrorHandler(changeQuantity))
cartRoutes.delete('/:id', [authenticateUser ],AsyncErrorHandler(deleteItemFromCart))


export default cartRoutes;