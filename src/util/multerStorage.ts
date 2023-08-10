import firebaseService from '../firebase';
var fs = require('fs')

class CustomFirebaseStorageEngine {
    _handleFile (req: any, file: any, cb: Function) {
        const tempFilePath = `./${file.originalname}`

        var outStream = fs.createWriteStream(tempFilePath)

        file.stream.pipe(outStream)
        outStream.on('error', cb)
        outStream.on('finish', function () {
            firebaseService.uploadImageToFirebase({
                fileOriginalName: file.originalname,
                userEmail: req.body.email,
                imagePath: tempFilePath
            }).then((url: string) => {
                console.log("Image Uploaded successully:", url)
                fs.unlink(tempFilePath, (er: any) => {
                    if(er) {
                        throw er;
                    }
                })

                cb(null, {
                    path: url,
                    size: outStream.bytesWritten
                })
              }).catch((e) => {
                console.log("Image upload Error:", e)
                fs.unlink(tempFilePath, (er: any) => {
                    if(er) {
                        throw er;
                    }
                })
                cb(e, null)
              })
        });

        
      }

      _removeFile (req: any, file: any, cb: Function) {
        cb(null)
      }
}


function customeStorageEngine() {
  return new CustomFirebaseStorageEngine()
}

export default customeStorageEngine;