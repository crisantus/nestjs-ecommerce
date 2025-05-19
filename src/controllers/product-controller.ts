import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prismaClient } from '..';
import * as CustomError from '../errors';

// CREATE Product
export const createProductController = async (req: Request, res: Response) => {
  const product = await prismaClient.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(","),
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "Product created successfully",
    data: product,
  });
};

export const getAllProductsController = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = (req.query.search as string)?.trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ],
      }
    : undefined;

  const [products, total] = await Promise.all([
    prismaClient.product.findMany({
      skip,
      take: limit,
      where,
    }),
    prismaClient.product.count({ where }),
  ]);

  res.status(200).json({
    status: true,
    data: products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};


  

// GET Single Product by ID
export const getProductByIdController = async (req: Request, res: Response) => {
const { id } = req.params;

const product = await prismaClient.product.findUnique({
    where: { id: Number(id) },
});

if (!product) {
   throw new  CustomError.BadRequestError("Product not found");
}

  res.status(StatusCodes.OK).json({
    status: true,
    data: product,
  });
};

// UPDATE Product
export const updateProductController = async (req: Request, res: Response) => {
  const { id } = req.params;

  let product = await prismaClient.product.findFirst({where:{ id: Number(id) }})
   
  // check if product exists
  if(!product) {
    throw new  CustomError.BadRequestError("Product not found");
  }
  
  // Update product in database
   product = await prismaClient.product.update({
    where: { id: Number(id) },
    data: {
      ...req.body,
      tags: req.body.tags ? req.body.tags.join(",") : undefined,
    },
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Product updated successfully",
    data: product,
  });
};

// DELETE Product
export const deleteProductController = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prismaClient.product.delete({
    where: { id: Number(id) },
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Product deleted successfully",
  });
};

export const searchProductController = async (req: Request, res: Response) => {
  const query = (req.query.q as string)?.trim();

  // Handle search only if a query is provided
  const where = query
    ? {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { tags: { contains: query } }, // Make sure tags is a String field
        ],
      }
    : undefined;


    const products = await prismaClient.product.findMany({ where });

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Product search completed",
      data: products,
    });
 
};


