import { useContext, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../components/UI/Button";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import ReviewExpenseCard from "../components/Voice/ReviewExpenseCard";
import { CategoriesContext } from "../../store/categories-context";
import { ExpensesContext } from "../../store/expenses-context";
import { GlobalStyles } from "../../constants/styles";
import { commitParsedExpenses } from "../../util/ai";

function buildEditableExpense(expense, index) {
  const hasExistingCategory =
    expense.category_action === "existing" && expense.category_id;

  return {
    id: `${index}-${expense.description}-${expense.amount}`,
    description: expense.description ?? "",
    amount: String(expense.amount ?? ""),
    date: expense.date ?? "",
    categorySelection: hasExistingCategory
      ? String(expense.category_id)
      : "__new__",
    category_id: expense.category_id ?? null,
    category_name: expense.category_name ?? "",
    category_action: hasExistingCategory ? "existing" : "create",
    newCategoryName:
      expense.category_action === "create" ? (expense.category_name ?? "") : "",
    confidence: expense.confidence ?? null,
    notes: expense.notes ?? null,
  };
}

function AIExpenseReviewScreen({ route, navigation }) {
  const categoriesCtx = useContext(CategoriesContext);
  const expensesCtx = useContext(ExpensesContext);
  const parseResult = route.params?.parseResult;

  const [expenses, setExpenses] = useState(() =>
    (parseResult?.expenses || []).map((expense, index) =>
      buildEditableExpense(expense, index),
    ),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoriesById = useMemo(() => {
    const map = {};
    for (const category of categoriesCtx.categories) {
      map[String(category.id)] = category;
    }
    return map;
  }, [categoriesCtx.categories]);

  function changeFieldHandler(expenseId, field, value) {
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === expenseId ? { ...expense, [field]: value } : expense,
      ),
    );
  }

  function changeCategorySelectionHandler(expenseId, selectedValue) {
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) => {
        if (expense.id !== expenseId) {
          return expense;
        }

        if (selectedValue === "__new__") {
          return {
            ...expense,
            categorySelection: "__new__",
            category_action: "create",
            category_id: null,
            newCategoryName:
              expense.newCategoryName || expense.category_name || "",
          };
        }

        const selectedCategory = categoriesById[selectedValue];

        return {
          ...expense,
          categorySelection: selectedValue,
          category_action: selectedCategory ? "existing" : "create",
          category_id: selectedCategory ? selectedCategory.id : null,
          category_name: selectedCategory
            ? selectedCategory.name
            : expense.category_name,
        };
      }),
    );
  }

  function buildReviewedPayload() {
    return {
      transcript: parseResult?.transcript ?? "",
      expenses: expenses.map((expense) => {
        if (expense.categorySelection === "__new__") {
          return {
            description: expense.description.trim(),
            amount: Number(expense.amount),
            date: expense.date.trim(),
            category_id: null,
            category_name: expense.newCategoryName.trim(),
            category_action: "create",
          };
        }

        const selectedCategory = categoriesById[expense.categorySelection];

        return {
          description: expense.description.trim(),
          amount: Number(expense.amount),
          date: expense.date.trim(),
          category_id: selectedCategory?.id ?? null,
          category_name: selectedCategory?.name ?? null,
          category_action: "existing",
        };
      }),
    };
  }

  function validateReviewedPayload(reviewedPayload) {
    const invalidExpense = reviewedPayload.expenses.find((expense) => {
      const descriptionIsValid = expense.description.length > 0;
      const amountIsValid = !isNaN(expense.amount) && expense.amount > 0;
      const dateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(expense.date);
      const categoryIsValid =
        expense.category_action === "existing"
          ? true
          : expense.category_name && expense.category_name.trim().length > 0;

      return (
        !descriptionIsValid ||
        !amountIsValid ||
        !dateIsValid ||
        !categoryIsValid
      );
    });

    return !invalidExpense;
  }

  async function confirmHandler() {
    const reviewedPayload = buildReviewedPayload();

    if (!validateReviewedPayload(reviewedPayload)) {
      Alert.alert(
        "Invalid review data",
        "Please check descriptions, amounts, dates, and any new category names.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await commitParsedExpenses(reviewedPayload);

      if (result.created_categories.length > 0) {
        categoriesCtx.addCategories(result.created_categories);
      }

      if (result.created_expenses.length > 0) {
        expensesCtx.addExpenses(result.created_expenses);
      }

      Alert.alert("Success", "Expenses saved successfully!");

      navigation.popToTop();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Could not save reviewed expenses.";
      Alert.alert("Save failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!parseResult) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No parse result found.</Text>
      </View>
    );
  }

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Review Parsed Expenses</Text>
      <Text style={styles.subtitle}>{parseResult.transcript}</Text>

      {parseResult.clarification_message ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            {parseResult.clarification_message}
          </Text>
        </View>
      ) : null}

      {expenses.map((expense, index) => (
        <ReviewExpenseCard
          key={expense.id}
          index={index}
          expense={expense}
          categories={categoriesCtx.categories}
          onChangeField={changeFieldHandler}
          onChangeCategorySelection={changeCategorySelectionHandler}
        />
      ))}

      <View style={styles.actions}>
        <Button mode="flat" onPress={() => navigation.goBack()}>
          Back
        </Button>
        <Button onPress={confirmHandler}>Save Expenses</Button>
      </View>
    </ScrollView>
  );
}

export default AIExpenseReviewScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  content: {
    padding: 24,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: GlobalStyles.colors.primary100,
    marginBottom: 16,
    textAlign: "center",
  },
  noticeBox: {
    backgroundColor: GlobalStyles.colors.primary500,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    color: GlobalStyles.colors.accent500,
    textAlign: "center",
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: GlobalStyles.colors.primary700,
  },
  emptyText: {
    color: "white",
  },
});
