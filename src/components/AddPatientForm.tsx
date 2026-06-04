import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { addPatient, getAllPatients, updatePatient } from "@/lib/patients";
import { getAllergiesList, getConditionsList } from "@/lib/utils";

type OptionItem = {
  key: string;
  displayName: string;
};

export default function AddPatient() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/patients/add-patient" }) as {
    patientId?: string;
  };
  const patientId = search.patientId;
  // IDs
  const fullNameId = useId();
  const idNumberId = useId();
  const ageId = useId();
  const heightId = useId();
  const weightId = useId();

  // Form state
  const [name, setName] = useState("");
  const [cpr, setCpr] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [conditions, setConditions] = useState<OptionItem[]>([]);
  const [allergies, setAllergies] = useState<OptionItem[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const [nameError, setNameError] = useState("");
  const [cprError, setCprError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load constraints
  useEffect(() => {
    setConditions(getConditionsList());
    setAllergies(getAllergiesList());
  }, []);

  useEffect(() => {
    if (!patientId) return;

    const patient = getAllPatients().find((p) => p.id === patientId);

    if (!patient) return;

    setName(patient.name || "");
    setCpr(patient.cpr || "");
    setAge(String(patient.age || ""));
    setHeight(String(patient.height || ""));
    setWeight(String(patient.weight || ""));
    setSelectedConditions(patient.conditions || []);
    setSelectedAllergies(patient.allergies || []);
  }, [patientId]);

  // CPR validation
  function isCprUnique(value: string) {
    const patients = getAllPatients();
    return !patients.some((p) => p.cpr === value && p.id !== patientId);
  }

  // Submit handler
  function handleSubmit() {
    // Reset errors
    setNameError("");
    setCprError("");
    setAgeError("");
    setHeightError("");
    setWeightError("");

    let hasError = false;

    // Name validation
    if (!name.trim()) {
      setNameError("Name is required");
      hasError = true;
    }

    // CPR validation
    if (!cpr.trim()) {
      setCprError("CPR is required");
      hasError = true;
    } else if (!/^\d{10}$/.test(cpr)) {
      setCprError("CPR must be exactly 10 digits");
      hasError = true;
    } else if (!isCprUnique(cpr)) {
      setCprError("CPR already exists!");
      hasError = true;
    }

    // Age validation
    if (!age) {
      setAgeError("Age is required");
      hasError = true;
    } else if (Number(age) <= 0) {
      setAgeError("Age must be a positive number");
      hasError = true;
    }

    // Height validation
    if (!height) {
      setHeightError("Height is required");
      hasError = true;
    } else if (Number(height) <= 0) {
      setHeightError("Height must be a positive number");
      hasError = true;
    }

    // Weight validation
    if (!weight) {
      setWeightError("Weight is required");
      hasError = true;
    } else if (Number(weight) <= 0) {
      setWeightError("Weight must be a positive number");
      hasError = true;
    }

    if (hasError) return;

    const bmi = Number(weight) / (Number(height) / 100) ** 2;

    const patientData = {
      name,
      cpr,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      bmi,
      conditions: selectedConditions,
      allergies: selectedAllergies,
    };

    if (patientId) {
      updatePatient(patientId, patientData);
      setSuccessMessage("Updated Successfully");
    } else {
      addPatient(patientData);
      setSuccessMessage("Created Successfully");
    }

    setShowSuccessModal(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-6 border">
        <h2 className="text-center text-blue-600 text-2xl font-semibold mb-6">
          {patientId ? "Update Patient" : "New Patient"}
        </h2>

        {/* Patient Info */}
        <div className="border rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-4">Patient Information</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor={fullNameId} className="block text-sm mb-1">
                Full Name
              </label>

              <input
                id={fullNameId}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                onBlur={() => {
                  if (!name.trim()) {
                    setNameError("Name is required");
                  }
                }}
                className="border rounded-lg p-2 w-full"
              />

              <div className="min-h-5">
                {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
              </div>
            </div>
            <div>
              <label htmlFor={idNumberId} className="block text-sm mb-1">
                CPR
              </label>
              <input
                id={idNumberId}
                value={cpr}
                onChange={(e) => {
                  setCpr(e.target.value);
                  setCprError("");
                }}
                onBlur={() => {
                  if (!cpr.trim()) {
                    setCprError("CPR is required");
                  } else if (!/^\d{10}$/.test(cpr)) {
                    setCprError("CPR must be exactly 10 digits");
                  } else if (!isCprUnique(cpr)) {
                    setCprError("CPR already exists!");
                  }
                }}
                className="border rounded-lg p-2 w-full"
              />
              {cprError && <p className="text-red-500 text-sm">{cprError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <input
                id={ageId}
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setAgeError("");
                }}
                onBlur={() => {
                  if (!age) {
                    setAgeError("Age is required");
                  } else if (Number(age) <= 0) {
                    setAgeError("Age must be positive");
                  }
                }}
                className="border p-2 rounded"
              />

              <div className="min-h-5">
                {ageError && <p className="text-red-500 text-sm">{ageError}</p>}
              </div>
            </div>

            <div className="flex flex-col">
              <input
                id={heightId}
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setHeightError("");
                }}
                onBlur={() => {
                  if (!height) {
                    setHeightError("Height is required");
                  } else if (Number(height) <= 0) {
                    setHeightError("Height must be positive");
                  }
                }}
                className="border p-2 rounded"
              />

              <div className="min-h-5">
                {heightError && <p className="text-red-500 text-sm">{heightError}</p>}
              </div>
            </div>

            <div className="flex flex-col">
              <input
                id={weightId}
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setWeightError("");
                }}
                onBlur={() => {
                  if (!weight) {
                    setWeightError("Weight is required");
                  } else if (Number(weight) <= 0) {
                    setWeightError("Weight must be positive");
                  }
                }}
                className="border p-2 rounded"
              />

              <div className="min-h-5">
                {weightError && <p className="text-red-500 text-sm">{weightError}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="border rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-4">Medical Conditions</h3>

          <div className="grid grid-cols-2 gap-3">
            {conditions.map((item) => (
              <label key={item.key} className="flex gap-2 border p-2 rounded">
                <input
                  type="checkbox"
                  value={item.displayName}
                  checked={selectedConditions.includes(item.displayName)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedConditions([
                        ...selectedConditions,
                        item.displayName,
                      ]);
                    } else {
                      setSelectedConditions(
                        selectedConditions.filter((c) => c !== item.displayName),
                      );
                    }
                  }}
                />
                {item.displayName}
              </label>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-3 text-sm text-gray-600">
            Selected: {selectedConditions.join(", ") || "None"}
          </div>
        </div>

        {/* Allergies */}
        <div className="border rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-4">Allergies</h3>

          <div className="grid grid-cols-3 gap-3">
            {allergies.map((item) => (
              <label key={item.key} className="flex gap-2 border p-2 rounded">
                <input
                  type="checkbox"
                  value={item.key}
                  checked={selectedAllergies.includes(item.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAllergies([...selectedAllergies, item.key]);
                    } else {
                      setSelectedAllergies(
                        selectedAllergies.filter((a) => a !== item.key),
                      );
                    }
                  }}
                />
                {item.displayName}
              </label>
            ))}
          </div>

          {/* Custom allergy */}
          <input
            type="text"
            placeholder="Add custom allergy"
            className="border p-2 rounded mt-3 w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value) {
                  setSelectedAllergies([...selectedAllergies, value]);
                  e.currentTarget.value = "";
                }
              }
            }}
          />

          {/* Preview */}
          <div className="mt-3 text-sm text-gray-600">
            Selected: {selectedAllergies.join(", ") || "None"}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={() => navigate({ to: "/" })}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {patientId ? "Update" : "Create"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[320px] shadow-lg text-center">
            <h2 className="text-xl font-semibold text-blue-700 mb-6">
              {successMessage}
            </h2>

            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setShowSuccessModal(false);
                navigate({ to: "/" });
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
