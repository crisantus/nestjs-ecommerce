import { Request, Response , NextFunction} from "express"
import { prismaClient } from "..";
import {hashSync, compareSync} from 'bcrypt'
import { SignUpSchema } from "../schema/users";
import * as CustomError from '../errors';
import { createAccessToken } from "../utils/jwt";
import { createTokenUser } from "../utils/signTokenUser";

export const signUpController = async (req:Request, res:Response, next: NextFunction) => {
    SignUpSchema.parse(req.body)

        const {email, password, name } = req.body
        // check if user exists
       let user = await prismaClient.user.findFirst({where:{email}})
       if(user){
        throw new CustomError.BadRequestError('User already exist');
       }
       // create a new user 
       user = await prismaClient.user.create({
           data:{
               email,
               password : hashSync(password , 10),
               name
           }
       })
       res.json({status:true,messasge:"New User has been created succefully",data:user})
   
}

export const logInController = async (req:Request, res:Response) => {
    const {email, password} = req.body
    // check if user exists
    let user = await prismaClient.user.findFirst({where:{email}})
    if(!user){
        throw new CustomError.NotFoundError("User does not found");
    }
    // check if password is correct
    if( !compareSync(password,user!.password)){
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    // user data to sign the jwt
    const tokenUser = createTokenUser(user.email,user.id,user.role)
    // create jwt token
    const accessToken = createAccessToken(tokenUser);
    
    res.json({status:true,messasge:"User Logged in succefully",data:user, token:accessToken})
}




