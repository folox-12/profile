module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        '@vue/standard',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        indent: ['error', 4],
        'vue/html-indent': ['error', 4],
        semi: ['error', 'always'],
        'space-before-function-paren': ['error', 'never'],
        // 'no-shadow': ['error', { allow: ['state'] }],
        'import/prefer-default-export': 0,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-dupe-class-members': 'off',
        'vue/comment-directive': 'error',
        'vue/multi-word-component-names': 0,
        'vue/no-multiple-template-root': 0,
    }
};
