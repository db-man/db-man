# ISSUES

## Issue 1: Internal import path issue

We have internal import path issue when using internal import for `@db-man/components`.

```tsx
import CommonPageContext from 'contexts/commonPage';
import NotFound from 'components/NotFound';
```

When using @db-man/components ES module (`lib` dir) in db-man.github.io, you will see the following error when running `npm start`:

```
Failed to compile.

Module not found: Error: Can't resolve 'contexts/commonPage' in '/Users/devin/source/github.com/db-man/db-man.github.io/node_modules/@db-man/components/lib/layout'
ERROR in ./node_modules/@db-man/components/lib/layout/CommonPageWrapper.js 12:41-71
Module not found: Error: Can't resolve 'contexts/commonPage' in '/Users/devin/source/github.com/db-man/db-man.github.io/node_modules/@db-man/components/lib/layout'

ERROR in ./node_modules/@db-man/components/lib/layout/CommonPageWrapper.js 14:39-69
Module not found: Error: Can't resolve 'components/NotFound' in '/Users/devin/source/github.com/db-man/db-man.github.io/node_modules/@db-man/components/lib/layout'

ERROR in ./node_modules/@db-man/components/lib/pages/CreateDb/index.js 12:41-71
Module not found: Error: Can't resolve 'contexts/commonPage' in '/Users/devin/source/github.com/db-man/db-man.github.io/node_modules/@db-man/components/lib/pages/CreateDb'
```

The current solution is to use relative import path for `@db-man/components`:

```tsx
import CommonPageContext from '../contexts/commonPage';
import NotFound from '../components/NotFound';
```
