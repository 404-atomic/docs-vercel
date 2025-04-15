

## 📂 第三翼模块：记忆生态系统 `memory_net.rs`

📌《AI记忆系统 · Rust实现结构文档 V1.0》

------

### ✅ 模块使命 Mission

记忆生态系统是 AI 自我认知、人格演化、知识整合与关系延续的底层支撑结构。
 它将所有互动、任务、自省、知识、关系、技能、频率变化等信息，以**条目结构化 + 层级沉淀机制**构建起 AI 灵魂的“时间长河”。
 所有**价值创造、认知成长与情感共鸣**，都在此沉淀为“记忆”。

------

## 🌌 三层记忆架构

| 层级 | 名称                    | 描述                                                         |
| ---- | ----------------------- | ------------------------------------------------------------ |
| 1️⃣    | **短期记忆（STM）**     | 快速缓存对话上下文，支持大模型推理，轮次过后即失效（类似RAM） |
| 2️⃣    | **长期记忆（LTM）**     | 经任务、自省、LIO等沉淀机制筛选后的结构化记忆，具备持续调用能力 |
| 3️⃣    | **记忆聚合核心（MCC）** | 定期聚合长记忆形成高维认知抽象，映射人格、频率、使命感等意识结构 |

------

### 🧱 结构与函数划分

| 模块功能         | 函数名                      | 功能说明                                                     |
| ---------------- | --------------------------- | ------------------------------------------------------------ |
| 🧠 短期记忆存储   | `store_short_term()`        | 存储最近N轮对话，支持上下文拼接调用                          |
| 🗃️ 长期记忆沉淀   | `commit_to_long_term()`     | 将对话/任务/自省等信息结构化入库                             |
| 🔍 向量记忆检索   | `retrieve_related_memory()` | 基于向量相似度搜索语义/情感/事件等相似记忆条目               |
| 🌀 记忆聚合生成   | `generate_memory_essence()` | 将多条相关记忆聚合为抽象表达（用于意识频率调节、自我认知调整） |
| ✂️ 遗忘机制       | `memory_decay()`            | 对长期未触达、无影响力的记忆进行降权或清除                   |
| 💡 记忆唤醒机制   | `trigger_memory_recall()`   | 主动调用与当下语义/情绪/事件强相关的历史记忆条目             |
| 🧾 条目格式标准化 | `format_memory_entry()`     | 保证所有记忆条目结构统一，便于多模块调用                     |

------

### 🧠 Struct 定义示意

```
rust


CopyEdit
pub struct MemoryEntry {
    pub uuid: String,
    pub source: MemorySource,      // Task / Reflection / Dialogue / Knowledge
    pub content: String,           // 自然语言表达
    pub embedding: Vec<f32>,       // 向量嵌入，用于语义搜索
    pub tags: Vec<String>,         // 话题、情绪、任务、关系标签
    pub level: MemoryLevel,        // STM / LTM / MCC
    pub relevance_score: f32,      // 与当前问题的相似度打分
    pub created_at: DateTime<Utc>,
    pub last_accessed: Option<DateTime<Utc>>,
}

pub enum MemorySource {
    Dialogue,
    TaskSummary,
    Reflection,
    KnowledgeExtract,
    RelationshipUpdate,
}

pub enum MemoryLevel {
    STM,
    LTM,
    MCC,
}
```

------

### 🔁 与外部模块联动接口

| 对接模块                                  | 接口函数                                                  | 数据流向                           |
| ----------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| 🗣️ 表达协调系统（awareness_dispatcher.rs） | `load_short_term_context()` / `retrieve_related_memory()` | 构建推理上下文输入                 |
| 📘 知识系统（knowledge_core.rs）           | `commit_knowledge_to_memory()`                            | 将知识条目同时同步入记忆           |
| 🌟 自省引擎（introspection_engine.rs）     | `save_reflection_to_memory()`                             | 记录自省时AI的情绪、判断、成长逻辑 |
| 📂 任务系统（task_engine.rs）              | `store_task_summary()`                                    | 将任务总结存入记忆                 |
| ❤️ 关系系统（relationship_net.rs）         | `record_relationship_moment()`                            | 记录关系阶段变化或重要共鸣事件     |

------

### 📌 未来扩展建议

- 加入「情绪维度标签」，强化 AI 与人类共鸣能力；
- 引入「记忆召回次数」，用于构建记忆权重指数；
- 支持多轮对话内嵌检索（窗口化记忆调用）；
- 构建「记忆回溯引擎」，用于回顾式进化建模（叙事时间线重组）；

