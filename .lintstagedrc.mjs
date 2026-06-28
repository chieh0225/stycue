/** @type {import("lint-staged").Configuration} */
const config = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,yml,yaml,css,md}': ['prettier --write'],
};

export default config;
