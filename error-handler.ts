import { NextFunction, Request, Response } from "express"

export const errorHandler  = (method:Function) => {
  return (req:Request,res:Response, next: NextFunction) => {
    try{
      method(req, res, next)
    } catch(err){
      
    }
  }
}