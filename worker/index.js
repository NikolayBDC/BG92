const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' https://formspree.io",
    "font-src 'self' https://fonts.gstatic.com",
    "form-action 'self' https://formspree.io",
    "frame-ancestors 'none'",
    "frame-src https://yandex.ru",
    "img-src 'self' data: https://yandex.ru https://*.yandex.ru",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "upgrade-insecure-requests"
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

function secureResponse(response, pathname) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);

  if (pathname.startsWith("/assets/")) {
    headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  } else if ((headers.get("Content-Type") || "").includes("text/html")) {
    headers.set("Cache-Control", "no-cache");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www.bavarian-garage.ru") {
      url.hostname = "bavarian-garage.ru";
      return Response.redirect(url.toString(), 308);
    }

    let response = await env.ASSETS.fetch(request);

    if (request.method === "GET" && response.status === 404 && url.pathname !== "/404.html") {
      const fallbackRequest = new Request(new URL("/404.html", request.url), {
        method: "GET",
        headers: request.headers
      });
      const fallback = await env.ASSETS.fetch(fallbackRequest);
      response = new Response(fallback.body, {
        status: 404,
        statusText: "Not Found",
        headers: fallback.headers
      });
    }

    return secureResponse(response, url.pathname);
  }
};
