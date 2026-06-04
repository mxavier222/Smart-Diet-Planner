import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/Header";

export const Route = createRootRoute({
	component: RootLayout,
});

function RootLayout() {
	return (
		<>
			<Header />
			<main>
				<Outlet />
			</main>
			<TanStackRouterDevtools position="bottom-right" />
			<ReactQueryDevtools initialIsOpen={false} />
		</>
	);
}
