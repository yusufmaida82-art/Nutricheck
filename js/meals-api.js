const API_URL = (globalThis.NUTRICHECK_API_URL || "http://localhost:3000").replace(/\/$/, "");
const MEALS_URL = `${API_URL}/meals`;

async function request(url, options = {}) {
    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers: { "Content-Type": "application/json", ...options.headers }
        });
    } catch {
        throw new Error("Could not reach the menu server. Check that the API is running.");
    }

    if (!response.ok) {
        throw new Error(`The server could not complete the request (${response.status}).`);
    }
    if (response.status === 204) return null;
    return response.json();
}

export function validateMeal(meal) {
    const name = String(meal.name || "").trim();
    const ingredients = String(meal.ingredients || "").trim();
    const price = Number(meal.price);
    if (name.length < 2) throw new Error("Enter a meal name with at least 2 characters.");
    if (!ingredients) throw new Error("Please list the meal ingredients.");
    if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a price greater than zero.");
    return { ...meal, name, ingredients, price };
}

export const getMeals = () => request(MEALS_URL);

export function createMeal(meal) {
    return request(MEALS_URL, { method: "POST", body: JSON.stringify(validateMeal(meal)) });
}

export function replaceMeal(id, meal) {
    return request(`${MEALS_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ ...validateMeal(meal), id: String(id) })
    });
}

export function updateMeal(id, changes) {
    return request(`${MEALS_URL}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    });
}

export function removeMeal(id) {
    return request(`${MEALS_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
