// import { Request, Response } from "express";
// import { checkPostRequestBody } from "../../middleware/checks";
// import { BlogController } from "./blogController";
// import FirebaseImageProvider, { IFileStatus } from "./providers/firebaseImageProvider";
// import UploadImageProvider from "./providers/imageProvider";
// import processImageMiddleware from "./providers/processImageMiddleware";

// export default [
//     {
//         path: "/api/v1/uploadImages",
//         method: "post",
//         handler: [
//             checkPostRequestBody,
//             async (req: Request, res: Response, next: any) => {
//                 processImageMiddleware(req, res, async (err) => {
//                     if (!req.file) {
//                         res.status(400).send('Please attach the file');
//                         return;
//                     }

//                     const file = req.file;
//                     const firebaseImageProvider = new FirebaseImageProvider(req, res);
//                     firebaseImageProvider.uploadImageToFirebase(file).then(async (file: IFileStatus) => {
//                         if (file.isUploaded) {
//                             const blogController = new BlogController(req);
//                             const result = await blogController.uploadImage(undefined, file.filePath);
//                             return res.status(200).send(result);
//                         }
//                     }).catch(error => {
//                         return res.status(400).json({
//                             "status": "failed",
//                             "code" : "400",
//                             "message" : error.message
//                         });
//                     })
//                 });
//             }
//         ]
//     }
// ];