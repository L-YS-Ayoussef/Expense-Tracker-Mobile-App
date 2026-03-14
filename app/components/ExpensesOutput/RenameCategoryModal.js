import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { GlobalStyles } from "../../../constants/styles";
import Button from "../UI/Button";

function RenameCategoryModal({
  visible,
  category,
  isSubmitting,
  onClose,
  onConfirm,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && category) {
      setName(category.name);
      setError("");
    }
  }, [visible, category]);

  function submitHandler() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    onConfirm(trimmedName);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Rename Category</Text>
          <Text style={styles.label}>Category name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Enter category name"
            placeholderTextColor={GlobalStyles.colors.primary200}
            autoCapitalize="words"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
              Save
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default RenameCategoryModal;

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
    marginBottom: 16,
  },
  label: {
    color: GlobalStyles.colors.primary100,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: GlobalStyles.colors.primary100,
    color: GlobalStyles.colors.primary700,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: GlobalStyles.colors.error50,
    marginTop: 8,
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
