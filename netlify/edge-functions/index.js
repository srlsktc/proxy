export default async (request, context) => {
  const response = await context.next();
  return new Response(response.body, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers":
        "x-request-source, content-type, access-control-allow-origin, x-api-key, x-api-signature",
    },
  });
};
export const config = {
  path: "/*",
};
