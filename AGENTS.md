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

`src/components/InterviewBody.tsx`是一个**定制的markdown解析器**，不是通用的react-markdown渲染——它专门解析"访谈体"内容，依赖一个具体的文本格式契约：

- 每个发言轮次必须是`**发言人：**内容`这种格式（发言人名字+中文全角冒号，包在`**`加粗标记里），后面紧跟这轮的内容
- 同一轮发言可以跨多个markdown段落（用空行分隔），只要没有插入新的`**发言人：**`前缀、`## `标题、`> `引用块或`---`分割线，就会被认成同一轮，套进同一个色块
- `## "标题文字"`会被渲染成分节标题（金句标题，见`prompts/article_writing.md`在vibe-podcast repo里的方法论）
- `> `引用块渲染成绿色调的disclosure提示框（专门给强制披露文本用的）
- `*披露：...*`（斜体，通常是文末的披露声明）渲染成小字灰色提示

**如果发言人名字不是"孙哥"，会被当成"嘉宾"样式（绿色调），"孙哥"固定是"主持人"样式（棕色调）**——这个判断逻辑写在`InterviewBody.tsx`的`HOST_NAMES`里，以后如果孙哥这个节目品牌改名或者出现别的主持人，要改这个集合。

**后果**：往`src/content/posts/`加新文章时，正文必须严格遵守这个格式，不能随便用其他markdown写法写对话（比如不能用列表、不能用普通的"发言人:"半角冒号）。如果某篇内容不是访谈体（比如纯个人随笔），`InterviewBody`也能兼容渲染成普通段落——不匹配`**X：**`格式的段落会走"叙事段落"分支，正常渲染，不会报错。

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

