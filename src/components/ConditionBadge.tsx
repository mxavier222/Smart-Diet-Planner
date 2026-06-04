interface ConditionBadgeProps {
	condition: string;
}

const conditionStyles: Record<string, string> = {
	"Type 2 Diabetes": "text-orange-600",
	"CKD Stage 3": "text-blue-600",
	"CKD Stage 4": "text-blue-800",
	Hypertension: "text-green-600",
	"Celiac Disease": "text-purple-600",
	Hyperlipidemia: "text-pink-600",
};

export default function ConditionBadge({ condition }: ConditionBadgeProps) {
	const styles = conditionStyles[condition] ?? "text-gray-600";

	return <span className={`text-xs font-semibold ${styles}`}>{condition}</span>;
}
