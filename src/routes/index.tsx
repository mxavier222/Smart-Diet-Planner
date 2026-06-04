import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import PatientCard from "@/components/PatientCard";
import {
  deletePatient,
  getPatientsForUI,
  type Patient,
  updatePatient,
} from "@/lib/patients";
export const Route = createFileRoute("/")({
  component: PatientListPage,
});

function PatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(getPatientsForUI());
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const handleUpdate = (
    id: string,
    updates: Partial<Omit<Patient, "id" | "createdAt">>,
  ) => {
    updatePatient(id, updates); // update storage
    setPatients(getPatientsForUI());
  };

  const handleGeneratePlan = (patientId: string) => {
    navigate({ to: "/generate-plan", search: (old) => ({ ...old, patientId }) });
  };

  // added for M1-11 ISSUE
  const handleDelete = (id: string) => {
    deletePatient(id);
    setPatients(getPatientsForUI());
    setShowDeleteSuccess(true);
  };
  return (
    <>
      <div className="mx-auto max-w-5xl p-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Follow these four simple steps to create a tailored meal plan for each patient.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              "Add patient details",
              "Add food based on constraints",
              "Review meal plan",
              "Save plan as PDF",
            ].map((stepText, index) => (
              <div
                key={stepText}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold text-slate-900">Step {index + 1}</p>
                <p className="text-sm text-slate-600">{stepText}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage patients and generate personalised meal plans
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/patients/add-patient" })}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            + New Patient
          </button>
        </div>

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold text-blue-700">{patients.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Patients
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold text-green-700">
              {patients.filter((p) => p.PlanGenerated).length}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Plans Generated
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold text-orange-600">
              {patients.filter((p) => p.hasViolations).length}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Plans with Violations
            </p>
          </div>
        </div>

        {/* Patient grid */}
        <div className="grid grid-cols-3 gap-4">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onGeneratePlan={() => handleGeneratePlan(patient.id)}
            />
            //<PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </div>

      {/* Deletion Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[280px] shadow-lg text-center">
            <h2 className="text-lg font-semibold text-blue-700 mb-6">
              Deleted Successfully
            </h2>
            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowDeleteSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
