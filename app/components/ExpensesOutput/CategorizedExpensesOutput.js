import { FlatList, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../../constants/styles";
import ExpensesSummary from "./ExpensesSummary";
import CategoryGroupCard from "./CategoryGroupCard";

function buildExpenseGroups(expenses, categories) {
  const groups = categories.map((category) => ({
    id: `category-${category.id}`,
    categoryId: category.id,
    name: category.name,
    category,
    expenses: [],
    count: 0,
    total: 0,
    isUncategorized: false,
  }));

  const groupMap = new Map(groups.map((group) => [group.categoryId, group]));

  const uncategorizedGroup = {
    id: "uncategorized",
    categoryId: null,
    name: "Uncategorized",
    category: null,
    expenses: [],
    count: 0,
    total: 0,
    isUncategorized: true,
  };

  for (const expense of expenses) {
    if (expense.category_id && groupMap.has(expense.category_id)) {
      const group = groupMap.get(expense.category_id);
      group.expenses.push(expense);
      group.count += 1;
      group.total += expense.amount;
      continue;
    }

    uncategorizedGroup.expenses.push(expense);
    uncategorizedGroup.count += 1;
    uncategorizedGroup.total += expense.amount;
  }

  if (uncategorizedGroup.count > 0) {
    groups.push(uncategorizedGroup);
  }

  return groups;
}

function CategorizedExpensesOutput({
  expenses,
  categories,
  expandedIds,
  onToggleGroup,
  onRenameCategory,
  onDeleteCategory,
  onMoveExpense,
}) {
  const groups = buildExpenseGroups(expenses, categories);

  return (
    <View style={styles.container}>
      <ExpensesSummary expenses={expenses} periodName="Total" />

      {groups.length === 0 ? (
        <Text style={styles.infoText}>No registered expenses found!</Text>
      ) : (
        <FlatList
          data={groups}
          renderItem={({ item }) => (
            <CategoryGroupCard
              group={item}
              isExpanded={expandedIds.includes(item.id)}
              onToggle={() => onToggleGroup(item.id)}
              onRenameCategory={
                item.isUncategorized
                  ? undefined
                  : () => onRenameCategory(item.category)
              }
              onDeleteCategory={
                item.isUncategorized
                  ? undefined
                  : () => onDeleteCategory(item.category, item.count)
              }
              onMoveExpense={onMoveExpense}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

export default CategorizedExpensesOutput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  infoText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});
