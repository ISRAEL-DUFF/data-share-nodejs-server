import * as admin from "firebase-admin"
import path from 'path';
import { UserModel } from "./types";

let serviceAccount = require("../serviceAccountKey.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET_URL,
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

var bucket = admin.storage().bucket();
let db = admin.database()
let userRef= db.ref("users");

const userService = {

    addOrUpdateUser(params: UserModel): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const userId = params.emailAddress.split("@")[0] ?? ""
            var oneUser = userRef.child(userId);
            oneUser.update(params,(err) => {
            if(err){
                return reject(new Error("Could not add user"));
            } else{
                resolve(true)
            }
            }) 
        })
    },

    getUser(emailAddress: string): Promise<UserModel | undefined> {
        return new Promise((resolve, reject) => {
            userRef.once('value', function(snap) {
                const users = snap.val()
    
                if(users) {
                    try {
                        const userId = emailAddress.split("@")[0] ?? ""
                        let user = users[userId] as UserModel
                        resolve(user)
                    } catch(e) {
                        reject(e)
                    }

                }
                resolve(undefined)
            })
        })
    }

}

function uploadImageToFirebase(params: {
    imagePath: string;
    userEmail: string;
    fileOriginalName: string;
}): Promise<string> {
    return new Promise((resolve, reject) => {
        try {

            console.log(params)

            userService.getUser(params.userEmail).then((user) => {
                if(!user) {
                    console.log("NO USER")
                    return reject(new Error("User Not Found!!!"))
                }

                const userEmail = params.userEmail
                const userName = userEmail ? userEmail.split("@")[0] : ''
                const createdAt = new Date().getTime()
    
                const extName = path.extname(params.fileOriginalName);
                
                bucket.upload(params.imagePath, {
                    destination: `${userName}_${createdAt}${extName}`
                }).then(async (resp) => {
                    const file = resp[0]
                    const publicUrl = await file.getSignedUrl({
                        action: 'read',
                        version: 'v2',
                        expires: Date.now() + 1000 * 60 * 60 * 60 * 24 * 7 * 4 * 3 // 3 months from now
                    });

                    user.companyInfo = {
                        name: user.companyInfo?.name ?? "",
                        numberOfUsers: user.companyInfo?.numberOfUsers ?? 0,
                        numberOfProducts: user.companyInfo?.numberOfProducts ?? 0,
                        percentage: user.companyInfo?.percentage ?? 0,
                        logoUrl: publicUrl[0]
                    }
                    await userService.addOrUpdateUser(user)
                    resolve(file.publicUrl());
                })
            }).catch((e) => {
                reject(e)
            })
    
        } catch(e) {
            reject(e)
        }
    })
}

const firebaseService = {
    uploadImageToFirebase,
    userService
}

export default firebaseService;
