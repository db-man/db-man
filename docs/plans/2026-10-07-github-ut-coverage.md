# packages/github 单元测试补强计划

- 日期：2026-10-07
- 范围：`packages/github`（`@db-man/github`）
- 状态：**Stage 0 / 1 / 2 / 3 / 4 已完成并推送**（提交 `85cb21d`，CI 两个工作流均 success）；
  **Stage 5（覆盖率闸门）待定**，见本文件 §4 Stage 5 与 §9.2 的修正说明
- 完成情况：用例 9 → 72；`Github.ts` 语句 28.4% → 96.29%，`GithubDb.ts` 36.0% → 98.66%，
  `utils.ts` 61.5% → 100%，包整体 42.26% → 97.42%（分支 95.18% / 函数 98.18%）
- 遗留缺陷：「`DeleteFileType.message` 必填但够不到默认值」「`getRecordFileContentAndSha` 的
  `primaryKeyVal` 声明为 `string` 而领域上可为数字」两条已移出本计划，前者登记在 `TODO.md`，
  后者由 **`docs/plans/2026-10-09-primary-key-val-type.md`** 处理
- 姊妹计划：`docs/plans/2026-10-07-components-ut-coverage.md`（components 侧，数字与口径各自独立）

---

## 0. 目标

把 `@db-man/github` 从「读了一半、写路径全裸」推到「写路径进 CI + 覆盖率不会回退」。

本包的一句话定位：**它是对外部 GitHub 接口做读写的薄封装**。所以风险不在「代码多不多」，而在「改文件/删文件/冲突重试这些会写坏用户数据的分支有没有网」。

当前实测水位（`cd packages/github && npx jest --coverage`，4 套件 / 9 用例全绿）：

| 指标 | 数值 |
|---|---|
| 语句覆盖率 | **42.26%** |
| 分支覆盖率 | 27.71% |
| 函数覆盖率 | 38.18% |
| 用例数 | 9 |
| `src` 下非测试源文件 | 9 个（`Github.ts` 426 行、`GithubDb.ts` 420 行） |

按文件：

| 文件 | 语句 | 分支 | 函数命中 | 备注 |
|---|---|---|---|---|
| `Github.ts` | 28.4% | 15.6% | 8 / 19 | 只读了「按路径取内容」，**写路径 0** |
| `GithubDb.ts` | 36.0% | 41.2% | 8 / 27 | 只测了「大表读」一条路径 |
| `utils.ts` | 61.5% | 0% | 2 / 6 | 只测了 `formatDate` |
| `octokit.ts` | 50% | — | 0 / 1 | 工厂函数 0 次调用（被 `jest.mock` 顶掉） |
| `insightsUtils.ts` / `constants.ts` | 100% | 100% | — | 合格 |
| `index.ts` / `types.ts` | 不进分母 | — | — | 无测试导入 |

**0 覆盖的生产函数**（不是分支漏测，是整个方法从没被调用过）：

- `Github.ts`：`getBlob`、`getBlobContentAndSha`、`getFileContentAndSha`（**普通表的默认读路径**）、`getPlainTextByPath`、`updateFile`、`deleteFile`、`getDbsCfg`
- `GithubDb.ts`：全部拼路径函数（9 个）、`getTableRows` 的**非大表分支**、`getTableInsights`、`getRecordFileContentAndSha`、`updateTableFile`、`updateRecordFile`、`createDatabaseSchema`、`updateDatabaseSchema`、`createTableSchema`、`getDbTablesSchemaAsync`、`getDbTablesSchemaV2Async`、`deleteRecordFile`
- `utils.ts`：`validFilename`、`getRecordFileName`、`getInsightsFileName`

**热度与覆盖倒挂**（`packages/components/src` 里的生产调用数）：`updateTableFile` 12 处、`updateRecordFile` 8 处、`getRecordFileContentAndSha` 6 处、`deleteRecordFile` 5 处 —— 全部 0 覆盖。

---

## 1. 根因（为什么写路径是 0%）

补之前先解释原因。这不是「忘了写测试」，是**测试脚手架在几个关键处是断的**。

### 1.1 mock 边界形状不匹配 → 写方法在当前 UT 结构下根本调不动

`Github.test.ts` 把 `./octokit` mock 成：

```ts
mockedOctokitFactory.mockReturnValue({ request: mockRequest } as any);
```

但源码里是两条**不同形状**的调用通道：

| 方法 | 通道 | 现有 mock 支持？ |
|---|---|---|
| `getContentByPath` / `getContentByPathV2` | `octokit(token).request(url, params)` | 支持 |
| `getBlob` | `octokit(token).request(...)` | 支持 |
| `updateFile` | `octokit(token).rest.repos.createOrUpdateFileContents(...)` | **不支持**，一调就 `TypeError` |
| `deleteFile` | `octokit(token).rest.repos.deleteFile(...)` | **不支持**，同上 |

也就是说：**只要有人给写方法补用例，会先撞一个和业务无关的 TypeError**。这是前置障碍，必须先修（Stage 0）。

### 1.2 唯一覆盖 409 的测试不在 `npm test` 里

`src/Github.tt.ts` 是唯一覆盖「两个文件并发创建 → 409 → `DBMERR_UPDATE_FILE_409_CONFLICT`」的用例，它需要真实网络和 `DBM_GH_TOKEN`。

而 jest 默认 `testMatch` 只认 `**/*.test.ts` / `**/*.spec.ts`，`*.tt.ts` **不被匹配**（实测：`npm test` 只跑 4 个套件，`Github.tt.ts` 不在其中，它靠 `npm run tt` 手动跑）。

CI 的 `.github/workflows/test.yml` 跑的正是 `npm test`。结论：**CI 绿 ≠ 写路径可用**。这个包最贵的一条分支，目前没有任何自动网。

### 1.3 `Github.tt.ts` 的断言写在 `.catch()` 里 → 假绿

```ts
github.updateFile({...}).catch((error) => {
  expect(error).toBeInstanceOf(Error);
  expect(error.message).toBe(DBMERR_UPDATE_FILE_409_CONFLICT);
})
```

如果请求**没有**报错（比如上游修好了并发行为、或 token 权限变了导致走了别的分支），`.catch()` 不执行，两条断言被静默跳过，用例仍然 PASS。既不能证明 409 被正确映射，也不能证明冲突真的发生了。

### 1.4 覆盖率口径与闸门双缺失

- `jest.config.js` 里 `collectCoverage` / `collectCoverageFrom` / `coverageThreshold` **全是注释状态**（模板默认值），什么都没开。所以现在覆盖率分母只含「被 import 到的文件」——`index.ts`（9 行导出）根本不在分母里，表里 42% 是偏乐观的口径。
- `packages/github/package.json` 的 `test` 是 `jest --detectOpenHandles`，**不带 `--coverage`**；CI 也只跑 `npm test`。所以即便现在把 `coverageThreshold` 写进配置，jest 不收集覆盖率 → 阈值永远不被校验，是假动作。

### 1.5 `tsc` 会把测试文件一起编译（新测试写错类型会红）

`tsconfig.json` 的 `include` 是 `./src/**/*.ts`，`build.sh` 里 commonjs 与 es6 两路都跑 `tsc`。现状确实如此：`dist/` 和 `es6/` 里躺着一堆 `*.test.js` / `*.test.d.ts`（`.npmignore` 只排除了 `/src/`）。

后果：**新增/改动的测试文件会被 `tsc` 类型检查，且会作为产物编译到 `dist/es6`**。CI 在跑测试前还要 `npm run build -w packages/github`，所以测试文件类型不过 → CI 直接红（不是测试红，是构建红）。

已实测确认（在 `src/` 放一个故意写错的 `.ts`，跑 `npx tsc --noEmit --declaration false --emitDeclarationOnly false` → 报 `error TS2322`，随后已删除该探针文件）：

- `src/` 下新增文件确实会被 `tsc` 检查
- `import { Base64 } from 'js-base64'` 在测试里**可以正常解析类型**（`js-base64@3.7.7` 自带 `base64.d.ts`），`Github.ts` 顶部那条 `// @ts-ignore TODO Cannot find module 'js-base64'` 已过期

编译环境约束（写测试时要注意）：`target: es6` + `lib: ["es2018","dom"]` + `strictNullChecks: true`（**非** `strict`，隐式 any 允许）。测试里不要用 es2019+ 的 API（`Object.fromEntries`、`String.replaceAll`）。

### 1.6 已测的那条路径也是「最特殊」的一条

`GithubDb.test.ts` 唯一那条用例用的 schema 是 `users: { large: true }`，所以它走的是**大表分支**（先列目录拿 sha，再调 blob 接口）。普通表的默认分支（`getFileContentAndSha`）恰好是 0 覆盖——**主路径没测，旁路测了**。

### 1.7 已有的几条测试断言偏弱

- `GithubDb.test.ts`：只有 1 个 `it`，覆盖 2 个方法，断言全是「mock 收到了什么参数」（`toHaveBeenCalledWith`），没有任何「返回值/错误行为」断言。
- `Github.test.ts`：mock 在 `./octokit` 这一层，所以 URL 模板串和参数名从来没被真实 octokit 校验过（详见 §3 方案 A 的代价说明）。
- `formatDate` 用例依赖**机器时区**（`2021-07-04T01:16:01Z` → `2021-07-04 09:16:01`，即东八区），靠 CI 里的 `TZ: Asia/Shanghai` 兜着。顺带发现：根 `DEVELOP.md` 引用的脚本是 `"test": "TZ=Asia/Shanghai lerna run test"`，而根 `package.json` 实际是 `"test": "npm run test --workspaces"`，文档引文已漂移（TZ 实际由 workflow 的 env 提供）。

---

## 2. 范围方案对比

| | 方案 A（最小） | **方案 B（推荐）** | 方案 C（激进） |
|---|---|---|---|
| 内容 | 修 mock 形状 + 补写路径（P0） | A + 默认读路径 + `GithubDb` 路径/写方法 + 入参校验 + utils | B + 覆盖率闸门与 CI 改造（`--coverage` + 阈值） |
| 用例数 | 9 → ~25 | 9 → ~45 | ~45 + 配置 |
| `Github.ts` 语句 | ~70% | **≥88%** | ≥88% |
| `GithubDb.ts` 语句 | ~55% | **≥90%** | ≥90% |
| 能防住的回归 | 改文件/删文件的成功路径与 409 | + 普通表读取、dbcfg 读写、路径拼接约定 | + 覆盖率随提交漂移 |
| 主要风险 | 写路径测了但覆盖面窄，读路径仍裸 | 用例量翻 5 倍，需逐个核对断言质量 | 阈值口径变化（分母变大）容易被误读成退步 |

**推荐方案 B**，并把方案 C 作为紧随其后的一小步。

理由：Stage 0（修 mock 形状）是后面所有写路径用例的前置，绕不过；Stage 1–2 正好覆盖「会写坏用户数据」的分支，单位成本最低、回归价值最高；Stage 3 的路径函数是纯字符串断言，几乎零成本，却能挡住「路径拼错导致写到别的目录」这类最贵的 bug。闸门（C）放在最后单独一步做，因为开 `collectCoverageFrom` 会改变分母，必须重测后按新口径定阈值（详见 §4 Stage 5）。

---

## 3. mock 方案对比（比「补哪些用例」更关键）

现状：mock 在 `./octokit` 工厂层。要不要继续这样，是一个真决策。

| 方案 | 做法 | 能挡住「URL 模板串/参数名写错」吗 | 新依赖 | 与现有风格 | 结论 |
|---|---|---|---|---|---|
| **A（推荐）** | 继续 mock `./octokit`，补上 `rest.repos.*` 形状；对 URL 模板串做**契约断言**（把 `'GET /repos/{owner}/{repo}/contents/{path}'` 写死在断言里，源码改了模板串就红） | 能挡住「本地把模板串改错」 | 无 | 与现有 4 个测试文件一致 | 采用 |
| B | 用 `nock` / `msw` 拦 HTTP，让真 Octokit 发请求 | 能，且连参数序列化、header 都验证 | 有 | 引入新风格 | 暂不采用 |
| C | 抽一层 repository gateway，再 mock 这一层 | 不能（把该验证的边界又包掉一层） | 无 | 需重构生产代码 | 超范围 |

**选 A 要认的账**：参数名到底能不能被 octokit 接受，UT 仍然不知道（例如把 `repo` 写成 `repository`，或者参数名笔误）。这个盲区只能靠 `Github.tt.ts` 的真网冒烟守——所以**保留 `tt.ts`**，只修它的假绿问题（Stage 5），不改它的定位。

---

## 4. 分阶段执行

### Stage 0 — 修 mock 形状（前置，必须先做）

改 `src/Github.test.ts` 的 mock 与 `beforeEach`：

```ts
const mockRequest = jest.fn();
const mockCreateOrUpdateFileContents = jest.fn();
const mockDeleteFile = jest.fn();

// 三个 mock 都要在 beforeEach 里 mockReset()，不要只在模块作用域建一次
mockedOctokitFactory.mockReturnValue({
  request: mockRequest,
  rest: {
    repos: {
      createOrUpdateFileContents: mockCreateOrUpdateFileContents,
      deleteFile: mockDeleteFile,
    },
  },
} as any);
```

同时把 `src/GithubDb.test.ts` 里对 `./Github` 的 mock 补齐（模块级工厂对象与测试内 `mockGithub` 都要加 `updateFile` / `deleteFile`；`getPlainTextByPath` 从「单个用例内 override」提到模块级，避免后续用例踩空）。

**验收**：`npm test` 现有 9 个用例仍全绿。

---

### Stage 1 — 写路径（本计划的核心价值）

`Github.updateFile`（3 例）：

| 用例 | 输入 | 断言 |
|---|---|---|
| 成功 | `createOrUpdateFileContents` resolve `{ data: { commit: { sha: 'c1' } } }` | 返回值就是 `data`；调用参数含 `owner/repo/path/sha/message`、`content = base64(原文)`、`committer` 与 `author` 均为 `{name:'db-man-bot', email:'db-man-bot-email'}` |
| 409 冲突 | reject `{ response: { status: 409 } }` | `rejects.toThrow(DBMERR_UPDATE_FILE_409_CONFLICT)` |
| 非 409（500） | reject 同一个错误对象 `err` | `rejects.toBe(err)`（原样抛出、未被包装） |

`Github.deleteFile`（3 例）：同形状，409 → `DBMERR_DELETE_FILE_409_CONFLICT`；另加一条「不传 `message` 时默认值为 `'Delete file'`」。

> **这两条用例就是「让 CI 真正守住写路径」的关键交付物**：把原本只有真网 `tt.ts` 能覆盖的 409 映射，搬进 `npm test`。

**纪律**：409 用例必须断言**错误类型**（`instanceof Error` 或 message 原文），不能只断言「抛错了」。反向检查方式见 §7。

---

### Stage 2 — 默认读路径与错误分支

`Github.getFileContentAndSha`（3 例）：

| 用例 | mock `request` 返回 | 断言 |
|---|---|---|
| 正常 | `{ data: { name:'users.data.json', content: base64(JSON.stringify([{id:1}])), sha:'s1' } }` | `content` 深等于 `[{id:1}]`，`sha === 's1'` |
| path 是目录 | `{ data: [{ name:'a.json' }] }` | `rejects.toThrow('getFileContentAndSha failed, res is an array')` |
| 响应无 content | `{ data: { name:'x', sha:'s1' } }` | `rejects.toThrow('res.content is not in res')` |

> **不要**为 `data.content === ''` 写用例：那是不可达分支，见 §9.1。

`Github.getContentByPath` 错误映射（3 例）：401 → 消息含 `personal access token is invalid`；403 → 含 `file too large`；500（默认分支）→ 含 `unknow error`（**原文如此，别顺手修拼写**，修了就与断言不一致）。另断言 `err.cause` 保留了原始错误对象。

`Github.getDbsCfg`（3 例）：正常（base64 的 `{repoPath:'dbs', dbModes:'normal'}` 能解出对象，`sha` 透传；**并加契约断言** `mockRequest` 收到 `'GET /repos/{owner}/{repo}/contents/{path}'` 且参数为 `{ owner:'db-man', repo:'db', path:'dbs.json', request:{ signal: undefined } }`）、返回数组 → throw、无 content → throw。

---

### Stage 3 — `GithubDb` 侧

先修 Stage 0 提到的 mock，再加用例：

| 用例 | 断言要点 |
|---|---|
| `getTableRows('iam','roles')`（**非大表**） | 走 `getFileContentAndSha('dbs/iam/roles.data.json', undefined)` |
| `getTableRows` 大表但 `getContentByPath` 返回对象 | `rejects.toThrow('Expected an array of files')` |
| `getRecordFileContentAndSha('iam','users',1)` | 走 `getFileContentAndSha('dbs/iam/users/1.json')` |
| `updateTableFile` | `updateFile` 收到 `path='dbs/iam/users.data.json'`、`content=JSON.stringify(content, null, 1)`（**1 空格缩进，别写成 2**）、`message='[db-man] Update table file (iam/users)'`、sha 透传 |
| `updateRecordFile` | 路径主键取 `record[primaryKey]` → `'dbs/iam/users/1.json'`、`content=JSON.stringify(record, null, '  ')`（**2 空格**）、`message='[db-man] Update record file (iam/users)'` |
| `deleteRecordFile` | 走 `deleteFile`，`message='[db-man] Delete file (iam/users)'`、sha 透传 |
| `createDatabaseSchema` | `path='dbs/iam/dbcfg.json'`、`sha=undefined`、`message='[db-man] Create database schema (iam)'` |
| `updateDatabaseSchema` | 同路径，`sha` 透传 |
| `createTableSchema` | 让 `getContentByPath` 返回 base64 的 dbcfg → 断言新表被**追加**到 `tables` 末尾、`sha` 用的是读回来的那个 |
| `getDbTablesSchemaAsync` | 返回 `getFileContentAndSha` 的 `content` |
| `getDbTablesSchemaV2Async` | 返回 `{ obj, sha }`；无 content 时 throw |
| `getTableSchema` 异常 | dbsSchema 里没有该库 → throw `'this.dbsSchema is invalid!'` |
| 9 个路径函数 | 一个 `it` 里多条 `expect` 断言具体字符串（`getGitHubRepoPath` / `getGitHubFullPath` / `getGitHubHistoryPath` / `getDbConfigPath` / `getRecordPath` / `getDbViewScriptPath` / `getDataPath` / `getInsightsPath` / `getDataUrl`） |

路径函数看着「只是拼字符串」，但 `getDataPath` 用的是 `getDataFileName(tableName)`（`xxx.data.json`），而 `getInsightsPath` 用的是 `xxx.insights.gitlog`——**拼错就是把数据写到别的文件**。这组断言成本最低、收益最高。

---

### Stage 4 — 补齐其余读路径与纯函数

- `Github.getBlob` / `getBlobContentAndSha`：大表读的最后一公里；断言 URL 模板串 `'GET /repos/{owner}/{repo}/git/blobs/{sha}'` 与 base64 解码结果
- `Github.getPlainTextByPath`：正常返回原文 / path 是数组 → throw / 无 content → throw
- `GithubDb.getTableInsights`：正常 / 数组 → throw / 无 content → throw
- 构造函数入参校验：`Github` 3 条（token 为 `undefined`、token 为 `null`、owner 空、repoName 空）、`GithubDb` 5 条（+ repoPath 空、dbsSchema 空）
- `Github.getContentByPathV2` 的 403 与默认分支：返回 `[errorObj, null]`，`type` 为 `FileNoPermission` / `FileUknownError`（原文拼写）
- `utils.test.ts`：`validFilename`（空格、斜杠、中文、正常串）、`getRecordFileName`（数字主键 vs 字符串主键）、`getInsightsFileName`、`getDataFileName`

---

### Stage 5 — 闸门与假绿修复（单独一步）

1. `jest.config.js` 打开：`collectCoverage: false`（保持按需）、`collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/setupTests.ts']`，并加 `coverageThreshold`。
   **阈值必须按改造后的实测值取整向下减 2–3 个点**，不要按 §2 的目标值钉。理由是开 `collectCoverageFrom` 后 `index.ts`、`types.ts` 会进分母，百分比会立刻下降——这是口径变化，不是退步。
2. 让覆盖率真的被收集：`packages/github` 的 `test` 脚本加 `--coverage`（或在 `.github/workflows/test.yml` 增加独立一步）。**只加配置不改脚本 = 假动作**（见 §1.4）。
3. 修 `Github.tt.ts` 的假绿：改成 `await expect(promise).rejects.toThrow(...)`（或先 `Promise.allSettled` 拿到两个结果再断言），让它「没冲突」时也能红。属于改测试代码，不动生产行为。
4. 顺手更新根 `DEVELOP.md`：Testing 章节里引用的 `TZ=Asia/Shanghai lerna run test` 已与实际脚本漂移（见 §1.7），把真实命令与 `--coverage` 说明补上。

---

## 5. 硬性纪律（给执行者）

1. **不要改生产代码的行为**。本次只动 `src/*.test.ts` 与（Stage 5 的）配置。唯一的例外是 `error.response.status` 无空值保护（§9.2），那是一条独立决策，**未获批就不要改**；也不要写「无 response 时应原样抛出」这种在现状下必然失败的断言（等于用测试锁定一个没修的 bug）。
2. **不要为不可达分支写测试**（§9.1 那 4 处）。写了必然红，或被迫改成假断言。
3. **不要写「mock 被调用了」就算完的用例**。每个用例至少要有一条针对**返回值或错误**的行为断言。判据见 §7 的反脆弱抽查。
4. **不要在测试里发真实网络请求**（除 `tt.ts`）。
5. **不要「顺手」把 `Github.tt.ts` 改成 `.test.ts`**。它依赖真网 + 真 token，进 `npm test` 会让 CI 红。
6. **不要让测试文件类型不过**。`tsc` 会检查 `src/**/*.ts`，`npm run build` 会红（§1.5）。
7. **不要用 `git checkout` 撤销改动**（工作区常有未提交内容），要撤就逐文件手工恢复。
8. **不要在模块作用域建 mock 后就不管**：这三个 mock 必须在 `beforeEach` 里 reset，否则用例间互相污染（本仓库 `Github.test.ts` 已有这个习惯，保持）。
9. **不要修改断言文案来「适配」源码里的拼写错误**（如 `unknow error`、`FileUknownError`）。要么按原文断言，要么单独提「修拼写」，不要夹带。

---

## 6. 不做的事

- 不引入新测试依赖（不用 `nock` / `msw`，理由见 §3）
- 不重构生产代码（不抽 gateway、不改 `Github.ts` 结构）
- 不为提高覆盖率而拆分/搬迁 `GithubDb.ts`
- 不追求 `Github.ts` 100%——有 4 处不可达分支封顶（§9.1），目标定在 88%+
- 不动 `packages/components`（那边有独立计划）

---

## 7. 验收

每个 Stage 单独验收：

1. `cd packages/github && npm test` 全绿
2. 该 Stage 目标文件的语句覆盖率达标（Stage 1+2 后 `Github.ts` ≥ 88%、Stage 3 后 `GithubDb.ts` ≥ 90%、Stage 4 后 `utils.ts` 100%）
3. `npm run build -w packages/github` 通过（`tsc` 类型检查）
4. 根级 `npm test --workspaces` 全绿
5. **反脆弱抽查**：从本 Stage 新增用例里随机挑 3 条，临时把对应生产代码改坏（例如把 409 的 `DBMERR_UPDATE_FILE_409_CONFLICT` 换成别的字符串、把 `null, 1` 缩进改成 `null, 2`），确认测试**变红**，再改回。改坏也不红的用例 = 空断言，必须重写。

整体验收（全部 Stage 完成后）：

- [ ] 用例数 9 → ~45；`Github.ts` ≥ 88%、`GithubDb.ts` ≥ 90%、`utils.ts` 100%
- [ ] `DBMERR_UPDATE_FILE_409_CONFLICT` / `DBMERR_DELETE_FILE_409_CONFLICT` 两条映射在 `npm test` 内被覆盖
- [ ] `updateTableFile` / `updateRecordFile` / `deleteRecordFile` 的**路径 + message + 缩进**有断言
- [ ] `npm run build -w packages/github` 通过
- [ ] 未改动生产代码行为（除非单独批准 §9.2）
- [ ] 改动前的覆盖率输出（本次实测：语句 42.26% / 分支 27.71% / 函数 38.18%）保留在 commit message 或 PR 描述里作为对照

---

## 8. 风险与未知

| 风险 | 说明 | 应对 |
|---|---|---|
| 写路径用例只是「照着实现抄一遍」 | mock 掉 octokit 后，断言容易变成「实现快照」，改坏实现也测不出 | §7.5 反脆弱抽查；409 必须断言错误类型而非「抛错了」 |
| 参数名/URL 模板串的盲区仍在 | 选方案 A 的固有代价（§3） | 保留 `tt.ts` 真网冒烟；不要假装 UT 覆盖了它 |
| 阈值口径一变就误判退步 | 开 `collectCoverageFrom` 后分母变大，百分比必降 | Stage 5 强制「重测后再填阈值」，并写进 commit message |
| 测试文件被编译进 `dist/es6` | 现状如此（`.npmignore` 只排 `/src/`） | 本次不改；若日后要清理，另开单（§9.6） |
| `formatDate` 依赖机器时区 | 非东八区机器上直接跑会红 | 沿用 CI 的 `TZ=Asia/Shanghai`；新增日期断言时显式提 TZ（§1.7） |
| `js-base64` 的类型解析看似诡异 | 源码里有一条已过期的 `@ts-ignore` | 实测该 import 可正常解析（§1.5），测试里造 base64 推荐 `Buffer.from(JSON.stringify(x)).toString('base64')`，最直白不踩坑 |
| 用 500 之类的假状态码断言「默认分支」 | octokit 真实错误对象形状与手写 `{ status: 500 }` 有差 | 断言只能覆盖我们**自己代码**的分支逻辑，这一点要在用例注释里写明，避免后人误以为验证了 octokit 行为 |

---

## 9. 死代码与隐患登记（S2：本次只记录，不动代码）

1. **4 处不可达分支**（前面 `!data.content` 已提前 throw，`=== ''` 的 else 永远走不到）：
   - `Github.ts:232` `getFileContentAndSha` 的 `rows = []`
   - `Github.ts:270` `getPlainTextByPath` 的 `return ''`
   - `Github.ts:409` `getDbsCfg` 的 `throw new Error('getDbsCfg failed, dbs.json file content is empty.')`
   - `GithubDb.ts:257` `getTableInsights` 的 `return ''`

   这几行就是 `Github.ts` 到不了 100% 的原因，也是「本包唯一注释里写着『no idea why this happens』」的地方。
2. **`error.response.status` 无空值保护**：`Github.updateFile` / `deleteFile` 的 catch 里直接读 `error.response.status`，网络层错误（无 `response`）会抛 `TypeError` 而不是被原样抛出。修法：`error?.response?.status`。**独立决策，未批准不改**。
3. **生产代码 0 调用的死代码**：`GithubDb.getGitHubHistoryPath`（只在 `components/src/pages/DbTablePage/ListPage/index.test.tsx:55` 的 mock 里出现过）、`Github.getContentByPathV2`（只在 `Github.test.ts` 里出现）。
4. **`GithubDb.isLargeTable` 签名说返回 boolean**，实际 `return table.large`，表里没写 `large` 字段时是 `undefined`。调用点 `if (!this.isLargeTable(...))` 恰好能容忍。
5. **`Github.ts` 顶部的 `// @ts-ignore TODO Cannot find module 'js-base64'` 已过期**（实测类型可解析），可清。
6. **`dist/` 与 `es6/` 里带着编译后的测试文件**，且 `.npmignore` 只排除了 `/src/` → 发布产物含测试代码。历史行为，非本次范围。

---

## 10. 附：本次实测用到的命令

```sh
cd packages/github

# 跑测试（等价于 npm test）
npx jest --detectOpenHandles

# 带覆盖率（本计划的基线命令，约 8 秒）
npx jest --coverage

# 只在带真实 token 时跑的真网冒烟（不在 CI）
DBM_GH_TOKEN=ghp_xxx npm run tt

# 类型检查（等价于 build 里的 tsc 环节，用来提前发现测试文件的类型问题）
npx tsc --noEmit --declaration false --emitDeclarationOnly false
```

覆盖率产物落在 `packages/github/coverage/`，已被根 `.gitignore` 忽略（不进仓库也不发 npm）。
本次分析产生的 `coverage/` 目录与其间用到的临时探针文件均已删除，工作区除本文件外无改动。
