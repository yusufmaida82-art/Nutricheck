import test from "node:test";
import assert from "node:assert/strict";
import { createMeal, getMeals, removeMeal, replaceMeal, updateMeal, validateMeal } from "../js/meals-api.js";

const example = { name: "Soup", ingredients: "Carrot and lentils", price: 5, category: "main", dietary: "none" };

function mockFetch(status = 200, result = { id: "4", ...example }) {
    globalThis.fetch = async (url, options = {}) => ({
        ok: status >= 200 && status < 300,
        status,
        json: async () => result,
        url,
        options
    });
}

test("validates and normalizes meal information", () => {
    assert.equal(validateMeal({ ...example, name: " Soup ", price: "5" }).name, "Soup");
    assert.throws(() => validateMeal({ ...example, name: "x" }), /at least 2/);
    assert.throws(() => validateMeal({ ...example, ingredients: " " }), /ingredients/);
    assert.throws(() => validateMeal({ ...example, price: "0" }), /greater than zero/);
});

test("GET loads meals", async () => {
    mockFetch(200, [{ id: "1", ...example }]);
    assert.equal((await getMeals()).length, 1);
});

test("POST creates a validated meal", async () => {
    mockFetch(201);
    assert.equal((await createMeal(example)).id, "4");
});

test("PUT replaces a meal", async () => {
    mockFetch();
    assert.equal((await replaceMeal("4", example)).name, "Soup");
});

test("PATCH updates a meal", async () => {
    mockFetch(200, { id: "4", available: false });
    assert.equal((await updateMeal("4", { available: false })).available, false);
});

test("DELETE removes a meal", async () => {
    mockFetch(204);
    assert.equal(await removeMeal("4"), null);
});

test("reports server and network errors", async () => {
    mockFetch(500);
    await assert.rejects(getMeals(), /500/);
    globalThis.fetch = async () => { throw new Error("offline"); };
    await assert.rejects(getMeals(), /Could not reach/);
});
