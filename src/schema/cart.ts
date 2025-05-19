

import {number, z} from 'zod'

export const CreateCartSchema = z.object({
    quantity:z. string(),
    productId:z. string(),
   
})

export const ChangeQuantitySchema = z.object({
   
    quantity: z.string().min(1),
});

