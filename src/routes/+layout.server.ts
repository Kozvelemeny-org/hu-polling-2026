import type { LayoutServerLoad } from "./$types";
import { getSiteData, type SiteDataProfile } from "$lib/server/siteData";

const FULL_PROFILE: SiteDataProfile = {
	surePolls: true,
	allPolls: true,
	simulation: true,
	mandateProjection: true,
	historicalSimulation: true
};

function getProfileForPath(pathname: string): SiteDataProfile | null {
	if (pathname === "/" || pathname === "/mandatumbecsles") {
		return FULL_PROFILE;
	}
	if (pathname === "/kutatasok") {
		return { surePolls: true };
	}
	if (pathname === "/reszletes") {
		return { simulation: true };
	}

	if (pathname.startsWith("/abra/") && !pathname.endsWith("/embed")) {
		const segments = pathname.split("/").filter(Boolean);
		const chartId = segments[1];
		if (!chartId) return null;

		if (chartId.startsWith("t-") || chartId.startsWith("b-")) {
			return { simulation: true };
		}
		if (chartId === "g-mandate-projection-chart") {
			return {
				surePolls: true,
				allPolls: true,
				mandateProjection: true,
				historicalSimulation: true
			};
		}
		if (chartId.startsWith("g-")) {
			return { surePolls: true, allPolls: true };
		}
	}

	return null;
}

export const load: LayoutServerLoad = async ({ fetch, url }) => {
	const profile = getProfileForPath(url.pathname);
	if (!profile) {
		return { siteData: null };
	}

	return {
		siteData: await getSiteData(fetch, profile)
	};
};
