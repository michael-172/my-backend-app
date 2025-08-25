import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";
import qs from "qs";

const ensureDir = (dir: string) => {
  fs.mkdirSync(dir, { recursive: true });
};

const toRelative = (absolutePath: string) =>
  path.relative(process.cwd(), absolutePath).split(path.sep).join("/");

const diskStorage = (subdir = "misc") => {
  const uploadDir = path.resolve(process.cwd(), "uploads", subdir);
  ensureDir(uploadDir);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path
        .basename(file.originalname, ext)
        .replace(/\s+/g, "_")
        .toLowerCase();
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${base}-${unique}${ext}`);
    },
  });
};

const imageOnlyFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/"))
    return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

export type CreateMulterOptions = {
  subdir?: string; // under uploads/
  accept?: "images" | "any";
  limits?: multer.Options["limits"];
};

export const createMulter = (opts: CreateMulterOptions = {}) => {
  const { subdir = "misc", accept = "images", limits } = opts;
  const storage = diskStorage(subdir);
  const fileFilter = accept === "images" ? imageOnlyFilter : undefined;
  return multer({ storage, fileFilter, limits });
};

// Parse bracketed keys from multipart form fields into nested objects/arrays
// E.g., variants[0][sku] -> { variants: [{ sku: ... }] }
export const parseMultipartFormFields =
  () => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.body || typeof req.body !== "object") return next();
    try {
      // stringify then parse to let qs interpret bracket notation from keys
      const parsed = qs.parse(qs.stringify(req.body), {
        allowDots: true,
        depth: 20,
        arrayLimit: 1000,
      });
      req.body = parsed as any;
      next();
    } catch {
      next();
    }
  };

// Helper to map uploaded file paths into req.body[key]
export const mapFilesToBody =
  (key: string) => (req: Request, _res: Response, next: NextFunction) => {
    const files = req.files as
      | Express.Multer.File[]
      | Record<string, Express.Multer.File[]>
      | undefined;

    if (Array.isArray(files)) {
      (req.body as any)[key] = files.map((f) => toRelative(f.path));
    } else if (files && typeof files === "object") {
      const arr = Object.values(files).flat();
      (req.body as any)[key] = arr.map((f) => toRelative(f.path));
    } else if (req.file) {
      (req.body as any)[key] = [
        toRelative((req.file as Express.Multer.File).path),
      ];
    }
    next();
  };

// Map product images (field 'images') and variant images from fields like variants[0][image]
export const mapProductAndVariantImages =
  (
    options: {
      productKey?: string;
      variantsKey?: string;
      imageSubKey?: string;
    } = {}
  ) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const productKey = options.productKey ?? "images";
    const variantsKey = options.variantsKey ?? "variants";
    const imageSubKey = options.imageSubKey ?? "image";

    // Normalize files into an array regardless of multer mode
    const rawFiles = req.files as
      | Express.Multer.File[]
      | Record<string, Express.Multer.File[]>
      | undefined;

    const files: Express.Multer.File[] = Array.isArray(rawFiles)
      ? rawFiles
      : rawFiles && typeof rawFiles === "object"
        ? Object.values(rawFiles).flat()
        : [];

    if (files.length === 0) return next();

    // Ensure body variants structure is an array if present
    let variants: any[] | undefined;
    const body: any = req.body ?? {};
    if (Array.isArray(body[variantsKey])) {
      variants = body[variantsKey];
    } else if (typeof body[variantsKey] === "string") {
      try {
        variants = JSON.parse(body[variantsKey]);
      } catch {
        variants = undefined;
      }
    }
    if (!Array.isArray(variants)) variants = [];

    for (const f of files) {
      // Product-level images: fieldname === 'images'
      if (f.fieldname === productKey) {
        body[productKey] = body[productKey] || [];
        if (!Array.isArray(body[productKey]))
          body[productKey] = [body[productKey]];
        body[productKey].push(toRelative(f.path));
        continue;
      }

      // Variant image fields like variants[0][image]
      const match = new RegExp(
        `^${variantsKey}\\[(\\d+)\\]\\[${imageSubKey}\\]$`
      ).exec(f.fieldname);
      if (match) {
        const idx = Number(match[1]);
        if (!variants[idx]) variants[idx] = {};
        variants[idx][imageSubKey] = toRelative(f.path);
      }
    }

    // Write back variants array if we set anything
    if (variants.length > 0) {
      body[variantsKey] = variants;
    }

    req.body = body;
    next();
  };
