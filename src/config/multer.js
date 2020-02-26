import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import crypto from 'crypto';
import { extname, resolve } from 'path';

const storageLocal = multer.diskStorage({
  destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, res) => {
      if (err) {
        return cb(err);
      }

      return cb(null, res.toString('hex') + extname(file.originalname));
    });
  },
});

const storageS3 = () => {
  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  });

  return multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) {
          return cb(err);
        }

        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  });
};

export default {
  storage: process.env.NODE_ENV === 'development' ? storageLocal : storageS3(),
};
