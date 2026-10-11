// Tiny pure function to demonstrate a testable frontend module.
// Actual meal logging, database access, and goals are future Sprint 1 tasks.
export function sumCalories(meals) {
  return meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0)
}
