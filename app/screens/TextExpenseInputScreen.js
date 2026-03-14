import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Button from "../components/UI/Button";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import { GlobalStyles } from "../../constants/styles";
import { parseExpenseTranscript } from "../../util/ai";

function TextExpenseInputScreen({ navigation }) {
  const [message, setMessage] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState();

  async function parseMessageHandler() {
    if (!message.trim()) {
      Alert.alert("Empty input", "Please type your expenses first.");
      return;
    }

    setIsParsing(true);
    setError(undefined);

    try {
      const result = await parseExpenseTranscript(message);
      navigation.navigate("AIExpenseReview", {
        parseResult: result,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Could not parse your text.";
      setError(message);
    } finally {
      setIsParsing(false);
    }
  }

  if (isParsing) {
    return <LoadingOverlay />;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Expenses with AI</Text>
      <Text style={styles.subtitle}>
        Type naturally, for example: “I bought coffee for 4 and took a taxi for
        8 today.”
      </Text>

      <TextInput
        style={styles.input}
        multiline
        value={message}
        onChangeText={setMessage}
        placeholder="Type what you spent..."
        placeholderTextColor={GlobalStyles.colors.primary200}
        textAlignVertical="top"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.buttons}>
        <Button onPress={parseMessageHandler}>Parse with AI</Button>
      </View>
    </ScrollView>
  );
}

export default TextExpenseInputScreen;

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
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: GlobalStyles.colors.primary100,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    minHeight: 220,
    borderRadius: 8,
    backgroundColor: GlobalStyles.colors.primary100,
    padding: 12,
    color: GlobalStyles.colors.primary700,
  },
  buttons: {
    marginTop: 16,
  },
  errorText: {
    color: GlobalStyles.colors.error500,
    marginTop: 12,
    textAlign: "center",
  },
});
