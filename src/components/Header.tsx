import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-linear-to-r from-green-600 via-emerald-500 to-lime-500 text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link to="/" className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-8 w-8 text-white"
            aria-hidden="true"
          >
            <path
              d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8-8 3.6-8 8Z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M6 12h12" strokeWidth="1.5" strokeLinecap="round" />
            <path
              d="M6.5 9.5c1 1.5 2.8 2.2 5 2.2 2.2 0 4-0.7 5-2.2"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <span className="text-lg font-semibold">Smart Diet Planner</span>
        </Link>
      </div>
    </header>
  );
}
