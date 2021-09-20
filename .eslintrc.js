module.exports = {
	extends: [
		'airbnb',
		'plugin:react/recommended',
		'plugin:import/recommended',
		'prettier',
		'plugin:prettier/recommended',
		'plugin:jest/recommended',
		'plugin:promise/recommended',
		'plugin:compat/recommended',
		'plugin:react-hooks/recommended',
	],
	env: {
		browser: true,
		node: true,
	},
	// parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 12,
		// sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	rules: {
		// A temporary hack related to IDE not resolving correct package.json
		'import/no-extraneous-dependencies': 'off',

		// '@typescript-eslint/no-inferrable-types': 2,
		'react/jsx-filename-extension': [1, {extensions: ['.js', '.jsx']}],
	},
	// settings: {
	//   "import/resolver": {
	//     // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
	//     node: {},
	//     webpack: {
	//       config: require.resolve("./.erb/configs/webpack.config.eslint.js"),
	//     },
	//   },
	// },
}
