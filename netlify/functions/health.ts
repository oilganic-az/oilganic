interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined> | null;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      status: 'ok',
      service: 'Oilganic Netlify Edge Health',
      timestamp: new Date().toISOString(),
      path: event.path,
    }),
  };
}
