interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export async function handler(_event: NetlifyEvent): Promise<NetlifyResponse> {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      adminService: 'operational',
      routingMode: 'SPA Fallback',
      environment: process.env.NODE_ENV || 'production',
      features: {
        adminGuard: true,
        cloposSync: true,
      },
      timestamp: new Date().toISOString(),
    }),
  };
}
