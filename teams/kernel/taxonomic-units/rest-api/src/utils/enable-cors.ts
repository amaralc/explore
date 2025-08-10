import cors from 'cors';
import { Request } from 'express';

export const validateCors = (req: Request, callback: (err: Error | null, options?: cors.CorsOptions) => void) => {
  const origin = req.header('Origin');
  const allowedOriginRegex = /^(https?:\/\/(?:localhost:\d+|.*\.hipeerlab\.com))$/;

  let corsOptions: cors.CorsOptions;
  if (origin && allowedOriginRegex.test(origin)) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};
