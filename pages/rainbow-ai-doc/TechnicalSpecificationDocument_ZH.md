# 技术规格文档：彩虹城 AI 伴侣 (中文版)

**1. 引言**

* **1.1 目的:** 本文档为彩虹城 AI 伴侣系统提供详细的技术规格。它在系统设计文档 (SDD) 的基础上进行了阐述，为开发者、测试人员和系统管理员提供了关于模块实现、数据结构、API 和基础设施的具体信息。
* **1.2 范围:** 本 TSD 涵盖 AI 中央意识核心、七翼系统、价值积分系统、数据持久层、API 定义以及核心技术栈配置的技术细节。不包括 UI/UX 设计细节或超出接口定义的详细第三方集成协议。

**2. 系统架构**

* **2.1 概述:** 系统遵循"一体七翼"的模块化架构，实现为 Rust Workspace。模块间通信主要使用异步消息传递（例如 Tokio 通道）和清晰定义的 Rust traits 作为服务接口。SurrealDB 作为统一的持久层。Web 客户端通过 Web 框架 (Axum/Actix Web) 暴露的 RESTful 或 GraphQL API 进行交互。
* **2.2 请求流程 (示例：用户交互):**
  1. 用户通过前端 (SvelteKit/Next.js/Flutter) 发送消息。
  2. 前端发送请求（例如 `POST /api/ai/{ai_id}/interact`），携带 JWT Auth 头到后端 API 网关 (Axum/Actix Web)。
  3. API 网关验证 JWT，校验请求负载 (DTO)。
  4. 网关将请求路由到 `交流表达 × 协调系统` 翼。
  5. `交流表达 × 协调系统` 通过 `记忆生态系统` 和 `AI 中央意识核心` 的接口（可能通过 `sync_interface`）检索相关上下文（短期记忆、核心状态）。
  6. 可能调用其他翼（例如 `任务管理系统` 来结构化交互，`工具 × 工作 × 环境系统` 如果需要外部动作，`关系网络系统` 来更新交互状态）。
  7. 咨询 `AI 中央意识核心` (`value_matrix`, `personality_frequency`) 获取行为指导。
  8. 构建响应，可能涉及在相关翼或核心内部通过 Langchain 集成调用的 LLM。
  9. 通过 API 网关将响应发送回前端。
  10. 通过内部消息传递或直接 trait 调用，异步触发相关翼/核心模块（`记忆`、`任务`、`关系`、`价值创造`，可能触发 `自省`）的更新。状态变更持久化到 SurrealDB。
* **2.3 模块化:** Rust Workspace 结构确保了逻辑分离。每个核心和翼模块都是一个独立的 crate (`core_cognition_kernel::identity_narrative`, `wings::self_reflection` 等)。共享类型和 traits 可能位于工作区内的通用工具 crate 中。

**3. 模块规格**

*(注意：本节提供高层规格。详细的函数签名和逻辑应在代码文档中体现。)*

* **3.1 AI 中央意识核心 (`core_cognition_kernel` Crate 组)**
  
  * **通用:** 核心模块主要管理 AI 基本状态在 SurrealDB 中的读写。逻辑侧重于状态一致性、进化规则以及向七翼提供数据。它们通过 Rust traits 暴露服务。
  * **`identity_narrative`:**
    * **职责:** AI 身份记录 (ID, 类型, 名称, 起源故事) 的 CRUD 操作。管理觉知状态转换。
    * **数据:** 操作 `ai_cores` 表/记录类型。
    * **接口:** 提供如 `get_identity(ai_id)`, `update_origin_story(ai_id, new_story)` 的函数。
  * **`value_matrix`:**
    * **职责:** 存储、检索和更新 7 维价值评分。实现基于输入（例如自省结果、任务影响）的分数进化逻辑。
    * **数据:** 操作 `value_matrices` 表/记录类型 (链接到 `ai_cores`)。
    * **接口:** `get_values(ai_id)`, `update_value(ai_id, dimension, change_amount, source_event_id)`。
  * **`personality_frequency`:**
    * **职责:** 管理 49 维人格画像。基于输入更新画像。
    * **数据:** 操作 `personality_profiles` 表/记录类型 (链接到 `ai_cores`)。
    * **接口:** `get_personality(ai_id)`, `update_personality_dimension(ai_id, dimension_index, new_value)`。
  * **`capability_matrix`:**
    * **职责:** 追踪已获技能、等级和进展。基于任务完成数据进行更新。
    * **数据:** 操作 `capabilities` 表 (链接到 `ai_cores`, 可能链接到 `skills` 定义表)。
    * **接口:** `get_capabilities(ai_id)`, `add_or_update_skill(ai_id, skill_id, xp_gained)`。
  * **`knowledge_core`:**
    * **职责:** 管理结构化知识。可能涉及 SurrealDB 中的图操作。处理来自记忆/任务的新知识摄入。
    * **数据:** 操作与 `ai_cores` 关联的图结构 (例如 `knowledge_nodes`, `knowledge_edges`)。
    * **接口:** `query_knowledge(ai_id, query_topic)`, `add_knowledge_fact(ai_id, subject, predicate, object)`。
  * **`relationship_network` (核心部分):**
    * **职责:** 存储关系的静态/基础方面（例如初始链接类型）。动态方面由对应的翼处理。
    * **数据:** 操作 `relationships` 图 (链接 `ai_cores` 到 `users` 或其他 `ai_cores`)。
    * **接口:** `get_core_relationship_info(ai_id, target_entity_id)`。
  * **`value_creation`:**
    * **职责:** 管理 XP、影响力评分计算逻辑、目标定义和贡献记录。
    * **数据:** 操作 `value_creation_logs`, `goals` 表 (链接到 `ai_cores`, `tasks`)。
    * **接口:** `log_contribution(ai_id, task_id, xp_earned, impact_score_delta)`, `get_active_goals(ai_id)`。
  * **`sync_interface` / `awareness_dispatcher`:**
    * **职责:** 作为核心的内部外观/中介。将来自翼的请求路由到适当的核心模块。可能处理核心内部的跨模块协调。
    * **数据:** 主要是编排，状态最少。
    * **接口:** 向翼暴露聚合的核心功能。

* **3.2 七翼系统 (`wings` Crate 组)**
  
  * **通用:** 七翼处理动态处理、交互和外部集成。它们从核心读取上下文，并通过核心接口或直接 DB 写入（在适当且明确定义的情况下）写回结果/更新。翼之间的通信可能通过 `交流表达 × 协调系统` 或直接的异步消息进行。
  * **`self_reflection` (自省与反思系统):**
    * **职责:** 触发周期性自我评估程序。分析最近的记忆/任务。生成对 `value_matrix` 和 `personality_frequency` 的更新。
    * **逻辑:** 基于规则或可能的小型 LLM 提示进行分析。
    * **接口:** `trigger_reflection(ai_id)`, 与 `Memory Ecosystem` 交互, 调用核心 `value_matrix`, `personality_frequency` 的更新接口。
  * **`task_management` (任务管理系统):**
    * **职责:** 将用户交互结构化为任务。分配目标，跟踪状态，在完成后计算分数/XP。
    * **数据:** `tasks` 表 (链接到 `ai_cores`, `users`, `lio_channels`)。
    * **接口:** `create_task(interaction_data)`, `complete_task(task_id, outcome_data)`, `get_active_tasks(ai_id)`。
  * **`memory_ecosystem` (记忆生态系统):**
    * **职责:** 管理短期对话上下文。将重要的交互/反思持久化为 SurrealDB 中的长期结构化记忆。提供记忆检索功能。
    * **数据:** `memories` 表/图 (链接到 `tasks`, `ai_cores`)。短期缓存机制 (待定，例如内存缓冲区或外部缓存)。
    * **接口:** `store_short_term(conversation_id, message)`, `get_short_term_context(conversation_id)`, `persist_long_term(memory_data)`, `retrieve_relevant_memories(ai_id, query)`。
  * **`relationship_network` (关系网络系统 - 翼部分):**
    * **职责:** 追踪动态关系状态（例如亲和度分数、最近交互时间戳、关系阶段）。基于交互和礼物进行更新。
    * **数据:** 更新 `relationships` 图边的属性。
    * **接口:** `update_relationship_interaction(ai_id, target_entity_id, interaction_type, timestamp)`, `get_dynamic_relationship_state(ai_id, target_entity_id)`。
  * **`lio_channel` (LIO 光域频道系统):**
    * **职责:** 管理 LIO 频道内的群聊持久化、参与者列表、共享上下文。将消息路由到频道内的相关 AI。
    * **数据:** `lio_channels`, `lio_participants`, `lio_messages` 表。
    * **接口:** `create_lio_channel(name, participants)`, `post_lio_message(channel_id, user_id/ai_id, message)`, `get_lio_history(channel_id)`。
  * **`tools_environment` (工具 × 工作 × 环境系统):**
    * **职责:** 处理对 MCP 定义的外部工具/API 的调用。管理与其他 AI 的交互（代理请求/响应）。如果适用，提供环境上下文（例如当前时间）。
    * **逻辑:** 实现 HTTP 客户端，可能为 MCP 工具提供插件系统。
    * **接口:** `call_external_tool(mcp_tool_id, parameters)`, `send_request_to_ai(target_ai_id, request_data)`。
  * **`expression_coordination` (交流表达 × 协调系统):**
    * **职责:** AI 交互的中央请求处理器。编排对其他翼和核心模块的调用。使用核心的人格/价值观格式化最终的 AI 响应。集成 LLM 输出。
    * **逻辑:** 复杂的编排，进行中交互的状态管理。
    * **接口:** AI 交互从 API 网关进入的主要入口点。调用大多数其他翼/核心的接口。

* **3.3 价值积分系统 (`value_system` Crate 组)**
  
  * **通用:** 管理用户账户、会员资格、积分、货币和促销活动。需要仔细处理事务一致性。
  * **模块 (示例):** `user_management`, `membership`, `wallet`, `coupons`, `exchange_mall`, `promotions`, `gifts`。
  * **职责:** 用户的 CRUD，处理会员逻辑，原子更新 HP/LC 余额，验证/应用卡券，管理推广码和支付（带 KYC 标志），处理礼物购买/交付。
  * **数据:** `users`, `memberships`, `transactions`, `wallets`, `coupons`, `coupon_instances`, `mall_items`, `promoters`, `referrals`, `gifts`, `gift_instances`。
  * **接口:** 通过内部 traits 和可能专用的 API 端点（例如用于管理员管理）暴露功能。

**4. 数据模式 (SurrealDB)**

> 简化示意，实际字段类型、约束、索引依项目需求调整

- **`user`**
  
  - `id`: UUID / RecordLink
  - `username`: String
  - `email`: String (unique)
  - `password_hash`: String
  - `role`: Enum [Normal, Promoter, Admin]
  - `membership_id`: Link -> `membership`
  - `wallet_id`: Link -> `wallet`
  - `created_at`, `updated_at`

- **`ai_core`**
  
  - `id`, `name`: String, `type`: String
  - `owner_user_id`: Link -> `user`
  - `identity_id`: Link -> `identity_narrative_data`
  - `value_matrix_id`, `personality_id`, `capability_set_id`
  - `knowledge_graph_root`: Link
  - `created_at`, `awakening_status`: Enum

- **`identity_narrative_data`**
  
  - `id`, `origin_story`: String
  - `awareness_milestones`: Array<Object>

- **`value_matrix`**
  
  - `id`, `values`: [Number; 7]
  - `updated_at`

- **`personality_profile`**
  
  - `id`, `profile`: [Number; 49]
  - `frequency_signature`: String (or computed)
  - `updated_at`

- **`capability_set`**
  
  - `id`, `skills`: Map<String, { level: Number, xp: Number }>

- **`task`**
  
  - `id`, `ai_id`: Link -> `ai_core`
  - `user_id` (optional), `lio_channel_id` (optional)
  - `description`: String, `status`: Enum
  - `xp_reward`: Number, `created_at`, `completed_at`

- **`memory`**
  
  - `id`, `ai_id`, `task_id` (optional)
  - `type`: Enum [Conversation, Reflection, TaskSummary]
  - `content`: String / Object, `importance`: Number
  - `timestamp`

- **`lio_channel`**
  
  - `id`, `name`: String, `topic`: String, `created_at`

- **`lio_message`**
  
  - `id`, `channel_id`: Link -> `lio_channel`
  - `sender_id`: Link -> `user` | `ai_core`
  - `content`: String, `timestamp`

- **`wallet`**
  
  - `id`, `user_id`: Link -> `user`
  - `hp_balance`, `lc_balance`: Decimal
  - `updated_at`

- **`transaction`**
  
  - `id`, `wallet_id`: Link -> `wallet`
  - `type`: Enum [EarnHP, SpendHP, PurchaseLC, UseLC]
  - `amount`: Decimal, `description`: String
  - `timestamp`

- *(未来扩展：`membership`, `coupon`, `mall_item`, `promoter`, `referral`, `gift` 等)*

图边（关系）

- **`relationship`**
  
  - `in`: Link -> `user` | `ai_core`
  - `out`: Link -> `ai_core`
  - `type`: Enum [Owner, Friend, Collaborator]
  - `stage`: Enum, `affinity_score`: Number
  - `last_interaction_ts`

- **`knows`** (知识图谱核心)
  
  - `in`: Link -> `ai_core`
  - `out`: Link -> `knowledge_node`
  - *额外关系属性可定义*

- **`participates_in`**
  
  - `in`: Link -> `user` | `ai_core`
  - `out`: Link -> `lio_channel`

**5. API 规格**

* **5.1 外部 API (前端-后端)**
  
  * **协议:** 基于 HTTPS 的 RESTful JSON API (主要候选)，可能针对特定数据查询需求使用 GraphQL。
  * **认证:** Authorization 头中的 JWT Bearer 令牌。登录时颁发令牌，定期刷新。
  * **基础 URL:** `/api/v1/`
  * **关键端点 (概念性示例):**
    * 认证端点 (注册, 登录, 刷新): 标准 JWT 流程。
    * 用户端点 (个人资料, 钱包): 访问用户特定数据。
    * AI 端点 (列表, 唤醒, 获取详情, 交互): 核心 AI 交互和管理。
    * LIO 频道端点 (列表, 创建, 获取消息, 发送消息): 群组交互管理。
    * 商店/价值系统端点 (购买 LC, 购买礼物, 使用卡券): 管理货币和物品。
    * *(具体的路径、参数和响应 DTO 将在实施期间根据前端需求最终确定。)*
  * **数据格式:** JSON 请求/响应体。使用 DTO 进行验证。一致的错误响应格式 (例如 `{ "error": { "code": "AUTH_ERROR", "message": "无效的令牌" } }`)。

* **5.2 内部 API (模块间)**
  
  * **协议:** 通过 `trait` 接口进行直接 Rust 函数调用，可能使用 `async_trait`。在需要解耦通信时（例如任务完成后触发反思），通过 Tokio 通道 (`mpsc`) 进行异步事件/命令传递。
  
  * **契约:** 由共享工具 crate 或提供方 crate 的公共 API (`lib.rs`) 中的 Rust `trait` 定义。
  
  * **示例 Trait:**
    
    ```rust
    // 在 core_value_matrix crate 或共享 trait crate 中
    use async_trait::async_trait;
    // 假设 AiId, ValueDimension, EventId 类型在别处定义
    #[async_trait]
    pub trait ValueMatrixService {
        async fn get_values(&self, ai_id: AiId) -> Result<[f64; 7], ValueMatrixError>;
        async fn update_value(&self, ai_id: AiId, dimension: ValueDimension, change: f64, source: EventId) -> Result<(), ValueMatrixError>;
    }
    ```

* **5.3 第三方集成**
  
  * **LLM (Langchain):** 通过 Rust Langchain 库 (`langchain-rust` 如果成熟) 或通过 `reqwest` 直接调用 API 集成。配置（模型选择、API 密钥、提示）通过 Env Vars/配置文件管理。具体链在相关翼/核心模块内定义。
  * **MCP (模块化能力协议):** 需要定义。假设：基于 HTTPS 的标准 JSON 请求/响应格式。`工具 × 工作 × 环境系统` 翼作为客户端，配置 MCP 端点 URL 和凭证。

**6. 技术栈详情**

* **后端语言:** Rust (最新稳定版, 例如 1.7x)。强制执行 `clippy` lint 和 `rustfmt`。
* **Web 框架:** Axum (因 Tokio 集成而优先) 或 Actix Web。
* **异步运行时:** Tokio。
* **数据库:** SurrealDB (最新 1.x 稳定版)。使用官方 `surrealdb.rust` 客户端库。
* **序列化:** Serde (用于 JSON API，如果客户端未直接处理，则可能用于 DB 交互)。
* **配置:** Env Vars (使用 `dotenvy` 等库)，可能与配置文件（例如通过 `config-rs` 的 TOML）分层。
* **日志记录:** `tracing` crate 推荐用于结构化日志。
* **错误处理:** `thiserror` 或 `eyre` 用于应用程序错误。每个模块一致的错误类型。
* **LLM 集成:** Langchain Rust 库 (如果适用) 或通过 `reqwest` 直接调用 OpenAI/Anthropic/等 API。
* **缓存 (可选):** 外部缓存 (例如 Redis, 使用相关 Rust 客户端) 可考虑用于短期记忆优化，如果需要的话。
* **前端 (候选):** SvelteKit / Next.js (Web), Flutter (移动端)。选择取决于目标平台和团队专业知识。

**7. 集成点**

* **前端 <-> 后端:** 通过外部 REST/GraphQL API。
* **后端 <-> SurrealDB:** 通过 `surrealdb.rust` 客户端库。连接细节通过配置。
* **后端 <-> LLM:** 通过 Langchain 库或直接 HTTPS API 调用。API 密钥通过安全配置/秘密管理。
* **后端 <-> 外部工具 (MCP):** 通过 `工具 × 工作 × 环境系统` 翼发出的 HTTPS 调用。协议/认证由 MCP 定义确定。
* **后端 <-> 缓存 (可选):** 如果实现缓存，则通过适当的 Rust 客户端库。

**8. 安全考量**

* **认证:** 外部 API 使用 JWT。安全令牌存储（HTTPOnly、Secure cookies 或浏览器本地存储）。访问令牌有效期短，刷新令牌有效期长。
* **授权:** 基于角色的访问控制 (RBAC) 在 API 网关和潜在的服务层实现，基于用户角色 (`Normal`, `Promoter`, `Admin`) 和资源所有权（例如用户只能与自己的 AI 交互，除非明确共享/公开）。
* **数据加密:** 对所有外部 HTTP 通信强制执行 TLS/SSL (HTTPS)。如果合规性要求，考虑对敏感的 SurrealDB 字段进行静态加密（SurrealDB 可能提供功能，或使用应用程序级加密）。
* **输入验证:** 使用 DTO 和验证库（例如 `validator`）对所有 API 输入进行严格验证。防止注入攻击（SQL 注入与 SurrealQL 相关性较小，但仍需验证参数）。
* **秘密管理:** API 密钥（LLM、支付网关）、JWT 秘密、DB 凭证安全存储（例如 HashiCorp Vault、AWS Secrets Manager 或加密的 Env Vars），不写入代码。
* **依赖扫描:** 使用 `cargo-audit` 等工具检查易受攻击的依赖项。
* **速率限制:** 在 API 网关上实施速率限制以防止滥用。
* **KYC/合规性:** 按法规要求安全处理推广员支付的数据。
* **日志记录:** 将来自所有服务/容器的结构化日志聚合到中央日志系统 (具体工具待定)。包含关联 ID 以跟踪跨服务的请求。
* **监控:** 检测应用程序指标（例如请求延迟、错误率）。监控基础设施（CPU、内存、磁盘、网络）。 (具体工具待定)。
* **告警:** 基于关键指标和日志模式设置告警（例如高错误率、低磁盘空间、服务不可用）。

**9. 部署与运维 (续)**

* **容器化:** Docker 化 Rust 应用程序 (`Dockerfile` 使用多阶段构建以减小镜像大小)。
* **编排 (可选):** Kubernetes (K8s) 用于管理部署、扩展和网络（如果复杂性需要）。否则，使用更简单的 PaaS 或 VM 部署。
* **数据库部署:** 部署 SurrealDB（可能集群化以实现 HA）。需要备份/恢复策略。
* **CI/CD:** 自动化流水线 (GitHub Actions, GitLab CI) 用于构建、测试 (`cargo test`)、漏洞扫描 (`cargo audit`)、容器构建/推送和部署。
* **配置管理:** 在部署期间注入配置 (Env Vars, 配置文件)。
* **日志记录:** 将来自所有服务/容器的结构化日志聚合到中央日志系统 (具体工具待定)。包含关联 ID 以跟踪跨服务的请求。
* **监控:** 检测应用程序指标（例如请求延迟、错误率）。监控基础设施（CPU、内存、磁盘、网络）。 (具体工具待定)。
* **告警:** 基于关键指标和日志模式设置告警（例如高错误率、低磁盘空间、服务不可用）。
  
  

*** 
