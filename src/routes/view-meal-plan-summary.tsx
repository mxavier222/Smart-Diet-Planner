import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { MEALS, type MealList, parseStoredMealPlan } from "@/lib/meal-plan";
import { getPatientById } from "@/lib/patients";

export const Route = createFileRoute("/view-meal-plan-summary")({
	component: ViewMealPlanSummaryPage,
});

function ViewMealPlanSummaryPage() {
	const navigate = useNavigate();
	const searchParams = new URLSearchParams(window.location.search);
	const patientId = searchParams.get("patientId") ?? "";

	const [planUpdate, setPlanUpdate] = useState<null | { violation: boolean }>(null);

	useEffect(() => {
		if (!patientId) return;
		try {
			const key = `plan_update_${patientId}`;
			const raw = localStorage.getItem(key);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			setPlanUpdate({ violation: !!parsed.violation });
			localStorage.removeItem(key);
			window.setTimeout(() => setPlanUpdate(null), 3500);
		} catch {
			// ignore
		}
	}, [patientId]);
	const patient = getPatientById(patientId);

	const mealPlanStorageKey = `meal_plan_${patientId}`;
	const stored =
		typeof window !== "undefined"
			? localStorage.getItem(mealPlanStorageKey)
			: null;
	const mealPlan = parseStoredMealPlan(stored);

	const days = Object.entries(mealPlan) as [string, MealList][];

	function handleDownloadPdf() {
		const pdfBlob = createMealPlanPdf({
			title: "Weekly Meal Plan Summary",
			patientLabel: patient
				? `Patient: ${patient.name} (${patient.cpr})`
				: "No patient selected",
			days,
		});
		const pdfUrl = URL.createObjectURL(pdfBlob);
		const downloadLink = document.createElement("a");
		const patientName = patient?.name ?? "meal-plan";

		downloadLink.href = pdfUrl;
		downloadLink.download = `${sanitizeFileName(patientName)}-weekly-meal-plan.pdf`;
		document.body.append(downloadLink);
		downloadLink.click();
		downloadLink.remove();
		window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
	}

	return (
		<div className="mx-auto max-w-6xl p-8">
			{planUpdate && (
				<div className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-2 text-sm font-semibold ${
					planUpdate.violation ? "bg-red-600 text-white" : "bg-green-600 text-white"
				}`}>
					{planUpdate.violation ? "Plan generated — Violations detected" : "Plan generated"}
				</div>
			)}
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">
						Weekly Meal Plan Summary
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Review the saved weekly meal plan for the selected patient.
					</p>
					{patient ? (
						<p className="mt-3 text-sm font-semibold text-slate-700">
							Patient: {patient.name} ({patient.cpr})
						</p>
					) : (
						<p className="mt-3 text-sm text-red-600">No patient selected.</p>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						onClick={() => navigate({ to: "/" })}
					>
						Back to Patients
					</button>
					<button
						type="button"
						className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
						onClick={handleDownloadPdf}
					>
						<Download className="h-4 w-4" />
						Download as PDF
					</button>
					<button
						type="button"
						className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
						onClick={() =>
							navigate({
								to: "/generate-plan",
								search: (old) => ({ ...old, patientId }),
							})
						}
					>
						Edit Plan
					</button>
				</div>
			</div>

			<div className="grid gap-6">
				{days.map(([day, meals]) => {
					const totalItems =
						meals.breakfast.length + meals.lunch.length + meals.dinner.length;
					return (
						<div
							key={day}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
						>
							<div className="mb-4 flex items-center justify-between gap-4">
								<div>
									<h2 className="text-xl font-semibold text-slate-900">
										{day}
									</h2>
									<p className="text-sm text-slate-500">
										{totalItems} item{totalItems === 1 ? "" : "s"} planned
									</p>
								</div>
							</div>
							<div className="space-y-4">
								{MEALS.map((meal) => (
									<div
										key={meal}
										className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
									>
										<p className="text-lg font-semibold text-slate-900 capitalize">
											{meal}
										</p>
										{meals[meal].length === 0 ? (
											<p className="mt-2 text-sm text-slate-500">
												No foods added
											</p>
										) : (
											<ul className="mt-3 space-y-2">
												{meals[meal].map((food) => (
													<li
														key={food.fdcId}
														className="rounded-xl bg-white p-3 shadow-sm"
													>
														<p className="font-semibold text-slate-900">
															{food.description}
														</p>
														<p className="mt-1 text-xs text-slate-500">
															{[food.dataType, food.brandOwner]
																.filter(Boolean)
																.join(" - ")}{" "}
															{food.grams ? `• ${food.grams} g` : ""}
														</p>
													</li>
												))}
											</ul>
										)}
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

type MealPlanPdfInput = {
	title: string;
	patientLabel: string;
	days: [string, MealList][];
};

function createMealPlanPdf({ title, patientLabel, days }: MealPlanPdfInput) {
	const pageWidth = 595;
	const pageHeight = 842;
	const margin = 48;
	const maxLineWidth = 70;
	const pages: PdfLine[][] = [[]];

	function currentPage() {
		return pages[pages.length - 1];
	}

	function addLine(line: PdfLine) {
		if (currentPage().length >= 42) {
			pages.push([]);
		}
		currentPage().push(line);
	}

	addLine({ text: title, font: "bold", size: 18, gapAfter: 10 });
	addLine({ text: patientLabel, font: "regular", size: 11, gapAfter: 16 });

	for (const [day, meals] of days) {
		const totalItems =
			meals.breakfast.length + meals.lunch.length + meals.dinner.length;
		addLine({
			text: `${day} - ${totalItems} item${totalItems === 1 ? "" : "s"} planned`,
			font: "bold",
			size: 14,
			gapBefore: 8,
			gapAfter: 8,
		});

		for (const meal of MEALS) {
			addLine({
				text: capitalize(meal),
				font: "bold",
				size: 12,
				indent: 12,
				gapAfter: 4,
			});

			if (meals[meal].length === 0) {
				addLine({
					text: "No foods added",
					font: "regular",
					size: 10,
					indent: 28,
					gapAfter: 8,
				});
				continue;
			}

			for (const food of meals[meal]) {
				const details = [food.dataType, food.brandOwner]
					.filter(Boolean)
					.join(" - ");
				const grams = food.grams ? `${food.grams} g` : "";
				const itemSummary = [details, grams].filter(Boolean).join(" - ");

				for (const [index, wrappedLine] of wrapText(
					`- ${food.description}`,
					maxLineWidth,
				).entries()) {
					addLine({
						text: wrappedLine,
						font: "regular",
						size: 10,
						indent: index === 0 ? 28 : 38,
						gapAfter: index === 0 && itemSummary ? 2 : 0,
					});
				}

				if (itemSummary) {
					addLine({
						text: itemSummary,
						font: "regular",
						size: 9,
						indent: 38,
						gapAfter: 6,
					});
				}
			}
		}
	}

	const objects = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		`<< /Type /Pages /Kids [${pages
			.map((_, index) => `${3 + index * 2} 0 R`)
			.join(" ")}] /Count ${pages.length} >>`,
	];

	for (const [pageIndex, pageLines] of pages.entries()) {
		const pageObjectId = 3 + pageIndex * 2;
		const contentObjectId = pageObjectId + 1;
		const regularFontObjectId = 3 + pages.length * 2;
		const boldFontObjectId = regularFontObjectId + 1;
		let currentY = pageHeight - margin;
		const content = [
			...pageLines.map((line) => {
				currentY -= line.gapBefore ?? 0;
				const lineCommand = [
					"BT",
					`/${line.font === "bold" ? "F2" : "F1"} ${line.size} Tf`,
					`${margin + (line.indent ?? 0)} ${currentY} Td`,
					`(${escapePdfText(line.text)}) Tj`,
					"ET",
				].join("\n");
				currentY -= line.size + 6 + (line.gapAfter ?? 0);
				return lineCommand;
			}),
		].join("\n");

		objects.push(
			`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${regularFontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
			`<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
		);
	}

	objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
	objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

	let pdf = "%PDF-1.4\n";
	const offsets = [0];

	for (const [index, object] of objects.entries()) {
		offsets.push(pdf.length);
		pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
	}

	const xrefOffset = pdf.length;
	pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (const offset of offsets.slice(1)) {
		pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
	}
	pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

	return new Blob([pdf], { type: "application/pdf" });
}

type PdfLine = {
	text: string;
	font: "regular" | "bold";
	size: number;
	indent?: number;
	gapBefore?: number;
	gapAfter?: number;
};

function wrapText(text: string, maxLength: number) {
	const words = text.split(" ");
	const lines: string[] = [];
	let line = "";

	for (const word of words) {
		const nextLine = line ? `${line} ${word}` : word;
		if (nextLine.length > maxLength && line) {
			lines.push(line);
			line = word;
		} else {
			line = nextLine;
		}
	}

	if (line) lines.push(line);
	return lines;
}

function escapePdfText(text: string) {
	return text
		.normalize("NFKD")
		.replace(/[^\x20-\x7E]/g, "?")
		.replaceAll("\\", "\\\\")
		.replaceAll("(", "\\(")
		.replaceAll(")", "\\)");
}

function sanitizeFileName(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
