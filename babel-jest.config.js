module.exports = {
  presets: [
    // 최신 JavaScript를 지원하는 환경으로 변환
    ["@babel/preset-env", { targets: { node: "current" } }],

    // React JSX 문법 지원
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
};
