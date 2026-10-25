import { createMeal, getMeals, removeMeal, replaceMeal, updateMeal, validateMeal } from "./meals-api.js";

const grid = document.querySelector("#menu-grid");
if (grid) {
    const status = document.querySelector("#menu-status");
    const emptyState = document.querySelector("#empty-state");
    const form = document.querySelector("#add-meal-form");
    const searchForm = document.querySelector("#menu-search-form");
    const searchInput = document.querySelector("#menu-search");
    const categoryFilter = document.querySelector("#category-filter");
    const dietaryFilter = document.querySelector("#diet-filter");
    const meals = [];
    let cartCount = 0;

    function announce(message, isError = false) {
        status.textContent = message;
        status.classList.toggle("error-message", isError);
    }

    function renderMeals() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value;
        const dietary = dietaryFilter.value;
        const filtered = meals.filter((meal) => {
            const matchesText = `${meal.name} ${meal.ingredients}`.toLowerCase().includes(query);
            return matchesText && (category === "all" || meal.category === category) &&
                (dietary === "all" || meal.dietary === dietary);
        });

        grid.replaceChildren();
        emptyState.hidden = filtered.length > 0;
        filtered.forEach((meal) => {
            const card = document.createElement("article");
            card.className = "menu-card";
            const title = document.createElement("h3");
            title.textContent = meal.name;
            const description = document.createElement("p");
            description.textContent = meal.description || "A fresh choice from our kitchen.";
            const details = document.createElement("p");
            details.textContent = `Ingredients: ${meal.ingredients}`;
            const price = document.createElement("p");
            price.textContent = `KSh ${Number(meal.price).toFixed(2)} · ${meal.available === false ? "Unavailable" : "Available"}`;

            const addButton = document.createElement("button");
            addButton.type = "button";
            addButton.textContent = "Add to cart";
            addButton.disabled = meal.available === false;
            addButton.addEventListener("click", () => {
                cartCount += 1;
                document.querySelector("#cart-count").textContent = cartCount;
                announce(`${meal.name} added to your cart.`);
            });

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn-secondary";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editMeal(meal));

            const availabilityButton = document.createElement("button");
            availabilityButton.type = "button";
            availabilityButton.className = "btn-secondary";
            availabilityButton.textContent = meal.available === false ? "Mark available" : "Mark unavailable";
            availabilityButton.addEventListener("click", () => toggleAvailability(meal));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn-secondary";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteMeal(meal));

            card.append(title, description, details, price, addButton, editButton, availabilityButton, deleteButton);
            grid.append(card);
        });
    }

    async function loadMeals() {
        announce("Loading meals…");
        try {
            meals.splice(0, meals.length, ...await getMeals());
            renderMeals();
            announce(`${meals.length} meals loaded.`);
        } catch (error) {
            announce(error.message, true);
        }
    }

    async function editMeal(meal) {
        const name = window.prompt("Meal name", meal.name);
        if (name === null) return;
        const ingredients = window.prompt("Ingredients", meal.ingredients);
        if (ingredients === null) return;
        const priceInput = window.prompt("Price in KSh", meal.price);
        if (priceInput === null) return;
        const updated = { ...meal, name, ingredients, price: priceInput };
        try {
            validateMeal(updated);
            Object.assign(meal, await replaceMeal(meal.id, updated));
            renderMeals();
            announce("Meal updated.");
        } catch (error) {
            announce(error.message, true);
        }
    }

    async function toggleAvailability(meal) {
        try {
            Object.assign(meal, await updateMeal(meal.id, { available: meal.available === false }));
            renderMeals();
            announce("Meal availability updated.");
        } catch (error) {
            announce(error.message, true);
        }
    }

    async function deleteMeal(meal) {
        if (!window.confirm(`Delete ${meal.name}?`)) return;
        try {
            await removeMeal(meal.id);
            meals.splice(meals.indexOf(meal), 1);
            renderMeals();
            announce("Meal deleted.");
        } catch (error) {
            announce(error.message, true);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const newMeal = Object.fromEntries(formData.entries());
        newMeal.available = true;
        try {
            validateMeal(newMeal);
            meals.push(await createMeal(newMeal));
            form.reset();
            renderMeals();
            announce("Meal added to the menu.");
        } catch (error) {
            announce(error.message, true);
        }
    });

    searchForm.addEventListener("submit", (event) => event.preventDefault());
    searchInput.addEventListener("input", renderMeals);
    categoryFilter.addEventListener("change", renderMeals);
    dietaryFilter.addEventListener("change", renderMeals);
    document.querySelector("#clear-filters").addEventListener("click", () => {
        searchInput.value = "";
        categoryFilter.value = "all";
        dietaryFilter.value = "all";
        renderMeals();
    });

    loadMeals();
}
