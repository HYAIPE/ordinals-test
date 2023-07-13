import {
  IPaginationCursor,
  IPaginatedResult,
  IPaginationOptions,
} from "../types.js";
import { deserializeSessionCookie } from "./cookie.js";

export function getAuthorizationToken(
  headers: Record<string, string | undefined>
): string | undefined {
  // First check cookie
  const session = deserializeSessionCookie(headers.cookie);
  if (session) {
    return session;
  }
  const authorization = headers.authorization;
  if (!authorization) {
    return undefined;
  }
  const [, token] = authorization.split(" ");
  return token;
}

export function encodeCursor({
  lastEvaluatedKey,
  count,
  page,
}: {
  lastEvaluatedKey: any;
  count: number;
  page: number;
}): string | null {
  if (!lastEvaluatedKey) {
    return null;
  }
  return JSON.stringify({ lastEvaluatedKey, count, page });
}

export function decodeCursor(cursor?: string): IPaginationCursor | null {
  if (!cursor) {
    return null;
  }
  const { lastEvaluatedKey, count, page } = JSON.parse(cursor);
  return { lastEvaluatedKey, count, page };
}

export async function* paginate<Response>(
  fetcher: (options: IPaginationOptions) => Promise<IPaginatedResult<Response>>,
  options?: IPaginationOptions
): AsyncGenerator<Awaited<Response>, void, unknown> {
  let cursor = options?.cursor ?? null;
  let size = options?.limit;
  do {
    const result = await fetcher({
      cursor: cursor ?? undefined,
      limit: size,
    });
    cursor = result.cursor;
    for (const item of result.items) {
      yield item;
    }
  } while (cursor);
}

export function defaultChainId() {
  return process.env.NEXT_PUBLIC_CHAIN_ID || "1";
}

export function defaultProviderUrl(): string {
  if (!process.env.WEB3_RPC_URL) {
    throw new Error("WEB3_RPC_URL is not set");
  }
  return process.env.WEB3_RPC_URL;
}

export function paginationOptions({
  cursor: cursorReq,
  limit: limitReq,
}: {
  cursor?: string | string[];
  limit?: string | string[];
}): IPaginationOptions {
  const cursor = Array.isArray(cursorReq) ? cursorReq[0] : cursorReq;

  const limitStr = Array.isArray(limitReq) ? limitReq[0] : limitReq;
  const limit = limitStr ? parseInt(limitStr) : undefined;
  return {
    cursor,
    limit,
  };
}

export function toPaginationResponse<T = unknown>(
  paginatedResponse: IPaginatedResult<T>
) {
  return {
    items: paginatedResponse.items,
    count: paginatedResponse.count,
    page: paginatedResponse.page,
    ...(paginatedResponse.cursor && { cursor: paginatedResponse.cursor }),
  };
}
