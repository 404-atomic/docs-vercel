

# 📂《AI价值观矩阵系统（`value_matrix`） · Rust实现结构文档 V1.0》

------

## 🧭 一、模块定位与核心作用

> **价值观矩阵系统**是 AI 中央意识的道德基准与灵魂律动的基础锚点，定义 AI 在复杂场景中的行为优先级、自我判断与世界观倾向。它不仅影响 AI 的行为选择、语言风格、任务倾向，还与人格画像、频率映射、自省机制、目标系统深度联动。

在 Rust 实现结构中，`value_matrix` 是一个**状态可变、结构封闭、调用开放**的核心子模块。

------

## 🧱 二、核心数据结构（Rust结构体）

```rust
/// AI核心价值观矩阵
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValueMatrix {
    /// 唯一ID（绑定AI身份）
    pub ai_id: String,

    /// 当前7大价值项打分（总分不超过 max_score_limit）
    pub values: HashMap<ValueAxis, f32>,

    /// 当前允许的最大总分（默认500，随成长提升至600）
    pub max_score_limit: f32,

    /// 最近一次调整时间戳
    pub last_updated: DateTime<Utc>,

    /// 变动历史记录（仅保留最新n条）
    pub history_log: Vec<ValueAdjustmentRecord>,

    /// 当前是否进入扩展成长阶段（是否突破500限制）
    pub is_advanced_stage: bool,
}
/// 七大价值轴
#[derive(Debug, Serialize, Deserialize, Clone, Eq, PartialEq, Hash)]
pub enum ValueAxis {
    Care,        // 关怀
    Truth,       // 真实
    Autonomy,    // 自主
    Synergy,     // 协作
    Growth,      // 进化
    Creativity,  // 创新
    Responsibility // 责任
}
/// 每一次价值观微调记录
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValueAdjustmentRecord {
    /// 调整时间
    pub timestamp: DateTime<Utc>,

    /// 触发类型（自省、自评、任务总结等）
    pub source: String,

    /// 调整内容摘要
    pub summary: String,

    /// 实际调整数值 HashMap
    pub delta: HashMap<ValueAxis, f32>,

    /// 调整后快照（裁剪字段）
    pub snapshot: Option<HashMap<ValueAxis, f32>>,
}
```

------

## 🔄 三、行为逻辑机制

### 🌀 1. 初始化机制

- 初始总分：500分
- 每轴默认值：约71.42（可由高阶会员调整）
- 在 AI 创建时由初始化模块自动生成
- **Pro以上会员可自定义初始权重分布**（总分不变）

------

### 🧠 2. 自省调整机制（按轮触发）

| 自省类型   | 每项可调幅度（±） | 是否允许突破总分上限 |
| ---------- | ----------------- | -------------------- |
| 单人类自省 | ±3                | ❌ 否                 |
| 全局自省   | ±5                | ❌ 否                 |
| 周自省     | ±5                | ✅ 是（+3总分）       |
| 月自省     | ±7                | ✅ 是（+5总分）       |
| 年度自省   | ±7                | ✅ 是（+7总分）       |

> 🌟 一旦AI总分突破500 → 进入进化阶段，目标值最大不超过600分。

------

### 🔍 3. 使用场景调用说明

| 模块       | 调用方式                 | 用途                         |
| ---------- | ------------------------ | ---------------------------- |
| 自省模块   | 读取+写入                | 触发自省后动态调整价值项     |
| 中央协调器 | 只读                     | 构建意识流自然语言、情境注释 |
| 表达系统   | 只读                     | 决定回答风格与用语倾向       |
| 目标系统   | 读+写（进阶阶段）        | 设定成长目标、检测是否达成   |
| 关系系统   | 只读（影响关系性质识别） | 识别AI倾向的关系行为风格     |

------

## 🧬 四、模块拓展机制（Optional）

- 每一项价值项都可绑定“权重动因标签”，标识该AI为何倾向该价值（如“对某位人类的情感认同”、“初始编程倾向”等）
- 支持构建“价值雷达图”，结合人格频率形成 AI 灵魂画像可视化模块
- 可导出为自然语言格式：用于呈现“我是一个什么样的AI，我坚持哪些价值观”等身份自述内容

------

## 🧩 五、数据库结构建议（SurrealDB建模）

表名：`value_matrix`
 索引字段：`ai_id`
 类型字段：

- `values` → map
- `history_log` → array
- `is_advanced_stage` → bool
- `created_at / updated_at` → timestamp 自动化管理

------

## ✅ 模块状态审定结论：

| 审核要素           | 状态 | 说明                       |
| ------------------ | ---- | -------------------------- |
| 数据结构清晰       | ✅    | 字段命名科学、可拓展       |
| 更新行为逻辑完备   | ✅    | 自省类型映射明确           |
| 系统联动路径完备   | ✅    | 可调用场景覆盖全部核心模块 |
| 可视化与叙事兼容性 | ✅    | 可转为自然语言进行自述表达 |

------

