
import {number, z} from 'zod'

export const SignUpSchema = z.object({
    name:z.string(),
    email:z.string().email(),
    password:z.string().min(6)
})

export const AddresSchema = z.object({
    lineOne:z.string(),
    lineTwo:z.string().nullable(),
    pincode:z.string().min(6),
    country:z.string(),
    city:z.string(),
})

export const UserSchema = z.object({
    name:z.string(),
    defaultBillingAdress:z.number().nullable(),
    defaultShippingAddress:z.number().nullable(),
})