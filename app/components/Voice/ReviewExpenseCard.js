import { StyleSheet, Text, View } from "react-native";

import Input from "../ManageExpense/Input";
import CategoryPicker from "../ManageExpense/CategoryPicker";
import { GlobalStyles } from "../../../constants/styles";

function ReviewExpenseCard({
  index,
  expense,
  categories,
  onChangeField,
  onChangeCategorySelection,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Expense #{index + 1}</Text>

      {typeof expense.confidence === "number" ? (
        <Text style={styles.metaText}>
          Confidence: {(expense.confidence * 100).toFixed(0)}%
        </Text>
      ) : null}

      {expense.notes ? <Text style={styles.notes}>{expense.notes}</Text> : null}

      <Input
        label="Description"
        textInputConfig={{
          value: expense.description,
          onChangeText: onChangeField.bind(this, expense.id, "description"),
        }}
      />

      <View style={styles.row}>
        <Input
          style={styles.rowInput}
          label="Amount"
          textInputConfig={{
            value: expense.amount,
            keyboardType: "decimal-pad",
            onChangeText: onChangeField.bind(this, expense.id, "amount"),
          }}
        />
        <Input
          style={styles.rowInput}
          label="Date"
          textInputConfig={{
            value: expense.date,
            placeholder: "YYYY-MM-DD",
            maxLength: 10,
            onChangeText: onChangeField.bind(this, expense.id, "date"),
          }}
        />
      </View>

      <CategoryPicker
        label="Category"
        selectedValue={expense.categorySelection}
        onValueChange={onChangeCategorySelection.bind(this, expense.id)}
        categories={categories}
        extraItems={[{ label: "Create new category", value: "__new__" }]}
      />

      {expense.categorySelection === "__new__" ? (
        <Input
          label="New Category Name"
          textInputConfig={{
            value: expense.newCategoryName,
            onChangeText: onChangeField.bind(
              this,
              expense.id,
              "newCategoryName",
            ),
            autoCapitalize: "words",
          }}
        />
      ) : null}
    </View>
  );
}

export default ReviewExpenseCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: GlobalStyles.colors.primary500,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  metaText: {
    color: GlobalStyles.colors.primary100,
    marginBottom: 4,
  },
  notes: {
    color: GlobalStyles.colors.accent500,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowInput: {
    flex: 1,
  },
});
