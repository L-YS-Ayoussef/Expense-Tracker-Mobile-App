import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../../constants/styles";
import ExpenseItem from "./ExpenseItem";
import IconButton from "../UI/IconButton";

function CategoryGroupCard({
  group,
  isExpanded,
  onToggle,
  onRenameCategory,
  onDeleteCategory,
  onMoveExpense,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Pressable
          style={({ pressed }) => [
            styles.headerPressable,
            pressed && styles.pressed,
          ]}
          onPress={onToggle}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{group.name}</Text>
            <Text style={styles.subtitle}>{group.count} expense(s)</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.total}>${group.total.toFixed(2)}</Text>
            <Ionicons
              name={isExpanded ? "chevron-down" : "chevron-forward"}
              size={20}
              color="white"
            />
          </View>
        </Pressable>

        {!group.isUncategorized ? (
          <View style={styles.actionsRow}>
            <IconButton
              icon="create-outline"
              size={20}
              color="white"
              onPress={onRenameCategory}
            />
            <IconButton
              icon="trash-outline"
              size={20}
              color={GlobalStyles.colors.error50}
              onPress={onDeleteCategory}
            />
          </View>
        ) : null}
      </View>

      {isExpanded ? (
        <View style={styles.expensesContainer}>
          {group.expenses.length === 0 ? (
            <Text style={styles.emptyText}>
              No expenses in this category yet.
            </Text>
          ) : (
            group.expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                {...expense}
                hideCategoryBadge
                showMoveButton
                onMovePress={() => onMoveExpense(expense)}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

export default CategoryGroupCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: GlobalStyles.colors.primary800,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  title: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
  subtitle: {
    color: GlobalStyles.colors.primary100,
    marginTop: 4,
    fontSize: 12,
  },
  total: {
    color: GlobalStyles.colors.accent500,
    fontWeight: "bold",
    fontSize: 15,
  },
  expensesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  emptyText: {
    color: GlobalStyles.colors.primary100,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
});
