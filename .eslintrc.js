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
        // es12: true,
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
        'no-console': 'off',
        // A temporary hack related to IDE not resolving correct package.json
        'import/no-extraneous-dependencies': 'off',
        'import/no-dynamic-require': 'off',
        'import/prefer-default-export': 'off',
        // '@typescript-eslint/no-inferrable-types': 2,
        'react/jsx-filename-extension': [1, {extensions: ['.js', '.jsx']}],
        'react/prop-types': 'off',
        'react-hooks/exhaustive-deps': 'off',

        'global-require': 'off',
        'prefer-promise-reject-errors': 'off',
        camelcase: 'off',
        'no-restricted-syntax': 'off',
        radix: 'off',
        'consistent-return': 'off',
        'no-param-reassign': 'off',
        'react/jsx-props-no-spreading': 'off',
        'no-use-before-define': 'off',
    },
    settings: {
        node: {
            resolvePaths: [__dirname],
        },
    },
}
