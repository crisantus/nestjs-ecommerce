import {Router}  from 'express';
import { AsyncErrorHandler } from '../utils/error-asyn';
import { authenticateUser, authorizePermissions, Role } from '../middlewares/authentication';
import { cancleOrder, createOrder, getOrderById, listOrders } from '../controllers/order-controller';


const orderRoutes:Router = Router();

orderRoutes.post('/', [authenticateUser ],AsyncErrorHandler(createOrder))
orderRoutes.get('/', [authenticateUser ],AsyncErrorHandler(listOrders)) 
orderRoutes.put('/:id/cancle', [authenticateUser ],AsyncErrorHandler(cancleOrder))
orderRoutes.get('/:id', [authenticateUser ],AsyncErrorHandler(getOrderById))


export default orderRoutes;