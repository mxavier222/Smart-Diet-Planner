import { createFileRoute } from "@tanstack/react-router";
import AddPatientForm from "@/components/AddPatientForm";

export const Route = createFileRoute("/patients/add-patient")({
  component: PatientInfoPage,
});

function PatientInfoPage() {
  return <AddPatientForm />;
}
