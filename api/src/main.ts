import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { createServer, proxy } from 'aws-serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Server } from 'http';
import { ValidationPipe } from '@nestjs/common';

// global['fetch'] = require('node-fetch');

let cachedServer: Server;

const bootstrapServer = async () => {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter, {logger: [
        'log', 'error', 'warn', 'debug', 'verbose'
    ]});
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    return createServer(expressApp);
};
  
export const api = async (event: any, context:any) => {
    if (!cachedServer) {
        cachedServer = await bootstrapServer();
    }
    console.log(event)
    console.log(context)
    return proxy(cachedServer, event, context, 'PROMISE').promise;
};
