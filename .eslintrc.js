module.exports = {
    extends: [
        'airbnb',
        'prettier',
        'plugin:react/recommended',
        'plugin:import/recommended',
        'plugin:prettier/recommended',
        'plugin:jest/recommended',
        'plugin:react-hooks/recommended',
    ],
    env: {
        browser: true,
        node: true,
    },
    // parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 12,
        // sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'no-unused-vars': 'off',
        // A temporary hack related to IDE not resolving correct package.json
        'import/no-extraneous-dependencies': 'off',
        'import/no-dynamic-require': 'off',
        // '@typescript-eslint/no-inferrable-types': 2,
        'react/jsx-filename-extension': [1, {extensions: ['.js', '.jsx']}],
        'react/react-in-jsx-scope': 'off',
        'global-require': 'off',
        'prefer-promise-reject-errors': 'off',
        camelcase: 'off',
        'no-restricted-syntax': 'off',
        radix: 'off',
        'consistent-return': 'off',
    },
    settings: {
        node: {
            resolvePaths: [__dirname],
        },
    },
}
