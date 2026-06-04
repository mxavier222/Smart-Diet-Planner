export interface Patient {
	PlanGenerated: boolean;
	violation: boolean;
	id: string;
	name: string;
	cpr: string;
	age: number;
	height: number;
	weight: number;
	bmi: number;
	conditions: string[];
	allergies: string[];
	createdAt: string;
}

const PATIENTS_STORAGE_KEY = "patients_data";

const DEFAULT_PATIENTS: Patient[] = [
	{
		id: "76c14e5f-14a6-4562-b016-b23cbf661134",
		name: "Patient 1",
		cpr: "1212152345",
		age: 35,
		height: 150,
		weight: 50,
		bmi: 22.2,
		conditions: ["Type 2 Diabetes", "Hypertension"],
		allergies: ["soy"],
		createdAt: "2026-04-21T08:21:27.122Z",
		PlanGenerated: false,
		violation: false,
	},
	{
		id: "d3e030ae-b0f3-4761-a396-1a9820e9182e",
		name: "Patient 2",
		cpr: "1212152300",
		age: 33,
		height: 160,
		weight: 60,
		bmi: 23.4,
		conditions: ["Type 2 Diabetes", "Chronic Kidney Disease (Stage 4)"],
		allergies: ["peanut"],
		createdAt: "2026-04-21T08:21:54.169Z",
		PlanGenerated: false,
		violation: false,
	},
	{
		id: "e11b67ed-9ae7-4c0c-b1ca-798e19e033a4",
		name: "Patient 3",
		cpr: "9912152346",
		age: 40,
		height: 170,
		weight: 70,
		bmi: 24.2,
		conditions: [
			"Chronic Kidney Disease (Stage 4)",
			"Chronic Kidney Disease (Stage 5, pre-dialysis)",
		],
		allergies: ["egg"],
		createdAt: "2026-04-21T08:22:30.386Z",
		PlanGenerated: false,
		violation: false,
	},
];

// In-memory storage for current session
const currentPatients: Patient[] = loadPatientsFromStorage();

import { getNutritionPer100g } from "./api";
// Helper: mark plan generated and optionally set violation flag based on stored meal plan
import { DAYS, MEALS, parseStoredMealPlan } from "./meal-plan";
import { mergeConstraintsForConditions } from "./utils";

export function setPlanGeneratedAndViolation(patientId: string): void {
	const index = currentPatients.findIndex((p) => p.id === patientId);
	if (index === -1) return;

	const patient = currentPatients[index];
	// mark plan generated
	patient.PlanGenerated = true;

	// load stored meal plan for this patient
	const mealPlanKey = `meal_plan_${patientId}`;
	const stored = typeof window !== "undefined" ? localStorage.getItem(mealPlanKey) : null;
	const mealPlan = parseStoredMealPlan(stored);

	// Build nutrient totals per day and per meal to check constraints
	const constraints = mergeConstraintsForConditions(patient.conditions || []);

	let hasViolation = false;

	for (const day of DAYS) {
		// totals per day
		const dayTotals: Record<string, number> = {};
		const perMealTotals: Record<string, Record<string, number>> = {
			breakfast: {},
			lunch: {},
			dinner: {},
		};

		for (const meal of MEALS) {
			const foods = mealPlan[day][meal] ?? [];
			for (const food of foods) {
				const nutrients = getNutritionPer100g(food as any);
				for (const n of nutrients) {
					const label = n.label;
					const val = (typeof n.value === "number") ? n.value * ((food.grams ?? 100) / 100) : 0;
					dayTotals[label] = (dayTotals[label] ?? 0) + val;
					perMealTotals[meal][label] = (perMealTotals[meal][label] ?? 0) + val;
				}
			}
		}

		// check constraints for this day
		for (const constraint of constraints) {
			const id = constraint.id.toLowerCase();
			let labelKey = "";
			if (id.includes("carb")) labelKey = "Carbs";
			else if (id.includes("protein")) labelKey = "Protein";
			else if (id.includes("fiber")) labelKey = "Fiber";
			else if (id.includes("sodium")) labelKey = "Sodium";
			else if (id.includes("potassium")) labelKey = "Potassium";

			if (!labelKey) continue;

			if (constraint.scope === "day") {
				const val = Math.round((dayTotals[labelKey] ?? 0) * 10) / 10;
				if ((constraint.min !== undefined && val < constraint.min) || (constraint.max !== undefined && val > constraint.max)) {
					hasViolation = true;
					break;
				}
			} else {
				// meal scope: check each meal's max against constraint
				for (const meal of MEALS) {
					const val = Math.round((perMealTotals[meal][labelKey] ?? 0) * 10) / 10;
					if ((constraint.min !== undefined && val < constraint.min) || (constraint.max !== undefined && val > constraint.max)) {
						hasViolation = true;
						break;
					}
				}
				if (hasViolation) break;
			}
		}

		if (hasViolation) break;
	}

	patient.violation = hasViolation;
	// persist
	savePatientsToStorage(currentPatients);
	try {
		// set a short-lived flag so the summary page can show a visual confirmation
		if (typeof window !== "undefined") {
			localStorage.setItem(
				`plan_update_${patientId}`,
				JSON.stringify({ violation: hasViolation, patientId, time: Date.now() }),
			);
		}
	} catch {}
}

function loadPatientsFromStorage(): Patient[] {
	if (typeof window === "undefined" || !window.localStorage) {
		return [...DEFAULT_PATIENTS];
	}

	const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
	if (!stored) {
		savePatientsToStorage(DEFAULT_PATIENTS);
		return [...DEFAULT_PATIENTS];
	}

	try {
		const parsed = JSON.parse(stored);
		if (Array.isArray(parsed)) {
			return parsed as Patient[];
		}
	} catch {
		// Fall through to default patients
	}

	savePatientsToStorage(DEFAULT_PATIENTS);
	return [...DEFAULT_PATIENTS];
}

/**
 * Fetch all patients
 */
export function getAllPatients(): Patient[] {
	return [...currentPatients];
}

/**
 * Get a single patient by ID
 */
export function getPatientById(id: string): Patient | undefined {
	return currentPatients.find((patient) => patient.id === id);
}

/**
 * Add a new patient
 */
export function addPatient(
	patient: Omit<Patient, "id" | "createdAt" | "PlanGenerated" | "violation"> &
		Partial<Pick<Patient, "PlanGenerated" | "violation">>,
): Patient {
	const newPatient: Patient = {
		...patient,
		PlanGenerated: patient.PlanGenerated ?? false,
		violation: patient.violation ?? false,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
	};

	currentPatients.push(newPatient);
	savePatientsToStorage(currentPatients);
	return newPatient;
}

/**
 * Update an existing patient
 */
export function updatePatient(
	id: string,
	updates: Partial<Omit<Patient, "id" | "createdAt">>,
): Patient | null {
	const index = currentPatients.findIndex((p) => p.id === id);
	if (index === -1) return null;

	currentPatients[index] = {
		...currentPatients[index],
		...updates,
	};

	savePatientsToStorage(currentPatients);
	return currentPatients[index];
}

/**
 * Delete a patient by ID
 */
export function deletePatient(id: string): boolean {
	const index = currentPatients.findIndex((p) => p.id === id);
	if (index === -1) return false;

	currentPatients.splice(index, 1);
	savePatientsToStorage(currentPatients);
	return true;
}

/**
 * Search patients by name or CPR
 */
export function searchPatients(query: string): Patient[] {
	const lowerQuery = query.toLowerCase();
	return currentPatients.filter(
		(patient) =>
			patient.name.toLowerCase().includes(lowerQuery) ||
			patient.cpr.includes(query),
	);
}

/**
 * Get patients formatted for UI display
 */
export function getPatientsForUI(): UIFormattedPatient[] {
	return currentPatients.map((patient) => ({
		id: patient.id,
		name: patient.name,
		cpr: patient.cpr,
		conditions: patient.conditions,
		allergies: patient.allergies,
		updatedAt: formatUpdatedAt(patient.createdAt),
		PlanGenerated: patient.PlanGenerated,
		hasViolations: patient.violation, // Simple heuristic: violations if multiple conditions
	}));
}

/**
 * UI-formatted patient type
 */
export interface UIFormattedPatient {
	id: string;
	cpr: string;
	name: string;
	conditions: string[];
	allergies: string[];
	updatedAt: string;
	hasViolations: boolean;
	PlanGenerated: boolean;
}

// Helper function to format updatedAt
function formatUpdatedAt(createdAt: string): string {
	const created = new Date(createdAt);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - created.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 1) return "today";
	if (diffDays === 2) return "yesterday";
	if (diffDays <= 7) return `${diffDays - 1} days ago`;
	return created.toLocaleDateString();
}

// Storage utilities
function savePatientsToStorage(patients: Patient[]): void {
	localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
}
