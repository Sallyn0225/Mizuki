---
title: 打死不掏钱！怎么用最低的成本白嫖各家强大模型
description: 基于CLIProxyAPI和New API两个项目，白嫖各家强大的模型，并且聚合后进行分发。
category: 学习
tags:
- 折腾大王
published: 2025-12-22
draft: false
---

**注：这篇文章并不能算得上是一个教程贴**，最好还是需要有一定阅读项目文档和折腾的时间来自行摸索。本文只是起到抛砖引玉的作用。

## 为什么折腾这个

虽然我我自己的的谷歌账号白嫖了一年的PRO会员，加上我自己对三大家（OpenAI/Anthropic/Google）的模型只对谷歌偏爱有加，理论上我其实不需要那么多模型来进行日常的使用。

![how-to-use-ai-for-free-20251222_21-07-17](../images/how-to-use-ai-for-free-20251222_21-07-17.webp)

但是在我之前尝试了vibe coding后，接触到了[kilo code](https://kilo.ai/)和[claude code](https://code.claude.com/docs/zh-CN/overview)等等需要特殊模型或者格式的项目。因此只用谷歌家的模型已经没有办法满足我的需求了。另外我感觉只使用一家的模型容易出现一些无法解决的问题而又不能换用其他的模型来解决问题，因此开始打算白嫖其他家的模型。~~比如之前用windsurf只使用claude写出来的项目存在比较严重的安全问题~~。

另外，一方面我也搞了一个自己的服务器，有很多逆向API的项目现在可以在我自己的服务器上用docker部署了。因此服务器不用白不用，说干就干。

## 白嫖模型的来源

### 一、谷歌带善人

谷歌现在比较稳定的反代有两个渠道：一个是[gemini cli](https://geminicli.com/)的反代，另一个是[Antigravity](https://antigravity.google/)的反代。

加上反重力的模型甚至可以使用claude sonnet和opus模型，以及自己的3-pro和3-flash模型，可以说是让人分外眼红。

因此谷歌带善人是薅的主要对象。

你问为什么不耗GCP 300刀赠金，我只能说那个一个号只有一次机会，而且3个月用完就没有了，加上现在谷歌开号保号的难度实在是太大了，大部分人如果现成只有一个号的话也就意味着只有一次薅这300刀的机会。所以这里就不考虑了。

---

那么用什么项目来逆向cli的模型呢？一开始我是使用的[gcli2api](https://github.com/su-kaka/gcli2api)这个项目，作者更新的也非常勤快，但是还是存在不少的bug（没有说这个项目不好的意思）不知道为什么即使是正常使用的大号，凭证失效的速度也非常快，而另一个项目[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)则失效的速度并没有那么快。

![how-to-use-ai-for-free-20251222_21-08-02](../images/how-to-use-ai-for-free-20251222_21-08-02.webp)

> 另外CLIProxyAPI这个项目的stars数和forks数也都明显比前者高，维护的也比较及时，可能这就是BUG比较少的缘故吧。

而且加上CLIProxyAPI这个项目还能接入Codex的逆向以及iflow的逆向模型，也就是说一个项目就可以同时使用国内外强大的大模型，所以干脆我就全部都换到了这个项目上。

### 二、iflow

其实也就是CLIProxyAPI可以支持的反代，[iflow](https://iflow.cn/)这个平台的限额其实我是不清楚的，但是好像说是cli是有永久免费使用额度的？哪怕我接了一个agent也没有触发到限额，所以总体来说体验还是挺好的。

## 如何汇总分发

[New API](https://github.com/QuantumNous/new-api)这个项目确实非常好用，在公益站基本上都可以看到。如果是自己用的话，其实不用这个进行分发也是可以的。如果你有考虑和朋友分享自己的API的话，那么这个管理起来肯定是非常方便的。

虽然CLIProxyAPI这个项目本身也支持各种格式的API地址，也可以自定义添加OpenAI适配的接入点和API。但是在我实际使用自己添加的API的时候还是有些问题的，而且自定义程度并不是很大。只能说如果是作为分发的用途来说还是差了点功能，因此打算最终还是上new api作为最终的分发——虽然给自己一个人用的话肯定是有点高射炮打鸟了。

![how-to-use-ai-for-free-20251222_21-12-43](../images/how-to-use-ai-for-free-20251222_21-12-43.webp)

## 使用教程

### 一、部署CLIProxyAPI

参考官方文档：https://help.router-for.me/cn/docker/docker-compose.html

---

但是需要注意的是，编辑的是`config.yaml`文件。

其中主要需要配置的是**允许远程和修改密码**的功能。

- `allow-remote: false` 需要改成 `true`
- `secret-key: ""` 需要添加一个密钥
  
其实到这里就可以保存然后启动容器了。因为这个项目自带了webui，只需要把webui的部分配置好然后去webui里修改就行了。

**访问webui有个坑，需要访问的是 `服务器地址/management.html`，没有这个 `.html` 就访问不了**。当时我找了半天文档才找到这个问题。

---

然后就可以开始添加自己的OAuth文件了，其实也是非常无脑，我主要只添加三个：gemini, Antigravity, iflow（因为其他的要钱）

其中gemini cli的需要自己提前进入 [Google Cloud Console](https://console.cloud.google.com/) 里先查看或者新建一个项目，然后把项目ID复制进去才可以。

![how-to-use-ai-for-free-20251222_21-26-36](../images/how-to-use-ai-for-free-20251222_21-26-36.webp)

反重力不需要这个步骤，**但是他们都需要复制一个以 `localhost` 开头的链接然后填入到回调地址输入框内获取才能算完成**。

iflow国内环境支持比较好，不过也是需要复制回调地址回来才可以。

### 二、部署New API

参考文档：https://www.newapi.ai/zh/docs/installation/deployment-methods/docker-compose-installation

---

在编辑这个`docker-compose.yml`文件的时候，我注意到用了比较常用的 `3000` 端口，这个使用的时候可能需要替换一下；另外这个项目中还用了redis和postgres，可能需要改一下名字，防止其他项目也用了这两个名字导致启动失败。

> 其实这个部分我是问了AI才知道的，以下是AI的回复。
> 
> 你之前提到你还有其他的 Docker 项目（比如 gemini-rss）。如果那个项目也用了 Redis 或 Postgres，并且也给它们命名为 container_name: redis，那么 Docker 会报错，因为它不允许两个容器叫同一个名字。
> 
> 建议给容器名加上前缀，使其唯一：

```yml
services:
  new-api:
    container_name: new-api-service  # 改名
    ...
  redis:
    container_name: new-api-redis    # 改名
    ...
  postgres:
    container_name: new-api-db       # 改名
```

AI还让我修改了卷名称

> 如果你有多个项目都叫 `pg_data`，它们可能会共用同一个虚拟硬盘，导致数据错乱。建议改成：

```yml
volumes:
  new-api-pg-data:
```

（注意：如果改了这里，postgres 服务下的 volumes 也要跟着改）。

另外还需要修改密码

```yml
# 1.‌ 修改这里
- SQL_DSN=postgresql://root:你的新密码@postgres:5432/new-api

# 2.‌ 修改这里（必须和上面一致）
POSTGRES_PASSWORD: 你的新密码
```

做完这些修改，就可以启动容器了。然后直接访问 `服务器地址:端口号` 打开webui就可以。然后就可以开始添加我们在CLIProxyAPI得到的地址和API了。

如果是接入New API的话，**我个人还是会选择OpenAI格式的地址和API Key**，虽然说这样的确会导致失去Gemini模型自带的联网功能。~~但是，嘛，适配要紧~~。

但是好像使用New API的自动获取模型列表有点问题？这个就不清楚究竟是CLIProxyAPI没做适配还是什么原因了，不过问题也不大，可以自己手动复制模型ID然后进去。

---

其实new api的功能还是非常强大的，但是在这里就不展开说了，反正他们的文档写的还是非常简单易懂的，我觉得也没有必要在博客这里复述一遍了。暂时也没踩到什么坑或者发现什么特别好用的功能。

## 如何接入使用

### 手机端

手机端其实有两个APP我一直还没对比出究竟是哪个好用。一开始我肯定会直接说[rikkahub](https://rikka-ai.com/)是最好用的多提供商聚合对话平台，但是使用了[kelivo](https://kelivo.psycheas.top/)之后我感觉两者大差不差，而且都不怎么卡，功能上也基本都是一模一样的。

![rikkahub的界面](../images/how-to-use-ai-for-free-20251222_21-39-47.webp)

![kelivo的界面](../images/how-to-use-ai-for-free-20251222_21-40-05.webp)

接入也非常简单。依旧是选择OpenAI格式，然后使用New API得到的地址和API Key即可。记得在输入地址的时候需要带上一个 `/v1` 的后缀。

### 电脑端

如果是之前，我肯定也是会无脑推荐 **cherry studio** ，但是随着它更新加的功能越来越多，而且使用 **node.js** 确实会比较卡。加上 kelivo 是 **mac, linux, windows** 三端都可以使用。所以同步起来的话也会更加方便，于是现在在电脑上，**我也是使用 kelivo 比较多**。

![kelivo电脑端的界面](../images/how-to-use-ai-for-free-20251222_21-45-58.webp)

配置也是和kelivo手机端的配置没有什么区别，在这里就不展开细说了。

## 目前发现的小BUG

- [ ] **在对话软件内使用New API的谷歌格式，尝试使用google模型内置的网络搜索失败**。不清楚是不是本身就要在将CLIProxyAPI接入New API的时候就要选择gemini格式防止搜索参数丢失。
- [ ] 在对话软件内使用OpenAI格式的New API，**如果使用的是谷歌模型，在调用Tavily等搜索工具的时候，非常容易失败**。但是如果使用的是非谷歌家的其他模型，则不会出现这种问题。

## 结言

总之以上就是折腾的结果了，至少现在在大部分时候我的New API分发的API都是没有问题的。实在想用搜索或者原生的CLIProxyAPI，那我就只需要在聊天软件里面重新添加一个CLIProxyAPI作为提供商就可以了。