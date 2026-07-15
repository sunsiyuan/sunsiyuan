<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 孙思远个人网站 — 架构与方法论

**这是什么**：孙思远（Miles Sun）的个人网站，`sunsiyuan.xyz`。长期定位是博客/播客文字版/个人思考的聚合站，不是某个单一节目的专属站点——第一篇内容是「孙哥火星殖民计划」Vibe Podcast系列的Naval Ravikant专访，但这个repo跟`vibe-podcast`那个repo是分开的、独立的项目，不要合并。

**技术栈**：Next.js 16（App Router）+ Tailwind v4 + 纯markdown文件驱动内容（`gray-matter`解析frontmatter），部署在Vercel，绑定自定义域名`sunsiyuan.xyz`（DNS托管在GoDaddy，没有迁移到Cloudflare——迁移注册商不是绑定Vercel自定义域名的必要条件）。

---

## 内容格式契约（重要：改内容格式前先读这个）

`src/components/InterviewBody.tsx`是一个**定制的markdown解析器**，不是通用的react-markdown渲染——它依赖一个具体的文本格式契约。

**两种 format mode（frontmatter `format` 字段必填，缺了直接 build 报错）**：`format: "interview"`（访谈式播客文字版，即本节下面这套）和 `format: "essay"`（随笔，见文末"随笔体"小节）。`page.tsx` 把 `format` 传给 `InterviewBody`，`## `标题、`> `引用、`---`分割线、eyebrow 都按 mode 分两套样式渲染。

访谈体（`format: "interview"`）依赖的契约：

- 每个发言轮次必须是`**发言人：**内容`这种格式（发言人名字+中文全角冒号，包在`**`加粗标记里），后面紧跟这轮的内容
- 同一轮发言可以跨多个markdown段落（用空行分隔），只要没有插入新的`**发言人：**`前缀、`## `标题、`> `引用块或`---`分割线，就会被认成同一轮，套进同一个色块
- `## "标题文字"`会被渲染成分节标题（金句标题，见`prompts/article_writing.md`在vibe-podcast repo里的方法论）
- `> `引用块渲染成绿色调的disclosure提示框（专门给强制披露文本用的）
- `*披露：...*`（斜体，通常是文末的披露声明）渲染成小字灰色提示
- 已支持的语法（2026-07-06 逐步补全，别再假设"不支持"）：行内`**粗体**`、`` `行内代码` ``、`[文字](链接)`；块级 ` ```代码块``` `、有序/无序列表（`1. ` / `1 ` / `- `）、段内单个换行会保留成`<br>`（软换行）；**独占一行的图片`![alt](src)`**（2026-07-16 加）——渲染成居中 `<figure>`，`alt` 文字自动当图注（可含行内`[链接]`等语法），图片放 `public/` 用 `/xxx.png` 引用，interview/essay 两种 mode 通用。**仍不支持**：斜体`*x*`（单星会原样显示星号——文末披露 `*披露：...*` 是特例分支）、**行内图片**（图片必须自己独占一段，混在段落文字里会原样显示）。这仍是手写正则解析器，加新语法前先确认`renderInline()` / `splitBlocks()` / block 循环里是否已支持，别假设标准 markdown 自动生效（2026-07-06 踩过`[](url)`链接、` ``` `代码块、列表都原样显示的坑）。

**如果发言人名字不是"孙哥"，会被当成"嘉宾"样式（绿色调），"孙哥"固定是"主持人"样式（棕色调）**——这个判断逻辑写在`InterviewBody.tsx`的`HOST_NAMES`里，以后如果孙哥这个节目品牌改名或者出现别的主持人，要改这个集合。

**后果**：往`src/content/posts/`加访谈体文章时，正文必须严格遵守这个格式，不能随便用其他markdown写法写对话（比如不能用普通的"发言人:"半角冒号）。

### 随笔体（`format: "essay"`）

随笔不走访谈体的金句/发言人语法，有自己的一套（都在`InterviewBody.tsx`里按`format === "essay"`分支）：

- `## 小标题` → 干净标题（serif 正体、无引号无绿边框），不是访谈体的金句斜体
- `> 文字` → 引用/题记样式（serif 斜体 + 左绿边框），用作副标题/文中引用，不是访谈体的绿色披露框
- `---` → 一小截居中细线（轻分隔），不是访谈体那条横贯的大分割线
- **时间标签块**：一个段落如果首行是纯`**标签**`（如`**10:19**`）、下面还有内容，会渲染成"标签紧贴内容"的块——标签用`--accent`（翠绿、不是压眼的墨绿`--accent-deep`）且**不加粗**（靠颜色区分就够），紧贴下面的动作行。这是排时间线用的（"时间独占一行、动作换到下面"）
- eyebrow：essay 显示"随笔"，interview 显示"孙哥火星殖民计划"

**随笔写作习惯（ssh-breach 那篇定的稿约定）**：

- 有序列表统一`1. `
- 正文产品/工具名小写：claude / gemini / vibe coding / api；硬缩写保留大写（SSH / IP / AK / SK / AI / OSS / GCP）
- 日期：时间线标记用`5/14`；自然语言句子里用「5 月 14 日」这种
- 时间线：时间独占一行，动作换到下一行
- 行内代码去了绿底、改中性淡底（`--paper-raised` + `--ink-soft`），别让技术 token 抢视觉
- **受众是非技术读者 → 脱技术化**：深技术细节（命令 / 配置 / 中间件名 / IP / 端口）收成一句白话概览（例："claude 取证挖出来一整套后门……具体我也看不太懂，反正挺专业的"），只保留读者认得、又撑真实感的词。技术是"质感"不是"主轴"，主轴是人的判断和体验

---

## 音频播放器 & 存储（Naval第一期确定下来的方案）

文章可以嵌入播客音频，走`AudioPlayer`组件（`src/components/AudioPlayer.tsx`），不是简单的原生`<audio controls>`——原生控件样式没法跟站点视觉系统对齐，所以手写了一个小组件（播放/暂停按钮+进度条+时间显示，全部用站点自己的CSS变量）。frontmatter里加`audio: "<url>"`（可选`audioDuration: "mm:ss"`当元数据还没加载出来时的占位显示），`page.tsx`会自动在文章顶部渲染播放器。

**音频文件存哪**：用Vercel Blob（`@vercel/blob`），不要提交进这个repo的git仓库，也不要依赖播客平台自己的CDN链接：
- 提交进git会让仓库随着嘉宾增多不断变大，拖慢git操作——这个考量跟`vibe-podcast`那边`.gitignore`掉`guests/*/content/podcast/audio/`是同一个原因
- 小宇宙等播客平台的CDN链接可能带生命周期过期时间（实测小宇宙的`media.xyzcdn.net`链接header里有`x-oss-expiration`，大概两个月后过期），拿来做站内永久播放器的音源不安全
- 上传方法：`vercel blob put <本地文件路径> --pathname "audio/<slug>.mp3" --rw-token "$BLOB_READ_WRITE_TOKEN" --access public`（`BLOB_READ_WRITE_TOKEN`在`.env.local`里，是链接Blob store之后自动写入的）。Blob store（`sunsiyuan-media`）已经创建并链接到这个Vercel项目，不需要重新建。

**播客平台关注卡片**：`Subscribe`组件（`src/components/Subscribe.tsx`）支持一个可选的`podcastQr`/`podcastUrl`prop，跟已有的微信公众号二维码卡片并排展示（`QrCard`是两者共用的展示组件）。

**二维码直接用单集链接生成，不要去裁小宇宙的分享图**（2026-07-13 定，取代了原来那套裁图方案）：

```python
import qrcode
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=2)
q.add_data("https://www.xiaoyuzhoufm.com/episode/<id>"); q.make(fit=True)
q.make_image(fill_color="#1c1b18", back_color="#f8f6f0").save("public/<slug>-xiaoyuzhou-qr.png")
```

配色直接用站点的`--ink`/`--paper-raised`，出来就是暖纸风格，不需要额外排版包装。

原来的做法是从小宇宙分享图里用`PIL`裁出二维码部分——那是因为当时只有分享图。裁图有两个麻烦：分享图是渐变紫蓝+插画风，跟站点风格冲突；而且不同期裁出来的二维码密度/留白不一致，并排放很明显。**用链接重新生成从根上避免了这两点**，两期的二维码现在完全一致（naval-ep1 那张也已经用同一个脚本重新生成过）。

---

## 视觉设计系统（跟vibe-podcast的artifact风格保持一致）

这个站的配色和字号是直接从`vibe-podcast` repo里所有HTML artifact（访谈草稿、公众号文章草稿）沿用过来的，定义在`src/app/globals.css`的`:root`里：

```
--paper: #f1eee6        暖纸色背景
--paper-raised: #f8f6f0  卡片背景（略浅）
--ink: #1c1b18           正文文字
--ink-soft: #5b564c      次要文字
--ink-faint: #8a8478     最淡文字（日期、meta信息）
--accent: #2f6f5e        主强调色（绿）
--accent-deep: #1f4a3e   深强调色（分节标题、嘉宾发言标签）
--rule: #dad5c8          分割线颜色
```

字号跟`vibe-podcast`里的HTML artifact完全对齐，不要随意改动，除非孙哥明确要求：
- H1标题：34px，serif，line-height 1.25
- 分节标题（金句）：22px，serif斜体，左边框3px accent色
- 正文/发言内容：15.5px，line-height 1.75
- eyebrow（mono标签，用于日期/meta）：12px，mono，大写，字间距0.08em
- 发言人inline标签：跟正文同字号，加粗+下划线（不是mono小字——试过mono 11.5px的badge风格，孙哥反馈"乍看有点别扭"，改成了跟正文一致字号的加粗下划线，这是最终定版）

**如果以后vibe-podcast那边的artifact设计系统改了配色/字号，这里要跟着同步**，两边视觉语言要保持一致，因为读者会同时看到访谈草稿（批注用）和最终发布的站点，风格割裂会显得不专业。

---

## 怎么加一篇新文章

1. 在`vibe-podcast`那边走完`prompts/article_writing.md`的流程，产出确认过的公众号文章md文件
2. 复制到这个repo的`src/content/posts/<slug>.md`
3. 在文件顶部加frontmatter：
   ```yaml
   ---
   title: "文章标题"
   date: "YYYY-MM-DD"
   description: "一句话描述，用于首页列表和SEO"
   tags: ["Vibe Podcast", "AI", "嘉宾名"]
   ---
   ```
4. 确认正文严格遵守上面的"内容格式契约"
5. `npm run build`本地跑一遍确认没有报错，`npm run start -- -p <端口>`本地预览
6. `git add -A && git commit && git push`，推到`master`分支（这个repo用`master`不用`main`，孙哥的偏好）——Vercel已经连了GitHub集成，推送会自动触发生产环境部署，不需要手动跑`vercel deploy`

**目前是纯手动流程**：从vibe-podcast那边的确认稿到这个repo的markdown文件，是人工复制+加frontmatter，没有自动化脚本。如果以后嘉宾多了、更新频繁了，值得写一个脚本把这一步自动化（读取`guests/<name>/content/wechat/*.md`，自动生成带frontmatter的文件到这个repo）。

---

## 部署与域名

- Vercel项目：`sunsiyuan`（team: `sunsiyuans-projects`，project ID见`.vercel/project.json`）
- GitHub仓库：`sunsiyuan/sunsiyuan`，`master`分支自动部署到生产环境
- 自定义域名：`sunsiyuan.xyz`（A记录指向Vercel的边缘IP）+ `www.sunsiyuan.xyz`（CNAME到`cname.vercel-dns.com`，自动307跳转到不带www的根域名）；DNS托管在GoDaddy，没有迁移注册商
- 本地`vercel` CLI已经登录（账号`sunsiyuan`），可以直接用`vercel domains`/`vercel link`等命令管理，不需要重新认证

