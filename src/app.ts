import 'dotenv/config';
import 'reflect-metadata';
import 'express-async-errors';

import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { routes } from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.use(errorHandler);

export { app };
