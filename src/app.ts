import express, { Express, Request, Response } from 'express';
import 'dotenv/config';
import processImageMiddleware from './middleware/processImageMiddleware';
import cors from 'cors'
import { UserModel } from './types';
import firebaseService from './firebase';

const app: Express = express();
app.use(cors())
app.use(express.json())

const port = process.env.PORT ?? 5000;

app.post('/upload/image', processImageMiddleware, (req: Request, res: Response) =>{
  res.send({
    status: "success"
  })
})

app.post('/update/info', async (req: Request, res: Response) => {
  try {
    const userPayload = req.body as UserModel;
    const user = await firebaseService.userService.getUser(userPayload.emailAddress)
    let success = false;

    if(user) {
      user.companyInfo = {
        name: userPayload.companyInfo?.name ?? "",
        numberOfUsers: userPayload.companyInfo?.numberOfUsers ?? 0,
        numberOfProducts: userPayload.companyInfo?.numberOfProducts ?? 0,
        percentage: userPayload.companyInfo?.percentage ?? 0,
        logoUrl: user.companyInfo?.logoUrl
      }

      success = await firebaseService.userService.addOrUpdateUser(user)

    } else {
      success = await firebaseService.userService.addOrUpdateUser(userPayload)
    }

    if(success) {
      return res.send({
        success,
        message: "User Info updated"
      })
    } else {
      res.status(400).send({
        message: "Unable to update user info"
      })
    }

  } catch(e) {
    console.log(e)
    res.status(400).send({
      message: "unable to update user info"
    })
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running on port ${port}`);
});