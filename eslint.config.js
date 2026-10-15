import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";

export default [{
  files: ["src/**/*.{js,jsx}"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: { react, "react-hooks": hooks },
  settings: { react: { version: "18.3" } },
  rules: {
    ...react.configs.recommended.rules,
    ...hooks.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "warn",
  },
}];
