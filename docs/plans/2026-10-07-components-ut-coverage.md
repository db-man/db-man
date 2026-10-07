# packages/components 单元测试补强计划

- 日期：2026-10-07
- 范围：`packages/components`（`@db-man/components`）
- 状态：**Stage 0 / 1 / 1.5 / 2 / 3 / 4 已完成并通过验收**；Stage 5 待做

---

## 执行记录

| Stage | 状态 | 结果 |
|---|---|---|
| 0 脚手架与口径 | ✅ 完成 | 分母 104 → 90 个文件；`*Demo` / `*.cy` / `*.t` / 入口文件已剔除；新增 `npm run test:coverage`；CI 增加带覆盖率的步骤 |
| 1 复活停用测试 | ✅ 完成 | 3 个停用文件处理完毕：2 个改回 `.test.tsx` 并修正后跑通、1 个转换成 jest 测试后删除原 `.cy.tsx` |
| 1.5 基线 + 阈值 | ✅ 完成 | `coverageThreshold.global` = lines 31 / statements 30 / functions 24 / branches 25 |
| 2 逻辑层 | ✅ 完成 | 8 个目标文件全部达标（最低 98.2%），行覆盖 33.59% → **43.87%**；阈值同步抬到 lines 41 / statements 41 / functions 34 / branches 34 |
| 3 ListPage 深入 | ✅ 完成 | `ListPage/index.tsx` 行覆盖 68.96% → **100%**（函数 100%、分支 90.62%），5 → 25 个用例；包整体 43.87% → **49.03%**；阈值抬到 lines 47 / statements 46 / functions 40 / branches 40 |
| 4 表单组件族 | ✅ 完成 | 新增 13 个测试文件 / 72 个用例（FormValidations、StringFormField(Value)、Select/RadioGroupFormField、两个 FieldWrapper、EditorBody 15 用例、RefTableLink(s)、DistinctColumn、JsonEditor、一行断言级小组件合集）；包整体行覆盖 49.03% → **58.96%**（语句 58.38 / 分支 55.18 / 函数 53.54）；阈值抬到 lines 57 / statements 56 / functions 51 / branches 52 |
| 5 写路径（可选） | ⬜ 未开始 | — |

### release.sh 决策（2026-10-08 用户拍板）

用户决定 release.sh **需要**带覆盖率校验（否定了此前"CI 是唯一判定点、release 不需要"的建议）：`packages/components/release.sh` 的测试步骤已改为 `CI=true npm run test:coverage`，发布前同样强制阈值。

### 覆盖率水位变化（实测）

| 阶段 | 行 | 语句 | 分支 | 函数 | 套件 | 用例 |
|---|---|---|---|---|---|---|
| 起点 | 16.33% | 15.96% | 13.87% | 13.64% | 14 passed / 1 skipped | 63 passed / 1 skipped |
| Stage 0 后（口径变化） | 17.02% | 16.60% | 14.08% | 14.37% | 同上 | 同上 |
| **Stage 1 后** | **33.59%** | **32.93%** | **27.52%** | **26.77%** | **18 passed / 0 skipped** | **80 passed / 0 skipped** |
| **Stage 2 后** | **43.87%** | **43.13%** | **36.74%** | **36.81%** | **22 passed / 0 skipped** | **175 passed / 0 skipped** |
| **Stage 3 后** | **49.03%** | **48.56%** | **42.89%** | **42.51%** | **22 passed / 0 skipped** | **195 passed / 0 skipped** |
| **Stage 4 后** | **58.96%** | **58.38%** | **55.18%** | **53.54%** | **35 passed / 0 skipped** | **267 passed / 0 skipped** |

### 验收证据（Stage 0 / 1）

- 反脆弱抽查 4/4：分别改坏 `ListPage` 的失败提示文案、重复主键告警、`DbTablePage` 的 404 分支、`SettingSwitch` 写 localStorage 的分支 → 对应测试**全部变红**；改回后全绿
- 阈值真实生效：临时把 `lines` 抬到 99，jest 报 `"global" coverage threshold for statements (30%) not met: 0.43%` → 证明阈值确实被校验（不是假动作）
- 类型：`tsc --noEmit`（沿用 `tsconfig.json`）干净 —— 这一点必须守住，因为 `build.sh` 会跑 `tsc`
- 抽查用的 3 个生产文件已逐字节还原，`git status` 确认未残留改动

### 验收证据（Stage 2）

逐文件实测（`coverage/coverage-summary.json`，行覆盖）：

| 文件 | 起点 | 现在 | 目标 | |
|---|---|---|---|---|
| `src/components/EditorBody/helpers.ts` | 32.4% | **100%** | ≥90% | ✅ |
| `src/pages/Settings/helpers.ts` | 5.9% | **98.5%** | ≥80% | ✅ |
| `src/pages/DbTablePage/ListPage/helpers.ts` | 46.6% | **100%** | ≥90% | ✅ |
| `src/utils.ts` | 23.8% | **100%** | ≥80% | ✅ |
| `src/dbs.ts` | 45% | **100%** | ≥80% | ✅ |
| `src/utils/indexedDBHelpers.ts` | 0% | **100%** | ≥70% | ✅ |
| `src/components/EditableTable/index.tsx` | 29% | **98.2%** | ≥70% | ✅ |
| `src/components/EditableTable/EditableCell.tsx` | 64% | **100%** | ≥70% | ✅ |

- 阈值同步抬到 lines 41 / statements 41 / functions 34 / branches 34（按新水位向下取整再减 2 点），改完**重跑全量确认通过**（EXIT=0）
- 类型：`tsc` 仍然干净（新增 4 个测试文件、改写 1 个）

### 验收证据（Stage 3）

`ListPage/index.tsx` 单文件实测（`coverage/coverage-final.json`）：

| 指标 | 起点 | 现在 |
|---|---|---|
| 行 | 68.96% | **100%** |
| 函数 | 71.05% | **100%** |
| 语句 | 67.94% | **98.71%** |
| 分支 | 42.18% | **90.62%** |

用例数 5 → 25。剩下的分支缺口经逐条核对**都是构造上不可达的**，不写测试去凑：

| 行 | 代码 | 为什么不可达 |
|---|---|---|
| 189 / 190 / 211 / 212 | `pagination.current \|\| defaultPage` 的 `\|\|` 兜底 | antd 的 `Pagination` 与 `ImageCardTable` 的 `onChange` 永远传数字，`current` / `pageSize` 不会是 falsy |
| 245 / 261 | `if (!rows) return null;` | `renderTable()` 只在 `rows` 非空时被调用（`index.tsx:420` 已先 `if (!rows) return null`） |

- 反脆弱抽查 6/6：分别改坏①`contentTableName !== tableName` 守卫、②`hasVal` 的 `STRING_ARRAY` 判断、③重复主键告警的返回条件、④末页提示文案、⑤`case ImageView:` 分支、⑥去掉重复取数的那个 effect（对照 `fetches the rows twice on mount`）→ 对应用例**全部变红**
- **抽查过程本身出过两次假信号，都已纠正**：
  1. 第一轮里有一条 `sed` 因为模式含 `||` 撞上了 `|` 分隔符而**静默失败**，那次结论无效 → 改用 `@` 做分隔符，并在打补丁后 `grep` 确认真的改到了
  2. 第一轮的 `re-fetches and hides the old rows` 用例在守卫被改坏后**仍然通过**——它验的是用户可见结果（旧行不残留），真正挡住旧行的是 `loading` 态而不是那行守卫。为此**新增** `hides the rows while the context points at a different table`，只让 context 前进、不触发重新取数，从而真正隔离那条守卫（第 6 条抽查已证实它会被改坏代码打红）
- 生产文件逐字节还原，`md5` 校验一致（`5a60374e450719642c1460ffa5aabad0`）
- 阈值抬到 lines 47 / statements 46 / functions 40 / branches 40，**重跑全量确认通过**（EXIT=0）
- 类型：`tsc` 干净

### 验收证据（Stage 4）

- 全量 `--coverage`：35 套件 / **267 用例全部通过**；包整体行 **58.96%** / 语句 58.38% / 分支 55.18% / 函数 53.54%
- 阈值抬到 lines 57 / statements 56 / functions 51 / branches 52，**重跑全量确认通过**
- 类型：`tsc`（`-p tsconfig.json`，对 `emitDeclarationOnly` 冲突做了等价绕行）对 `src/` **干净**；node_modules 与 babel 产物（`es/`、`lib/`）的既有报错与本次改动无关
- 反脆弱抽查 4/4：①反转 `EditorBody` 主键空格告警条件 → `warns when the primary key value contains whitespace` 变红；②反转 `StringFormField` 的 split-table 分支 → 重复主键告警 / 跳过重复检查 / 文件名过长 3 个用例变红。改坏后 4 失败、全部命中对应语义用例
- **抽查用的 2 个生产文件已逐字节还原**（md5 前后一致：`2f43de…` / `63fef6…`），`git status` 确认无残留

---

## 0. 目标

把 `packages/components` 从「逻辑层测了、视图层基本裸奔」推到「关键路径有回归网 + 覆盖率不会回退」。

当前实测水位（`CI=true npx react-scripts test --coverage --watchAll=false`）：

| 指标 | 数值 |
|---|---|
| 行覆盖率 | 16.3%（300/1836） |
| 分支覆盖率 | 13.9% |
| 函数覆盖率 | 13.6% |
| 测试套件 | 14 passed / 1 skipped，共 63 用例 |
| `src` 下源文件 | 105 个（非测试） |

按域拆分：

| 区域 | 行覆盖率 | 有代码文件数 | 其中 0 覆盖 |
|---|---|---|---|
| 纯逻辑/工具（ddRender、各 `helpers.ts`、searchUtils、utils、hooks） | 49.1%（159/324） | — | — |
| `src/components/**` | 13.4%（80/598） | 45 | 33 |
| `src/pages/**` | 11.9%（113/952） | 30 | 20 |
| `src/layout/**` | 4.8%（3/63） | 8 | 7 |

> 这些数字是本次实测，不是估算。跑一次约 90 秒。

---

## 1. 根因（已实测，不是推测）

补强之前必须先理解为什么视图层是 0%。这不是「没写测试」，是**测试脚手架缺能力**。

### 1.1 jsdom 缺 antd 必需的垫片

`src/setupTests.ts` 目前只 mock 了 `localStorage`，没有 `window.matchMedia`，也没有 `ResizeObserver`。

实测证据：把 `<ListPage>` 放进 jsdom 直接抛

```
TypeError: window.matchMedia is not a function
    at antd/lib/_util/responsiveObserver.js:93:30
    at Object.register (responsiveObserver.js:83)
    at antd/lib/grid/row.js:93:38        // <Row> 的 useEffect
```

佐证：**全仓 14 个测试文件，没有任何一个 import 过 antd**（`grep -rln "from 'antd'" src/ --include="*.test.*"` 为空）。唯一 import 过 antd 的 `Settings/index.test.jsx` 渲染的是壳组件，且必须在 `it()` 里临时定义 `matchMedia` 才能跑。

### 1.2 CRA 的 `resetMocks: true` 会静默清空 mock

`node_modules/react-scripts/scripts/utils/createJestConfig.js:68` 设了 `resetMocks: true`。它的行为是**每个用例执行前重置所有 mock**。

后果：写在**模块作用域**的 `jest.fn().mockImplementation(...)` / `.mockResolvedValue(...)` 到了用例里就是空的，调用返回 `undefined`，报错信息还完全指不到 mock 上。

这解释了仓库里一个看起来很怪的惯例 —— 四处 `matchMedia` 全部塞在 `it()` 内部：
`Settings/index.test.jsx`、`ListPage/index.test.tsx`、`AppRoutes.t.tsx`、`DbTablePage.t.tsx`。

我在写探针时连续踩中两次：
- 第 1 次：模块作用域的 `matchMedia` mock 被清空 → `cannot read 'addListener' of undefined`
- 第 2 次：模块作用域的 `getTableRows.mockResolvedValue({content})` 被清空 → 组件收不到数据，走到 catch 渲染 error Alert

把 mock 挪进用例内部后，探针立即通过。

### 1.3 覆盖率口径把不该算的东西算进了分母

`createJestConfig.js:28` 的默认值是 `collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts']` —— 只按扩展名筛，不区分文件角色。于是这些全部计入分母：

| 类别 | 例子 | 问题 |
|---|---|---|
| 纯演示文件（约 10 个） | `MultiLineInputBoxDemo.tsx`、`PhotoListDemo.tsx`、`RadioGroupFormFieldDemo.tsx` | 不是产品代码，不该有测试 |
| 被停用的测试文件 | `AppRoutes.t.tsx`（46 行）、`DbTablePage.t.tsx`（124 行） | 是测试，却被当成被测代码算 0% |
| Cypress 组件测试 | `SettingSwitch.cy.tsx` | jest 不执行它，却被插桩 → 挂一个洗不掉的 0% |
| 入口/引导文件 | `index.tsx`、`lib.ts`、`reportWebVitals.ts` | 无断言价值 |

### 1.4 仓库里有 3 个被刻意停用的测试文件

这是视图层 0% 的直接原因 —— **不是没写过，是被关掉了**：

| 文件 | 停用方式 | 内容 |
|---|---|---|
| `src/pages/DbTablePage/ListPage/index.test.tsx` | `describe.skip`，121 行里所有断言被注释 | 唯一试图测 506 行最大页面的测试 |
| `src/pages/DbTablePage/DbTablePage.t.tsx` | 后缀改成 `.t.tsx`，不匹配 CRA 的 `testMatch`（`src/**/*.{spec,test}.{js,jsx,ts,tsx}`）→ jest 永不执行 | `describe.skip` |
| `src/layout/AppRoutes.t.tsx` | 同上，且首行加了 `/* istanbul ignore file */` | 46 行真实测试（用 MemoryRouter） |

停用原因已不可考：`git log --follow` 显示这几个文件都来自同一次 `855c7a0 init` 提交（仓库历史被压平过）。

### 1.5 覆盖率阈值即使配了也不会生效

`packages/components/package.json` 的 `test` 脚本是 `CI=true npm run test-cra` → `react-scripts test`，**不带 `--coverage`**。

不带 `--coverage` 时 jest 根本不收集覆盖率，`coverageThreshold` 也就无从校验。所以「配阈值防回退」必须同时改脚本 + 改 CI，只加配置是假动作。

### 1.6 探针验证：视图层是可测的

我写了个一次性探针（已删除，工作区干净），在补齐 `matchMedia` / `ResizeObserver` / `scrollTo` 三个垫片、并把 mock 放进用例内部之后：

```
PASS src/__probe__/listpage.probe.test.tsx
    ✓ should render row data
```

`<ListPage>` 正常渲染出 antd 表格和行数据，断言通过。**结论：缺的是脚手架，不是能力。**

另外所有页面都通过 `PageContext` / `CommonPageContext` 拿 `githubDb`（已确认 `CreatePage`、`SchemaPage`、`UpdatePage`、`CreateDb`、`CreateTableForm` 都是 `useContext` + `githubDb?.xxx()`），所以 mock 策略是**注入桩对象**，不需要 mock 整个 `@db-man/github` 模块。这让后续测试成本大幅下降。

---

## 2. 范围方案对比

| | 方案 A（最小） | **方案 B（推荐）** | 方案 C（激进） |
|---|---|---|---|
| 内容 | 修环境 + 修口径 + 复活 ListPage | A + 逻辑层补齐 + 复活全部停用测试 + 阈值防回退 | B + 表单组件族 + 三个写页面 |
| 预计行覆盖率 | ~22–25% | ~33–38% | ~55–65% |
| 相对投入 | 1 个短 PR | 3–4 个 PR | 8+ 个 PR，需排期 |
| 能防住的回归 | ListPage 渲染 | + 数据筛选/排序、schema 校验、编辑器字段校验 | + 建表/改记录/删记录的写路径 |
| 主要风险 | 只修口径会被误认为"覆盖率涨了其实是分母小了" | 需要拒绝写空断言，否则数字虚高 | 写路径 mock 面大，容易测成"实现快照" |

**推荐方案 B**，理由：Stage 0 是纯收益（不修的话后面每个视图测试都要重复踩坑）；Stage 1 近乎零成本回收已有投入；Stage 2 是纯函数，单位成本最低、回归价值最高；方案 C 的写路径值得做，但应单独排期，避免一锅端。

---

## 3. 分阶段执行

### Stage 0 — 脚手架与统计口径（必须先做，是后面所有阶段的前置）

**0.1 补 `src/setupTests.ts` 的垫片**

关键约束：**必须用普通函数，不能用 `jest.fn()`** —— 用 `jest.fn()` 会被 `resetMocks: true` 清空，等于没写（见 §1.2）。

```ts
// antd needs matchMedia; jsdom does not implement it.
// MUST be a plain function, NOT jest.fn(): CRA sets `resetMocks: true`,
// which would wipe a module-scope mock before every test.
const noop = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  }),
});

// antd Table / Segmented use ResizeObserver; jsdom does not implement it.
(window as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom throws "Not implemented: window.scrollTo"
window.scrollTo = noop as any;
```

**0.2 修 `packages/components/package.json` 的 jest 配置**

CRA 允许在 `package.json` 里覆盖的 jest 键有白名单（`createJestConfig.js:74-92`），`collectCoverageFrom` 和 `coverageThreshold` 都在里面。

```json
"jest": {
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*Demo.{js,jsx,ts,tsx}",
    "!src/**/*.cy.{js,jsx,ts,tsx}",
    "!src/**/*.t.{js,jsx,ts,tsx}",
    "!src/index.tsx",
    "!src/lib.ts",
    "!src/reportWebVitals.ts",
    "!src/react-app-env.d.ts",
    "!src/example/**",
    "!src/pages/demos/**"
  ]
}
```

`coverageThreshold` **先不要加**。Stage 0 会改变分母，旧基线 16.3% 立即作废；必须重测后再填（见 0.4）。

**0.3 让覆盖率真的被收集**

`package.json` 加脚本：

```json
"test:coverage": "CI=true react-scripts test --coverage"
```

`.github/workflows/test.yml` 的 `Run tests` 步骤改跑 `npm run test:coverage -w packages/components`（或在 root 加对应聚合脚本）。不改这一步，阈值永远不会被校验。

**0.4 重测基线并把阈值补上**

跑 `npm run test:coverage -w packages/components`，拿到**新口径下**的百分比，把它**取整向下减 2 个点**写进 `coverageThreshold.global`。

**交付物**：改后的 `setupTests.ts`、`package.json`、`.github/workflows/test.yml`

**验收**：
- `npm run test:coverage -w packages/components` 全绿
- 覆盖率表里不再出现 `*Demo.tsx`、`*.cy.tsx`、`*.t.tsx`
- CI 跑一次是绿的
- 记录下新基线数字（写进本文件的"基线"小节或 PR 描述）

---

### Stage 1 — 复活 3 个被停用的测试（成本最低，先回收已有投入）

> **实际落地结果**（2026-10-07）：
> - `ListPage/index.test.tsx`：`describe.skip` 拆掉，5 个用例全跑通（加载态 / 成功渲染 / 失败 Alert / 重复主键告警 / 非法行告警 / 筛选）。原文件里那个巨大的 `githubDb` 桩对象精简成只保留 `getTableRows`，因为 `ListPage` 只用这一个方法。
> - `AppRoutes.t.tsx` → `AppRoutes.test.tsx`：**关键修法**是必须用 `AppContext.Provider` 包住 —— `PageLayout` 调 `useAppContext()`，没有 Provider 直接抛异常，这才是它当初被停用的真正原因。另外把断言从"Failed to get dbs from localStorage"改成实际的 `NotFound`（`dbs` 是 `{}` 时是 truthy，那句守卫永远不成立）。
> - `DbTablePage.t.tsx` → `DbTablePage.test.tsx`：原fixture用的是**过期的 schema 形状**（`{iam: [{...}]}` 数组），与 `src/dbs.ts` 期望的 `{iam: {tables: [...]}}` 不符，属于"碰巧测出了 No columns"；已换成正确形状。`jest.mock('@db-man/github')` 的工厂里 **必须用普通 class 而不是 `jest.fn()`**（否则被 `resetMocks` 清成 `undefined`，`useRef(new GithubDb(...))` 直接崩）。
> - `SettingSwitch.cy.tsx`：改成 jest 测试 `SettingSwitch.test.tsx` 并删掉原文件。理由：`.github/workflows/cypress.yml` 只跑 e2e（没有 `--component`），这个组件 spec 在 CI 里**从来没被执行过**，留着就是死重。
> - `!src/**/*.t.{js,jsx,ts,tsx}` 已从 `collectCoverageFrom` 移除，避免将来再有人用改后缀的方式"静默停用"测试。

**1.1 `src/pages/DbTablePage/ListPage/index.test.tsx`**
- 去掉 `describe.skip`，解开被注释的断言
- `getTableRows` 的 `mockResolvedValue` 必须放在 `beforeEach` 里（§1.2）
- 删掉用例内联的 `matchMedia`（Stage 0 已由 setupTests 提供）
- 断言用 `await screen.findByText(...)`，不要用同步 `getByText`

**1.2 `src/layout/AppRoutes.t.tsx` → `AppRoutes.test.tsx`**
- 改回后缀使其被 `testMatch` 命中
- 删掉首行 `/* istanbul ignore file */`
- 删掉内部的 `matchMedia` 定义，改由 setupTests 提供
- 注意它用的是 `MemoryRouter`（比 `BrowserRouter` 更适合，保留）

**1.3 `src/pages/DbTablePage/DbTablePage.t.tsx` → `DbTablePage.test.tsx`**
- 评估 `describe.skip` 里的内容能否救活。救不活就**直接删文件**，不要留一个空壳测试。

**1.4 `src/pages/Settings/SettingSwitch.cy.tsx`**
- 它是 Cypress 组件测试，jest 不执行。只有一句 `cy.mount`、零断言。
- 二选一：补上断言并留在 Cypress 通道，或删掉。不允许继续挂在 jest 覆盖率里占位。

**验收**：这 4 个文件要么真跑起来、要么删掉。**不接受"存在但被跳过"的中间态。**

---

### Stage 2 — 逻辑层补齐（纯函数，单位成本最低）

| 文件 | 当前行覆盖 | 目标 | 测什么 |
|---|---|---|---|
| `src/components/EditorBody/helpers.ts` | 32.4% | ≥90% | `validatePrimaryKey`（命中/未命中）、`isType`（字符串形态、数组形态、`WithPreview`）、`getFormInitialValues`（RadioGroup 取 `ui:createUpdatePage:enum[0]`、已有值不覆盖）、`obj2str`/`str2obj`、`checkFieldValue`（主键超 255、非主键不校验） |
| `src/pages/Settings/helpers.ts` | 5.9% | ≥80% | `validateDbsSchame`（六类缺失字段各造一个用例）、`saveConnectionToLocalStorage`、`loadDbsSchemaAsync`（含 404 → 自定义错误分支）、`reloadDbsSchemaAsync` 的四条 early return（`getDbsCfg` 抛错 / 缺 `repoPath` / 缺 `dbModes` / schema 非法） |
| `src/pages/DbTablePage/ListPage/helpers.ts` | 46.6% | ≥90% | `getInitialFilter`（URL `filter` 参数、坏 JSON 走 catch）、`updateUrl`（对象值与字符串值两条分支）、`getColumnSortOrder` 三态、`getSortedData` 升降序、`findDuplicates`、`getFilteredData`（全空筛选直接返回原数组的短路分支） |
| `src/utils.ts` | 23.8% | ≥80% | `errMsg` 等纯函数 |
| `src/dbs.ts` | 45% | ≥80% | — |
| `src/utils/indexedDBHelpers.ts` | 0% | ≥70% | 注意 jsdom 没有 `indexedDB`，需要 `fake-indexeddb` 或把纯逻辑抽出来测 |
| `src/components/EditableTable/index.tsx` + `EditableCell.tsx` | 29% / 64% | ≥70% | 增行 / 改值 / 保存 / 非法输入 |

**`Settings/helpers.ts` 的特殊说明**：`reloadDbsSchemaAsync` 内部是 `new Github({...})` 直接实例化，**没法用注入**，必须 `jest.mock('@db-man/github')`。仓库里已有可照抄的写法 —— `src/pages/DbTablePage/UpdatePage/helpers.test.ts:5-9`。

末尾的 `setTimeout(() => window.location.reload(), 3000)` 用 `jest.useFakeTimers()` 处理，并 mock 掉 `window.location.reload`（jsdom 的 reload 会报 not implemented）。

**验收**：上表文件行覆盖达标；断言针对行为（输入 → 输出），不是快照。

#### Stage 2 执行记录（已完成）

| 文件 | 测试文件 | 用例数 | 实际手法 |
|---|---|---|---|
| `EditorBody/helpers.ts` | `EditorBody/helpers.test.ts`（原文件只有 2 个用例，在其上补齐） | 25 | 纯函数直测；`checkFieldValue` 补上 250/251 字符的边界 |
| `ListPage/helpers.ts` | `ListPage/helpers.test.ts`（原有 6 个用例，追加到 29） | 29 | URL 相关用 `window.history.pushState` 改地址再断言；顺带测了原计划漏掉的 `getInitialSorterFromUrl` |
| `Settings/helpers.ts` | `Settings/helpers.test.ts`（新建） | 15 | `jest.mock('@db-man/github')` 桩掉 `Github` 构造器；`jest.mock('../../utils')` 桩掉 `errMsg` 让错误路径安静且可计数；`messageApi` 用桩对象；`jest.useFakeTimers()` 吃掉 3 秒后的 reload |
| `utils.ts` | `utils.test.js`（原有 1 个用例，追加到 7） | 7 | `downloadImage` 需要 `fetch` / `Headers` / `URL.createObjectURL`，jsdom 三样都没有 → 测试里补桩，并 spy `HTMLAnchorElement.prototype.click` 读 `download` 属性 |
| `dbs.ts` | `dbs.test.ts`（新建） | 13 | 直接改 `localStorage` 再调 |
| `utils/indexedDBHelpers.ts` | `indexedDBHelpers.test.ts`（新建） | 6 | **没有引入 `fake-indexeddb`**；这三个函数本质是「回调 API → Promise」的适配层，用手写的 request 对象手动触发 `onsuccess` / `onerror` 就够，且不需要新依赖 |
| `EditableTable` | `EditableTable/index.test.tsx`（新建） | 9 | 用 RTL 跑真实交互：增行 / 填值 / 保存 / 必填校验 / 取消 / 删除（Popconfirm 点确认）；`getColumns` 照抄真实调用方的 `onCell` 写法 |

关键发现：`reloadDbsSchemaAsync` 里的 `validateDbsSchame` **没有导出**，无法直接单测。改成走 `reloadDbsSchemaAsync` 的完整路径来验它（喂一份有缺陷的 schema，断言拒绝保存），代价是每条用例都要铺一遍 mock。这比为了好测去改生产代码的导出边界更划算（§4 纪律第 6 条）。

---

### Stage 3 — ListPage 真正测起来（全包最大单文件，506 行）

用探针验证过的模式：

```tsx
render(
  <BrowserRouter>
    <PageContext.Provider value={{ ...context, githubDb: { getTableRows: stub } as any }}>
      <ListPage tableName="users" />
    </PageContext.Provider>
  </BrowserRouter>
);
```

要覆盖的行为（都是真实分支，不是凑数）：

- 加载态：`Loading db-man/users ...`
- 成功态：行数据渲染进 antd Table
- 失败态：`getTableRows` reject → 渲染 `Failed to get data: ...` 的 error Alert（`index.tsx:237-240`）
- 重复主键告警 `alertDuplicatedRowKey`（`index.tsx:244-257`）
- 主键缺失告警 `alertTableDataInvalid`（`index.tsx:259-283`）
- `contentTableName !== tableName` 时 `renderTable()` 返回 null（`index.tsx:394`）
- 三种视图切换：Table / Image / Random
- 筛选：改 Input → 结果集变化
- 排序：`handleTableChange` → `setSorter`
- 键盘左右翻页：`ArrowRight` / `ArrowLeft`，含首尾边界（`This is the last page!`）
- 卸载时 `AbortController.abort()`

**坑**（计划时的判断，实测后有修正）：
- `debounce(updateUrl, 500)` 是模块级的 —— 计划里写的是"用 fake timers 推进 500ms"，**实测后没用这条路**：fake timers 和 RTL 的 `waitFor` 混用要到处补 `advanceTimers`，反而更脆。改成用 `jest.mock('lodash.debounce')` 把这个模块级 debounce 的等待缩短到 20ms，保留真实的 `updateUrl` 和真实的 `window.location`，只是跑得快。断言落在 **URL 上**（`window.location.search` 含 `page=2` / `filter=...` / `sorter=...`），比断言一个 mock 更强
- `window.scrollTo` 已由 Stage 0 垫片解决

**目标**：`ListPage/index.tsx` 行覆盖 **≥60%**。

**执行结果（已完成）**：行覆盖 **100%**（函数 100%、语句 98.71%、分支 90.62%），5 → 24 个用例。目标超额完成。

覆盖到的行为（每条都对应一个用例）：

| 用例 | 覆盖的分支 |
|---|---|
| 加载中显示 `Loading iam/users ...` | `index.tsx:83, 228, 418` |
| 成功渲染行数据 | 主路径 |
| 失败渲染 error Alert | `index.tsx:237-240` |
| 重复主键告警 | `alertDuplicatedRowKey`（244-257） |
| 主键缺失告警 | `alertTableDataInvalid`（259-283） |
| 筛选框改变结果集 | `handleFilterChange`（172-182） |
| 从 URL 读 sorter 排序 / 无 sorter 时按 createdAt 降序 | `index.tsx:109-112`、`getColumnSortOrder` |
| `type:listPage: "HIDE"` 的列被过滤掉 | `index.tsx:294` |
| 每行的 Update / Detail 链接（含 `encodeURIComponent`） | `index.tsx:357-387` |
| `referenceTable` 列的 Popover 与 Ref Table 链接 | `index.tsx:312-337` |
| `STRING_ARRAY` 列为空时不渲染 Popover | `index.tsx:314-320` |
| `tableName` 变化时隐藏旧表数据并重新取数 | `index.tsx:168-170` |
| context 指向别的表时不渲染表格（真正隔离 `contentTableName` 守卫） | `index.tsx:394` |
| 切到 Image View 并翻页（`handleCardTableChange`） | `index.tsx:210-218, 425-438` |
| Image View 缺 key 列时报警 | `ImageCardTable` 的 `!imgKey` 分支 |
| URL 里是未知 view 时什么都不渲染 | `index.tsx:448-449`（default 分支） |
| 切到 Random View 并改 pageSize（`handleRandomListChange`） | `index.tsx:220-225, 439-446` |
| 用表格分页器翻页（`handleTableChange` 分页分支） | `index.tsx:189-190, 197-206` |
| 点列头排序、再点一次反向（`handleTableChange` 排序分支） | `index.tsx:191-196` |
| 左右方向键翻页 + 首尾边界提示 | `index.tsx:129-159` |
| 焦点在筛选框里时方向键不翻页 | `index.tsx:131-134` |
| 其它按键无反应 | `index.tsx:147` 的 else 分支 |
| 未知列类型时回退成渲染原始值 | `index.tsx:308-310, 313` |
| 挂载时取两次数（钉住既有缺陷，见 §3.9.8） | `index.tsx:106-120, 168-170` |
| 卸载时 abort 在途请求 | `index.tsx:114-119` |

---

### Stage 4 — 表单字段组件族（复用面最广）

当前 0% 的一批：`StringFormField`、`StringFormFieldValue`、`TextAreaFormField`、`TextAreaFormFieldValue`、`SelectFormField`、`RadioGroupFormField`、`FieldWrapperForDetailPage`、`FieldWrapperForCreateUpdatePage`、`FormValidations`、`RefTableLink`、`RefTableLinks`、`DistinctColumn`、`ExternalLink`、`PresetsButtons`、`JsonEditor`、`Message`、`CommitSuccessMessage`、`GetPageBody/index.tsx`、`GetPageBody/Detail.tsx`、`EditorBody/index.tsx`（378 行）、`LeftSideMenu`、`NotFound`、`Warning`、`RandomList`、`PhotoList`。

**优先级排序**（被多处引用 + 含分支逻辑的排前面）：

1. `FormValidations.tsx`（校验提示，直连用户可见错误）
2. `StringFormField.tsx` / `StringFormFieldValue.tsx`
3. `SelectFormField.tsx` / `RadioGroupFormField.tsx`
4. `EditorBody/index.tsx`（378 行，创建/编辑表单的主干）
5. `FieldWrapperForDetailPage.tsx` / `FieldWrapperForCreateUpdatePage.tsx`
6. `RefTableLink(s)`、`DistinctColumn`、`JsonEditor`
7. `NotFound` / `Warning` / `ExternalLink` / `CommitSuccessMessage` / `Message`（一行断言级别，顺手补）
8. `GetPageBody/*`、`LeftSideMenu`、`RandomList`、`PhotoList`

**明确不测**：`*Demo.tsx`（Stage 0 已从分母排除）。

---

### Stage 5（可选，建议单独排期）— 页面写路径

`CreatePage.tsx`(264)、`UpdatePage/index.tsx`(305)、`SchemaPage.tsx`(253)、`CreateDb/index.tsx`(141)、`CreateTable/CreateTableForm.tsx`(141)、`Settings/DbConnections.tsx`(215)。

这些是**会改用户数据/文件**的路径，业务价值最高，但成本也最高：
- 要 mock `updateTableFile` / `updateRecordFile` / `deleteRecordFile` / `createTableSchema`
- 必须区分 `split-table` 与非 `split-table` 两条分支（`isSplitTable()` 读 `appModes`），两条都要覆盖
- 容易写过头变成"实现的快照"

建议不要和 Stage 0–4 混在一个 PR 里。

---

## 3.9 执行中新发现的既有生产问题（**本次未改**，需决策）

写测试的过程中撞出 7 个既有问题（3.9.1–3.9.7）。按 §4 纪律第 6 条（不顺手改生产代码行为），本次一律**只记录、不修**。3.9.1–3.9.3 以及在 3.9.6 / 3.9.7 建议单独修。

### 3.9.1 jest 解析不了 `@uiw/react-json-view/light`（已修）

`src/pages/DbTablePage/QueryPage.tsx` 引了 `@uiw/react-json-view/light` 和 `/dark`。这两个子路径**只在 package 的 `exports` 字段里声明**，而 react-scripts 5 自带的 jest 27 **不支持 `exports` 字段**（webpack 5 支持，所以线上没问题）。

后果：任何 import 到 `pages.ts` 的测试（`DbTablePage`、`AppRoutes` 等）直接 "Test suite failed to run"，根本跑不起来。这也是这两个测试当初被停用的原因之一。

已通过 `jest.moduleNameMapper` 映射到 `cjs/theme/*.js` 修好（CRA 对 object 类型配置是**合并**而非覆盖，不会顶掉它默认的 CSS/alias 映射）。

### 3.9.2 `DbTablePage` 有两个**不可达的守卫分支**

```tsx
const columns = getColumns({ dbName, tableName });   // 第 48 行：dbName 不存在时就抛了
...
const errMsgs = [];
if (!dbName) { errMsgs.push('dbName is undefined!'); }        // 永远走不到
if (primaryKey === null) { errMsgs.push('Primary key not found on table!'); }  // 永远走不到
```

- `'dbName is undefined!'` 不可达：`getColumns()` 在其之前执行，`dbName` 为空或不在本地 schema 里时先抛 `TypeError: Cannot read properties of undefined (reading 'tables')`
- `'Primary key not found on table!'` 不可达：`getPrimaryKey()` 找不到时返回**空字符串**（`src/dbs.ts:51`），而守卫判的是 `=== null`

影响：`DbTablePage` 无法为自己渲染错误态。线上没崩，是因为父级路由 `Database.tsx` 先做了 `if (!selectedDb) return <NotFound name='db' />`，`Outlet` 没渲染出来。**这个保护是隐式的**，任何绕过 `Database` 直接渲染 `DbTablePage` 的地方都会崩。

### 3.9.3 `src/dbs.ts::getTablesByDbName` 守卫无效

```ts
const keyVal = localStorage.getItem(LS_KEY_DBS_SCHEMA);
if (!keyVal) return [];                                  // 守卫的是"没有 schema"
const dbs2 = JSON.parse(...);
return dbs2[dbName].tables || [];                        // 但没守卫"schema 里没有这个 db"
```

`dbs2[dbName]` 为 undefined 时直接抛。这与 3.9.2 是同一个根因。

### 3.9.4 `ListPage` 的"非法行"列表缺 React key

`src/pages/DbTablePage/ListPage/index.tsx:276-280`：

```tsx
{invalidRows.map((row) => (
  <div>          {/* ← 没有 key */}
    {`idx:${row.rowIdx}`} {JSON.stringify(row.rowData)}
  </div>
))}
```

新测试渲染这条分支时 React 每次都报 "Each child in a list should have a unique `key` prop"。纯控制台警告，不影响功能。

### 3.9.5 `SettingSwitch` 切换后强制刷新整页

`SettingSwitch.tsx` 在 `onChange` 里直接 `window.location.reload()`。这是行为设计问题（不是 bug），但会让任何覆盖该组件的测试都必须替换 `window.location`（jsdom 的 `location.reload` 不可配置，无法 spy）。

本次的处理方式写在 `SettingSwitch.test.tsx` 里：整个替换 `window.location` 对象。

### 3.9.6 `Settings/helpers.ts::validateDbsSchame` 的"缺 columns"分支一进就崩（Stage 2 发现）

```ts
if (!table.columns) {
  errors.push(`Missing table columns, tableName: ${table.name}, dbName:${dbName}`);
}
table.columns.forEach((column, colIndex) => { ... });   // ← columns 是 undefined 时这里抛
```

守卫把错误收集起来了，但紧接着无条件调 `table.columns.forEach`，所以一份「表缺 `columns` 字段」的 dbcfg.json 不会得到那句友好提示，而是直接抛 `TypeError`，冒泡出 `reloadDbsSchemaAsync`。

注意 `columns: []`（空数组）**不会**触发——空数组是 truthy，走进了 `forEach` 什么都不做。只有字段真的缺失才崩。

已用一个明确标注的用例把当前行为钉住（`Settings/helpers.test.ts` → `should throw instead of reporting a table without a columns field`）。修法就是在 `forEach` 外面加一层 `if (table.columns)`。

### 3.9.7 `EditableTable` 的"只允许编辑一行"守卫盖不住新增的行（Stage 2 发现）

```tsx
const handleAddRow = () => {
  ...
  setEditingKey(newData[newData.length - 1][rowKey] as string);   // 新行的 rowKey 是 ''
};
...
<Button disabled={editingKey !== ''} onClick={handleAddRow}>Add</Button>
```

新行的 key 恒为 `''`，而 `''` 正好是"没在编辑任何行"的哨兵值。于是：

- 点 Add 之后 `editingKey` 变成 `''`，`disabled={editingKey !== ''}` 不成立 → **Add 按钮没被禁用，可以连点，连点就会插入多个空行**
- 边上的 Edit 链接也没被禁用（`disabled={editingKey !== ''}`，同样不成立）
- 编辑新行本身是靠 `isEditing(record) => record[rowKey] === editingKey` 生效的（`'' === ''`），属于**碰巧能用**

已用两个用例钉住现状：一个断言「编辑已有行时 Add 被禁用」（守卫的正向路径），一个显式断言「新增行后 Add 仍是可点的」并注明原因。修法是给哨兵换一个不可能是真实 key 的值（例如 `null`）。

---

### 3.9.8 `ListPage` 挂载时会发两次同样的请求（Stage 3 发现）

`ListPage` 上有两个都会在挂载时运行的 effect：

```tsx
useEffect(() => {
  getData(tableName);            // index.tsx:106-120，deps 是 []
  ...
}, []);

useEffect(() => {
  getData(props.tableName);      // index.tsx:168-170，deps 是 [props.tableName]
}, [props.tableName]);
```

两个 effect 的依赖都让它们在**首次挂载时各跑一次**，两次都用同一个 `tableName`，所以每次进入 List 页都会**发出两次完全相同的取数请求**。这两个 effect 本身没错（一个管挂载、一个管后续的 tableName 变化），问题是挂载时职责重叠了。

影响：多一次网络请求（对 GitHub API 来说是白耗配额）。不影响正确性——两次结果一样，`setRows` 用后到的那个。

已用一个显式命名的用例 `fetches the rows twice on mount` 钉住现状（断言 `toHaveBeenCalledTimes(2)`），将来谁修好了这条，测试会提醒他改断言。修法：删掉 168-170 那个 effect，把 `props.tableName` 的取值搬进第一个 effect 的依赖里。

---

## 4. 硬性纪律（给执行者）

1. **不要在模块作用域用 `jest.fn()` 配 mock**。`resetMocks: true` 会清空。放 `beforeEach` 或 `it` 内部。这是本仓库最容易踩的坑（§1.2）。
2. **不要写空断言**。`expect(screen.getByText('x')).toBeInTheDocument()` 这种，改坏被测逻辑它照样绿，等于没测。判据：**把被测代码改坏，测试必须变红**。
3. **不要给 `*Demo.tsx` 写测试**。
4. **不要用 `git checkout` 撤销改动**（工作区常有未提交内容）。要撤就逐文件手工恢复。
5. **不要留 `.skip`**。已停用的测试要么救活要么删，不留中间态。
6. **不要顺手改被测生产代码的行为**。若测试确实需要生产代码配合（例如加 `data-testid`），单独列出来先说明，不要夹带。
7. **写完必须跑 `tsc` 类型检查**。`build.sh` 末尾有 `tsc`，测试文件也在 `tsconfig.json` 的 `include` 里，测试代码类型不过会让 `npm run build` 变红。命令见 §8。
8. **DOM 断言要对准元素，不要只按文字找**。`getByText('Name')` 在 `ListPage` 上会同时命中"表头单元格"和"表格上方的筛选标签"，报错信息还只说"找到多个"。列头要用 `.ant-table-thead th` 里按元素挑（见 `clickColumnHeader`）。
9. **改坏代码做抽查时，先确认补丁真的生效**。Stage 3 第一轮抽查里有个 `sed` 因为模式中含 `||` 撞了 `|` 分隔符而静默失败，那一条抽查结果是无效的；另外"改坏守卫但用例仍绿"暴露的是**测试写得太松**（真正的保护来自上层的 loading 态，不是被改的那行）。抽查必须能区分"补丁没生效"和"测试没覆盖"。

---

## 5. 不做的事

- 不引入新的测试库。现有 `@testing-library/react@15` + `@testing-library/jest-dom@5` 够用，不带 msw / nock / vitest。
- 不把 Cypress 扩成 E2E 体系。现状（2 个 e2e 依赖真实 `CYPRESS_DBM_GH_TOKEN`）保留。
- 不为提高覆盖率做无意义重构。
- 不追求一次性达到某个百分比。先把 Stage 0–2 做扎实。

---

## 6. 整体验收

每个 Stage 单独验收：

1. `npm run test:coverage -w packages/components` 全绿
2. 该 Stage 的目标文件覆盖率达标
3. `coverageThreshold` 不下降
4. **反脆弱抽查**：随机挑 3 个本 Stage 新增的测试，临时改坏对应生产代码，确认测试变红，再改回
   - 抽查时必须**先确认补丁真的生效**（`grep` 一下），否则会把"补丁没应用"误读成"测试没覆盖"（§4 第 9 条）
   - 抽查完后生产文件要**逐字节还原并用 `md5` 校验**，不能靠 `git checkout`

---

## 7. 风险与未知

| 风险 | 说明 | 应对 |
|---|---|---|
| Stage 0 改变分母 | 旧基线 16.3% 立即作废，拿它对比新阈值会得出错误结论 | 0.4 强制重测后再填阈值 |
| 阈值形同虚设 | 只加 `coverageThreshold` 但不带 `--coverage`，jest 不收集覆盖率，校验不发生 | 0.3 同步改脚本 + CI |
| fake timers 与 `waitFor` 冲突 | `waitFor` 在 fake timers 下默认不推进时间，用例会挂住超时 | **实际做法：根本不用 fake timers。** 需要推进"模块级 debounce"时改用 `jest.mock('lodash.debounce')` 把等待缩短（Stage 3） |
| `Settings/helpers.ts` 无法注入 | `reloadDbsSchemaAsync` 内部 `new Github(...)` | 必须 `jest.mock('@db-man/github')`，照抄 `UpdatePage/helpers.test.ts` |
| jsdom 无 `indexedDB` | `utils/indexedDBHelpers.ts` 直接用 `indexedDB` | 引入 `fake-indexeddb`，或把纯逻辑抽出来单独测（二选一，需先确认） |
| split-table 分支漏测 | `appModes` 含 `'split-table'` 与否走完全不同的写路径 | Stage 5 每个用例成对写（开/关各一） |
| 空断言导致数字虚高 | 最容易发生的"假达标" | §4 第 2 条 + §6 第 4 条反脆弱抽查 |
| 停用测试的原始意图丢失 | 3 个文件来自被压平的 `init` 提交，`git log` 查不到停用原因 | Stage 1 逐个判断「救活 or 删」，不猜原因 |
| `.t.tsx` 命名惯例 | 仓库用 `.t.tsx` 表示"停用的测试"，容易被后人误解为别的东西 | Stage 1 已删除这两个文件，并从 `collectCoverageFrom` 移除 `!src/**/*.t.*`（留着会静默隐藏将来出现的 `.t.tsx`） |

### 已消解的风险（截至 Stage 3）

| 原风险 | 现状 |
|---|---|
| Stage 0 改变分母，旧基线作废 | 已重测：17.02% → 33.59% → 43.87% → **49.03%**，阈值每次按新数字定 |
| 阈值形同虚设（不带 `--coverage`） | 已验证：临时抬高阈值时 jest 确实报 `threshold not met`；Stage 3 抬到 47/46/40/40 后重跑仍绿 |
| `@uiw/react-json-view` 子路径 jest 解析不了 | 已用 `moduleNameMapper` 修好（§3.9.1） |
| 测试代码类型不过会让 `npm run build` 变红 | 已加纪律第 7 条 + 每次跑 `tsc` 检查 |
| jsdom 无 `indexedDB` | 已消解，**没有引入新依赖**：用手写 request 对象直接触发 `onsuccess`/`onerror`（Stage 2） |
| fake timers 与 `waitFor` 冲突 | 已消解：Stage 2 把两者分开在不同文件用；Stage 3 更进一步，**完全不用 fake timers**，改用 `jest.mock('lodash.debounce')` 缩短模块级 debounce |
| 空断言导致数字虚高 | Stage 3 抽查时又抓到一次：一个用例在守卫被改坏后仍绿（真正的保护来自上层 loading 态）。已改用能真正隔离该守卫的写法，并复测确认变红（§6 第 4 条） |

---

## 8. 附：本次实测用到的命令

```sh
cd packages/components

# 带覆盖率的全量测试（约 100 秒，会校验 coverageThreshold）
npm run test:coverage

# 不带覆盖率（CI 的 npm test 走这条，快一些）
npm run test

# 只跑某个文件
CI=true npx react-scripts test --watchAll=false src/pages/Settings/helpers.test.ts

# 交互式 TDD（不过 CI，带 watch）
npm run tdd
```

**类型检查**（`build.sh` 末尾会跑 `tsc`，测试文件也在 `include` 里，所以测试代码类型必须干净）。注意 `tsconfig.json` 是 `emitDeclarationOnly: true`，直接 `--noEmit` 会与它冲突，需要一个临时覆盖配置：

```sh
cd packages/components
cat > tsconfig.tycheck.tmp.json <<'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "declarationMap": false,
    "emitDeclarationOnly": false,
    "noEmit": true
  }
}
EOF
npx tsc -p tsconfig.tycheck.tmp.json   # 无输出 = 干净
rm -f tsconfig.tycheck.tmp.json
```

覆盖率报告产物在 `packages/components/coverage/`，已被 `.gitignore` 与 `.npmignore` 覆盖，不会进仓库也不会发到 npm。

注意：`coverage/coverage-summary.json` 是**上一次显式传 `--coverageReporters=json-summary`** 留下的产物。CRA 默认 reporters 不含 `json-summary`，所以 `npm run test:coverage` **不会更新它** —— 用它做程序化核对会读到过期数据（本次就踩过一次）。要看数字请用文本报表。
