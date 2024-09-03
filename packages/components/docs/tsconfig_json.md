# tsconfig.json

## `"jsx": "react-jsx"`

The `"jsx": "react-jsx"` setting in your tsconfig.json file is used to specify how TypeScript should handle JSX syntax. This setting is particularly important for projects using React 17 or later, as it enables the new JSX Transform introduced in React 17.

**What Does "jsx": "react-jsx" Do?**

1. **Automatic JSX Runtime**: With the new JSX Transform, you no longer need to import React at the top of your files to use JSX. The "jsx": "react-jsx" setting tells TypeScript to use the new JSX runtime, which automatically imports the necessary functions from the React library behind the scenes.
2. **Improved Performance**: The new JSX Transform can lead to smaller bundle sizes and improved performance because it avoids including the entire React library in every file that uses JSX.
3. **Simplified Code**: By not requiring explicit imports of React in every file, your code becomes cleaner and easier to maintain.

**Issues**

If no `"jsx": "react-jsx"` in your tsconfig.json file, and also you don't have `import React from 'react';` at the top of your TSX files, you will see the following error after you build your project with `npm run build`:

```
ReferenceError: React is not defined
```
