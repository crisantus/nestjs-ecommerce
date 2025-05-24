import dotenv from "dotenv"
dotenv.config({path:'.env'})

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY 
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY 
export const BASE_URL = process.env.BASE_URL
export const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY!;
export const FLW_BASE_URL = "https://api.flutterwave.com/v3";