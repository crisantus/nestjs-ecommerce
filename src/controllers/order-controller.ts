
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { prismaClient } from "..";
import { NotFoundError } from "../errors";
import * as CustomError from "../errors";
import { OverEventStatus } from "../generated/prisma";


export const createOrder = async (req: AuthenticatedRequest, res: Response) => {

    const order = await prismaClient.$transaction(async (tx) => {
// 1. Get cart items
const cartItems = await tx.cartItem.findMany({
    where: { userId : req.user.id},
    include: { product: true },
  });

  if (cartItems.length === 0) {
    throw new NotFoundError('No items in cart');
  }

  // 2. Get address
  const address = await tx.address.findFirst({  where: { userId : req.user.id}, });
  if (!address) throw new NotFoundError('No Address found for this order');

// 3. Calculate total
//   let total = 0;
//   for (const item of cartItems) {
//     if (item.quantity > item.product.stock) {
//       throw new Error(`Insufficient stock for product: ${item.product.name}`);
//     }
//     total += item.quantity * item.product.price;
//   }
  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  // 4. Create order
  const createdOrder = await tx.order.create({
    data: {
      userId: req.user.id,
      netAmount: totalPrice,
      address: address.formattedAddress,
      orderProduct: {
        create : cartItems.map((cart )=> {
            return {
                productId: cart.productId,
                quantity: cart.quantity,
                price: cart.product.price,
            }
        })
      }
    },
  });

// 5. Create order items + Deduct stock
//   for (const item of cartItems) {
//     await tx.orderItem.create({
//       data: {
//         orderId: createdOrder.id,
//         productId: item.productId,
//         quantity: item.quantity,
//         price: item.product.price,
//       },
//     });
//     // Deduct stock
//     await tx.product.update({
//       where: { id: item.productId },
//       data: { stock: { decrement: item.quantity } },
//     });
//   }

 await tx.orderEvent.create({
  data: {
    orderId: createdOrder.id,
  },
})
// 6. Clear cart
   await tx.cartItem.deleteMany({ where: { userId : req.user.id } });

// 7. Audit log
//   await tx.auditLog.create({
//     data: {
//       userId,
//       action: `Placed order #${createdOrder.id} totaling $${total.toFixed(2)}`,
//     },
//   });

  return createdOrder;
});

// 8. Send email outside transaction
// const user = await prismaClient.user.findUnique({ where: { id: userId } });
// if (user?.email) {
//   await sendEmail(
//     user.email,
//     'Order Confirmation',
//     `Thanks for your purchase! Order #${order.id} placed successfully.`
//   );

// }

return res.status(201).json({ message: 'Order created successfully', data: order });
}

export const listOrders = async (req: AuthenticatedRequest, res: Response) => {
  const orders = await prismaClient.order.findMany({
    where:{
      userId: req.user.id,
    }
  })

  res.status(200).json({
    status: true,
    message: "Orders fetched successfully",
    data: orders,
});

    
}

export const cancleOrder = async (req: AuthenticatedRequest, res: Response) => {
  const orders = await prismaClient.order.update({
    where:{
      id: Number(req.params.id),
    },
    data:{
      status: OverEventStatus.CANCELLED
    }
  })

  await prismaClient.orderEvent.update({
    where:{
      id: Number(req.params.id),
    },
    data: {
      orderId: orders.id,
      status: OverEventStatus.CANCELLED
    },
  })

  // Check if order exists
  if (!orders) throw new CustomError.NotFoundError("Order not found");
  
  res.status(200).json({
    status: true,
    message: "Orders fetched successfully",
    data: orders,
});
}

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  const orders = await prismaClient.order.findFirst({
    where:{
      userId: req.user.id,
    },
    include:{
      orderProduct :true,
      events: true
    }
  })

  // Check if order exists
  if (!orders) throw new CustomError.NotFoundError("Order not found");
  
  res.status(200).json({
    status: true,
    message: "Orders fetched successfully",
    data: orders,
});
    
}

