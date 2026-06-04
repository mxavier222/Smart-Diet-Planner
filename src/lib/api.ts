const USDA_API_BASE_URL = "https://api.nal.usda.gov/fdc/v1";
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || "DEMO_KEY";

type UsdaNutrient = {
	nutrientName?: string;
	nutrientNumber?: string;
	nutrient?: {
		name?: string;
		number?: string;
		unitName?: string;
	};
	amount?: number;
	value?: number;
	unitName?: string;
};

export type FoodSearchResult = {
	fdcId: number;
	description: string;
	brandOwner?: string;
	dataType?: string;
	foodCategory?: string;
	foodNutrients?: UsdaNutrient[];
};

type FoodSearchResponse = {
	foods?: FoodSearchResult[];
	totalHits?: number;
};

export type FoodDetails = {
	fdcId: number;
	description: string;
	dataType?: string;
	brandOwner?: string;
	foodCategory?: string;
	foodNutrients?: UsdaNutrient[];
};

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
	const trimmedQuery = query.trim();

	if (!trimmedQuery) return [];

	const url = new URL(`${USDA_API_BASE_URL}/foods/search`);
	url.searchParams.set("api_key", USDA_API_KEY);

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: trimmedQuery,
			pageSize: 15,
			dataType: ["SR Legacy", "Foundation"],
			sortBy: "dataType.keyword",
      		sortOrder: "asc",
		}),
	});

	if (!response.ok) {
		throw new Error(`USDA food search failed: ${response.status}`);
	}

	const data: FoodSearchResponse = await response.json();
	return data.foods ?? [];
}

export async function getFoodById(fdcId: number): Promise<FoodDetails> {
	const url = new URL(`${USDA_API_BASE_URL}/food/${fdcId}`);
	url.searchParams.set("api_key", USDA_API_KEY);

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`USDA food details failed: ${response.status}`);
	}

	return response.json();
}

type NutritionKey = "Energy" | "Protein" | "Carbs" | "Fat" | "Fiber" | "Sodium" | "Potassium";

type NutritionItem = {
	label: NutritionKey;
	value: number | null;
	unit: string;
};

const NUTRIENT_LABELS: Record<string, NutritionKey> = {
	Energy: "Energy",
	Protein: "Protein",
	"Carbohydrate, by difference": "Carbs",
	"Total lipid (fat)": "Fat",
	"Fiber, total dietary": "Fiber",
	"Sodium, Na": "Sodium",
	Potassium: "Potassium",
};

export function getNutritionPer100g(
	food?: FoodDetails | FoodSearchResult,
): NutritionItem[] {
	const nutrients = food?.foodNutrients ?? [];

	return Object.entries(NUTRIENT_LABELS)
		.map(([nutrientName, label]) => {
			const nutrient = nutrients.find(
				(item) => (item.nutrientName ?? item.nutrient?.name) === nutrientName,
			);

			return {
				label,
				value: nutrient?.value ?? nutrient?.amount ?? null,
				unit: nutrient?.unitName ?? nutrient?.nutrient?.unitName ?? "",
			};
		})
		.filter((nutrient) => nutrient.value !== null);
}
