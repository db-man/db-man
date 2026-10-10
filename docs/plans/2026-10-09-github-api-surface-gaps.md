# packages/github 公开 API 面缺口补齐计划

- 日期：2026-10-09
- 范围：`packages/github`（`@db-man/github`），连带少量 `packages/components` 调用点
- 状态：**Stage 1.1、1.2 已完成并合并**（1.1 = PR #1 / 合并提交 `006919f`；1.2 = PR #2 /  
  合并提交 `a1f71bb`，CI 绿）。Stage 1.3 / 1.4 与 Stage 2 / 3 **未开工**
- 行号基准：2026-10-09 23:00 的工作区状态（`packages/github` 的 `tsconfig.include` 是  
  `./src/**/*.ts`，测试文件与源码同目录，改动会让行号漂移——引用行号前先 `grep -nE` 复核）
- 前置：`docs/plans/2026-10-09-primary-key-val-type.md`（主键类型收口 `PrimaryKeyVal`）  
  **已完成并推送**（提交 `72d2ee3`，CI 绿）。本计划承接它留下的空档，不重复它的内容
- 相邻但**不属于本计划**：`docs/plans/2026-10-07-github-ut-coverage.md`（写路径单测 + mock 形状）。  
  按 `AGENTS.md` 的 Boundaries，别人的计划只能读，不得编辑或合并——本计划只引用它

---

## 0. 目标

一句话：**把 `@db-man/github` 从「文件级读写器」补成「consumer 能真正当数据库用」的 API。**

判定"够不够"的口径（本计划采用）：一个 consumer 想操作 db 数据时，**不需要自己实现数据库语义**  
（行身份、读-改-写、冲突处理、目录编目），只调用库即可完成。按这个口径，当前差距集中在  
Stage 1 / Stage 2；Stage 3 是可选的扩展与一致性。

---

## 1. 根因

### 1.1 公开 API 面现状

`packages/github/src/index.ts` 只导出 6 项：`types`、`contants`、`GithubDb`、`Github`、  
`utils`、`insightsUtils`。其中真正的数据操作面：

| 类          | 方法                                                                                                                                                                        | 性质                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `Github`   | `getGitHubUrl`、`getBlob`、`getBlobContentAndSha`、`getContentByPath`、`getContentByPathV2`、`getFileContentAndSha`、`getPlainTextByPath`、`updateFile`、`deleteFile`、`getDbsCfg` | 单仓**文件级**读写（octokit 包装） |
| `GithubDb` | 10 个纯路径/URL 拼装 + 14 个数据操作                                                                                                                                                 | **数据库语义层**，但见 §1.2      |

`GithubDb` 的 23 个方法里有 10 个只是拼路径字符串（`get*Path` / `get*Url`），所以真正的  
"数据操作"只有 14 个：`getTableSchema`、`isLargeTable`、`getTableRows`、`getTableInsights`、  
`getRecordFileContentAndSha`、`getDbViewScriptFileContentAndSha`、`updateTableFile`、  
`updateRecordFile`、`deleteRecordFile`、`getDbTablesSchemaAsync`、`getDbTablesSchemaV2Async`、  
`createDatabaseSchema`、`updateDatabaseSchema`、`createTableSchema`。

### 1.2 四块缺口（每条都有现场证据）

| #  | 缺口                                                                            | 证据（file:line）                                                                                                                                                                                                        |
| -- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 | **normal 模式没有行级 API**。写一行 = 读全表 → 前端改数组 → 带 sha 覆写全表；**删一行在 normal 模式下根本做不到** | `components/.../CreatePage.tsx:110-131`、`components/.../UpdatePage/index.tsx:109-120`（两处各手写一遍 read-modify-write）；`UpdatePage/index.tsx:56-62`（删行只支持 split-table）                                                     |
| G2 | **没有目录/编目 API**。"有哪些 db / 哪些 table"由 portal 自己列目录 + 逐个读 `dbcfg.json` 拼出来      | `components/src/pages/Settings/helpers.ts:8-55`（`loadDbsSchemaAsync`）；`components/.../PageHeaderContent.tsx:12` 留了同一条 TODO                                                                                           |
| G3 | **写操作无法留痕**。commit message / committer / author 全是硬编码 `db-man-bot`            | `Github.ts:20-28`（常量）、`GithubDb.ts:324,341,356,366,381,423`（每条写路径的固定 message）。而 `getTableInsights` 恰恰是从 git log 提炼价值的（`InsightsPage.tsx:17`）                                                                         |
| G4 | **错误契约三套并存**，409 不可编程处理                                                       | `Github.ts:119-155`（抛带 `.cause` 的 Error）vs `Github.ts:162-206`（返回 `[err, data]` 元组）vs `Github.ts:213-245`（抛裸 Error）；`Github.ts:336,378` 的 409 只 `throw new Error('DBMERR_*_409_CONFLICT')`，**不挂 `.cause`、不挂 status** |

### 1.3 消费方分布（决定"改签名"的风险等级）

`-E` 实测（`grep -nE`，勿用 `\|` 交替，BSD grep 下会假阴性——本计划开工当天就踩过一次）：

| 方法                                                          | 跨包消费点                                                                         | 结论                     |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| `getContentByPath`                                          | `components/src/pages/Settings/helpers.ts:11`                                 | **有外部消费者**，改行为需谨慎      |
| `getFileContentAndSha`                                      | `components/src/pages/Settings/helpers.ts:28`                                 | 有外部消费者                 |
| `getDbsCfg`                                                 | `components/src/pages/Settings/helpers.ts:134`（直接用 `Github` 实例，不经 `GithubDb`） | 有外部消费者                 |
| `getContentByPathV2`                                        | 无。只有定义 + 它自己的测试                                                               | **死代码**（见 §5）          |
| `getPlainTextByPath`、`getBlobContentAndSha`                 | 无（仅 `GithubDb` 内部 + 库内测试）                                                     | 内部方法，改起来自由             |
| `updateFile`、`deleteFile`                                   | 仅 `GithubDb` 内部                                                               | 内部方法                   |
| `isLargeTable`、`getTableSchema`                             | 无（仅库内 + 测试）                                                                   | 内部方法                   |
| `getTableRows`                                              | 19 处（List/Create/Update/Get/Query/View/Schema 各页）                             | **最热路径**，任何签名改动都是大面积破坏 |
| `updateTableFile` / `updateRecordFile` / `deleteRecordFile` | 13 / 9 / 6 处                                                                  | 热路径                    |

补充：`components/src/contexts/commonPage.ts:13,51,60` 有整块**被注释掉的** `GithubDbType` 手写副本  
——历史遗留，说明 consumer 曾经重复定义过库的类型。

---

## 2. 开工前必须先定的三件事

### 2.1 行级 API 的形态（A / B / C 对比）

|     | 方案 A：库内按模式自动分派                                                                                 | 方案 B：调用方分派，两套命名                                      | 方案 C：只补 normal 模式（推荐）                                                                |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 做法  | `GithubDb` 构造参数新增 `dbModes`，行级 API 内部判断走 table 文件还是 record 文件                                  | 暴露 `insertRowToTable` / `insertRecordFile` 两组，调用方自己选 | 只新增 `insertRow` / `updateRow` / `deleteRow`，**只作用于 `<table>.data.json`**             |
| 判定点 | 库内部隐式判断                                                                                        | 调用方（已有 `appModes`）                                   | 调用方（已有 `appModes`），库不新增判定                                                            |
| 问题  | ① `GithubDb` 构造里没有 `dbModes`，要新增输入；② 模式缺失时要么报错要么推导默认——"推导默认"正是被明确否决的 fallback 反模式；③ 与"判定点单一"冲突 | 命名冗余，但显式                                             | split-table 的行级操作**本来就已经有了**（`updateRecordFile` / `deleteRecordFile`），缺的只是 normal 模式 |
| 结论  | 不采纳                                                                                            | 备选                                                   | **采纳**                                                                               |

**推荐 C 的理由**：split-table 侧不缺 API，缺的是 normal 侧。C 不新增任何判定点，不引入 fallback，  
且是纯新增、零破坏。列 A 是为了留痕"为什么不把模式判断放进库"。

### 2.2 新增 vs 改签名（发布风险）

`@db-man/github` 是 public 包、已发布到 npm（`0.1.79`）。因此：

- **优先纯新增**（Stage 2 的 `insertRow` / `updateRow` / `deleteRow` / 目录 API）→ 走 minor，零破坏
- **改现有签名**必须逐个评估 §1.3 的消费方；`getTableRows` / `update*File` 这类热路径**不要动签名**，  
  需要新能力时**加可选参数**或**并列新方法**
- `getContentByPathV2` 无消费者 → 可以最自由地处理（见 §5，建议删除而不是改造）

### 2.3 错误类型怎么造（必须避开 babel 降级坑）

`build.sh` 的 commonjs 分支走 `babel src --out-dir dist`，`@babel/preset-env` 可能把 class 降级到 ES5。  
**`class DbmError extends Error` 在 ES5 降级下会破坏原型链**，导致 `instanceof DbmError` 失效、  
stack 丢失。因此**不要用 class，用工厂函数 + 挂字段**：

```ts
// src/errors.ts（新文件；types.ts 目前是纯类型，不放运行时值）
export type DbmErrorType =
  | 'FILE_NOT_FOUND'
  | 'NO_PERMISSION'
  | 'FILE_TOO_LARGE'
  | 'CONFLICT'
  | 'ROW_NOT_FOUND'
  | 'DUPLICATE_KEY'
  | 'UNKNOWN';

export interface DbmError extends Error {
  type: DbmErrorType;
  status?: number;
  url?: string;
}

export const createDbmError = (
  type: DbmErrorType,
  message: string,
  extra?: { status?: number; url?: string; cause?: unknown },
): DbmError => {
  const err = new Error(message) as DbmError;
  err.type = type;
  if (extra?.status !== undefined) err.status = extra.status;
  if (extra?.url !== undefined) err.url = extra.url;
  if (extra?.cause !== undefined) err.cause = extra.cause;
  return err;
};
```

判据 API 侧：consumer 用 `err.type === 'CONFLICT'` 判断，**不再字符串匹配**。`DbmErrorType` 与  
`createDbmError` 都从 `src/index.ts` 导出。

---

## 3. 分阶段执行

三个 Stage 有严格先后：Stage 1 是正确性前置，Stage 2 的行级 API 依赖 Stage 1 的错误契约。

### Stage 1（P0）— 正确性修复，先做

#### 1.1 修 numeric 主键查找（实锤 bug）

`TODO.md:15-21` 曾登记过（修好后该条已从 `TODO.md` 删除）。normal 模式下按主键找行用的是 `===`，
主键列声明为 `NUMBER` 时永远不成立（`row.userId` 是数字 `1`，URL query 是字符串 `'1'`）。

**范围要按全仓 grep 数，不要信任 TODO 已登记的那几条。** 用一条覆盖 `===` / `!==` 的 grep
（注意：只写 `===` 会漏掉 `!==`，`!==` 里没有连续的三个等号）：

```sh
grep -rnE "\[primaryKey\][[:space:]]*(===|!==|==|!=)" packages/*/src --include='*.ts' --include='*.tsx'
```

实际有 **5 处**（TODO 只登记了第 1、4 处）：

| # | 位置 | 作用 | 漏掉的后果 |
|---|---|---|---|
| 1 | `components/src/components/EditorBody/helpers.ts:18` `validatePrimaryKey` | 新建时的主键去重校验 | **最严重**：判不出重复 → 允许插入重复主键 → 数据写坏 |
| 2 | `components/src/pages/DbTablePage/UpdatePage/helpers.ts:12` `getNewRows` | 算出「改后整表」 | 行没被替换，UI 报成功但改动被静默丢弃 |
| 3 | `components/src/components/GetPageBody/index.tsx:23` | detail 页按主键找行 | 报 `item not found in db` |
| 4 | `components/src/pages/DbTablePage/UpdatePage/index.tsx:80` | update 页按主键取行 | 表单空白、不渲染 Save |
| 5 | `components/src/ddRender/ddRenderFnMapping.tsx:85` `getTableRecordByKey` | 模板 helper | 模板取不到记录，渲染为空 |

不谈主键语义的等值比较**不要动**：`ListPage/index.tsx:263` 是空值检查；`EditableTable/index.tsx:95,105,128`  
比的是行编辑器内部的 `rowKey`（两侧同源）。

夹具证据（不是假设）：`packages/cli/__test_dbs_dir__/iam/dbcfg.json` 里 `users.userId` 是  
`NUMBER` + `primary: true`，`packages/cli/__test_dbs_dir__/iam/users.data.json` 里是 JSON 数字；  
`packages/github/src/Github.tt.ts:19` 用 `date.valueOf()`。

改法：抽出**一个**比较函数（放 `components/src/utils.ts`，`isSamePrimaryKey(a, b)`，内部  
`String(a) === String(b)`），5 处都调它。**不要在多处各写一遍**——否则又是多套口径。  
注意 `null` / `undefined` 的处理：`String(null)` 是 `'null'`，必须先排除空值，否则 `undefined`  
和 `null` 会被判为相等；而「行没有主键」也不该被当成本次 URL 要的那一行。

**状态：已完成并合并**（PR #1，合并提交 `006919f`；分支 `fix/primary-key-string-number-lookup`
已删除）。5 处改点 + 单测都在里面。验收实测：`npm run test:coverage -w packages/components`
43 suites / 338 tests 全绿，语句 1405/1767（≈79.5%，闸门 73/74/66/63 全过）；
PR 的 `test` 与 `cypress-run (1)(2)` 全绿。

删除的合并分支里值得留一句的东西：无（改动全在 `packages/components`，未触碰 `packages/github`，
所以不需要 `./rebuild_github.sh`、也不会影响已发布的 `@db-man/github`）。

#### 1.2 统一"主键 → 文件名"规则

`TODO.md:22-26` 已登记。现在存在两套规则，同一行会被算出两个路径：

- `packages/github/src/utils.ts:39-44`：`validFilename(String(pk))`
- `packages/cli/bin/processTables.mjs:49-53`：`NUMBER` 列走 `row[primaryKey] + ''`（**不消毒**），  
  其余走 `utils.validFilename(...)`

分叉只在数字字符串含需转义字符时暴露（如 `1e21` → `'1e+21'` vs `'1e_21'`）。  
唯一事实源应落在 `@db-man/github` 的 `utils.getRecordFileName`，`processTables.mjs` 改为调用它  
（该文件已经 `import { utils } from '@db-man/github'`，无需新增依赖）。

**注意一个独立问题**：`processTables.mjs:123-125` 的排序也用 `'' + a[primaryKey]`，那是**排序键**  
不是文件名，语义不同，**不要顺手改**。

**状态：已实现并合并**（PR #2，合并提交 `a1f71bb`）。`processTables.mjs` 里那段三行分支  
（`NUMBER` 走 `row[primaryKey] + ''`、其余走 `utils.validFilename`）换成一行  
`utils.getRecordFileName(row[primaryKey])`，两套规则收敛为一处；`primaryColumn` 变量随之删掉  
（`getPrimaryKey(table)` 已经做过同样的查找）。排序键按要求未动。

新增 `packages/cli/bin/processTables.test.mjs`：把一张表 split 到临时目录，再断言产出的文件名  
逐个等于 `utils.getRecordFileName(pk)`。**改动前 `1e21` 那条是红的**（实际写出 `1e+21.json`，  
期望 `1e_21.json`），同一用例里 `1 / -1 / 1744820403529 / 1.5` 与 STRING 主键是绿的 —— 这组  
红绿同时钉住了「分叉只发生在科学计数法」和「修的是这一处」。

#### 1.3 错误契约收口

见 §2.3 的类型设计。要做的收敛（**只收敛，不改语义**）：

| 位置                                         | 现状                                                 | 改成                                                                                                                                                                |
| ------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Github.ts:119-155` `getContentByPath`     | 抛 `Error` + `.cause`，message 分 401/403/404/default | 保持 message 文案不变（有调用方依赖 `err.cause.status === 404` 的判断，见 `Settings/helpers.ts:35-50`），额外用 `createDbmError` 补上 `type` / `status` / `url`                            |
| `Github.ts:213-245` `getFileContentAndSha` | 抛裸 `Error`                                         | 同上                                                                                                                                                                |
| `Github.ts:336` `updateFile` 409           | `throw new Error(DBMERR_UPDATE_FILE_409_CONFLICT)` | `createDbmError('CONFLICT', DBMERR_UPDATE_FILE_409_CONFLICT, { status: 409, cause: error })`。**`message` 必须仍是那个常量字符串**（`Github.tt.ts:43` 断言了 `error.message` 等于它） |
| `Github.ts:378` `deleteFile` 409           | 同上                                                 | 同上                                                                                                                                                                |
| `Github.ts:162-206` `getContentByPathV2`   | 返回 `[err, data]` 元组，无消费者                           | **不改造，删除**，见 §5                                                                                                                                                   |

**风险点**：`Github.tt.ts:39-44` 与 `52-56` 的断言写在 `.catch()` 里。如果 409 不再发生，断言根本  
不会执行 → **假绿**。改完 409 后必须确认这条 tt 用例仍然真实断言（或按 §3 `2026-10-07` 计划的  
Stage 5 处理）。这条不在 `npm test` 里（`*.tt.ts` 不匹配 jest 默认 testRegex），只能  
`DBM_GH_TOKEN=... npm run tt -w packages/github` 手工跑。

#### 1.4 对齐 `message` 必填性

`TODO.md:9-14` 已登记。`types.ts:160-165` `UpdateFileType.message` 可选，而 `types.ts:167-171`  
`DeleteFileType.message` **必填**，于是 `Github.ts:349` 的默认值 `message = 'Delete file'`  
对任何被类型检查的调用者都不可达（只有测试用 `as unknown as DeleteFileType` 强转才碰到）。

二选一（执行者定，但要写进提交信息说明取舍）：

- 选项 1：`DeleteFileType.message` 改为可选 → 与 `UpdateFileType` 对齐，默认值变成真可达
- 选项 2：`UpdateFileType.message` 改为必填 → 两处都必填，`Github.ts:292` 的默认值不可达

**推荐选项 1**：新增 Stage 2.2 之后 message 会变成"调用方要显式提供"的东西，底层保持可选更灵活。

### Stage 2（P1）— 核心能力

#### 2.1 normal 模式行级 API（本计划的核心价值）

按 §2.1 的方案 C，在 `GithubDb` 上**纯新增**三个方法，只作用于 `<table>.data.json`：

```ts
async insertRow(dbName: string, tableName: string, row: Record<string, any>, message: string): Promise<{ commit: { html_url: string } }>
async updateRow(dbName: string, tableName: string, primaryKey: string, row: Record<string, any>, message: string): Promise<{ commit: { html_url: string } }>
async deleteRow(dbName: string, tableName: string, primaryKey: string, primaryKeyVal: PrimaryKeyVal, message: string): Promise<{ commit: { html_url: string } }>
```

内部统一是同一个机械流程：`getTableRows(db, table)` 拿到 `{content, sha}` → 在内存里改数组 →  
`updateTableFile(db, table, newContent, sha)`。**库只做"读-改-写"的机械动作，不做业务校验。**

**语义必须显式（这些是 API 定义，不是替调用方兜底）**：

| 情形                               | 行为                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `updateRow` / `deleteRow` 找不到该主键 | 抛 `createDbmError('ROW_NOT_FOUND', ...)`。**不要静默变成 insert**                                |
| `insertRow` 的主键已存在               | 抛 `createDbmError('DUPLICATE_KEY', ...)`。**不要静默覆盖**                                       |
| `deleteRow` 删掉最后一行               | 写回空数组 `[]`，不要删文件                                                                          |
| 写冲突（409）                         | 抛 `createDbmError('CONFLICT', ...)`。**不自动重试**——重试会读到他人改动后覆盖，属隐式行为，交给调用方决定（与 §2.2 的显式原则一致） |

**`message` 设为必填**：`Github.updateFile` 层保持可选（兼容），但新增的行级 API **强制调用方传  
message**，让"要不要留痕"的决定点显式落在调用方，符合"判定点单一 + 不做隐式默认"。

**与 UI 现有校验的关系（重要）**：`components/src/components/EditorBody/helpers.ts` 的  
`validatePrimaryKey` 目前在提交前预检重复主键。库引入 `DUPLICATE_KEY` 后**判定点会变成两处**。  
处理原则：**库是唯一判定点**（只有库知道写那一刻的真实表内容），UI 的预检降级为可选体验优化  
（提前提示，不再承担正确性）。本计划**不要求**在同一个 Stage 里删 UI 预检，但必须在  
`AGENTS.md` 记一条，避免两侧口径长期漂移。


**消费者收敛（可分批）**：`CreatePage.tsx:110-131` 与 `UpdatePage/index.tsx:109-120` 改为调用新 API。  
建议分两个提交：先加 API + 单测（零破坏），再改 consumer（行为不变、去掉重复实现）。  
**normal 模式的删除能力**顺带补齐：`UpdatePage/index.tsx:56-62` 的  
`messageApi.info('Only supported in split-table mode!')` 可以换成真正的 `deleteRow` 调用。

#### 2.2 写操作可留痕（commit message / 身份）

- `Github.updateFile` / `Github.deleteFile` 的入参对象新增可选 `author` / `committer`、  
  `message` 已是入参；不传时沿用 `Github.ts:20-28` 的既有默认。**这是向后兼容的新增，默认值等于现状**
- `GithubDb.updateTableFile` / `updateRecordFile` / `deleteRecordFile` / 三个 `*Schema` 方法  
  各加一个可选 `message` 参数，透传下去
- Stage 2.1 的行级 API 透传必填的 `message`
- 对 `GetPageBody` / `UpdatePage` 那种"无人值守"的读路径**不做改动**

理由留痕：`getTableInsights`（`InsightsPage.tsx:17`）的全部价值来自 git log，  
但当前每次写都是固定的 `[db-man] Update table file (iam/users)`，**读的和写的自相矛盾**。

#### 2.3 目录 / 编目 API

把 `components/src/pages/Settings/helpers.ts:8-55` 的逻辑搬进 `GithubDb`：

```ts
async listDbNames(): Promise<string[]>              // 列 repoPath 目录，取目录项名
async getDatabases(): Promise<DatabaseMap>          // = 上面的 loadDbsSchemaAsync 搬进来
async listTableNames(dbName: string): Promise<string[]>  // 从 this.dbsSchema[dbName].tables 取
```

搬移注意事项：

- `listDbNames` 需要 `getContentByPath(repoPath)` 返回**数组**；返回对象说明路径是文件 →  
  抛错。`GithubDb.ts:225-229`（`getTableRows` 里）已有这个模式，照抄文案风格
- `helpers.ts:45-47` 的报错文案（`Database config file dbcfg.json not found for database "X"`）  
  与 `helpers.ts:35-50` 对 `err.cause.status === 404` 的判断，**搬移后行为必须一致**——  
  这条正是 §1.3 要求"`getContentByPath` 的 `.cause` 不许动"的原因
- `helpers.ts` 搬完改成调用 `GithubDb`。注意它现在是 `new Github(...)` 直接建的，  
  而 `GithubDb` 需要 `dbsSchema`（`helpers.ts` 恰好就是在**生产** dbsSchema）→ 这里有个  
  先有鸡还是先有蛋的死结，**执行者必须先解决它**（建议：`getDatabases` 做成静态方法或  
  独立函数，只依赖 `Github` 实例，不依赖 `dbsSchema`），否则这条搬不动

**这一条有真实风险，执行前先验证上面的死结**；若无法在不动架构的前提下解决，本子项可推迟。

### Stage 3（P2）— 扩展与一致性（可选，按需取用）

| 子项  | 做什么                                                                          | 说明                                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1 | schema 补全：`updateTableSchema` / `deleteTableSchema` / `deleteDatabaseSchema` | 现在建表/建库/改整库有，**删表/删库/改单表没有**，对称性缺失                                                                                                                                                                                                   |
| 3.2 | branch / ref 支持                                                              | `GithubDb.ts:120,124` 硬编码 `/blob/main/`、`/commits/main/`；所有 octokit 调用不传 `ref` → 无法用分支/暂存流程                                                                                                                                          |
| 3.3 | 二进制 / 附件通道                                                                   | `Github.ts:99` 强制 `JSON.parse`、`Github.ts:237` 假定内容是 `rows` 数组 → 图片等非 JSON 走不通                                                                                                                                                       |
| 3.4 | 条件请求 / ETag                                                                  | 全是无条件全量下载，无缓存失效机制（`dbsSchema` 是构造时注入的，不是拉来的）                                                                                                                                                                                         |
| 3.5 | 命名与契约清理                                                                      | `Github.ts:79` 的 JSDoc 标 `@private` 但实际 public；`updateFile` 实为 create-or-update（代码自带 TODO）；`GithubDb.ts:49-56` 的 `LS_KEY_*` 字段已非 localStorage key；`GithubDb.ts:189-194` `getTableSchema` 抛错 vs `196-200` `isLargeTable` 静默返回 `false` |

**已被否掉的子项（留痕，避免以后有人重新提）**：原 P1 清单里的"分页 / 过滤 / 排序"  
（`getTableRows` 加 `page`/`pageSize`/`filter`/`sort`）。理由：GitHub contents API  
**不支持服务端过滤**，库里做分页仍然要全量下载再切片，**不省流量、不省时间**，只是把  
`ListPage` 的代码搬进库——属无收益抽象。分页/过滤是 UI 职责，`ListPage` 现状是对的。  
若将来真要省流量，前提是先有 §3.4 的 ETag/条件请求，届时另开计划。

---

## 4. 硬性纪律（给执行者）

1. **每个 Stage 一个提交，consumer 收敛再一个提交**。不要把 API 新增和 consumer 改造混在一起，  
   否则回归时无法判断是谁引起的。
2. **只 stage 自己改的文件。** 仓库里可能同时有别的 agent 在改（`docs/plans/` 下已有两份并行计划）。  
   发现有非自己改动的文件呈 modified，**保持原样并在提交信息里说明**。
3. **`packages/github` 是"构建产物被消费"的包。** 改完 `src` 必须重建，否则 `components` 看不到：  
   `npm run build -w packages/github`，或一步到位 `./rebuild_github.sh`（后者还会 `npm i` +  
   清 CRA cache）。`dist/`、`es6/` 已被 `.gitignore` 忽略（`git ls-files packages/github | grep -cE '^packages/github/(dist|es6)/'` → 0），  
   **产物不提交**，本地重建即可。
4. **测试文件会被 tsc 编译。** `tsconfig.include` 是 `./src/**/*.ts`，`*.test.ts` 会进 `dist/`。  
   测试里写错类型会让 `npm run build` 失败，而 **CI 先 build 再 test**。
5. **`@db-man/github` 的测试要 mock 两条通道**（照抄现有形状，别自创）：
   - `Github.test.ts:4-14`（测 `Github` 类）：`jest.mock('./octokit')`，mock 上必须**同时**有  
     `request` 和 `rest.repos.{createOrUpdateFileContents,deleteFile}`。只给 `request` 会让写路径  
     抛 `TypeError`
   - `GithubDb.test.ts:4-36`（测 `GithubDb`）：`jest.mock('./Github', () => ({ __esModule: true, default: jest.fn() }))`
     - `createMockGithub()` 把 `GithubDb` 会碰到的每个方法都列出来（`getFileContentAndSha`、  
       `getContentByPath`、`getBlobContentAndSha`、`getPlainTextByPath`、`updateFile`、`deleteFile`）。  
       新增行级 API 若复用这些方法则 mock 够用；**若新增了 `Github` 上的方法，必须同步补进  
       `createMockGithub`**，否则用例会调到 `undefined`
6. **多分支匹配一律 `grep -nE "a|b|c"`。** BSD grep 下 `\|` 交替不生效，会返回空 → 被误读成  
   "对象不存在"。（本计划开工当天已踩一次：差点把 `getContentByPath` 误判为无消费者。）
7. **同一失败最多重试 2 次**，第 3 次停手，把现状 + 已试假设 + 建议下一步一起交回。

---

## 5. 不做的事

- **不动 `getContentByPathV2`**：实测只有定义 + 它自己的测试（`Github.ts:162`、`Github.test.ts:181-225`），  
  **无任何真实消费者**。建议**删除**方法 + 它的测试（属死代码清理），而不是给它补 `DbmError` 改造。  
  删除是 public API 的破坏性变更——若要保守，可先 `@deprecated` 标注、下一个 major 再删。
- **不改 `getTableRows` / `updateTableFile` / `updateRecordFile` / `deleteRecordFile` 的签名**：  
  §1.3 显示它们是 6–19 处调用的热路径。需要新能力时加可选参数或并列新方法。
- **不做 UI 重构**：`CreatePage` / `UpdatePage` 只做"把手写逻辑换成调库"，版面与交互不动。
- **不编辑 `docs/plans/` 下的其他计划文件**。
- **不在本计划里改 `dist/`、`es6/`**（构建产物，见纪律 3）。
- **不做"自动重试 409"**（理由见 §2.1 表格与 2.1 的语义表）。

---

## 6. 验收

### 每个 Stage 都要过的通用项

```sh
# 1. 单包测试
npm run test -w packages/github

# 2. 类型检查（等价于 build 里的 tsc 环节；测试文件也会被检查）
cd packages/github && npx tsc --noEmit --declaration false --emitDeclarationOnly false && cd ../..

# 3. 构建
npm run build -w packages/github

# 4. 全仓测试（会不会碰坏 components）
npm test
```

判据：四条全 exit 0；`npm run test -w packages/github` 的用例数**只增不减**（当前 76，见  
`2026-10-09-primary-key-val-type.md`）；覆盖率不下降（`cd packages/github && npx jest --coverage`，  
注意 `packages/github` 的 jest 配置**没有** `coverageThreshold` 闸门，闸门只在  
`components` 的 `test:coverage` 那一步）。

### Stage 1 专项

- 新增用例：主键为 `NUMBER` 时，`GetPageBody` / `UpdatePage` 能按 URL query 找到那一行  
  （用一个 `primary: true, type: 'NUMBER'` 的表夹具）
- 新增用例：主键为 `NUMBER` 时，`validatePrimaryKey` 判得出重复（否则会写入重复主键）
- 新增用例：主键为 `NUMBER` 时，`getNewRows` 替换掉那一行而不是原样返回
- 新增用例：`isSamePrimaryKey` 对 `null` / `undefined` 一律返回 `false`
- 新增用例：`utils.getRecordFileName` 与 `cli/bin/processTables.mjs` 产出的文件名一致  
  （同一个主键，如 `1e21`）
- 新增用例：409 抛出的错误对象上 `type === 'CONFLICT'` 且 `message` 仍是  
  `DBMERR_UPDATE_FILE_409_CONFLICT`
- 回归：`Settings/helpers.ts` 依赖的 `err.cause.status === 404` 判断仍成立  
  （跑 `packages/components` 的 Settings 相关测试）

已实现的前 4 条在：`components/src/utils.test.ts`（新建）、`components/src/components/EditorBody/helpers.test.ts`、
`components/src/components/GetPageBody/index.test.tsx`（新建）、
`components/src/pages/DbTablePage/UpdatePage/helpers.test.ts`、
`components/src/pages/DbTablePage/UpdatePage/index.test.tsx`、
`components/src/ddRender/ddRenderFnMapping.test.tsx`。

第 5 条（`getRecordFileName` 与 `processTables.mjs` 产出一致）在
`packages/cli/bin/processTables.test.mjs`（新建），随 1.2 落地。

### Stage 2 专项

- 新增用例（`GithubDb.test.ts`）：`insertRow` 追加一行并写回整表；`updateRow` 改到的是目标行；  
  `deleteRow` 删掉目标行；`ROW_NOT_FOUND` / `DUPLICATE_KEY` / `CONFLICT` 三条错误路径各一个用例
- 新增用例：`message` 被原样透传到 `github.updateFile`
- **consumer mock 兼容性**：跑 `packages/components` 全套测试，确认现有  
  `jest.mock('@db-man/github', ...)`（见 `components/.../DbTablePage.test.tsx:21-22`、  
  `ListPage/index.test.tsx:4` 等）不因新增方法而失败
- 覆盖率：`packages/github` 新增方法的语句/分支覆盖率不为 0（新代码要有用例）
- 真网冒烟（人工，可选）：`DBM_GH_TOKEN=<token> npm run tt -w packages/github`

---

## 7. 风险与未知

| 风险                        | 说明                                                                                       | 对策                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Stage 2.3 的"先有鸡还是先有蛋"** | `getDatabases` 需要 `GithubDb`（要 `dbsSchema`），而 `helpers.ts` 正是在生产 `dbsSchema`             | 执行前先验证；建议做成只依赖 `Github` 实例的静态方法/独立函数。解不了就推迟本子项                           |
| **409 断言假绿**              | `Github.tt.ts` 的断言写在 `.catch()` 内，409 不再发生时断言不执行                                         | 改 409 后必须重跑 `npm run tt` 确认；或在提交信息里显式承认"该用例不再覆盖 409 分支"                  |
| **行号漂移**                  | 本计划引用的行号基于 2026-10-09 23:00 状态；`primary-key-val-type` 那次改动就让 `GithubDb.ts` 第 2 行起整体 `+6` | 动手前用 `grep -nE` 复核每个引用点                                                  |
| **normal 模式的行级操作成本**      | 每次写都要"下载全表 + 上传全表"，`large: true` 的表走 blob，大表下很慢                                          | 这是架构决定的，本计划不改；如实记在 API 的 JSDoc 里（"normal 模式写入是整表覆写，大表请用 split-table 模式"） |
| **`message` 从可选变必填是破坏性的** | `UpdateFileType.message` 若变必填，外部 consumer 会编译失败                                          | 见 §1.4——推荐反过来把 `DeleteFileType.message` 改为可选                             |
| **发布节奏**                  | 改动全在一个 public 包上                                                                         | 新增走 minor；删除 `getContentByPathV2` 若执行，属 major，需单独决策                      |

---

## 8. 命令速查

```sh
# 改完 packages/github/src 后让 components 看到（二者等价，后者更彻底）
npm run build -w packages/github
./rebuild_github.sh

# 单包 / 单用例
npm run test -w packages/github
npm run test -w packages/github -- GithubDb

# 覆盖率（无闸门，仅供观察）
cd packages/github && npx jest --coverage

# 类型检查（含测试文件）
cd packages/github && npx tsc --noEmit --declaration false --emitDeclarationOnly false

# 真网冒烟（不在 CI，需要真 token）
DBM_GH_TOKEN=<token> npm run tt -w packages/github

# 全仓
npm test
npm run test:coverage -w packages/components   # CI 的覆盖率闸门在这一步

# 定位引用点（务必 -E，勿用 \| 交替）
grep -rnE "insertRow|updateRow|deleteRow" packages/*/src --include='*.ts' --include='*.tsx'
```
