import { useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../../constants/styles";
import { AuthContext } from "../../../store/auth-context";
import Input from "../ManageExpense/Input";
import Button from "../UI/Button";
import LoadingOverlay from "../UI/LoadingOverlay";

function AuthForm({ isLogin, onSwitchMode }) {
  const authCtx = useContext(AuthContext);

  const [inputs, setInputs] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function inputChangedHandler(inputIdentifier, enteredValue) {
    setInputs((curInputs) => {
      return {
        ...curInputs,
        [inputIdentifier]: enteredValue,
      };
    });
  }

  function validateInputs() {
    const emailIsValid = inputs.email.includes("@");
    const passwordIsValid = inputs.password.trim().length >= 6;
    const fullNameIsValid = inputs.fullName.trim().length > 0;
    const passwordsMatch = inputs.password === inputs.confirmPassword;

    if (isLogin) {
      return emailIsValid && passwordIsValid;
    }

    return emailIsValid && passwordIsValid && fullNameIsValid && passwordsMatch;
  }

  async function submitHandler() {
    if (!validateInputs()) {
      Alert.alert(
        "Invalid input",
        isLogin
          ? "Please enter a valid email and a password with at least 6 characters."
          : "Please check your full name, email, password, and confirm password fields.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await authCtx.login({
          email: inputs.email.trim(),
          password: inputs.password,
        });
      } else {
        await authCtx.signup({
          full_name: inputs.fullName.trim(),
          email: inputs.email.trim(),
          password: inputs.password,
        });
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Authentication failed. Please try again.";

      Alert.alert("Authentication failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  return (
    <ScrollView style={styles.root}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>
          {isLogin ? "Welcome Back" : "Create Your Account"}
        </Text>

        {!isLogin && (
          <Input
            label="Full Name"
            textInputConfig={{
              value: inputs.fullName,
              onChangeText: inputChangedHandler.bind(this, "fullName"),
              autoCapitalize: "words",
            }}
          />
        )}

        <Input
          label="Email Address"
          textInputConfig={{
            value: inputs.email,
            onChangeText: inputChangedHandler.bind(this, "email"),
            keyboardType: "email-address",
            autoCapitalize: "none",
            autoCorrect: false,
          }}
        />

        <Input
          label="Password"
          textInputConfig={{
            value: inputs.password,
            onChangeText: inputChangedHandler.bind(this, "password"),
            secureTextEntry: true,
            autoCapitalize: "none",
            autoCorrect: false,
          }}
        />

        {!isLogin && (
          <Input
            label="Confirm Password"
            textInputConfig={{
              value: inputs.confirmPassword,
              onChangeText: inputChangedHandler.bind(this, "confirmPassword"),
              secureTextEntry: true,
              autoCapitalize: "none",
              autoCorrect: false,
            }}
          />
        )}

        <View style={styles.buttons}>
          <Button onPress={submitHandler}>
            {isLogin ? "Log In" : "Sign Up"}
          </Button>

          <Button onPress={onSwitchMode} mode="flat">
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

export default AuthForm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  authContainer: {
    marginTop: 64,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: GlobalStyles.colors.primary800,
    elevation: 2,
    shadowColor: "black",
    shadowOpacity: 0.35,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  buttons: {
    marginTop: 8,
  },
});
