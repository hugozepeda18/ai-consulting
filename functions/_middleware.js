// Stamps the visitor's real country (from Cloudflare) on <html data-country="..">; main.js picks the language from it.
export const onRequest = async ({ request, next }) => {
  const res = await next();
  const country = request.cf?.country;
  if (!/^[A-Z]{2}$/.test(country || "") || !res.headers.get("content-type")?.includes("text/html")) return res;
  return new HTMLRewriter().on("html", { element: e => e.setAttribute("data-country", country) }).transform(res);
};
