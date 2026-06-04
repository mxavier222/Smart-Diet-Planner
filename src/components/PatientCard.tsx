import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import type { UIFormattedPatient } from "@/lib/patients";

interface PatientCardProps {
  patient: UIFormattedPatient;
  onUpdate?: (id: string, updates: Partial<UIFormattedPatient>) => void;
  onDelete?: (id: string) => void;
  onGeneratePlan?: (id: string) => void;
}

const maskCpr = (cpr: string) => {
  if (!cpr || cpr.length < 10) return cpr;
  return `${cpr.slice(0, 6)}****`;
};

export default function PatientCard({
  patient,
  onUpdate,
  onDelete,
  onGeneratePlan,
}: PatientCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const conditions = Array.isArray(patient.conditions)
    ? patient.conditions
    : [];
  const allergies = Array.isArray(patient.allergies) ? patient.allergies : [];

  const navigate = useNavigate();

  return (
    <>
      <div className="rounded-xl border bg-white p-5 shadow-sm flex h-full flex-col gap-3">
        {/* Name + ID */}
        <div>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900">{patient.name}</p>
            <div className="flex items-center gap-2">
              {onUpdate && (
                <Pencil
                  className="w-4 h-4 text-black cursor-pointer hover:text-blue-700"
                  onClick={() =>
                    navigate({
                      to: "/patients/add-patient",
                      search: { patientId: patient.id },
                    })
                  }
                />
              )}
              {onDelete && (
                <Trash
                  className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
                  onClick={() => {
                    setShowDeleteModal(true);
                  }}
                />
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {maskCpr(patient.cpr)}
          </p>
        </div>

        {/* Conditions */}
        <div className="text-xs leading-5 min-h-12 flex flex-wrap items-center gap-1">
          {conditions.map((condition, index) => {
            const conditionStyles: Record<string, string> = {
              "Type 2 Diabetes": "text-orange-600",
              "Chronic Kidney Disease (Stage 3)": "text-blue-600",
              "Chronic Kidney Disease (Stage 4)": "text-blue-800",
              "Chronic Kidney Disease (Stage 5, pre-dialysis)": "text-red-800",
              "Chronic Kidney Disease (Stage 5D, on dialysis)": "text-pink-900",
              Hypertension: "text-green-600",
              "Heart Failure": "text-red-600",
              "Gluten Intolerance / Celiac Disease": "text-purple-600",
              Hyperlipidemia: "text-pink-600",
            };
            const styles = conditionStyles[condition] ?? "text-gray-600";
            return (
              <span key={condition} className="inline-flex items-center gap-1">
                <span className={`font-semibold ${styles}`}>{condition}</span>
                {index < conditions.length - 1 && (
                  <span className="text-slate-400">|</span>
                )}
              </span>
            );
          })}
        </div>

        {allergies.length > 0 && (
          <div className="text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            className="flex-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
            onClick={() => onGeneratePlan?.(patient.id)}
          >
            Generate Plan
          </button>

          <button
            type="button"
            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              patient.PlanGenerated
                ? "text-slate-600 hover:bg-slate-50"
                : "text-slate-400 opacity-60 cursor-not-allowed"
            }`}
            onClick={() =>
              navigate({
                to: "/view-meal-plan-summary",
                search: { patientId: patient.id },
              })
            }
            disabled={!patient.PlanGenerated}
          >
            View Plan
          </button>
        </div>

        {!patient.PlanGenerated && (
          <p className="text-xs text-slate-400 mt-2">
            Plan not generated — open Generate Plan to create and save a plan
            first.
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[350px] shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Do you confirm?
            </h2>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded border"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDelete?.(patient.id);
                  console.log("Deleted Patient with ID", patient.id);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
