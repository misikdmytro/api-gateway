import pluginJs from '@eslint/js'
import globals from 'globals'

export default [
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    {
        files: ['**/__tests__/**/*'],
        languageOptions: { globals: globals.jest },
    },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
]
