# packages/github 主键类型收口计划（`PrimaryKeyVal`）

- 日期：2026-10-09
- 范围：`packages/github`（`@db-man/github`）
- 状态：**Stage 1 / 2 / 4 已完成**（提交 `72d2ee3`，**尚未推送**）；Stage 3 按计划**不做**
- 完成情况：用例 72 → 76（`GithubDb.test.ts` 净 +1、`utils.test.ts` +3）；覆盖率**与改前逐项相同**
  （整体语句 97.42% / 分支 95.18% / 函数 98.18%，`utils.ts` 仍 100%），符合「纯类型收口」预期
- 验收实测（2026-10-09，全部在最终态跑）：`tsc --noEmit --declaration false --emitDeclarationOnly false`
  exit 0；`npx jest --coverage` 76 用例全绿；`npm run build -w packages/github` exit 0；
  `npm test` 76 全绿。构建产物已刷新：`dist/GithubDb.d.ts` 的 `getRecordFileContentAndSha`
  现在是 `PrimaryKeyVal`，`dist/utils.js` / `es6/utils.js` 里**没有** `types` 的 `require`（`import type` 已擦除）
- 抽查实测结果：① 把 `GithubDb.ts` 的 `getRecordFileName(primaryKeyVal)` 换成 `` `${primaryKeyVal}.json` ``
  → **`should sanitize a primary key that is not filename safe` 确实变红**（1 failed / 33 passed），
  随后逐字节还原（`shasum` 与 `git diff | shasum` 双重比对一致）；② 删掉 `utils.ts` 的 `typeof === 'number'`
  分支 → **76 用例仍全绿**，证实两分支行为等价、本条不是回归信号
- 行号偏移（改动已发生，文内引用均为**改造前**行号）：`GithubDb.ts` 因 import 由 1 行变 7 行，
  **第 2 行之后全部 +6**（135→141、138→144、271→277、275→281、330→336）；`utils.ts` 插入了
  1 行 import + 1 行空行，**第 2 行之后全部 +2**（37→39、38→40）；`GithubDb.test.ts:148` **不受影响**
- 遗留：`TODO.md` 的 3 条登记、`2026-10-07` 那份计划的状态更新、以及**本计划文档自身**，
  已另成一个**文档提交**（紧随 `72d2ee3` 之后的那个提交），见 §9
- 用户已选：**变体 2**（新增 `PrimaryKeyVal` 别名，三处签名统一用它）
- 相关：`TODO.md` 里两条主键相关条目；`packages/components/src/components/StringFormField.tsx:59` 的既有 TODO

---

## 0. 目标

把「主键值」这个概念在 `@db-man/github` 里收成**一个名字**，并把唯一写窄了的那一处签名改对。

一句话概括改动性质：**纯类型收口 + 净新增 4 个测试用例**（共 5 个新 `it`，其中 1 个替换掉旧的那条；`GithubDb.test.ts` 净 +1、`utils.test.ts` +3）。不改运行时行为，不加防御分支。

## 1. 为什么要改（根因）

### 1.1 领域事实：主键列可以是 `STRING`，也可以是 `NUMBER`

这不是假设，仓库里有硬证据：

| 证据 | 位置 |
|---|---|
| 测试夹具的主键列就是 `NUMBER` + `primary: true`，且该表 `large: true` | `packages/cli/__test_dbs_dir__/iam/dbcfg.json` |
| 表数据里主键是 **JSON 数字** | `packages/cli/__test_dbs_dir__/iam/users.data.json`：`"userId": 1` |
| 真实网络测试把 JS `number` 当主键用 | `packages/github/src/Github.tt.ts:19`：`userId: date.valueOf()` |
| 仓库自己已经记过这条假设 | `packages/components/src/components/StringFormField.tsx:59`：<br>``// TODO why do we assume the type of primary column in a table is always `string`?`` |

### 1.2 现状：同一个概念有两种写法，其中一种是错的

源码里 `grep "string | number"` 只有 **2 处**命中，都是主键（另有 3 处是构建产物，不算新增写法：`packages/github/dist/GithubDb.d.ts:73`、`packages/github/dist/utils.d.ts:10`，以及 `packages/components/lib/components/FieldWrapperForDetailPage.d.ts:22` 里一个无关的 PropTypes 类型）：

| 位置 | 现在的签名 | 对不对 |
|---|---|---|
| `packages/github/src/utils.ts:37` `getRecordFileName` | `primaryKeyVal: string \| number` | 对 |
| `packages/github/src/GithubDb.ts:135` `getRecordPath` | `primaryKeyVal: string \| number` | 对 |
| `packages/github/src/GithubDb.ts:278` `getRecordFileContentAndSha` | `primaryKeyVal: string` | **错**（写窄了） |

补充：`GithubDb.ts:271` 的 JSDoc 写的是 `@param {string|number} primaryKeyVal`（该 JSDoc 块为 268–274 行；275 行是函数名那一行），与紧随其后的 TS 签名矛盾 —— 也就是**文档和代码都知道真相，只有签名写错了**。

### 1.3 危害：类型在说谎，下游只能靠猜绕过

`getRecordFileContentAndSha` 签名写窄的直接后果：任何想按**数字主键**读记录的地方都会撞 `TS2345`。

这不是纸上推演 —— 2026-10-09 补测时就真撞了一次：按计划传数字 `1`，`tsc` 直接报 TS2345，最后只能在测试里改传字符串 `'1'` 才通过。**一个正确的调用被类型系统拒绝**，这才是要修的点。

## 2. 范围

**做**：

- `packages/github/src/types.ts`（新增 1 个类型）
- `packages/github/src/GithubDb.ts`（2 处签名）
- `packages/github/src/utils.ts`（1 处签名 + 1 行 import）
- `packages/github/src/GithubDb.test.ts`、`packages/github/src/utils.test.ts`（4 个契约测试用例）

**不做**（本次一个字都不碰；第 1–3 条已登记在根 `TODO.md`，第 4 条是仓库级配置改动、**未登记**）：

1. 非 `split-table` 模式 + NUMBER 主键时，`row[primaryKey] === getUrlParams()[primaryKey]` 数字与字符串恒不相等 → 报 "item not found in db"
2. CLI 用 `row[pk] + ''`、`@db-man/github` 用 `validFilename(String(x))`，两套文件名规则
3. `DeleteFileType.message` 必填 vs `UpdateFileType.message` 可选
4. 全仓开 `noImplicitAny`（**未登记**；与 Stage 3 是同一件事的两端）

## 3. 变更清单（逐文件，带行号与 before/after）

### Stage 1 — 新增类型定义

**文件**：`packages/github/src/types.ts`
**位置**：文件末尾，紧跟 `DeleteFileType` 之后（该文件第 160–171 行已经是 `UpdateFileType` / `DeleteFileType` 所在处，是共享类型的家）

**新增**：

```ts
/**
 * A primary key value.
 *
 * The primary column of a table may be declared as `STRING` or as `NUMBER`, so
 * both are legal here. Converting a primary key value into a file name happens
 * in exactly one place: `utils.getRecordFileName`.
 */
export type PrimaryKeyVal = string | number;
```

编译后果：**零运行时体积**。已实测 `dist/types.js` 只有 113 字节、内容是 `__esModule` 标记，没有实际代码；纯类型会被完全擦除。

### Stage 2 — 三处签名改用它

#### 2.1 `packages/github/src/GithubDb.ts:135`（行为不变，只把字面量换成名字）

```ts
// before
  getRecordPath(dbName, tableName, primaryKeyVal: string | number) {
// after
  getRecordPath(dbName, tableName, primaryKeyVal: PrimaryKeyVal) {
```

`dbName` / `tableName` 保持隐式 `any` 不动 —— 与 Stage 3「不补显式参数类型」的决定一致，本行只做「字面量 → 类型名」的替换。

#### 2.2 `packages/github/src/GithubDb.ts:275-280` ← **这一处才是修 bug**

```ts
// before
  getRecordFileContentAndSha(
    dbName: string,
    tableName: string,
    primaryKeyVal: string,
    signal?: AbortSignal,
  ) {
// after
  getRecordFileContentAndSha(
    dbName: string,
    tableName: string,
    primaryKeyVal: PrimaryKeyVal,
    signal?: AbortSignal,
  ) {
```

函数体（第 281–282 行 `getRecordPath(...)` + `getFileContentAndSha(...)`）**一行都不动**。

#### 2.3 `packages/github/src/utils.ts`

**import**：该文件目前**没有任何 import** —— 第 1–20 行是注释块，第 28 行才是第一个导出。新 import 加在文件**最开头**（注释块之前）：

```ts
import type { PrimaryKeyVal } from './types';
```

用 `import type` 的理由：类型导入会被擦除，不会给 `utils.js` 增加运行时 `require`；且将来若有人打开 `isolatedModules` 也不会出问题。（本包 TypeScript 4.9.5，`import type` 从 3.8 起支持；`packages/components` 已有 6 处先例。）

**签名**（第 37 行）：

```ts
// before
export const getRecordFileName = (primaryKeyVal: string | number) => {
// after
export const getRecordFileName = (primaryKeyVal: PrimaryKeyVal) => {
```

**函数体保留原样，不要合并分支**。第 38–41 行那个 `typeof primaryKeyVal === 'number'` 分支**不是死代码**（`GithubDb.test.ts:142/143` 分别覆盖两条分支），它正好把"两种类型都合法"写在了代码里。

**GithubDb.ts 的 import**（第 3 行）追加 `PrimaryKeyVal`：

```ts
// before
import { DatabaseMap, DatabaseSchema, UpdateFileType, DbTable } from './types';
// after
import {
  DatabaseMap,
  DatabaseSchema,
  UpdateFileType,
  DbTable,
  PrimaryKeyVal,
} from './types';
```

> 注：该 import 不按字母序，原文件就不是按字母序排的，跟随原顺序在末尾追加即可。
>
> 为什么这里用普通 `import`、而 2.3 的 `utils.ts` 用 `import type`：这一行本来已经混着 `DatabaseMap` / `DatabaseSchema` / `UpdateFileType` / `DbTable` 四个纯类型，全走普通 `import`；追加一个名字只需改这**一条 import 语句**。之所以上面写成折行的 7 行，是因为加上 `PrimaryKeyVal` 后整条 94 列，超出本仓通行的 80 列（本仓 `max-len` 是 off、也没装 prettier，所以单行同样合法，写折行只是跟随本文件的既有排版）。把它们拆成 `import type` 会多改一处、却没有任何行为差别。**不要为了"两处写法一致"去拆这一行。**

### Stage 3（可选，**默认不做**）

给 `GithubDb.ts` 里**其余仍依赖隐式 `any` 的入参**补显式类型（根 `tsconfig.json` 只开了 `strictNullChecks`，没有 `noImplicitAny`）。注意：下列函数本计划其余部分**都不改**，所以这一段是独立的整洁工作，不是 Stage 2 的配套：

- `getDataPath(dbName: string, tableName: string)`
- `getInsightsPath(dbName: string, tableName: string)`
- `getDataUrl(dbName: string, tableName: string)`
- `updateRecordFile(dbName: string, tableName: string, primaryKey: string, record, sha)` —— ⚠️ 注意 `primaryKey` 这里是**列 id**（函数体第 330 行做的是 `record[primaryKey]`），不是主键值，所以类型是 `string` 而不是 `PrimaryKeyVal`
- `deleteRecordFile(dbName: string, tableName: string, primaryKeyVal: PrimaryKeyVal, sha)` —— 这里才是**主键值**

⚠️ 做 Stage 3 之前必须知道：`updateRecordFile` / `deleteRecordFile` 的调用方在 `packages/components`，补了类型后如果那边传的不是 `string`，`tsc` 会在**另一个包**报错。所以 Stage 3 的验收必须多跑一条针对 `packages/components` 的类型检查（见 §5 第 5 条）。

**建议**：先不做。本计划的价值在 Stage 2.2 那一行，Stage 3 是顺手的整洁工作，容易把 diff 撑大、把"改了什么"讲不清。

### Stage 4 — 测试（净 +4 个用例：改写旧的那条 + 新增 3 个）

#### 4.1 `packages/github/src/GithubDb.test.ts`，改写 `describe('getRecordFileContentAndSha')`

现状（第 275–293 行）：只有 1 个 `it`，传字符串 `'1'`，注释里写着含糊的 `see the registered issue in the report`。

**替换为**：

```ts
  describe('getRecordFileContentAndSha', () => {
    it('should read the record file for a string primary key', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 'ADMIN' }],
        sha: 'r1',
      });

      const res = await gd.getRecordFileContentAndSha('iam', 'roles', 'ADMIN');

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/roles/ADMIN.json',
        undefined,
      );
      expect(res.sha).toBe('r1');
    });

    // The primary column may be declared as NUMBER (see
    // packages/cli/__test_dbs_dir__/iam/dbcfg.json and Github.tt.ts, which uses
    // date.valueOf()). A numeric value is therefore a legal input, not a
    // caller mistake — do not "fix" this test by passing a string.
    it('should read the record file for a numeric primary key', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ userId: 1744820403529 }],
        sha: 'r2',
      });

      const res = await gd.getRecordFileContentAndSha(
        'iam',
        'users',
        1744820403529,
      );

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/users/1744820403529.json',
        undefined,
      );
      expect(res.sha).toBe('r2');
    });
  });
```

`1744820403529` 取自 `UpdatePage/index.tsx:85` 的示例 URL（`?userId=1744820403529`），不是随便编的数。

⚠️ **这两条测试是本计划的回归信号**：改之前，第二条会因为 `tsc` 报 TS2345 而无法通过类型检查（jest 用 babel 转译不会报，但 `npm run build` 会红——见 §5）。

#### 4.2 `packages/github/src/utils.test.ts`，新增 `describe('getRecordFileName')`

该文件现在只有 `formatDate` 一个 describe（9 行）。import 改成：

```ts
import { formatDate, getRecordFileName } from './utils';
```

**追加**（以下期望值全部是 2026-10-09 用构建产物 `dist/utils.js` 实测得到的，不是推断）：

```ts
describe('getRecordFileName', () => {
  it('should build the same file name for a numeric primary key and its string form', () => {
    expect(getRecordFileName(1)).toBe('1.json');
    expect(getRecordFileName('1')).toBe('1.json');
    expect(getRecordFileName(1)).toBe(getRecordFileName('1'));
  });

  it('should keep digits, dot and hyphen as-is', () => {
    expect(getRecordFileName(0)).toBe('0.json');
    expect(getRecordFileName(-1)).toBe('-1.json');
    expect(getRecordFileName(1.5)).toBe('1.5.json');
    expect(getRecordFileName(1744820403529)).toBe('1744820403529.json');
  });

  it('should sanitize characters that are not filename safe', () => {
    expect(getRecordFileName('a/b c')).toBe('a_b_c.json');
    expect(getRecordFileName('a#b')).toBe('a_b.json');
    // exponent notation contains "+", which is not portable in a file name
    expect(getRecordFileName(1e21)).toBe('1e_21.json');
  });
});
```

## 4.5 预期产出规模

用例数：**72 → 76**（`GithubDb.test.ts` 净 +1，`utils.test.ts` +3）。

逐文件的行数变化不预估 —— 以执行后的 `git diff --stat` 为准。

## 5. 验收（必须全过）

在 `packages/github` 下依次执行：

```sh
# 1. 类型检查 —— 测试文件也在 tsconfig include 里，会一起被检查
npx tsc --noEmit --declaration false --emitDeclarationOnly false

# 2. 测试 + 覆盖率
npx jest --coverage --coverageReporters=text

# 3. 构建 —— 两个 push 触发的 workflow 都会先 build 这个包，所以它必须绿
cd ../.. && npm run build -w packages/github

# 4. 本包在 CI 里的对应入口（CI 另外还跑 components 的 test/coverage 与 Cypress E2E，与本计划无关）
cd packages/github && npm test

# 5. 仅当执行了 Stage 3 时跑：在 packages/components 里暴露类型错误。
#    components 的 tsconfig 带 emitDeclarationOnly，所以不能加 --noEmit（会被 TS5053 挡掉）。
#    下面这条 2026-10-09 实测 exit 0、约 11 秒，产物写在 /tmp，比全仓构建便宜得多
cd packages/components && npx tsc --emitDeclarationOnly --declaration --outDir /tmp/dbm-comp-types

# 5b. 想走完整链路（babel + tsc，数分钟）时才跑：
# cd ../.. && npm run build
```

> 为什么 build 必须绿：`test.yml` 与 `cypress.yml` **都在 push 时触发**（`.github/workflows/` 下另外 4 个只有 `workflow_call`，push 不跑），且**都**先执行 `npm run build -w packages/github` —— 前者接着跑 `npm test`，后者接着跑 Cypress E2E。而 `tsconfig.json` 的 `include` 是 `src/**/*.ts`，tsc 会把 `*.test.ts` 一并类型检查，所以测试文件里的类型错误会让**两条流水线同时变红**，不依赖人盯。

**覆盖率不得下降**（改造前实测基线）：

| 指标 | 基线 |
|---|---|
| `Github.ts` 语句 | 96.29%（分支 93.33，函数 100） |
| `GithubDb.ts` 语句 | 98.66%（分支 97.05，函数 100） |
| `utils.ts` 语句 | 100% |
| 包整体语句 | 97.42%（分支 95.18，函数 98.18） |
| 用例数 | 72 |

注意：本包**没有** `coverageThreshold`；CI 里的 `--coverage` 步骤只针对 `@db-man/components`（`npm run test:coverage -w packages/components`，其 `package.json` 里有闸门），**本包不跑**。所以本包的覆盖率只能靠人比对上表，不会自动拦。

### 反脆弱抽查（至少 1 条）

把 `GithubDb.ts:138` 里 `getRecordFileName(primaryKeyVal)` 换成直接模板串 `` `${primaryKeyVal}.json` ``（即假装"主键值永远是文件名安全的"），跑 `npx jest`：

**预期**：`GithubDb.test.ts` 里 `should sanitize a primary key that is not filename safe`（第 148 行）**变红**。

确认变红后**把生产代码精确还原**，并用 `git diff` 与逐文件 `shasum` 双重确认还原干净（见 2026-10-09 的实践：`git diff` 为空还不够，要跟 `HEAD` 逐字节比）。

### 一条**预期不会变红**的抽查（先说明，免得被误判成测试漏洞）

把 `utils.ts:38` 的 `typeof primaryKeyVal === 'number'` 分支删掉、直接写成 `validFilename(String(primaryKeyVal))` —— **测试仍然全绿**。

这不是测试的漏洞，而是两条分支在行为上**完全等价**（两者最终都执行 `validFilename(String(v))`）。该分支的价值是**表达领域事实**（"两种类型都合法"），不是制造行为差异。所以：**不要把这条当成回归信号**。

## 6. 提交

单独一个提交（不夹带任何其他改动），建议的 message：

```
Type primary key values as string | number across @db-man/github

The primary column of a table may be declared as STRING or as NUMBER — the
CLI fixture ships a NUMBER primary column and Github.tt.ts uses
date.valueOf() — but getRecordFileContentAndSha declared it as `string`,
so a correct numeric call site failed to type-check.

Introduce PrimaryKeyVal = string | number and use it in getRecordPath,
getRecordFileContentAndSha and getRecordFileName, the single place that
turns a primary key into a file name.

No behaviour change: getRecordFileName is untouched, and its numeric branch
is kept deliberately, since both branches legitimately occur.

Tests pin the contract that a numeric primary key and its string form
produce the same file name, and that getRecordFileContentAndSha accepts
both.
```

## 7. 执行前的前置核对

开工前先跑，确认仓库没被其他 agent 改过：

```sh
git status --short packages/github/src
git log --oneline -3
grep -n "primaryKeyVal:" packages/github/src/GithubDb.ts packages/github/src/utils.ts
```

预期：

- `git status --short packages/github/src` **必须无输出**。这是硬条件 —— 源码被别人动过就停下看 diff。
- 整仓 `git status --short` 此刻**不一定干净**。2026-10-09 复核（HEAD `e6b6a1b`）时正好是这 3 行：
  `M TODO.md`、`M docs/plans/2026-10-07-github-ut-coverage.md`（本系列自己的未提交改动），
  以及 `?? docs/plans/2026-10-09-primary-key-val-type.md`（**本计划文档自身，未跟踪**）。
  这不是异常，但**这 3 项都不许混进本次提交**。
- grep 的**全部输出就是 3 行**：`GithubDb.ts:135` 与 `utils.ts:37` 是 `string | number`，`GithubDb.ts:278` 是 `string`。另外两处 JSDoc（`GithubDb.ts:132`、`:271`）写的是 `@param {string|number} primaryKeyVal`，**不含冒号，不会被这条 grep 匹配** —— 别因为只看到 3 行就以为 JSDoc 不存在。

**若源码那几行与预期不符就停下来先看 diff**，不要照着本计划盲改行号。

## 8. 待拍板

- **D-A：已决定「不加」**（2026-10-09 复核后撤回）。原拟在 `AGENTS.md` 的 Gotchas 加一条主键领域不变量，理由不成立：
  判据是「**写错了，编译器和测试会不会当场拦住**」——
  「主键列可以是 `STRING` 或 `NUMBER`」已由 `types.ts:20` 的 `DbColumnType` 与 `DbColumn.primary` 的 JSDoc
  表达，`packages/components/DOC.md:78` 也指了路，属于「读代码就能看出来」，不该进 `AGENTS.md`；
  「URL 查询参数永远是字符串、别用 `===` 比」则是 `TODO.md` 里那条 bug 的**修法**，修时顺手定。
  本质：**这条本来是用文档去补类型的窟窿，而窟窿由本计划（代码）堵。** `AGENTS.md` 保持 117 行不动（2026-10-09 实测，与 HEAD 一致）。
- **D-B**：Stage 3（补显式参数类型）做不做，**默认不做**。

## 9. 边界纪律

- `docs/plans/` 下其他计划（`2026-10-07-components-ut-coverage.md`、`2026-10-07-github-ut-coverage.md`）只读不改
- 工作区可能同时有其他 agent 的在途改动。**代码提交只暂存那 5 个源文件**；
  文档（本计划、`TODO.md` 登记、`2026-10-07` 状态更新）另成一个**文档提交**，
  两者不许混入对方（"别混进代码提交" ≠ "不提交" —— 后者会让文件只存在于本机，
  对其他人和别的 agent 等于不存在）
- 不做 `git add .`、不做 `git add -A`
