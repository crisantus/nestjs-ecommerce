import { Router } from 'express';
import { AsyncErrorHandler } from '../utils/error-asyn';
import { getAllPaymentOptionController, getAllPaymentsController, initiatePaymentController,verifyPaymentCallbackFlutterWaveController, verifyPaymentCallbackPaystackController} from '../controllers/payment-controller';
import { authenticateUser } from '../middlewares/authentication';

const paymentRoutes: Router = Router();   

paymentRoutes.get('/all-payment', [authenticateUser],AsyncErrorHandler(getAllPaymentsController));
paymentRoutes.get('/all-payment-option', [authenticateUser],AsyncErrorHandler(getAllPaymentOptionController));
paymentRoutes.post('/initiate-payment', [authenticateUser],AsyncErrorHandler(initiatePaymentController));
paymentRoutes.get('/verify-callback', AsyncErrorHandler(verifyPaymentCallbackPaystackController) );
paymentRoutes.get('/callback', AsyncErrorHandler(verifyPaymentCallbackFlutterWaveController) );

export default paymentRoutes;
