import { create } from "zustand";

// Example store — delete this file and create your own stores in this folder
// Docs: https://zustand.docs.pmnd.rs/getting-started/introduction

interface FavoritesStore {
	/** The list of saved image URLs. */
	favorites: string[];

	/** Adds an image URL to your favorites list. */
	addFavorite: (url: string) => void;

	/** Removes an image URL from your favorites list. */
	removeFavorite: (url: string) => void;

	/** Returns true if the given URL is already in your favorites. */
	isFavorite: (url: string) => boolean;
}

/**
 * A Zustand store that keeps track of favorited dog images.
 *
 * This is client-side state only — favorites reset when you refresh the page.
 * In a real app you'd save these to a database or localStorage.
 *
 * Usage in a component:
 *
 * ```ts
 * const { favorites, addFavorite } = useFavoritesStore();
 * ```
 */
export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
	favorites: [],
	addFavorite: (url) =>
		set((state) => ({ favorites: [...state.favorites, url] })),
	removeFavorite: (url) =>
		set((state) => ({ favorites: state.favorites.filter((f) => f !== url) })),
	isFavorite: (url) => get().favorites.includes(url),
}));
