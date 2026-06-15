module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Tamagui ("prepare for setup"): once @tamagui/* is installed, enable its
    // optimizing compiler here, e.g.:
    // plugins: [
    //   ["@tamagui/babel-plugin", {
    //     components: ["tamagui"],
    //     config: "./tamagui.config.ts",
    //     logTimings: true,
    //   }],
    // ],
  };
};
