import type { RequestHandler } from "./$types";

const BASE_URL = "https://2026.kozvelemeny.org";

const URLS = ["/", "/mandatumbecsles", "/reszletes", "/kutatasok"];

export const GET: RequestHandler = async () => {
	const now = new Date().toISOString();
	const urlEntries = URLS.map(
		(path) => `<url><loc>${BASE_URL}${path}</loc><lastmod>${now}</lastmod></url>`
	).join("");

	const body =
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
		urlEntries +
		"</urlset>";

	return new Response(body, {
		headers: {
			"content-type": "application/xml; charset=utf-8"
		}
	});
};
