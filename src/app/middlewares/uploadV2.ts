import { Request, Response, NextFunction } from "express";
import multer, { Multer } from "multer";
import path from "node:path";
import fs from "node:fs";

// Define the configuration options for our uploader
type UploaderOptions = {
  type: "single" | "array";
  fieldName: string;
  maxCount?: number;
  destination?: string;
};

/**
 * A factory function to create a dynamic file upload middleware.
 * @param options - Configuration for the upload (type, fieldName, maxCount, destination).
 * @returns An Express middleware handler.
 */
export const uploaderV2 = (options: UploaderOptions) => {
  // Use diskStorage to store files on disk with unique names.
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = options.destination || "uploads";
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);
      cb(null, uniqueName);
    },
  });
  const upload: Multer = multer({ storage });

  return (req: Request, res: Response, next: NextFunction) => {
    const { type, fieldName, maxCount } = options;

    let uploadMiddleware;

    // Determine which multer upload method to use
    if (type === "single") {
      uploadMiddleware = upload.single(fieldName);
    } else if (type === "array" && maxCount) {
      uploadMiddleware = upload.array(fieldName, maxCount);
    } else {
      // If options are invalid, skip to the next middleware with an error.
      return next(
        new Error(
          'Invalid uploader options: "maxCount" is required for "array" type.'
        )
      );
    }

    // Execute the multer middleware
    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        // Handle potential errors from multer (e.g., file size limits)
        return next(err);
      }

      // If a file or files were uploaded, attach the filename(s) to the request body.
      // This makes them easily accessible in the following controller.
      if (req.file) {
        req.body[fieldName] = req.file.filename;
      } else if (req.files) {
        req.body[fieldName] = (req.files as Express.Multer.File[]).map(
          (file) => `${options.destination}/${file.filename}`
        );
      }
      //   console.log(req.body, "BODY");
      next();
    });
  };
};
