import fetch from "cross-fetch";

export async function getData(url: RequestInfo) {
  const response = await fetch(url);
  if (!response.ok) {
    // check if HTTP-status is 200-299
    // NOT ok, throw error
    throw new Error(response.status.toString());
  }
  const data = await response.text();
  return data;
}
export async function postData(
  url: RequestInfo,
  json: string,
  content_type = "",
  apikey = "",
) {
  const headers: HeadersInit = {};

  if (content_type) {
    headers["Content-Type"] = content_type;
  }
  if (apikey) {
    headers["X-Api-Key"] = apikey;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: json,
  });

  if (!response.ok) {
    // check if HTTP-status is 200-299
    // NOT ok, throw error
    throw new Error(response.status.toString());
  }

  const data = await response.text(); // or use response.json() if your data is JSON
  return data;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackOff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  backOff: number,
) {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (retries >= maxRetries) {
        throw e;
      }
      retries++;
      await sleep(backOff * retries);
    }
  }
}
