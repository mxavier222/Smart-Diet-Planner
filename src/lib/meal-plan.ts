import type { FoodSearchResult } from "@/lib/api";

export const DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;

export const MEALS = ["breakfast", "lunch", "dinner"] as const;

export type DayKey = (typeof DAYS)[number];
export type MealKey = (typeof MEALS)[number];

export type PlannedFood = FoodSearchResult & { grams?: number };

export type MealList = Record<MealKey, PlannedFood[]>;
export type MealPlanState = Record<DayKey, MealList>;

export function createEmptyMealPlan(): MealPlanState {
	return DAYS.reduce((plan, day) => {
		plan[day] = {
			breakfast: [],
			lunch: [],
			dinner: [],
		};

		return plan;
	}, {} as MealPlanState);
}

function isMealList(value: unknown): value is MealList {
	if (!value || typeof value !== "object") return false;

	const meals = value as Partial<Record<MealKey, unknown>>;
	return MEALS.every((meal) => Array.isArray(meals[meal]));
}

function isMealPlanState(value: unknown): value is MealPlanState {
	if (!value || typeof value !== "object") return false;

	const plan = value as Partial<Record<DayKey, unknown>>;
	return DAYS.every((day) => isMealList(plan[day]));
}

export function parseStoredMealPlan(stored: string | null): MealPlanState {
	const emptyPlan = createEmptyMealPlan();

	if (!stored) return emptyPlan;

	try {
		const parsed: unknown = JSON.parse(stored);

		if (isMealPlanState(parsed)) {
			return parsed;
		}

		if (isMealList(parsed)) {
			return {
				...emptyPlan,
				Monday: parsed,
			};
		}
	} catch {
		return emptyPlan;
	}

	return emptyPlan;
}
