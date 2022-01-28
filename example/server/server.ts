import cuid from 'cuid';
import * as fastify from 'fastify';
import WebSocket from 'ws';

import { env } from './utils';
import { verifyToken } from './utils/auth';

const clients = new Map<string, WebSocket[]>();

interface testSocket extends WebSocket {
  id: string;
}

console.log(env);
console.log('Starting realtime services');

function startWs() {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', async function(ws: testSocket, request) {
    ws.id = cuid();
    //console.log('Opening connection:' + ws.id);

    let user: string;
    ws.on('message', async function(message) {
      //console.log('Connection', ws.id, 'got message');
      //console.log(message);
      if (message.toString().startsWith('Bearer')) {
        const token = await verifyToken(message.toString());
        if (token) {
          clients.set(token.sub, [...(clients.get(token.sub) ?? []), ws]);
          user = token.sub;
        }
        //console.log(clients);
      }
    });

    ws.on('close', function(code) {
      //console.log('connection closed');
      //console.log(user);
      clients.set(
        user,
        clients.get(user)?.filter(socket => socket !== ws) ?? []
      );
    });
  });

  console.info(` 📡  Websocket server is listening on 8080`);
}

startWs();

async function startRestServer(port: number) {
  const server = fastify.fastify();
  server.post(
    '/realtime',
    {
      schema: {
        body: {
          properties: {
            event: { type: 'string' },
            userSub: { type: 'string' },
          },
          required: ['userSub', 'event'],
          type: 'object',
        },
      },
    },
    async (request, reply) => {
      const { userSub, event } = request.body as never;

      //console.log(`Realtime event ${event} for ${userSub}`);

      clients.get(userSub)?.forEach(ws => ws.send(event));

      //console.log(clients.keys());
      reply.code(200).send();
    }
  );

  const url = await server.listen(port, '0.0.0.0');

  console.info(`️🔥  Fastify server ready at ${url}`);
}

startRestServer(80);
