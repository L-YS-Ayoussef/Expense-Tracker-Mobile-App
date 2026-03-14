import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../../constants/styles";
import Button from "../UI/Button";
import CategoryPicker from "../ManageExpense/CategoryPicker";

function MoveExpenseModal({
  visible,
  expense,
  categories,
  isSubmitting,
  onClose,
  onConfirm,
}) {
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    if (visible && expense) {
      setSelectedValue(expense.category_id ? String(expense.category_id) : "");
    }
  }, [visible, expense]);

  function submitHandler() {
    const nextCategoryId = selectedValue ? Number(selectedValue) : null;
    onConfirm(nextCategoryId);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Move Expense</Text>
          <Text style={styles.description}>
            {expense
              ? `Move "${expense.description}" to another category.`
              : ""}
          </Text>

          <CategoryPicker
            label="New category"
            selectedValue={selectedValue}
            onValueChange={setSelectedValue}
            categories={categories}
          />

          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color="white"
              style={styles.loader}
            />
          ) : null}

          <View style={styles.buttonsRow}>
            <Button style={styles.button} mode="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button style={styles.button} onPress={submitHandler}>
              Move
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default MoveExpenseModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: GlobalStyles.colors.primary700,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    color: GlobalStyles.colors.primary100,
    marginBottom: 8,
    lineHeight: 20,
  },
  loader: {
    marginTop: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  button: {
    minWidth: 110,
    marginLeft: 8,
  },
});
