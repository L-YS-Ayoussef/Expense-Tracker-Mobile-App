import { api } from "./api";
import { getFormattedDate, parseExpenseDate } from "./date";

function normalizeExpense(expense) {
  return {
    id: expense.id,
    description: expense.description,
    amount: Number(expense.amount),
    date: parseExpenseDate(expense.date),
    category_id: expense.category_id ?? null,
    category_name: expense.category_name ?? null,
    source: expense.source ?? "manual",
  };
}

export async function parseExpenseTranscript(transcript, date = new Date()) {
  const response = await api.post("/ai/parse-expense-transcript", {
    transcript,
    client_local_date: getFormattedDate(date),
  });

  return response.data;
}

export async function commitParsedExpenses(payload) {
  const response = await api.post("/ai/commit-parsed-expenses", payload);

  return {
    created_categories: response.data.created_categories ?? [],
    created_expenses: (response.data.created_expenses ?? []).map(
      normalizeExpense,
    ),
  };
}
