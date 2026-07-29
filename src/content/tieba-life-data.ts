import type { NarrativeMetadata } from "@/contracts/content";

export interface OrdinaryTiebaReply {
  id: string;
  author: string;
  text: string;
  time: string;
  likes: number;
  replies?: Array<{
    id: string;
    author: string;
    replyTo?: string;
    text: string;
  }>;
}

export interface OrdinaryTiebaPost {
  id: string;
  bar: string;
  author: string;
  title: string;
  body: string[];
  time: string;
  views: number;
  replyCount: number;
  media?: string;
  replies: OrdinaryTiebaReply[];
  narrative: NarrativeMetadata;
}

function narrative(
  firstReadValue: string,
  primaryFunction: NarrativeMetadata["primaryFunction"] = "world_context",
  options: Partial<NarrativeMetadata> = {}
): NarrativeMetadata {
  return {
    primaryFunction,
    secondaryFunctions: options.secondaryFunctions ?? [],
    clueRole: options.clueRole ?? "none",
    worldFactIds: options.worldFactIds ?? ["wf.hangzhou.daily"],
    characterTraitIds: options.characterTraitIds ?? [],
    relationshipBeatIds: options.relationshipBeatIds ?? [],
    continuityLinkIds: options.continuityLinkIds ?? [],
    firstReadValue,
    payoffPolicy: options.payoffPolicy ?? "none"
  };
}

const seeds: Array<{
  bar: string;
  author: string;
  title: string;
  body: string[];
  time: string;
  views: number;
  media?: string;
  replies: Array<[string, string, string, number, Array<[string, string, string?]>?]>;
  narrative: NarrativeMetadata;
}> = [
  {
    bar: "杭州吧",
    author: "南岸没有风",
    title: "今天傍晚这阵雨来得也太快了",
    body: ["五点多出门时还是闷热，走到地铁口雨已经横着下了。", "提醒还没下班的吧友带伞，几个低洼路口积水有点深。"],
    time: "7月15日 18:42",
    views: 1864,
    media: "/media/case-001/daily/temporary-rainy-street.jpg",
    replies: [
      ["今天也下雨", "城西也下了，十分钟就停。", "18:46", 18],
      ["普通路过", "刚把晾在外面的衣服收回来。", "18:51", 7, [["南岸没有风", "我已经放弃今天晾干了。"]]],
      ["沿河慢慢走", "骑车的注意井盖，路面很滑。", "19:03", 13]
    ],
    narrative: narrative("建立七月城市阵雨和通勤语境。")
  },
  {
    bar: "摄影吧",
    author: "一档欠曝",
    title: "阴天街景是不是宁可欠一点也别硬拉亮",
    body: ["最近拍树影和湿路面，总觉得自动曝光把灰天提得太白。", "我现在会先减三分之一档，回去再看直方图，不追求每张都通透。"],
    time: "7月15日 15:19",
    views: 2940,
    media: "/media/case-001/daily/temporary-rainy-cafe.jpg",
    replies: [
      ["慢快门小顾", "保住高光就行，阴天本来就不必装晴天。", "15:31", 42],
      ["照片很多但不慌", "手机也可以先锁曝光再构图。", "15:44", 16],
      ["普通路过", "学到了，之前总以为越亮越好。", "16:02", 9]
    ],
    narrative: narrative("补充普通摄影兴趣与平台交流。", "habit", { characterTraitIds: ["ct.shenchuan.photo"] })
  },
  {
    bar: "数码吧",
    author: "硬盘灯还亮着",
    title: "移动硬盘长期备份，大家会留几份索引",
    body: ["照片按年份和项目分目录，原图与导出图分开。", "现在的问题是换盘后总忘记哪些目录已经校验，想做一张简单表格记录日期、容量和哈希。"],
    time: "7月15日 12:08",
    views: 4318,
    replies: [
      ["版本号从一开始", "索引不要只放盘里，至少再导出一份到云端。", "12:16", 57],
      ["橙色文件夹", "我会加一列“最后抽查日期”。", "12:29", 31],
      ["一只普通用户", "文件名统一后，盘坏了也更容易重建目录。", "13:07", 12]
    ],
    narrative: narrative("补充文件归档习惯，不承载直接线索。", "profession", { characterTraitIds: ["ct.shenchuan.archivist"] })
  },
  {
    bar: "家常菜吧",
    author: "灶台很小",
    title: "一个人晚饭，十五分钟能做什么",
    body: ["冰箱里只有青菜、鸡蛋和昨天剩的一点米饭。", "最后做了菜饭加蛋花汤，锅少洗一个比摆盘重要。"],
    time: "7月14日 20:37",
    views: 1262,
    media: "/media/case-001/daily/temporary-weekday-lunch.jpg",
    replies: [
      ["今天吃什么呀", "菜饭很适合下雨天。", "20:45", 23],
      ["冰箱便签", "剩饭先彻底加热就好。", "20:51", 11],
      ["午间十分钟", "这已经比我晚饭认真了。", "21:06", 6]
    ],
    narrative: narrative("补充普通独居饮食与生活节奏。", "habit")
  },
  {
    bar: "收纳吧",
    author: "收纳慢慢来",
    title: "线材不用买很多盒子，先固定四个位置",
    body: ["桌面、床头、通勤包和办公室各留一根常用线，剩下的贴标签放抽屉。", "整理后最明显的变化不是好看，而是不再每天找线。"],
    time: "7月14日 16:22",
    views: 2380,
    replies: [
      ["木桌边", "同意，先解决每天都在用的东西。", "16:34", 34],
      ["接口旁边", "还要记得标功率，不然快充线全混了。", "16:47", 27],
      ["普通路过", "收藏，周末照着做。", "17:05", 8]
    ],
    narrative: narrative("建立普通收纳讨论和稳定生活习惯。", "habit", { characterTraitIds: ["ct.shenchuan.charger"] })
  },
  {
    bar: "羽毛球吧",
    author: "今天没迟到",
    title: "新手双打站位总撞在一起怎么办",
    body: ["和朋友打了三次，前后站还好，一到平行站位就互相让球。", "有没有不用记太多术语、上场就能执行的办法？"],
    time: "7月14日 10:11",
    views: 3271,
    replies: [
      ["沿河慢慢走", "先约定谁正手谁优先，喊出来比默契更可靠。", "10:26", 46],
      ["白色鞋带", "接发球阶段先固定前后，不要急着跑平行。", "10:39", 28],
      ["普通路过", "同新手，发现喊“我来”真的有用。", "11:03", 15]
    ],
    narrative: narrative("补充普通体育社交和场馆生活。")
  },
  {
    bar: "读书吧",
    author: "第三章以后",
    title: "非虚构读到一半总忘记前面，怎么做轻量笔记",
    body: ["不想把阅读变成摘抄任务，但隔一周再打开又记不得结构。", "目前只在每章结束写三个问题，感觉比划满整页有效。"],
    time: "7月13日 22:14",
    views: 2107,
    replies: [
      ["研究提纲", "每章一句话概括，再记一条不同意的地方。", "22:27", 39],
      ["一只普通用户", "我只记页码和关键词，读完再整理。", "22:48", 21],
      ["普通路过", "三个问题这个方法很好。", "23:01", 7]
    ],
    narrative: narrative("补充阅读与记录习惯。", "habit")
  },
  {
    bar: "杭州吧",
    author: "沿河慢慢走",
    title: "周末想骑一段不太晒的绿道，有普通路线推荐吗",
    body: ["距离十五公里以内，最好中途能补水，纯休闲不追速度。", "公共道路和开放绿道都可以，不想去人特别多的景点。"],
    time: "7月13日 09:36",
    views: 5921,
    replies: [
      ["南岸慢慢走", "早点出发，十点以后无遮阴的路段还是晒。", "09:45", 63],
      ["南岸没有风", "带驱蚊，沿水绿道傍晚虫多。", "10:02", 33],
      ["今天也下雨", "这周天气不稳，回程前看一下雷达图。", "10:20", 19]
    ],
    narrative: narrative("补充城市公共空间和周末出行。")
  },
  {
    bar: "摄影吧",
    author: "镜头布不见了",
    title: "冲洗照片要不要保留原始比例的白边",
    body: ["店里问我要不要满版裁切，我担心手机截图和相机原图比例不同。", "打算统一留一点白边，在背面写日期和文件名。"],
    time: "7月12日 17:53",
    views: 3496,
    replies: [
      ["慢快门小顾", "留原比例更稳，后面装框再决定裁不裁。", "18:06", 51],
      ["照片很多但不慌", "背面用铅笔轻写，别压出痕。", "18:21", 24],
      ["旧雨17", "文件名和冲印批次都记一下。", "18:37", 17]
    ],
    narrative: narrative("补充照片冲印与原文件意识。", "habit", { characterTraitIds: ["ct.shenchuan.photo", "ct.shenchuan.archivist"] })
  },
  {
    bar: "通勤吧",
    author: "耳机只戴一边",
    title: "换乘只差两分钟的时候还要不要跑",
    body: ["以前总在扶梯口冲刺，赶上了也要一路喘。", "最近决定错过就等下一班，实际也只晚五六分钟。"],
    time: "7月12日 08:43",
    views: 1849,
    replies: [
      ["今天没迟到", "不跑，安全比两分钟重要。", "08:51", 32],
      ["白色鞋带", "而且跑到站台经常还是要等。", "09:02", 18],
      ["普通路过", "看到这帖决定今天不冲了。", "09:17", 9]
    ],
    narrative: narrative("补充城市通勤和人物节奏。")
  },
  {
    bar: "家居吧",
    author: "窗台三号盆",
    title: "连续阴雨后绿萝黄叶，是少水还是缺光",
    body: ["窗边没有直射光，盆土摸起来还潮。", "先停水开窗两天，新叶倒是没有继续变黄。"],
    time: "7月11日 19:28",
    views: 2675,
    replies: [
      ["冰箱便签", "土还潮就别浇，先看根有没有闷住。", "19:41", 26],
      ["接口旁边", "阴雨天风扇远距离吹一会也行。", "19:53", 11],
      ["普通路过", "同样情况，来蹲后续。", "20:06", 5]
    ],
    narrative: narrative("补充普通家居照料和天气连续性。")
  },
  {
    bar: "数码吧",
    author: "版本号从一开始",
    title: "“最终版2”已经出现了，怎么把文件名救回来",
    body: ["共享目录里现在有最终版、最终版2、最终修改、最终不改四个文件。", "想从今天开始统一日期_主题_v编号，不知道旧文件该不该一起重命名。"],
    time: "7月11日 14:05",
    views: 7480,
    replies: [
      ["硬盘灯还亮着", "旧文件先只读备份，再建立映射表批量改。", "14:13", 88],
      ["橙色文件夹", "不要覆盖原文件，先复制到新目录演练一次。", "14:27", 54],
      ["研究提纲", "版本规则写在目录最上层的说明里。", "14:39", 37]
    ],
    narrative: narrative("补充工作文件管理语境。", "profession", { characterTraitIds: ["ct.shenchuan.archivist"] })
  },
  {
    bar: "杭州吧",
    author: "写字楼观察员",
    title: "午休只有四十分钟，附近走一圈还是直接趴着",
    body: ["办公室空调太冷，出去走十分钟反而清醒一点。", "但这几天中午湿度太高，回来又是一身汗。"],
    time: "7月10日 12:34",
    views: 1596,
    replies: [
      ["午间十分钟", "我会先吃完饭，再在有树荫的路段走一小圈。", "12:41", 19],
      ["南岸没有风", "雨天就去楼下便利店绕一下。", "12:52", 8],
      ["普通路过", "四十分钟还是趴十分钟最实在。", "13:06", 14]
    ],
    narrative: narrative("补充普通工作日和办公生活。", "profession")
  },
  {
    bar: "宠物吧",
    author: "八点四十二",
    title: "猫每天准时坐门口，但开门又不出去",
    body: ["八点半开始等，门一开只闻两下就往回跑。", "怀疑它只是把开门当成每天固定节目。"],
    time: "7月9日 21:02",
    views: 6254,
    media: "/media/case-001/daily/temporary-cat-window.jpg",
    replies: [
      ["普通路过", "猫：流程走完了，可以关门。", "21:08", 96],
      ["一只普通用户", "我家也这样，主要是检查走廊有没有变化。", "21:17", 44],
      ["收纳慢慢来", "头像和帖子都好可爱。", "21:36", 21]
    ],
    narrative: narrative("补充宠物内容和平台轻松语气。")
  },
  {
    bar: "摄影吧",
    author: "照片很多但不慌",
    title: "一次只整理一百张照片，真的会更容易坚持",
    body: ["以前每次都想一晚上整理完整个月，最后只建了文件夹。", "现在固定一百张：删重复、标收藏、导出备份，然后立刻停。"],
    time: "7月9日 18:11",
    views: 4812,
    replies: [
      ["橙色文件夹", "给任务设结束条件比设开始时间更有用。", "18:24", 61],
      ["硬盘灯还亮着", "我会再抽查十张确认备份能打开。", "18:39", 29],
      ["一只普通用户", "今晚试一下。", "19:02", 8]
    ],
    narrative: narrative("补充照片整理的普通方法。", "habit", { characterTraitIds: ["ct.shenchuan.photo"] })
  },
  {
    bar: "咖啡吧",
    author: "木桌边",
    title: "手冲器具越买越多，最后还是最常用那一个杯子",
    body: ["滤杯换了三个，电子秤也升级过，工作日早上还是只想快点冲完。", "最近把不常用的都收起来，台面终于能放下一本书。"],
    time: "7月8日 07:56",
    views: 2218,
    replies: [
      ["午间十分钟", "工作日稳定比折腾参数重要。", "08:03", 17],
      ["接口旁边", "我最后连温度计都不用了。", "08:15", 12],
      ["普通路过", "台面清爽以后确实更想用。", "08:37", 6]
    ],
    narrative: narrative("补充普通消费与居家使用痕迹。")
  }
];

export const ordinaryTiebaPosts: OrdinaryTiebaPost[] = seeds.map((seed, index) => ({
  id: `tieba.ordinary.${String(index + 1).padStart(2, "0")}`,
  bar: seed.bar,
  author: seed.author,
  title: seed.title,
  body: seed.body,
  time: seed.time,
  views: seed.views,
  replyCount: seed.replies.length,
  media: seed.media,
  replies: seed.replies.map(([author, text, time, likes, nested], replyIndex) => ({
    id: `tieba.ordinary.${String(index + 1).padStart(2, "0")}.reply.${replyIndex + 1}`,
    author,
    text,
    time,
    likes,
    replies: nested?.map(([nestedAuthor, nestedText, replyTo], nestedIndex) => ({
      id: `tieba.ordinary.${String(index + 1).padStart(2, "0")}.reply.${replyIndex + 1}.${nestedIndex + 1}`,
      author: nestedAuthor,
      replyTo,
      text: nestedText
    }))
  })),
  narrative: seed.narrative
}));

export const followedTiebaBars = [
  { name: "杭州吧", members: "286万", posts: "1.3万", description: "城市生活、通勤与本地见闻" },
  { name: "摄影吧", members: "418万", posts: "2.7万", description: "器材、作品与日常拍摄" },
  { name: "数码吧", members: "192万", posts: "8,642", description: "设备、文件与数据整理" },
  { name: "羽毛球吧", members: "136万", posts: "6,238", description: "训练、球拍与场地交流" },
  { name: "读书吧", members: "338万", posts: "9,106", description: "阅读记录与书目讨论" },
  { name: "潘博文事件吧", members: "3.4万", posts: "126", description: "旧网页、缓存记录与公开讨论存档" }
] as const;
