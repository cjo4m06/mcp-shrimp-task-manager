[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇪🇸 Español](../es/README.md) | [🇫🇷 Français](../fr/README.md) | [🇮🇹 Italiano](../it/README.md) | [🇮🇳 हिन्दी](README.md) | [🇯🇵 日本語](../ja/README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

# MCP Shrimp Task Manager

> 🦐 **AI-संचालित विकास के लिए बुद्धिमान कार्य प्रबंधन** - जटिल परियोजनाओं को प्रबंधनीय कार्यों में विभाजित करें, सत्रों के बीच संदर्भ बनाए रखें और अपने विकास वर्कफ़्लो को तेज़ करें।

<div align="center">
  
[![Shrimp Task Manager Demo](../yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[डेमो वीडियो देखें](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[त्वरित प्रारंभ](#-त्वरित-प्रारंभ)** • **[प्रलेखन](#-प्रलेखन)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## 🚀 त्वरित प्रारंभ

### आवश्यकताएं
- Node.js 18+ 
- npm या yarn
- MCP-संगत AI क्लाइंट (Claude Code, आदि)

### स्थापना

#### Claude Code स्थापित करें

**Windows 11 (WSL2 के साथ):**
```bash
# पहले, सुनिश्चित करें कि WSL2 स्थापित है (PowerShell में Administrator के रूप में)
wsl --install

# Ubuntu/WSL पर्यावरण में प्रवेश करें
wsl -d Ubuntu

# Claude Code को globally स्थापित करें
npm install -g @anthropic-ai/claude-code

# Claude Code शुरू करें
claude
```

**macOS/Linux:**
```bash
# Claude Code को globally स्थापित करें
npm install -g @anthropic-ai/claude-code

# Claude Code शुरू करें
claude
```

#### Shrimp Task Manager स्थापित करें

```bash
# रिपॉजिटरी क्लोन करें
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# निर्भरताएं स्थापित करें
npm install

# प्रोजेक्ट बनाएं
npm run build
```

### Claude Code कॉन्फ़िगर करें

अपनी प्रोजेक्ट डायरेक्टरी में `.mcp.json` फ़ाइल बनाएं:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/your/shrimp_data",
        "TEMPLATES_USE": "hi",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

उदाहरण कॉन्फ़िगरेशन:
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/home/fire/claude/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/home/fire/claude/project/shrimp_data",
        "TEMPLATES_USE": "hi",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

फिर अपने कस्टम MCP कॉन्फ़िगरेशन के साथ Claude Code शुरू करें:

```bash
claude --dangerously-skip-permissions --mcp-config .mcp.json
```

<details>
<summary><b>अन्य AI क्लाइंट्स</b></summary>

**Cline (VS Code Extension)**: AI-सहायक कोडिंग के लिए VS Code एक्सटेंशन। VS Code settings.json में `cline.mcpServers` के तहत जोड़ें

**Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) या `%APPDATA%\Claude\claude_desktop_config.json` (Windows) में जोड़ें
</details>

### उपयोग शुरू करें

1. **अपना प्रोजेक्ट आरंभ करें**: `"init project rules"`
2. **एक कार्य की योजना बनाएं**: `"plan task: उपयोगकर्ता प्रमाणीकरण लागू करें"`
3. **कार्य निष्पादित करें**: `"execute task"` या `"continuous mode"`

## 💡 Shrimp क्या है?

Shrimp Task Manager एक MCP (Model Context Protocol) सर्वर है जो AI एजेंट्स के सॉफ़्टवेयर विकास दृष्टिकोण को बदल देता है। संदर्भ खोने या काम दोहराने के बजाय, Shrimp प्रदान करता है:

- **🧠 निरंतर मेमोरी**: कार्य और प्रगति सत्रों के बीच बनी रहती है
- **📋 संरचित वर्कफ़्लो**: योजना, निष्पादन और सत्यापन के लिए निर्देशित प्रक्रियाएं
- **🔄 बुद्धिमान अपघटन**: जटिल कार्यों को स्वचालित रूप से प्रबंधनीय उप-कार्यों में विभाजित करता है
- **🎯 संदर्भ संरक्षण**: टोकन सीमा के साथ भी अपना स्थान कभी न खोएं

## ✨ मुख्य विशेषताएं

### कार्य प्रबंधन
- **बुद्धिमान योजना**: कार्यान्वयन से पहले आवश्यकताओं का गहन विश्लेषण
- **कार्य अपघटन**: बड़े प्रोजेक्ट्स को atomic, परीक्षणीय इकाइयों में विभाजित करना
- **निर्भरता ट्रैकिंग**: कार्य संबंधों का स्वचालित प्रबंधन
- **प्रगति निगरानी**: वास्तविक समय स्थिति ट्रैकिंग और अपडेट

### उन्नत क्षमताएं
- **🔬 अनुसंधान मोड**: तकनीकों और समाधानों की व्यवस्थित खोज
- **🤖 एजेंट सिस्टम**: विशिष्ट कार्यों के लिए विशेषज्ञ AI एजेंट्स असाइन करें ([और जानें](../agents.md))
- **📏 प्रोजेक्ट नियम**: अपने प्रोजेक्ट में कोडिंग मानकों को परिभाषित और बनाए रखें
- **💾 कार्य मेमोरी**: कार्य इतिहास का स्वचालित बैकअप और पुनर्स्थापना

### वेब इंटरफेस

#### 🖥️ Task Viewer
drag-and-drop, वास्तविक समय खोज और multi-profile समर्थन के साथ दृश्य कार्य प्रबंधन के लिए आधुनिक React इंटरफेस।

**त्वरित सेटअप:**
```bash
cd tools/task-viewer
npm install
npm run start:all
# http://localhost:5173 पर पहुंच
```

[📖 पूर्ण Task Viewer प्रलेखन](../../tools/task-viewer/README.md)

<kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Task Viewer इंटरफेस" width="600"/></kbd>

#### 🌐 Web GUI
कार्यों के त्वरित अवलोकन के लिए वैकल्पिक हल्का वेब इंटरफेस।

`.env` में सक्षम करें: `ENABLE_GUI=true`

## 📚 प्रलेखन

- [📖 पूर्ण प्रलेखन](../README.md)
- [🛠️ उपलब्ध उपकरण](../tools.md)
- [🤖 एजेंट प्रबंधन](../agents.md)
- [🎨 प्रॉम्प्ट अनुकूलन](prompt-customization.md)
- [🔧 API संदर्भ](../api.md)

## 🎯 सामान्य उपयोग मामले

<details>
<summary><b>सुविधा विकास</b></summary>

```
एजेंट: "plan task: JWT के साथ उपयोगकर्ता प्रमाणीकरण जोड़ें"
# एजेंट कोडबेस का विश्लेषण करता है, उप-कार्य बनाता है

एजेंट: "execute task"
# चरणबद्ध तरीके से प्रमाणीकरण लागू करता है
```
</details>

<details>
<summary><b>बग फिक्सिंग</b></summary>

```
एजेंट: "plan task: डेटा प्रोसेसिंग में मेमोरी लीक ठीक करें"
# एजेंट समस्या की जांच करता है, सुधार योजना बनाता है

एजेंट: "continuous mode"
# सभी सुधार कार्यों को स्वचालित रूप से निष्पादित करता है
```
</details>

<details>
<summary><b>अनुसंधान और सीखना</b></summary>

```
एजेंट: "research: इस प्रोजेक्ट के लिए React vs Vue की तुलना करें"
# फायदे/नुकसान के साथ व्यवस्थित विश्लेषण

एजेंट: "plan task: चुने गए फ्रेमवर्क में घटक को माइग्रेट करें"
# अनुसंधान के आधार पर माइग्रेशन योजना बनाता है
```
</details>

## 🛠️ कॉन्फ़िगरेशन

### पर्यावरण चर

`.env` फ़ाइल बनाएं:

```bash
# आवश्यक
DATA_DIR=/path/to/data/storage

# वैकल्पिक
ENABLE_GUI=true          # वेब GUI सक्षम करें
WEB_PORT=3000           # कस्टम वेब पोर्ट
PROMPT_LANGUAGE=hi      # प्रॉम्प्ट भाषा (hi, en, zh, आदि)
```

### उपलब्ध कमांड

| कमांड | विवरण |
|---------|-------------|
| `init project rules` | प्रोजेक्ट मानकों को आरंभ करें |
| `plan task [विवरण]` | कार्य योजना बनाएं |
| `execute task [id]` | विशिष्ट कार्य निष्पादित करें |
| `continuous mode` | सभी कार्यों को क्रमानुसार निष्पादित करें |
| `list tasks` | सभी कार्य दिखाएं |
| `research [विषय]` | अनुसंधान मोड में प्रवेश करें |
| `reflect task [id]` | कार्य की समीक्षा और सुधार करें |

## 🤝 योगदान

हम योगदान का स्वागत करते हैं! विवरण के लिए कृपया हमारी [योगदान गाइड](../../CONTRIBUTING.md) देखें।

## 📄 लाइसेंस

यह प्रोजेक्ट MIT लाइसेंस के तहत लाइसेंसीकृत है - विवरण के लिए [LICENSE](../../LICENSE) फ़ाइल देखें।

## 🌟 श्रेय

[cjo4m06](https://github.com/cjo4m06) द्वारा निर्मित और समुदाय द्वारा बनाए रखा गया।

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">चर्चाएं</a>
</p>