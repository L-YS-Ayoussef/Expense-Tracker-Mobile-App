import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../../constants/styles";
import Button from "../UI/Button";
import CategoryPicker from "../ManageExpense/CategoryPicker";

function DeleteCategoryModal({
  visible,
  category,
  categories,
  expenseCount,
  isSubmitting,
  onClose,
  onConfirm,
}) {
  const [replacementValue, setReplacementValue] = useState("");

  useEffect(() => {
    if (visible) {
      setReplacementValue("");
    }
  }, [visible]);

  const availableCategories = useMemo(() => {
    if (!category) {
      return categories;
    }

    return categories.filter((item) => item.id !== category.id);
  }, [categories, category]);

  function submitHandler() {
    const replacementCategoryId = replacementValue
      ? Number(replacementValue)
      : null;
    onConfirm(replacementCategoryId);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Delete Category</Text>
          <Text style={styles.description}>
            {category
              ? `Delete "${category.name}" and move ${expenseCount} expense(s).`
              : "Delete this category."}
          </Text>

          <CategoryPicker
            label="Move expenses to"
            selectedValue={replacementValue}
            onValueChange={setReplacementValue}
            categories={availableCategories}
          />

          <Text style={styles.hintText}>
            Choose "Uncategorized" to remove the category without reassigning
            the expenses.
          </Text>

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
              Delete
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default DeleteCategoryModal;

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
  hintText: {
    color: GlobalStyles.colors.primary100,
    fontSize: 12,
    marginTop: 4,
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
