import express, {Express, Request, Response} from 'express'
import { PORT } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from './generated/prisma/client';
import { SignUpSchema } from './schema/users';
import { errorHandlerMiddleware } from './middlewares/errors-handler';
import { notFound } from './middlewares/not-found';

const app:Express = express();

// body parser
app.use(express.json())

app.use('/api', rootRouter);


export const prismaClient = new PrismaClient({
    log:['query']
}).$extends({
    query:{
        user: {
            create({args,query}){
                args.data = SignUpSchema.parse(args.data)
                return query(args)
            }
        }
    }
}).$extends({
    result: {
      address: {
        formattedAddress: {
          needs: {
            lineOne:true,
            lineTwo:true,
            city:true,
            country:true,
            pincode:true,
           },
          compute: (addr) => { return `${addr.lineOne}, ${addr.lineTwo}, ${addr.city}, ${addr.country} - ${addr.pincode}` }
        }
      }
    }
  })

app.use(notFound);
app.use(errorHandlerMiddleware)

app.listen(PORT, ()=> {
    console.log("App working! ")
})