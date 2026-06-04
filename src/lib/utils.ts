import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { dietaryConstraints } from "./constraints";

type ConditionKey = keyof typeof dietaryConstraints.conditions;
type DietaryConstraint = {
	unit: string;
	scope: string;
	source: string;
	min?: number;
	max?: number;
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getConditionsList() {
	return Object.entries(dietaryConstraints.conditions).map(
		([key, condition]) => ({
			key,
			displayName: condition.display_name,
		}),
	);
}

export function getAllergiesList() {
	return Object.entries(dietaryConstraints.allergies).map(([key, allergy]) => ({
		key,
		displayName: allergy.display_name,
	}));
}

export function normalizeConditionKey(
	conditionName: string,
): ConditionKey | undefined {
	const conditionKey = (
		Object.keys(dietaryConstraints.conditions) as ConditionKey[]
	).find((key) => key === conditionName);
	if (conditionKey) return conditionKey;
	return (
		Object.entries(dietaryConstraints.conditions) as [
			ConditionKey,
			(typeof dietaryConstraints.conditions)[ConditionKey],
		][]
	).find(([, condition]) => condition.display_name === conditionName)?.[0];
}

export function formatConstraintLabel(constraintId: string) {
	return constraintId
		.split("_")
		.map((segment) => segment.replace(/\b\w/g, (match) => match.toUpperCase()))
		.join(" ");
}

export function mergeConstraintsForConditions(conditionNames: string[]) {
	const merged: Record<
		string,
		{
			id: string;
			label: string;
			unit: string;
			scope: string;
			min?: number;
			max?: number;
			conditions: string[];
			sources: string[];
		}
	> = {};

	for (const rawName of conditionNames) {
		const conditionKey = normalizeConditionKey(rawName);
		if (!conditionKey) continue;

		const condition = dietaryConstraints.conditions[conditionKey];
		if (!condition) continue;

		for (const [constraintId, constraint] of Object.entries(
			condition.constraints,
		) as [string, DietaryConstraint][]) {
			const existing = merged[constraintId];
			const conditionName = condition.display_name;

			if (!existing) {
				merged[constraintId] = {
					id: constraintId,
					label: formatConstraintLabel(constraintId),
					unit: constraint.unit,
					scope: constraint.scope,
					min: constraint.min,
					max: constraint.max,
					conditions: [conditionName],
					sources: [constraint.source],
				};
				continue;
			}
				if (constraint.min !== undefined) {
					existing.min =
						existing.min === undefined
							? constraint.min
							: Math.max(existing.min, constraint.min);
				}
				if (constraint.max !== undefined) {
					existing.max =
						existing.max === undefined
							? constraint.max
							: Math.min(existing.max, constraint.max);
				}

				if (!existing.conditions.includes(conditionName)) {
					existing.conditions.push(conditionName);
				}

				if (!existing.sources.includes(constraint.source)) {
					existing.sources.push(constraint.source);
				}
			}
		}

	return Object.values(merged).sort((a, b) => a.label.localeCompare(b.label));
}

type AllergyKey = keyof typeof dietaryConstraints.allergies;

export function normalizeAllergyKey(
	allergyName: string,
): AllergyKey | undefined {
	const allergyKey = (
		Object.keys(dietaryConstraints.allergies) as AllergyKey[]
	).find((key) => key === allergyName);
	if (allergyKey) return allergyKey;
	return (
		Object.entries(dietaryConstraints.allergies) as [
			AllergyKey,
			(typeof dietaryConstraints.allergies)[AllergyKey],
		][]
	).find(([, allergy]) => allergy.display_name === allergyName)?.[0];
}

export function checkFoodAllergyConflicts(
	foodDescription: string,
	allergyNames: string[],
): { hasConflict: boolean; conflictingAllergies: string[] } {
	const conflictingAllergies: string[] = [];
	const lowerDescription = foodDescription.toLowerCase();

	for (const allergyName of allergyNames) {
		const allergyKey = normalizeAllergyKey(allergyName);
		if (!allergyKey) continue;

		const allergy = dietaryConstraints.allergies[allergyKey];
		if (!allergy) continue;

		for (const excludeTerm of allergy.exclude_terms) {
			if (lowerDescription.includes(excludeTerm.toLowerCase())) {
				const displayName = allergy.display_name;
				if (!conflictingAllergies.includes(displayName)) {
					conflictingAllergies.push(displayName);
				}
				break;
			}
		}
	}

	return {
		hasConflict: conflictingAllergies.length > 0,
		conflictingAllergies,
	};
}
