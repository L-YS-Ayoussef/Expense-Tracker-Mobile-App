import AuthForm from "../components/Auth/AuthForm";

function LoginScreen({ navigation }) {
  function switchAuthModeHandler() {
    navigation.replace("Signup");
  }

  return <AuthForm isLogin onSwitchMode={switchAuthModeHandler} />;
}

export default LoginScreen;
