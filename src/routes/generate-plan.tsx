import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type FoodSearchResult,
	getFoodById,
	getNutritionPer100g,
	searchFoods,
} from "@/lib/api";
import {
	DAYS,
	type DayKey,
	MEALS,
	type MealKey,
	type MealPlanState,
	parseStoredMealPlan,
} from "@/lib/meal-plan";
import { getPatientById, setPlanGeneratedAndViolation } from "@/lib/patients";
import {
	checkFoodAllergyConflicts,
	mergeConstraintsForConditions,
} from "@/lib/utils";

type GeneratedConstraint = {
	id: string;
	label: string;
	unit: string;
	scope: string;
	min?: number;
	max?: number;
	conditions: string[];
};

export const Route = createFileRoute("/generate-plan")({
	component: GeneratePlanPage,
});

function GeneratePlanPage() {
	const navigate = useNavigate();
	const [foodQuery, setFoodQuery] = useState("");
	const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
	const [selectedDay, setSelectedDay] = useState<DayKey>("Monday");
	const [selectedMeal, setSelectedMeal] = useState<MealKey>("breakfast");

	const searchParams = new URLSearchParams(window.location.search);
	const patientId = searchParams.get("patientId") ?? "";
	const MEAL_PLAN_STORAGE_KEY = `meal_plan_${patientId}`;
	const [selectedFoods, setSelectedFoods] = useState<MealPlanState>(() => {
		const stored = localStorage.getItem(MEAL_PLAN_STORAGE_KEY);
		return parseStoredMealPlan(stored);
	});

	useEffect(() => {
		localStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(selectedFoods));
	}, [selectedFoods, MEAL_PLAN_STORAGE_KEY]);

	const patient = useMemo(() => getPatientById(patientId), [patientId]);
	const constraints = useMemo<GeneratedConstraint[]>(
		() => (patient ? mergeConstraintsForConditions(patient.conditions) : []),
		[patient],
	);

	// Compute nutrient totals for the currently selected day, across meals and per-meal
	const nutrientTotals = useMemo(() => {
		const totals: Record<string, { value: number; unit: string }> = {};
		const perMeal: Record<
			string,
			Record<string, { value: number; unit: string }>
		> = {
			breakfast: {},
			lunch: {},
			dinner: {},
		};

		const dayPlan = selectedFoods[selectedDay] ?? {
			breakfast: [],
			lunch: [],
			dinner: [],
		};

		for (const meal of MEALS) {
			for (const food of dayPlan[meal]) {
				const nutrients = getNutritionPer100g(food);
				for (const n of nutrients) {
					const label = n.label;
					const val =
						typeof n.value === "number"
							? n.value * ((food.grams ?? 100) / 100)
							: 0;

					// per-day totals
					if (!totals[label]) totals[label] = { value: 0, unit: n.unit };
					totals[label].value += val;

					// per-meal totals
					if (!perMeal[meal][label])
						perMeal[meal][label] = { value: 0, unit: n.unit };
					perMeal[meal][label].value += val;
				}
			}
		}

		return { totals, perMeal };
	}, [selectedFoods, selectedDay]);

	function getCurrentForConstraint(constraint: GeneratedConstraint) {
		const id = constraint.id.toLowerCase();
		let labelKey = "";
		if (id.includes("carb")) labelKey = "Carbs";
		else if (id.includes("protein")) labelKey = "Protein";
		else if (id.includes("fiber")) labelKey = "Fiber";
		else if (id.includes("sodium")) labelKey = "Sodium";
		else if (id.includes("potassium")) labelKey = "Potassium";

		const dayVal = nutrientTotals.totals[labelKey];

		const round = (v: number) => Math.round(v * 10) / 10;

		// base current values
		if (constraint.scope === "day") {
			return {
				value: round(dayVal?.value ?? 0),
				unit: dayVal?.unit ?? constraint.unit,
			};
		}

		// for meal-scoped constraints return the largest single meal value (to detect per-meal violations)
		const mealVals = Object.values(nutrientTotals.perMeal).map(
			(m) => m[labelKey]?.value ?? 0,
		);
		const maxMeal = Math.max(...mealVals, 0);
		const mealUnit =
			nutrientTotals.perMeal.breakfast[labelKey]?.unit ?? constraint.unit;
		return { value: round(maxMeal), unit: mealUnit };
	}
	// Automatically trigger search when 3+ letters are typed
	const trimmedQuery = foodQuery.trim();
	const shouldSearch = trimmedQuery.length >= 3;

	const foodSearch = useQuery({
		queryKey: ["food-search", trimmedQuery],
		queryFn: () => searchFoods(trimmedQuery),
		enabled: shouldSearch,
	});

	// Get allergy conflicts for each food (for display purposes)
	const foodConflicts = useMemo(() => {
		if (!foodSearch.data || !patient) return new Map();

		const conflicts = new Map<number, { conflictingAllergies: string[] }>();
		for (const food of foodSearch.data) {
			const { conflictingAllergies } = checkFoodAllergyConflicts(
				food.description,
				patient.allergies,
			);
			if (conflictingAllergies.length > 0) {
				conflicts.set(food.fdcId, { conflictingAllergies });
			}
		}
		return conflicts;
	}, [foodSearch.data, patient]);

	const foodDetails = useQuery({
		queryKey: ["food-details", selectedFoodId],
		queryFn: () => getFoodById(selectedFoodId ?? 0),
		enabled: selectedFoodId !== null,
	});
	const selectedFood = foodDetails.data;
	const selectedNutrients = getNutritionPer100g(selectedFood);

	function handleAddFood(food: FoodSearchResult, grams: number) {
		setSelectedFoods((prev) => {
			const currentMealFoods = prev[selectedDay][selectedMeal];

			const alreadyExists = currentMealFoods.some(
				(f) => f.fdcId === food.fdcId,
			);

			if (alreadyExists) return prev;

			const toAdd = { ...food, grams };

			return {
				...prev,
				[selectedDay]: {
					...prev[selectedDay],
					[selectedMeal]: [...currentMealFoods, toAdd],
				},
			};
		});
	}

	function handleRemoveFood(meal: MealKey, foodId: number) {
		setSelectedFoods((prev) => {
			return {
				...prev,
				[selectedDay]: {
					...prev[selectedDay],
					[meal]: prev[selectedDay][meal].filter(
						(food) => food.fdcId !== foodId,
					),
				},
			};
		});
	}

	return (
		<div className="mx-auto max-w-6xl p-8">
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Generate Plan</h1>
					<p className="mt-1 text-sm text-slate-500">
						Review merged dietary constraints for this patient&apos;s
						conditions.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						onClick={() => navigate({ to: "/" })}
					>
						Back to patients
					</button>
					<button
						type="button"
						className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
							onClick={() => {
								try {
									localStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(selectedFoods));
									setPlanGeneratedAndViolation(patientId);
								} catch (e) {
									console.error(e);
								}
								navigate({ to: "/view-meal-plan-summary", search: (old) => ({ ...old, patientId }) });
							}}
					>
						View Weekly Meal Plan
					</button>
				</div>
			</div>

			{!patient ? (
				<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
					<p className="text-lg text-slate-700">No patient selected.</p>
					<p className="mt-2 text-sm text-slate-500">
						Use Generate Plan from the patients page to view merged constraints.
					</p>
				</div>
			) : (
				<div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
					<section className="rounded-2xl border bg-white p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-900">
							Patient details
						</h2>
						<div className="mt-4 space-y-3 text-sm text-slate-600">
							<p>
								<span className="font-semibold text-slate-900">Name:</span>{" "}
								{patient.name}
							</p>
							<p>
								<span className="font-semibold text-slate-900">CPR:</span>{" "}
								{patient.cpr}
							</p>
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-semibold text-slate-900">
									Conditions:
								</span>
								{patient.conditions.map((condition) => (
									<span
										key={condition}
										className="rounded-full border px-3 py-1 text-xs font-semibold text-slate-700"
									>
										{condition}
									</span>
								))}
							</div>

							<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="text-sm font-semibold text-slate-900">Day</p>
										<p className="text-xs text-slate-500">
											Choose a day of the week to build a targeted meal plan.
										</p>
									</div>
									<Select
										value={selectedDay}
										onValueChange={(value) => setSelectedDay(value as DayKey)}
									>
										<SelectTrigger className="w-full min-w-40">
											<SelectValue placeholder="Select a day" />
										</SelectTrigger>
										<SelectContent>
											{DAYS.map((day) => (
												<SelectItem key={day} value={day}>
													{day}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 sm:mt-6 sm:border-t-0 sm:pt-0">
									{MEALS.map((meal) => (
										<button
											type="button"
											key={meal}
											className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
												selectedMeal === meal
													? "bg-slate-900 text-white"
													: "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
											}`}
											onClick={() => setSelectedMeal(meal)}
										>
											{meal}
										</button>
									))}
								</div>

								{/* compact Day/Meal header removed per request */}
							</div>

							{/* Meal Plan (per selected day) */}
							<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
								<h2 className="mb-4 text-lg font-semibold text-slate-900">
									Meal Plan — {selectedDay}
								</h2>

								{MEALS.map((meal) => (
									<div key={meal} className="mb-6">
										<h3 className="mb-3 border-b pb-2 text-lg font-semibold capitalize text-slate-800">
											{meal}
										</h3>

										{selectedFoods[selectedDay][meal].length === 0 ? (
											<p className="text-sm text-slate-400">No foods added</p>
										) : (
											<div className="space-y-3">
												{selectedFoods[selectedDay][meal].map((food) => (
													<div
														key={food.fdcId}
														className="flex items-start justify-between rounded-xl border bg-white p-3"
													>
														<div>
															<p className="font-semibold text-slate-900">
																{food.description}
															</p>
															<p className="mt-1 text-xs text-slate-500">
																{[food.dataType, food.brandOwner]
																	.filter(Boolean)
																	.join(" - ")}{" "}
																{food.grams ? ` • ${food.grams} g` : ""}
															</p>
														</div>

														<button
															type="button"
															className="text-red-500 hover:text-red-700"
															onClick={() => handleRemoveFood(meal, food.fdcId)}
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								))}
							</div>

							<div className="pt-4">
								<h3 className="text-lg font-semibold text-slate-900">
									Food search
								</h3>
								<p className="mt-1 text-xs text-slate-500">
									Start typing to search (minimum 3 letters)
								</p>
								<Input
									value={foodQuery}
									onChange={(event) => {
										setFoodQuery(event.target.value);
										setSelectedFoodId(null);
									}}
									placeholder="Search USDA foods"
									aria-label="Search USDA foods"
									className="mt-3 h-10 bg-white"
								/>

								{foodSearch.isFetching && shouldSearch && (
									<div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
										<Loader2 className="animate-spin" size={16} />
										Searching foods...
									</div>
								)}

								{foodSearch.isError && (
									<p className="mt-3 text-sm text-destructive">
										Food search failed. Check the USDA API key and try again.
									</p>
								)}

								{shouldSearch &&
									foodSearch.data &&
									foodSearch.data.length === 0 && (
										<p className="mt-3 text-sm text-slate-500">
											No foods found for this search.
										</p>
									)}

								{!shouldSearch && (
									<p className="mt-3 text-xs text-slate-400">
										Type at least 3 characters to search
									</p>
								)}

								{shouldSearch &&
									foodSearch.data &&
									foodSearch.data.length > 0 && (
										<div className="mt-4 space-y-2">
											{foodSearch.data.map((food) => {
												const conflict = foodConflicts.get(food.fdcId);
												return (
													<FoodSearchItem
														key={food.fdcId}
														food={food}
														isSelected={selectedFoodId === food.fdcId}
														onAddFood={(g) => handleAddFood(food, g)}
														conflictingAllergies={
															conflict?.conflictingAllergies ?? []
														}
													/>
												);
											})}
										</div>
									)}

								{foodDetails.isFetching && (
									<p className="mt-3 text-sm text-slate-500">
										Loading food details...
									</p>
								)}

								{foodDetails.isError && (
									<p className="mt-3 text-sm text-destructive">
										Food details could not be loaded.
									</p>
								)}

								{selectedFood && (
									<div className="mt-4 rounded-lg border bg-slate-50 p-4">
										<p className="font-semibold text-slate-900">
											{selectedFood.description}
										</p>
										<p className="mt-1 text-xs text-slate-500">
											{[selectedFood.dataType, selectedFood.brandOwner]
												.filter(Boolean)
												.join(" - ")}
										</p>
										<p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
											Nutrition per 100 g
										</p>
										<div className="mt-3 grid gap-2 sm:grid-cols-2">
											{selectedNutrients.map((nutrient) => (
												<div
													key={nutrient.label}
													className="rounded-md border bg-white px-3 py-2 text-xs"
												>
													<p className="font-semibold text-slate-700">
														{nutrient.label}
													</p>
													<p className="text-slate-500">
														{nutrient.value ?? "N/A"} {nutrient.unit}
													</p>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</section>

					<aside className="rounded-2xl border bg-slate-50 p-6 shadow-sm">
						<div className="mt-2 space-y-6">
							<div>
								<h2 className="mb-4 text-xl font-semibold text-slate-900">
									Constraints
								</h2>
								<div className="space-y-4">
									{constraints.length === 0 ? (
										<p className="text-sm text-slate-500">
											No constraints available for these conditions.
										</p>
									) : (
										constraints.map((constraint) => {
											const current = getCurrentForConstraint(constraint);

											const isPerKg = (constraint.unit ?? "").includes("/kg");
											const weightKg = patient?.weight ?? 0;

											const computedMin =
												isPerKg && constraint.min !== undefined
													? constraint.min * weightKg
													: constraint.min;
											const computedMax =
												isPerKg && constraint.max !== undefined
													? constraint.max * weightKg
													: constraint.max;

											const targetAbs = computedMax ?? computedMin ?? undefined;
											const pct =
												targetAbs && targetAbs > 0
													? Math.min(
															100,
															Math.round((current.value / targetAbs) * 100),
														)
													: 0;

											const belowMin =
												computedMin !== undefined &&
												current.value < computedMin;
											const aboveMax =
												computedMax !== undefined &&
												current.value > computedMax;

											const unitWithoutPerKg = isPerKg
												? constraint.unit?.replace("/kg", "").trim() ||
													current.unit
												: current.unit;
											const computedMinAbsDisplay =
												computedMin !== undefined
													? Math.round(computedMin * 10) / 10
													: undefined;
											const computedMaxAbsDisplay =
												computedMax !== undefined
													? Math.round(computedMax * 10) / 10
													: undefined;

											return (
												<div
													key={constraint.id}
													className="rounded-2xl border border-slate-200 bg-white p-4"
												>
													<div className="flex items-start justify-between gap-3">
														<div>
															<p className="font-semibold text-slate-900">
																{constraint.label}
															</p>
															<p className="mt-1 text-xs text-slate-500">
																{constraint.conditions.join(", ")}
															</p>
														</div>

														<div className="text-right text-sm text-slate-700 w-40">
															<div className="mb-2 text-sm font-semibold">
																{current.value} / {targetAbs ?? "—"}{" "}
																{current.unit}
															</div>

															{isPerKg &&
																(constraint.min !== undefined ||
																	constraint.max !== undefined) && (
																	<div className="text-xs text-slate-500">
																		{constraint.min !== undefined && (
																			<div>
																				{constraint.min} {constraint.unit} ={" "}
																				{computedMinAbsDisplay}{" "}
																				{unitWithoutPerKg} for {weightKg || "—"}{" "}
																				kg
																			</div>
																		)}
																		{constraint.max !== undefined && (
																			<div>
																				{constraint.max} {constraint.unit} ={" "}
																				{computedMaxAbsDisplay}{" "}
																				{unitWithoutPerKg} for {weightKg || "—"}{" "}
																				kg
																			</div>
																		)}
																	</div>
																)}

															<div className="w-full h-2 rounded bg-slate-200 overflow-hidden">
																<div
																	className={`${belowMin || aboveMax ? "bg-red-500" : "bg-emerald-500"} h-2`}
																	style={{ width: `${pct}%` }}
																/>
															</div>

															{belowMin && (
																<p className="mt-2 text-xs text-red-600">
																	⚠️ Below minimum — need{" "}
																	{Math.round(
																		((computedMin ?? 0) - current.value) * 10,
																	) / 10}{" "}
																	more {current.unit}
																</p>
															)}

															{aboveMax && (
																<p className="mt-2 text-xs text-red-600">
																	⚠️ Above maximum — exceed by{" "}
																	{Math.round(
																		(current.value - (computedMax ?? 0)) * 10,
																	) / 10}{" "}
																	{current.unit}
																</p>
															)}

															<p className="text-[11px] text-slate-400 mt-1">
																{constraint.scope}
															</p>
														</div>
													</div>
												</div>
											);
										})
									)}
								</div>
							</div>

							{/* Meal Plan moved to left column */}
						</div>
					</aside>
				</div>
			)}
		</div>
	);
}

type FoodSearchItemProps = {
	food: FoodSearchResult;
	isSelected: boolean;
	onAddFood: (grams: number) => void;
	conflictingAllergies: string[];
};

function FoodSearchItem({
	food,
	isSelected,
	onAddFood,
	conflictingAllergies,
}: FoodSearchItemProps) {
	const nutrients = getNutritionPer100g(food);
	const hasConflict = conflictingAllergies.length > 0;
	const [grams, setGrams] = useState<number>(100);

	return (
		<div
			className={`relative w-full rounded-lg border bg-white p-3 text-left text-sm ${
				isSelected ? "border-slate-900" : ""
			}`}
		>
			<div className="absolute right-3 top-2 flex items-center gap-2">
				<input
					type="number"
					min={1}
					value={grams}
					onChange={(e) => setGrams(Math.max(1, Number(e.target.value) || 0))}
					className="w-16 rounded border px-2 py-1 text-sm"
				/>
				<button
					type="button"
					className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700"
					onClick={() => onAddFood(grams)}
				>
					+
				</button>
			</div>

			<span className="block font-semibold text-slate-900">
				{food.description}
			</span>
			<span className="mt-1 block text-xs text-slate-500">
				{[food.dataType, food.brandOwner, food.foodCategory]
					.filter(Boolean)
					.join(" - ")}
			</span>
			{hasConflict && (
				<span className="mt-2 block text-xs font-semibold text-red-700">
					⚠️ Conflicts with: {conflictingAllergies.join(", ")}
				</span>
			)}
			{nutrients.length > 0 && (
				<span className="mt-3 block">
					<span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
						Per 100 g
					</span>
					<span className="mt-2 grid gap-2 sm:grid-cols-3">
						{nutrients.map((nutrient) => (
							<span
								key={nutrient.label}
								className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600"
							>
								<span className="font-semibold text-slate-800">
									{nutrient.label}:
								</span>{" "}
								{nutrient.value} {nutrient.unit}
							</span>
						))}
					</span>
				</span>
			)}
		</div>
	);
}
