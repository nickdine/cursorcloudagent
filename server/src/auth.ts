import type { FastifyRequest, FastifyReply } from "fastify";
import { ACCESS_TOKEN } from "./config.js";

export function authHook(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void,
): void {
  if (!ACCESS_TOKEN) {
    done();
    return;
  }

  const header = request.headers.authorization;
  const query = request.query as { token?: string };
  const token =
    header?.startsWith("Bearer ")
      ? header.slice(7)
      : (request.headers["x-access-token"] as string | undefined) ?? query.token;

  if (token !== ACCESS_TOKEN) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }
  done();
}
