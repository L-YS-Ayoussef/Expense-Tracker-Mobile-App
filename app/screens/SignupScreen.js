import AuthForm from "../components/Auth/AuthForm";

function SignupScreen({ navigation }) {
  function switchAuthModeHandler() {
    navigation.replace("Login");
  }

  return <AuthForm onSwitchMode={switchAuthModeHandler} />;
}

export default SignupScreen;
