import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { CreateCartSchema, ChangeQuantitySchema } from "../schema/cart";
import { prismaClient } from "..";
import * as CustomError from "../errors";

// ✅ Add item to cart
export const addItemToCart = async (req: AuthenticatedRequest, res: Response) => {
    // Validate request body using Zod schema
    const validatedData = CreateCartSchema.parse(req.body);

    // Check if the product exists
    const product = await prismaClient.product.findUnique({
        where: {
            id: Number(validatedData.productId),
        },
    });

    if (!product) {
        // If product doesn't exist, throw an error
        throw new CustomError.BadRequestError("Product not found");
    }

    // Check if the item is already in the cart
    const existingCartItem = await prismaClient.cartItem.findFirst({
        where: {
            userId: req.user.id,
            productId: product.id,
        },
    });

    let cartItem;

    if (existingCartItem) {
        // If item exists, update the quantity
        cartItem = await prismaClient.cartItem.update({
            where: { id: existingCartItem.id },
            data: {
                quantity: existingCartItem.quantity + Number(validatedData.quantity),
            },
        });
    } else {
        // If not, create a new cart item
        cartItem = await prismaClient.cartItem.create({
            data: {
                userId: req.user.id,
                productId: product.id,
                quantity: Number(validatedData.quantity),
            },
        });
    }

    // Send success response with the cart item
    res.status(200).json({
        status: true,
        message: "Item added to cart",
        data: cartItem,
    });
};

// ✅ Delete item from cart
export const deleteItemFromCart = async (req: AuthenticatedRequest, res: Response) => {
    const cartItemId = Number(req.params.id); // Get cart item ID from URL param

    // Find the cart item
    const existingItem = await prismaClient.cartItem.findUnique({
        where: { id: cartItemId },
    });

    // Check if it exists and belongs to the user
    if (!existingItem || existingItem.userId !== req.user.id) {
        throw new CustomError.NotFoundError("Cart item not found or unauthorized");
    }

    // Delete the cart item
    await prismaClient.cartItem.delete({
        where: { id: cartItemId },
    });

    // Send response
    res.status(200).json({
        status: true,
        message: "Item deleted from cart",
    });
};

// ✅ Change quantity of an item in the cart
export const changeQuantity = async (req: AuthenticatedRequest, res: Response) => {
    // Validate input with Zod schema
    const {quantity } = ChangeQuantitySchema.parse(req.body);
    const cartItemId = Number(req.params.id);

    // Find the cart item
    const existingItem = await prismaClient.cartItem.findUnique({
        where: { id: Number(cartItemId) },
    });

    // Check ownership
    if (!existingItem || existingItem.userId !== req.user.id) {
        throw new CustomError.NotFoundError("Cart item not found or unauthorized");
    }

    // Update quantity
    const updatedItem = await prismaClient.cartItem.update({
        where: { id: Number(cartItemId) },
        data: {
            quantity: Number(quantity),
        },
    });

    // Return updated item
    res.status(200).json({
        status: true,
        message: "Quantity updated successfully",
        data: updatedItem,
    });
};

// ✅ Get all items in the user's cart
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
    // Fetch all cart items for the user and include product details
    const cartItems = await prismaClient.cartItem.findMany({
        where: {
            userId: req.user.id,
        },
        include: {
            product: true,
        },

    });

    // Return cart data
    res.status(200).json({
        status: true,
        message: "Cart retrieved successfully",
        data: cartItems,
    });
};
