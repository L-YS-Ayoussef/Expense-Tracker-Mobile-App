import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { GlobalStyles } from "../../../constants/styles";

function CategoryPicker({
  label,
  selectedValue,
  onValueChange,
  categories,
  invalid,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, invalid && styles.invalidLabel]}>
        {label}
      </Text>
      <View
        style={[
          styles.pickerContainer,
          invalid && styles.invalidPickerContainer,
        ]}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="white"
        >
          <Picker.Item label="Uncategorized" value="" />
          {categories.map((category) => (
            <Picker.Item
              key={category.id}
              label={category.name}
              value={String(category.id)}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export default CategoryPicker;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    color: GlobalStyles.colors.primary100,
    marginBottom: 4,
  },
  invalidLabel: {
    color: GlobalStyles.colors.error500,
  },
  pickerContainer: {
    backgroundColor: GlobalStyles.colors.primary100,
    borderRadius: 6,
    overflow: "hidden",
  },
  invalidPickerContainer: {
    backgroundColor: GlobalStyles.colors.error50,
  },
  picker: {
    color: GlobalStyles.colors.primary700,
  },
});
