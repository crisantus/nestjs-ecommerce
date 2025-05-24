import {Router}  from 'express';
import { AsyncErrorHandler } from '../utils/error-asyn';
import { createProductController, deleteProductController, getAllProductsController, getProductByIdController, searchProductController, updateProductController } from '../controllers/product-controller';
import { authenticateUser, authorizePermissions, Role } from '../middlewares/authentication';

const productRoutes:Router = Router();

productRoutes.post('/', [authenticateUser, authorizePermissions(Role.ADMIN)],AsyncErrorHandler(createProductController))
productRoutes.get('/', [authenticateUser, authorizePermissions(Role.USER)],AsyncErrorHandler(getAllProductsController))
productRoutes.put('/:id', [authenticateUser, authorizePermissions(Role.USER)],AsyncErrorHandler(updateProductController))
productRoutes.delete('/:id', [authenticateUser, authorizePermissions(Role.USER)],AsyncErrorHandler(deleteProductController)) 
productRoutes.get('/:id', [authenticateUser, authorizePermissions(Role.USER)],AsyncErrorHandler(getProductByIdController))
// search?q=next
productRoutes.get('/:id', [authenticateUser, authorizePermissions(Role.USER)],AsyncErrorHandler(searchProductController))

export default productRoutes;