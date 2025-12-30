import next from "eslint-config-next";

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  ...next,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
