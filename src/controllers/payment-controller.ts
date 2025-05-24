
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { prismaClient } from "..";
import { NotFoundError } from "../errors";
import * as CustomError from "../errors";
import { paystack } from "../../services/paystack/paystack";
import { PaystackInitResponse, PaystackVerifyResponse } from "../../services/paystack/paystack-type";
import { BASE_URL } from "../secrets";
import { generateTxRef, initiatePaymentService, verifyPaymentService } from "../../services/flutterwave/flutterwave";
import { FlutterwaveVerificationResponse } from "../../services/flutterwave/flutterwave-type";


export const getAllPaymentsController = async (req: Request, res: Response) => {
  
    const payments = await prismaClient.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        paymentOption: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.status(200).json({
      status: true,
      message: "Payments fetched successfully",
      data: payments
    });
 
};





export const getAllPaymentOptionController = async (req: Request, res: Response) => {
    const payments = await prismaClient.paymentOption.findMany({
      where:{
        active: true
      }
    });

    res.status(200).json({
      status: true,
      message: "Payments fetched successfully",
      data: payments,
    });
 
};


export const initiatePaymentController = async (req: Request, res: Response) => {
  const { id , amount } = req.body;


    if (!id && amount) throw new NotFoundError('Please provide amount');

  switch (id) {
    case "2":
      return initiateFlutterwaveController(req, res);
    case "1":
      return initiatePaystackController(req, res);
    default:
      return res.status(400).json({ status: false, message: "Unsupported payment provider" });
  }
};






// Initialize a payment
export const initiatePaystackController = async (req: AuthenticatedRequest, res: Response) => {
    const { amount } = req.body;
    const callback_url = `${process.env.BASE_URL}payment/verify-callback`;
  
 
      const response = await paystack.post<PaystackInitResponse>('/transaction/initialize', {
        email: req.user.email,
        amount: amount * 100, // Paystack expects amount in kobo
        userId: req.user.id,
        callback_url: callback_url,
      });
  
      const { authorization_url, reference } = response.data.data;
  
      await prismaClient.payment.create({
        data: {
          email: req.user.email,
          userId: req.user.id,
          amount : Number(amount),
          reference: reference,
          status: 'pending',
        },
      });
  
      return  res.status(200).json({
        status: true,
        message: "Payment Initialized",
        url: authorization_url
    });
     
  
  };
  
  // Verify a payment
  export const verifyPaymentCallbackPaystackController = async (req: Request, res: Response) => {
    const { reference } = req.query;
  
      const response = await paystack.get<PaystackVerifyResponse>(`/transaction/verify/${reference}`);
      
      const { status, amount, customer } = response.data.data;
  
      if (status === 'success') {
        await prismaClient.payment.updateMany({
          where: { reference: reference as string },
          data: { status: 'success' },
        });
  
        return res.status(200).json({  status : true , message: 'Payment successful', email: customer.email, amount: amount / 100 });
      } else {
        return res.status(400).json({ status : false ,message: 'Payment not successful' });
      }
  
  };

  // export const handlePaystackWebhook = async (req: Request, res: Response) => {
  //   const event = req.body;
  
  //   if (event.event === 'charge.success') {
  //     const reference = event.data.reference;
  //     const metadata = event.data.metadata; // <-- your custom data here
  
  //     // Example: metadata.userId
  //     const userId = metadata.userId;

  //     await prismaClient.payment.updateMany({
  //       where: { reference },
  //       data: { status: 'success', userId },
  //     });
  
  //     // Now you know exactly which user made this payment!
  //   }
  
  //   res.sendStatus(200);
  // };



export const initiateFlutterwaveController = async (req: AuthenticatedRequest, res: Response) => {
  const { amount, currency = "NGN" } = req.body;
  const callback_url = `${process.env.BASE_URL}payment/callback`;
  const txRef = generateTxRef();
  const payload = {
    tx_ref: txRef,
    amount,
    currency,
    redirect_url: callback_url,
    customer: {
      email: req.user.email,
      userId: req.user.id,
    },
    // customizations: {
    //   title: "My Product",
    //   description: "Product description",
    // },
  };

  const result = await initiatePaymentService(payload);

  await prismaClient.payment.create({
    data: {
      email: req.user.email,
      userId: req.user.id,
      amount : Number(amount),
      reference: txRef,
      status: 'pending',
    },
  });

  return res.json(result);
};



export const verifyPaymentCallbackFlutterWaveController = async (req: Request, res: Response) => {
 
    const transactionId = req.query.transaction_id as string;

    if (!transactionId) {
      return res.status(400).json({
        status: false,
        message: "Missing transaction_id in callback query params",
      });
    }

    // ✅ Verify with Flutterwave
    const verification: FlutterwaveVerificationResponse["data"] = await verifyPaymentService(transactionId);

    const txRef = verification.tx_ref;
    const flwStatus = verification.status;

    // ✅ Update your DB record using tx_ref (if that's what you stored)
    const updateResult = await prismaClient.payment.updateMany({
      where: { reference: txRef },
      data: { status: flwStatus },
    });

    if (updateResult.count === 0) {
      return res.status(404).json({
        status: false,
        message: `No payment found with reference: ${txRef}`,
      });
    }

    return res.status(200).json({
      status: true,
      message: `Payment marked as ${flwStatus}`,
      data: { txRef, flwStatus },
    });

};


