export const dietaryConstraints = {
	meta: {
		version: "2.1.0",
		sources: {
			KDOQI_2020:
				"KDOQI Clinical Practice Guideline for Nutrition in CKD: 2020 Update. Am J Kidney Dis. 2020;76(3 Suppl 1):S1-S107",
			ESPEN_2021:
				"ESPEN guideline on clinical nutrition in hospitalized patients with acute or chronic kidney disease. Clin Nutr. 2021;40(4):1644-1668",
			ADA_2026:
				"ADA Standards of Care in Diabetes — 2026, Section 5: Facilitating Positive Health Behaviors",
			EASD_ADA_2022:
				"Management of Hyperglycemia in Type 2 Diabetes, 2022. Consensus Report (ADA/EASD). Diabetes Care. 2022;45(11):2753-2786",
			ESC_2021_HF:
				"2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):3599-3726",
			ESC_2024_HTN:
				"2024 ESC Guidelines for the management of elevated blood pressure and hypertension. Eur Heart J. 2024;45(38):3912-4018",
			HFA_ESC_2024:
				"Dietary sodium and fluid intake in heart failure. Clinical consensus statement of the HFA of the ESC. Eur J Heart Fail. 2024",
			WHO_2012:
				"WHO Guideline: Potassium intake for adults and children. Geneva: WHO; 2012",
			NKF_CLINICAL:
				"National Kidney Foundation patient education and clinical practice thresholds",
		},
	},
	conditions: {
		type_2_diabetes: {
			display_name: "Type 2 Diabetes",
			constraints: {
				carbs_g_per_meal: {
					max: 45,
					unit: "g",
					scope: "meal",
					source:
						"ADA_2026 — common clinical heuristic; ADA recommends individualized carb intake",
				},
				carbs_g_per_day: {
					max: 135,
					unit: "g",
					scope: "day",
					source:
						"ADA_2026 — derived from 45g × 3 meals; ADA recommends individualized carb intake",
				},
				protein_g_per_kg_per_day: {
					max: 0.8,
					unit: "g/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.0.2 — 0.6-0.8 g/kg/day for metabolically stable CKD 3-5 with diabetes (2C)",
				},
				fiber_g_per_day: {
					min: 28,
					unit: "g",
					scope: "day",
					source:
						"ADA_2026 §5.24 — at least 14g fiber per 1000 kcal; 28g assumes ~2000 kcal/day",
				},
				sodium_mg_per_day: {
					max: 2300,
					unit: "mg",
					scope: "day",
					source: "ADA_2026 §5.20",
				},
			},
		},
		ckd_stage_3: {
			display_name: "Chronic Kidney Disease (Stage 3)",
			constraints: {
				protein_g_per_kg_per_day: {
					max: 0.6,
					unit: "g/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.0.1 — 0.55-0.60 g/kg/day for metabolically stable CKD 3-5 without diabetes (1A)",
				},
				sodium_mg_per_day: {
					max: 2300,
					unit: "mg",
					scope: "day",
					source:
						"KDOQI_2020 §6.5 — <100 mmol/d (<2.3 g/d) for CKD 3-5 and 5D (1B)",
				},
				potassium_mg_per_day: {
					max: 2500,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.4 recommends individualization; 2500 mg is a common clinical threshold for stage 3",
				},
				phosphorus_mg_per_day: {
					max: 1000,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.3 recommends individualization; 800-1000 mg is a common clinical threshold",
				},
				calcium_mg_per_day: {
					min: 800,
					max: 1000,
					unit: "mg",
					scope: "day",
					source:
						"KDOQI_2020 §6.2 — total elemental calcium 800-1000 mg/d for CKD 3-4 not on active vitamin D (2B)",
				},
				energy_kcal_per_kg_per_day: {
					min: 25,
					max: 35,
					unit: "kcal/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.1.1 — 25-35 kcal/kg/day for metabolically stable CKD 1-5D (1C)",
				},
			},
		},
		ckd_stage_4: {
			display_name: "Chronic Kidney Disease (Stage 4)",
			constraints: {
				protein_g_per_kg_per_day: {
					max: 0.6,
					unit: "g/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.0.1 — 0.55-0.60 g/kg/day for metabolically stable CKD 3-5 without diabetes (1A)",
				},
				sodium_mg_per_day: {
					max: 2300,
					unit: "mg",
					scope: "day",
					source:
						"KDOQI_2020 §6.5 — <100 mmol/d (<2.3 g/d) for CKD 3-5 and 5D (1B)",
				},
				potassium_mg_per_day: {
					max: 2000,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.4 recommends individualization; 2000 mg is a common clinical threshold for stage 4-5",
				},
				phosphorus_mg_per_day: {
					max: 800,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.3 recommends individualization; 800 mg is a common clinical threshold for stage 4-5",
				},
				calcium_mg_per_day: {
					min: 800,
					max: 1000,
					unit: "mg",
					scope: "day",
					source:
						"KDOQI_2020 §6.2 — total elemental calcium 800-1000 mg/d for CKD 3-4 not on active vitamin D (2B)",
				},
				fluid_ml_per_day: {
					max: 1500,
					unit: "ml",
					scope: "day",
					source:
						"ESPEN_2021 — fluid restriction may be needed in advanced CKD; 1500 ml is a common clinical threshold",
				},
				energy_kcal_per_kg_per_day: {
					min: 25,
					max: 35,
					unit: "kcal/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.1.1 — 25-35 kcal/kg/day for metabolically stable CKD 1-5D (1C)",
				},
			},
		},
		ckd_stage_5: {
			display_name: "Chronic Kidney Disease (Stage 5, pre-dialysis)",
			constraints: {
				protein_g_per_kg_per_day: {
					max: 0.6,
					unit: "g/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.0.1 — 0.55-0.60 g/kg/day for metabolically stable CKD 3-5 without diabetes (1A)",
				},
				sodium_mg_per_day: {
					max: 2300,
					unit: "mg",
					scope: "day",
					source:
						"KDOQI_2020 §6.5 — <100 mmol/d (<2.3 g/d) for CKD 3-5 and 5D (1B)",
				},
				potassium_mg_per_day: {
					max: 2000,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.4 recommends individualization; 2000 mg is a common clinical threshold for stage 4-5",
				},
				phosphorus_mg_per_day: {
					max: 800,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.3 recommends individualization; 800 mg is a common clinical threshold for stage 5",
				},
				fluid_ml_per_day: {
					max: 1000,
					unit: "ml",
					scope: "day",
					source:
						"ESPEN_2021 — fluid restriction in advanced CKD with reduced urine output; 1000 ml is a common clinical threshold",
				},
				energy_kcal_per_kg_per_day: {
					min: 25,
					max: 35,
					unit: "kcal/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.1.1 — 25-35 kcal/kg/day for metabolically stable CKD 1-5D (1C)",
				},
			},
		},
		ckd_stage_5d: {
			display_name: "Chronic Kidney Disease (Stage 5D, on dialysis)",
			constraints: {
				protein_g_per_kg_per_day: {
					min: 1.0,
					max: 1.2,
					unit: "g/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.0.3 — 1.0-1.2 g/kg/day for metabolically stable CKD 5D on MHD (1C)",
				},
				sodium_mg_per_day: {
					max: 2300,
					unit: "mg",
					scope: "day",
					source:
						"KDOQI_2020 §6.5 — <100 mmol/d (<2.3 g/d) for CKD 3-5 and 5D (1C)",
				},
				potassium_mg_per_day: {
					max: 2000,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.4 recommends individualization; 2000 mg is a common clinical threshold for dialysis patients",
				},
				phosphorus_mg_per_day: {
					max: 800,
					unit: "mg",
					scope: "day",
					source:
						"NKF_CLINICAL — KDOQI 2020 §6.3 recommends individualization; 800 mg is a common clinical threshold for dialysis patients",
				},
				fluid_ml_per_day: {
					max: 1000,
					unit: "ml",
					scope: "day",
					source:
						"NKF_CLINICAL — fluid typically limited to urine output + 500-750 ml; 1000 ml is a common threshold for oliguric/anuric patients",
				},
				energy_kcal_per_kg_per_day: {
					min: 25,
					max: 35,
					unit: "kcal/kg",
					scope: "day",
					source:
						"KDOQI_2020 §3.1.1 — 25-35 kcal/kg/day for metabolically stable CKD 1-5D (1C)",
				},
			},
		},
		hypertension: {
			display_name: "Hypertension",
			constraints: {
				sodium_mg_per_day: {
					max: 2000,
					unit: "mg",
					scope: "day",
					source: "ESC_2024_HTN — restrict sodium to ~2 g/day (~5 g NaCl/day)",
				},
				potassium_mg_per_day: {
					min: 3510,
					unit: "mg",
					scope: "day",
					source:
						"WHO_2012 — increase potassium intake to at least 90 mmol/day (3510 mg/day) to reduce blood pressure in adults",
				},
			},
		},
		heart_failure: {
			display_name: "Heart Failure",
			constraints: {
				sodium_mg_per_day: {
					max: 2000,
					unit: "mg",
					scope: "day",
					source:
						"ESC_2021_HF — avoid excessive salt intake (>5 g NaCl/day ≈ 2000 mg Na/day) in all HF patients",
				},
				fluid_ml_per_day: {
					max: 2000,
					unit: "ml",
					scope: "day",
					source:
						"ESC_2021_HF — fluid restriction of 1.5-2 L/day may be considered in severe HF; HFA_ESC_2024 notes limited RCT evidence",
				},
			},
		},
	},
	allergies: {
		peanut: {
			display_name: "Peanut Allergy",
			exclude_terms: [
				"peanut",
				"peanut oil",
				"peanut butter",
				"groundnut",
				"arachis oil",
			],
		},
		tree_nut: {
			display_name: "Tree Nut Allergy",
			exclude_terms: [
				"almond",
				"cashew",
				"walnut",
				"pecan",
				"pistachio",
				"macadamia",
				"hazelnut",
				"brazil nut",
				"chestnut",
				"pine nut",
			],
		},
		gluten: {
			display_name: "Gluten Intolerance / Celiac Disease",
			exclude_terms: [
				"wheat",
				"barley",
				"rye",
				"spelt",
				"kamut",
				"triticale",
				"malt",
				"brewer's yeast",
				"semolina",
				"durum",
				"bulgur",
				"couscous",
				"farro",
				"seitan",
			],
		},
		lactose: {
			display_name: "Lactose Intolerance",
			exclude_terms: [
				"milk",
				"cream",
				"butter",
				"cheese",
				"yogurt",
				"whey",
				"casein",
				"lactose",
				"ice cream",
				"custard",
			],
		},
		egg: {
			display_name: "Egg Allergy",
			exclude_terms: [
				"egg",
				"egg white",
				"egg yolk",
				"albumin",
				"globulin",
				"lysozyme",
				"mayonnaise",
				"meringue",
			],
		},
		shellfish: {
			display_name: "Shellfish Allergy",
			exclude_terms: [
				"shrimp",
				"prawn",
				"crab",
				"lobster",
				"crayfish",
				"clam",
				"mussel",
				"oyster",
				"scallop",
			],
		},
		fish: {
			display_name: "Fish Allergy",
			exclude_terms: [
				"cod",
				"salmon",
				"tuna",
				"trout",
				"haddock",
				"halibut",
				"mackerel",
				"sardine",
				"anchovy",
				"bass",
				"tilapia",
				"fish sauce",
				"fish oil",
			],
		},
		soy: {
			display_name: "Soy Allergy",
			exclude_terms: [
				"soy",
				"soybean",
				"soya",
				"tofu",
				"tempeh",
				"edamame",
				"miso",
				"soy sauce",
				"soy milk",
				"soy lecithin",
			],
		},
	},
};
