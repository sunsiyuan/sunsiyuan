---
title: "同一个项目，我在硬盘上拷了四份"
date: "2026-07-10"
description: "分享一下我的工作区设置：三块屏幕、四个目录、一张端口表。"
tags: ["随笔", "AI", "工作流"]
format: "essay"
---

> 分享一下我的工作区怎么配的。同一个项目在硬盘上拷了四份，四个 claude 同时跑。

---

我硬盘上有个文件夹叫 `shengcai`，里面十几个项目。把不相干的删掉，剩下这几行：

```
pod-ops-agent
pod-ops-agent-build -> /Volumes/Extreme SSD/shengcai-archive/pod-ops-agent-build
pod-ops-agent-dev-mirror-1
pod-ops-agent-dev-mirror-2
pod-ops-agent-dev-mirror-3
.worktrees
dev-slots.tsv
```

同一个项目拷了四份。旁边一个空的 `.worktrees`，一个 `dev-slots.tsv`，还有一个已经不在这台电脑上的 `pod-ops-agent-build`。

## 多大

从 4 月下旬认真开工，到现在两个半月，主仓库四十七万行代码，四千八百多个 commit、一千多个合并的 PR、两百多个 issue。核心那二十来万行，git 算我头上的七成，一个同事三成，都是正经业务代码。平摊下来一天六十个 commit 上下。

代码不是我们手敲的，claude 写，我俩指挥。

拷四份，四个 claude 各占一份、各干各的。分工没那么刻意，活多的时候哪个槽空着就上哪个。

## 屏幕

三块。

左边一块竖屏，副的。上面放 chatgpt，下面一个 terminal——chatgpt 经常被 terminal 盖住。

中间那块是主力，左右各摆一个 terminal。

右边是 macbook 自己的屏。微信、todesk，一切跟外面打交道的事都在那儿。

terminal 里跑的都是 claude code，一个窗口底下还会开几个 tab。四个槽都会用到，只是不常驻——哪个在跑活哪个才开着。次要的活放在左边那块副屏上。

## worktree

一开始想用 git worktree，一个 `.git` 底下挂多个工作目录。现在也还在用，两种混着来。

四个目录都停在 `master`，git 不许同一个分支在两个工作目录里同时 checkout。主槽自己也在干活，也停在 master 上，要从它身上开一个 worktree，就得先把它腾出来——正干到一半的东西就被 checkout 走了。

这事发生过好几次。每次都得停下来先收拾：先恢复哪个，哪份活先放着。

拷 mirror 就没这问题：整个目录复制一份，各有各的 `.git`，四份一起停在 master 也没人管。就是在 Finder 里选中那个文件夹，复制，粘贴。

这东西跑起来还要同时起三个进程：云端、本地执行器、界面。它还是个桌面 app，一台电脑只准开一个实例，靠一个锁文件认人。

## 端口

四份拷完各自跑起来，调试端口撞了，才加的这张表。

```
slot  suffix  cloud  connector  ui    folder
A     -       3170   3271       5173  pod-ops-agent
C     wsC     3190   3291       5193  pod-ops-agent-dev-mirror-1
D     wsD     3200   3301       5203  pod-ops-agent-dev-mirror-3
E     wsE     3210   3311       5213  pod-ops-agent-dev-mirror-2
```

一个槽位一套端口，绑死一个目录。开工前认一个槽，栈就往那几个口上起。

表和脚本是 6 月 3 号才补的。之前四个目录已经各自干了一两个月，端口我手改。仓库里还留着那时候的模板文件，里面手写着第二套端口。

## build

还有第五个目录，`pod-ops-agent-build`，出客户端安装包用的。它不是仓库，里面就是一堆打包日志，和 `artifacts/` 底下打出来的安装包。

它已经不在这台电脑上了。内置盘 228G，只剩 6 个多 G，装不下了，就把整个目录挪去外接的 SSD，原地留了个软链——从 `shengcai` 底下看，它还在原来的位置。

## spec

我不写 spec。

openspec 那套 proposal、design、tasks 三件套试过一阵，基本抛弃了。仓库里还躺着一百五十来份 spec，项目文档里现在写着一句：非所有 dev flow 都走 openspec，不作为权威。

现在多周的大改动开一个 `docs/initiatives/<名字>/` 文件夹，plan、audit、kickoff 丢进去；小一点的就一个 md；再小的直接干，最多先让 claude plan 一下。那底下现在七十一个 initiative，四十三个文件夹，二十八个单文件。

不可逆的决定写成 ADR。日常的想法不进仓库。
