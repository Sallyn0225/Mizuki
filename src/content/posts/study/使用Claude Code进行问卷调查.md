---
title: 使用Claude Code进行问卷调查的工作流
description: 使用Claude Code的MCP, skills, agent等功能，做一个从设计问卷到发布问卷调查结果的工作流
category: 学习
tags:
- 折腾大王
- 开发
published: 2025-12-26
draft: false
image: https://assets.sallyn.top/images/2025/12/20251226130105671.webp
---

最近发公众号的时间确实少了些，一方面是考试周，另一方面是手头有要毕设开题有要做课程设计，确实有些忙了。虽然在之前已经做过一个[自动总结每日资讯的网站](https://mp.weixin.qq.com/s/ocWceRgXSZMPyIZjG4pDhg)，但也仅仅是完成了周报相关的部分。

我们有一个专门的抽选统计环节，~~只不过上次因为当时鸡狗 2 开票的时候我在看 MOIW 呢~~，所以那个时候就没有发问卷以及统计结果。

最近感觉公众号的周报才啊还有问卷统计的环节其实本来也就可以高度的自动化和模板化，只不过我有了服务器之后也一直没有折腾 n8n 之类的工作流，最近开题了刷到了一个[用 Claude Code 来提高自己的效率的帖子](https://linux.do/t/topic/1358868)（这个帖子可能有访问权限所以可能没办法看到）用了一下 CC 不禁感慨自己之前过的都是什么些苦日子x。

在实际测试中，成功使用 Claude Code 官方的 subagent, skills, MCP 等功能做出来了一个可以实现自动生成抽选调查问卷、自动分析 xlsx 数据、自动将分析结果生成可视化的 HTML 页面的工作流。

## 前置条件

- **安装好 Claude Code**  
`npm install -g @anthropic-ai/claude-code`
- **获取好需要使用的 skills**  
Claude 官方的 skills 仓库：https://github.com/anthropics/skills ，我们需要的是里面的 xlsx 这个技能。

```TEXT
.claude/
└── skills/
    └── xlsx/		//官方的xlsx技能
```

- **多个 subagent 执行不同的任务**  
代码我就放在最后好了，放在这里恐怕确实有点长了。主要是四个关键的文件，分别对应四个任务：

```text
.claude/
└── agents/
    ├── design-question.md			//用于设计问卷
    ├── excel-analyzer.md			//用于分析excel数据
    ├── html-to-image-converter.md	//用于将html文件转换成图片
    └── xlsx-html-visualizer.md 	//用于将分析数据转换成HTML
```

当然，为了输入和生成文件在后续方便我整理和查看，可以提前做好文件夹。不过没有也没有关系，因为 agent 看到没有路径的话会自动创建的。

最后的结构大概是这样子的

```TETX
表格分析-HTML生成/
├── .claude/
│   ├── agents/
│   │   ├── design-question.md
│   │   ├── excel-analyzer.md
│   │   ├── html-to-image-converter.md
│   │   └── xlsx-html-visualizer.md
│   └── skills/
│       └── xlsx/
├── inputs/		//输入问卷调查的xlsx文件
├── outputs/
│ ├── analysis/		//xlsx分析后生成的.md文件存放于此
│ ├── images/		//HTML转图片后的图片目录
│ ├── reports/		//生成的HTML文件
│ └── surveys/		//生成的问卷文件，可以直接导入腾讯问卷
├── CLAUDE.md		//项目说明，让AI读的
├── render_report.py		//HTML转图片的脚本
└── universal_excel_analyzer.py		//好像是AI写好的分析xlsx文件的脚本
```

## 各个术语的解释

我的解释不一定是最标准的，只是方便我理解，来调用 Claude Code 官方文档里提及的内容。

- MCP：比较占用上下文，用于链接外部信息或者数据
- skill：做一样事情的能力。具体怎么去做这个事情，不调用的时候占用上下文很少。
- agent：一个角色，这个角色专门用来做什么事情。上下文独立，很能节省上下文。

好像这么解释了诶还是非常抽象，不妨打个比方。现在我要开一家餐厅，**我雇了一些员工**，这些员工有的负责做饭，有的负责打扫卫生，一个人只专门干一件事情，**他们就是 agent**；另外，比如需要做饭的时候，我需要知道**菜谱（skill）**，比如怎么做一道番茄炒蛋，这个时候如果我有对应的 skill，那么我就可以完成这道菜；一个餐厅肯定需要去外部拿货，去不同的地方拿信息没有一个统一的标准，非常麻烦。但是遵循这个 **统一标准(MCP)** 的就可以直接接入，不论是拿货还是查库存，都可以通过这个统一的标准来进行，但是 MCP 比较占用上下文，个人觉得还是一个比较实验的技术。

## 工作流

### 告知 AI 信息，生成问卷

> 这一步其实很简单，甚至如果你已经在腾讯问卷里有过之前做好的问卷，可以直接复制一个副本然后修改内容就好了，我个人做完觉得没啥必要，还费 token

告诉 AI 以下信息，并且使用 `@` 命令，选择设计问卷的 agent：

- 这次活动名称
- 这次活动有什么等级的席位
- 这次活动一人最大可以申请多少张票

然后 AI 就会自动生成一个. txt 文件，可以直接复制到腾讯问卷里面进行导入。**但是在. txt 编辑模式下，无法实现逻辑功能**！我觉得这就很没意思了，还不如我自己手动创建一个问卷模板然后改来得快。

![AI生成的问卷](https://assets.sallyn.top/images/2025/12/20251226114134193.webp)

### 分析问卷结果

因为 xlsx AI 是没有办法直接读取的，所以需要使用 python 脚本来把 xlsx 文件转换成 AI 可以看懂的格式。这个时候就要用到我们之前设置好的 `xlsx` 技能。在 CC 里面可以使用 `@` 命令或者其他显示调用的方式要求使用我们提前写好的 agent（agent 的提示词里面有要求使用这个 skill）然后 AI 就会使用这个技能，对我们输入的 xlsx 文件进行分析。

最后，agent 会将分析的结果提取成一个 .md 文件，用于下一步的操作。

```TETX
表格分析-HTML生成/
└── outputs/
    └── analysis/
        ├── bang-dream-10th.json
        └── bang-dream-10th.md
```

> 我觉得这个 json 应该是 skill 生成的，agent 多生成了一个.md 文件而已

### 将分析结果转换成 HTML

这个时候，我们直接调用之前已经写好的 `xlsx-html-visualizer` 这个 agent，告诉他我们的.md 文件在哪里，就可以自动生成一份 HTML 的页面，用可视化的图表来展示这次抽选的数据。

![在浏览器内打开可以查看HTML](https://assets.sallyn.top/images/2025/12/20251226125838693.webp)

> 个人不太满意的地方就是这一部分交叉分析没有体现出来，或许需要用上一部 xlsx 转换出来的.json 原始数据，再写一个专门用来分析结论的 agent，进行更深层的数据探究，然后再转换成 HTML

结果会保存至 `/output/reports` 文件夹内。

### 将 HTML 转换成图片

这个任务其实还蛮简单的，不用 AI 也可以做完。调用 `html-to-image-converter` 这个 agent 就会自动运行 python 脚本，将刚才生成的 HTML 文件转换成图片，方便在社交媒体上进行分享。

![HTML转换后的长图](https://assets.sallyn.top/images/2025/12/20251226130105671.webp)

## 不足之处

事实上，这么操作下来的流程其实只有读取 xlsx 文件和生成 HTML 是比较需要靠 AI 的，其他的部分都可以自己手动更快的完成，**效率比较低，而且还是需要手动批准较多次**。

因此我正在考虑部署一个 n8n 在我自己的服务器上的可能性。利用 **fetch 这个 MCP+定时任务**，爬取活动官网的链接，在获取到了官网更新抽选信息后自动生成一份问卷文件并提示我及时更新并分享问卷链接；在问卷收集了一段时间的数据后，只需要我上传 xlsx 文件，最后自动交付给我一张图片，为本次抽选的结论。

不过 n8n 还需要学习，另外最近确实有点小忙了，看看之后要不要考虑折腾一下。并且有了 n8n 之后说不定还可以做一个 n8n 的工作流，自动生成每日日报到 .md 文件，每日只需要查看这个 .md 文件即可。比起当前的 NSYC 订阅站，我感觉这个方案会更加稳定一些。

## 所使用到的文件

我把我自己用到的全局提示词和这几个 subagent 的提示词都打了个包，就不开 Github 仓库了，有需要的朋友可以在链接里下载查看。

链接：https://sallyn.lanzoul.com/iFHBp3ejdi5i

## 参考链接

- [Claude Code 官方文档](https://code.claude.com/docs)
- [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)
- [Claude Code是真心好用，原生工具也很丰富，直接给我用爽了，爽！再次感谢各位公益站的大佬，感谢！！！](https://linux.do/t/topic/1351251)