const EMBED_CHART_IDS = [
	'g-fidesz-tisza',
	'g-mandate-projection-chart',
	'g-kis-partok',
	'g-all-parties',
	'b-main',
	'b-kormanyfuggetlen',
	'b-kormanykozeli',
	't-main',
	't-kormanyfuggetlen',
	't-kormanykozeli'
] as const;

export function entries() {
	return EMBED_CHART_IDS.map((chartId) => ({ chartId }));
}
