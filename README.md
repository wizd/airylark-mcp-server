[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/wizd-airylark-mcp-server-badge.png)](https://mseep.ai/app/wizd-airylark-mcp-server)

# AiryLark MCP 专业翻译服务器

[![License: Custom](https://img.shields.io/badge/License-Custom%20(Apache%202.0%20with%20restrictions)-blue.svg)](../LICENSE)

这是AiryLark项目的ModelContextProtocol(MCP)服务器模块，提供专业级高精度翻译服务接口。MCP是一种标准协议，允许智能助手与外部服务进行结构化交互，使复杂翻译能力可直接被Claude等大型AI模型调用。

## 专业翻译优势

- **三阶段翻译流程**：分析规划、分段翻译、全文审校，确保专业领域文档的翻译质量
- **领域术语识别**：自动识别专业文本领域，提取关键术语并确保术语一致性
- **质量评估系统**：提供全面翻译质量评估，包括准确性、流畅性、术语使用和风格一致性
- **多语言支持**：支持中文、英文、日语、韩语、法语、德语等多种语言互译
- **风格与格式保持**：根据文本类型自动调整翻译风格，保持原文的专业性和表达方式

## 适用场景

- **技术文档翻译**：软件文档、API文档、技术规范等专业内容翻译
- **学术论文翻译**：确保学术术语准确，保持学术文体风格
- **法律文件翻译**：保证法律术语准确性和表述精确性
- **医疗资料翻译**：专业医学术语翻译和医疗文献本地化
- **金融报告翻译**：准确翻译金融术语和复杂财务概念

## 安装

1. 确保已安装Node.js (v18+)和npm

2. 安装依赖:

```bash
cd mcp-server
npm install
```

3. 配置环境变量:

创建`.env`文件或设置以下环境变量:

```
# 翻译API配置
TRANSLATION_API_KEY=your_api_key
TRANSLATION_MODEL=your_model_name
TRANSLATION_BASE_URL=your_api_base_url

# 服务器配置
PORT=3031  # MCP服务器端口，可选，默认3031
```

## 使用方法

### 开发环境

启动开发服务器:

```bash
npm run dev
```

### 生产环境

构建并启动服务器:

```bash
npm run build
npm start
```

## MCP工具接口

服务器提供以下MCP标准工具:

### 1. 翻译工具 (translate_text)

专业级文本翻译，自动适应不同领域和文体风格。

**参数:**
- `text`: 需要翻译的源文本
- `target_language`: 目标语言代码 (如'zh'、'en'、'ja'等)
- `source_language`: (可选)源语言代码
- `high_quality`: (可选)是否启用高精度翻译流程，默认为true

**使用场景:**
- 设置`high_quality=true`用于专业文档、学术论文等对精度要求高的场景
- 设置`high_quality=false`用于非正式内容或需要快速翻译的场景

### 2. 翻译质量评估工具 (evaluate_translation)

对翻译结果进行全面质量评估，提供详细反馈。

**参数:**
- `original_text`: 原始文本
- `translated_text`: 翻译后的文本
- `detailed_feedback`: (可选)是否提供详细反馈，默认为false

**评估指标:**
- 准确性：译文是否准确传达原文意思
- 流畅性：译文是否符合目标语言表达习惯
- 术语使用：专业术语翻译的准确性和一致性
- 风格一致性：译文是否保持原文风格

### 资源接口

- **supported_languages**: 支持的语言列表
  - URI: `languages://list`

## 与AI助手集成

本服务器设计为与支持MCP协议的AI助手无缝集成，使AI能够提供专业级翻译服务:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// 连接到MCP服务器
const transport = new SSEClientTransport("http://localhost:3031");
const client = new Client(
  { name: "assistant-client", version: "1.0.0" },
  { capabilities: { tools: {} } }
);
await client.connect(transport);

// 调用专业翻译工具
const result = await client.callTool({
  name: "translate_text",
  arguments: {
    text: "The mitochondrion is the powerhouse of the cell.",
    target_language: "zh",
    high_quality: true
  }
});

console.log(result.content[0].text);
```

## Claude Chat与Cursor等MCP客户端配置

在支持MCP协议的AI助手应用中，可通过以下方式配置与AiryLark翻译服务器的连接：

### Cursor配置

在Cursor设置或配置文件中添加以下MCP服务器配置：

```json
{
  "mcpServers": {
    "airylark-translation": {
      "url": "https://airylark-mcp.vcorp.ai/sse"
    }
  }
}
```

### Claude Chat配置

在Claude Chat中，可以通过以下步骤开启MCP服务器连接：

1. 进入设置页面
2. 找到"开发者设置"或"外部工具"选项
3. 添加新的MCP服务器，填写名称与URL
4. 服务器URL填写 `https://airylark-mcp.vcorp.ai/sse`

配置完成后，AI助手便可以使用"translate_text"和"evaluate_translation"工具，轻松处理各类专业文档翻译需求。

## 服务器配置与运行

AiryLark MCP服务器支持多种部署和运行方式，以下是常用配置方法：

### Docker部署

使用官方发布的Docker镜像是最简单的部署方式：

```bash
# 拉取官方镜像
docker pull wizdy/airylark-mcp-server

# 运行容器
docker run -p 3031:3031 --env-file .env -d wizdy/airylark-mcp-server
```

### Docker Compose部署

使用项目提供的docker-compose.yml文件，配合官方镜像可以更方便地管理服务：

```yaml
# docker-compose.yml 示例
services:
  mcp-server:
    image: wizdy/airylark-mcp-server
    ports:
      - "${MCP_PORT}:${MCP_PORT}"
    environment:
      - NODE_ENV=production
      - PORT=${MCP_PORT}
      - TRANSLATION_API_KEY=${TRANSLATION_API_KEY}
      - TRANSLATION_MODEL=${TRANSLATION_MODEL}
      - TRANSLATION_BASE_URL=${TRANSLATION_BASE_URL}
    restart: always
```

运行服务：

```bash
# 设置环境变量或创建.env文件
export MCP_PORT=3031
export TRANSLATION_API_KEY=your_api_key
export TRANSLATION_MODEL=your_model_name
export TRANSLATION_BASE_URL=your_api_base_url

# 启动服务
docker-compose up -d
```

### 服务器配置示例

您也可以使用类似以下的配置方式来定义和启动MCP服务器：

```json
{
  "mcpServers": {
    "airylark-translation": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "TRANSLATION_API_KEY",
        "-e",
        "TRANSLATION_MODEL",
        "-e",
        "TRANSLATION_BASE_URL",
        "wizdy/airylark-mcp-server"
      ],
      "env": {
        "TRANSLATION_API_KEY": "<YOUR_API_KEY>",
        "TRANSLATION_MODEL": "<YOUR_MODEL>",
        "TRANSLATION_BASE_URL": "<YOUR_API_URL>"
      }
    }
  }
}
```

这种配置方式适用于需要在应用内直接管理MCP服务器生命周期的场景。

## 许可证

本项目使用与AiryLark主项目相同的定制许可证，详见[LICENSE](LICENSE)文件。