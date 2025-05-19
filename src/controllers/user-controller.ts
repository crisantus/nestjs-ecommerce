import { Request, Response } from "express";
import { prismaClient } from "..";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { StatusCodes } from "http-status-codes";
import { createTokenUser } from "../utils/signTokenUser";
import { createAccessToken } from "../utils/jwt";
import * as CustomError from "../errors";
import { hashSync, compareSync } from "bcrypt";
import { AddresSchema,UserSchema } from "../schema/users";
import { Address } from "../generated/prisma";

// =======================
// Get a single user
// =======================
export const getSingleUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await prismaClient.user.findFirst({
    where: { id: Number(req.user?.id) },
    include: { addresses: true },
  });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  res.status(StatusCodes.OK).json({ user });
};

// =======================
// Show current user
// =======================
export const showCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// =======================
// Update user profile
// =======================
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = UserSchema.parse(req.body)
  let shippingAddress : Address;
  let billingAddress : Address;

  if(validatedData.defaultShippingAddress){
    shippingAddress = await prismaClient.address.findFirstOrThrow({
      where: {
        id: validatedData.defaultShippingAddress,
        userId: Number(req.user.id),
      },
    })
  }

  if(validatedData.defaultBillingAdress){
    shippingAddress = await prismaClient.address.findFirstOrThrow({
      where: {
        id: validatedData.defaultBillingAdress,
        userId: Number(req.user.id),
      },
    })
    
    const updatedUser = await prismaClient.user.update({
    where: { id: req.user.id },
    data: validatedData,
  });


  // const { email, name } = req.body;
  // if (!email || !name) {
  //   throw new CustomError.BadRequestError('Please provide all values');
  // }
  // if (!req.user) {
  //   throw new CustomError.UnauthenticatedError('User not authenticated');
  // }
  // const updatedUser = await prismaClient.user.update({
  //   where: { id: req.user.id },
  //   data: { email, name },
  // });
  // const tokenUser = createTokenUser(updatedUser.email, updatedUser.id, updatedUser.role);
  // const accessToken = createAccessToken(tokenUser);
  // res.status(StatusCodes.OK).json({ user: tokenUser, accessToken });
}};

// =======================
// Update user password
// =======================
export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  if (!req.user) {
    throw new CustomError.UnauthenticatedError('User not authenticated');
  }

  const existingUser = await prismaClient.user.findUnique({
    where: { id: req.user.id },
  });

  if (!existingUser) {
    throw new CustomError.UnauthenticatedError('User not found');
  }

  const isPasswordCorrect = compareSync(oldPassword, existingUser.password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const hashedNewPassword = hashSync(newPassword, 10);

  await prismaClient.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword },
  });

  res.status(StatusCodes.OK).json({ message: 'Success! Password updated.' });
};

// =======================
// Add new address
// =======================
export const addAddressController = async (req: AuthenticatedRequest, res: Response) => {
  AddresSchema.parse(req.body);

  const user = await prismaClient.user.findUnique({
    where: { id: Number(req.user.id) },
  });

  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }

  const address = await prismaClient.address.create({
    data: {
      ...req.body,
      userId: user.id,
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "New address has been created successfully",
    data: address,
  });
};

// =======================
// Delete an address
// =======================
export const deleteAddressController = async (req: AuthenticatedRequest, res: Response) => {
  const addressId = Number(req.params.id);

  if (isNaN(addressId)) {
    throw new CustomError.BadRequestError("Invalid address ID");
  }

  // Check if the address belongs to the current user
  const address = await prismaClient.address.findFirst({
    where: {
      id: addressId,
      userId: req.user.id,
    },
  });

  if (!address) {
    throw new CustomError.NotFoundError("Address not found or not authorized");
  }

  await prismaClient.address.delete({
    where: { id: addressId },
  });

  res.status(StatusCodes.OK).json({ status: true, message: "Address deleted successfully" });
};

// =======================
// List all addresses
// =======================
export const listAddressController = async (req: AuthenticatedRequest, res: Response) => {
  const addresses = await prismaClient.address.findMany({
    where: {
      userId: req.user.id,
    },
  });

  res.status(StatusCodes.OK).json({
    status: true,
    count: addresses.length,
    data: addresses,
  });
};
