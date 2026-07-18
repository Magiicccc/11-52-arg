import type { NarrativeMetadata } from "@/contracts/content";

export type OrdinaryMessageType =
  | "text"
  | "image"
  | "voice"
  | "file"
  | "location"
  | "link"
  | "sticker"
  | "quote"
  | "recalled"
  | "payment";

export interface OrdinaryMessage {
  id: string;
  sender: "self" | string;
  type: OrdinaryMessageType;
  text: string;
  time: string;
  duration?: number;
}

export interface OrdinaryWechatThread {
  id: string;
  title: string;
  avatar: string;
  group: boolean;
  muted?: boolean;
  pinned?: boolean;
  messages: OrdinaryMessage[];
  narrative: NarrativeMetadata;
}

export interface OrdinaryXhsNote {
  id: string;
  author: string;
  avatar: string;
  category: string;
  title: string;
  body: string[];
  date: string;
  location: string;
  likes: number;
  comments: { id: string; author: string; text: string; likes: number }[];
  media: string;
  mediaSet: string[];
  mediaType: "image" | "video";
  narrative: NarrativeMetadata;
}

export interface OrdinaryMail {
  id: string;
  threadId: string;
  folder: "收件箱" | "星标邮件" | "已发送" | "草稿箱" | "订阅邮件" | "归档";
  from: string;
  senderType: "person" | "service" | "organization";
  subject: string;
  preview: string;
  body: string[];
  date: string;
  unread: boolean;
  starred?: boolean;
  attachments?: { id: string; name: string; size: string; kind: string }[];
  narrative: NarrativeMetadata;
}

export interface OrdinaryVideo {
  id: string;
  author: string;
  caption: string;
  category: string;
  likes: number;
  comments: number;
  duration: number;
  media: string;
  narrative: NarrativeMetadata;
}

export interface OrdinaryXhsDraft {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
  media: string;
  narrative: NarrativeMetadata;
}

export interface TemporaryMapPoi {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  detail: string;
}

export interface OrdinaryPlatformRecord {
  id: string;
  appId: "app.toutiao" | "app.baidunetdisk" | "app.alipay" | "app.didi" | "app.meituan" | "app.taobao";
  title: string;
  subtitle: string;
  date: string;
  category: string;
  amount?: number;
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
    recontextualizedValue: options.recontextualizedValue,
    payoffPolicy: options.payoffPolicy ?? "none"
  };
}

function messages(thread: string, entries: Array<[OrdinaryMessage["sender"], OrdinaryMessageType, string, string, number?]>): OrdinaryMessage[] {
  return entries.map(([sender, type, text, time, duration], index) => ({
    id: `${thread}.message.${String(index + 1).padStart(2, "0")}`,
    sender,
    type,
    text,
    time,
    duration
  }));
}

export const ordinaryWechatThreads: OrdinaryWechatThread[] = [
  {
    id: "wechat.daily.chenyu",
    title: "陈屿",
    avatar: "陈",
    group: false,
    pinned: true,
    messages: messages("wechat.daily.chenyu", [
      ["陈屿", "text", "雨又下大了，你那把折叠伞还在我车里。", "08:16"],
      ["self", "text", "先放你那，我今天带了长柄伞。", "08:18"],
      ["陈屿", "quote", "“先放你那”\n好，周末见面再带给你。", "08:18"],
      ["陈屿", "image", "[图片：路边积水]", "12:07"],
      ["self", "text", "这条路下午还是绕一下吧。", "12:09"],
      ["陈屿", "voice", "晚饭别又拿咖啡顶。", "18:42", 4.2],
      ["self", "text", "知道，楼下吃碗面。", "18:44"]
    ]),
    narrative: narrative("保持陈屿与沈川长期朋友的克制日常交流。", "relationship", {
      characterTraitIds: ["ct.chenyu.dry"],
      relationshipBeatIds: ["rb.shenchuan.chenyu"]
    })
  },
  {
    id: "wechat.daily.photo-group",
    title: "周末城市摄影",
    avatar: "摄",
    group: true,
    messages: messages("wechat.daily.photo-group", [
      ["群主", "text", "周日天气不稳定，集合时间改到九点半。", "周一"],
      ["小顾", "location", "[位置：地铁口公共集合点]", "周一"],
      ["self", "text", "收到，我带备用电池。", "周一"],
      ["小周", "image", "[图片：雨后树影]", "周二"],
      ["群主", "text", "大家只拍开放区域，不要翻围挡。", "周二"],
      ["self", "file", "[文件：本周外拍注意事项.pdf]", "周二"],
      ["小顾", "sticker", "[表情：相机]", "周二"]
    ]),
    narrative: narrative("展示普通摄影社群与公开区域拍摄习惯。", "world_context", {
      characterTraitIds: ["ct.shenchuan.photo"]
    })
  },
  {
    id: "wechat.daily.research-group",
    title: "访谈项目组",
    avatar: "研",
    group: true,
    muted: true,
    messages: messages("wechat.daily.research-group", [
      ["项目经理", "text", "今天两场访谈都按新版提纲走。", "昨天"],
      ["self", "text", "原始录音、逐字稿和结论稿我分目录放。", "昨天"],
      ["研究助理", "file", "[文件：访谈提纲_v4.docx]", "昨天"],
      ["项目经理", "text", "敏感信息记得脱敏。", "昨天"],
      ["self", "link", "[链接：研究资料归档规范]", "昨天"],
      ["研究助理", "voice", "第二位受访者晚十分钟上线。", "昨天", 5.8],
      ["self", "text", "没问题，我把缓冲时间留出来。", "昨天"]
    ]),
    narrative: narrative("呈现用户研究工作的真实协作密度。", "profession", {
      worldFactIds: ["wf.shenchuan.job"],
      characterTraitIds: ["ct.shenchuan.archivist"]
    })
  },
  {
    id: "wechat.daily.family",
    title: "一家人",
    avatar: "家",
    group: true,
    pinned: true,
    messages: messages("wechat.daily.family", [
      ["妈", "text", "杭州今天下雨，鞋湿了回家记得换。", "昨天"],
      ["self", "text", "知道，我包里有一双干袜子。", "昨天"],
      ["爸", "image", "[图片：阳台新开的花]", "昨天"],
      ["self", "text", "这盆终于开了。", "昨天"],
      ["妈", "voice", "周末有空就视频，不用特意赶回来。", "昨天", 8.4],
      ["爸", "payment", "[转账：买菜钱 · 已收款]", "昨天"],
      ["self", "text", "周六晚上打。", "昨天"]
    ]),
    narrative: narrative("以连续家庭琐事支撑正常家庭关系。", "relationship", {
      worldFactIds: ["wf.shenchuan.family"],
      characterTraitIds: ["ct.zhoulan.care"],
      relationshipBeatIds: ["rb.shenchuan.zhoulan"]
    })
  },
  {
    id: "wechat.daily.xu",
    title: "前台小许",
    avatar: "许",
    group: false,
    messages: messages("wechat.daily.xu", [
      ["前台小许", "text", "你的快递我放在前台第二层了。", "昨天"],
      ["self", "text", "谢谢，晚点下来拿。", "昨天"],
      ["前台小许", "image", "[图片：快递柜标签，无个人信息]", "昨天"],
      ["self", "text", "看到了。", "昨天"],
      ["前台小许", "text", "还有一根充电线是不是你的？", "昨天"],
      ["self", "text", "黑色短线是我的，又忘在会议室了。", "昨天"],
      ["前台小许", "sticker", "[表情：捂脸]", "昨天"]
    ]),
    narrative: narrative("补充办公室前台与遗忘充电线的普通往来。", "habit", {
      worldFactIds: ["wf.shenchuan.job"],
      characterTraitIds: ["ct.shenchuan.charger"]
    })
  },
  {
    id: "wechat.daily.lin",
    title: "林工",
    avatar: "林",
    group: false,
    messages: messages("wechat.daily.lin", [
      ["林工", "text", "测试包今晚会更新，明早再跑一轮。", "周一"],
      ["self", "text", "我只看研究流程，不碰正式环境数据。", "周一"],
      ["林工", "file", "[文件：变更说明.txt]", "周一"],
      ["self", "text", "收到，问题我按版本号回。", "周一"],
      ["林工", "link", "[链接：内部测试说明]", "周二"],
      ["林工", "text", "昨晚那个缓存问题已经定位。", "周二"],
      ["self", "text", "好，我更新访谈记录里的环境说明。", "周二"]
    ]),
    narrative: narrative("提供正常跨职能工作沟通。", "profession", {
      worldFactIds: ["wf.shenchuan.job"]
    })
  },
  {
    id: "wechat.daily.gu",
    title: "小顾",
    avatar: "顾",
    group: false,
    messages: messages("wechat.daily.gu", [
      ["小顾", "text", "上次那组雨夜照片方便发原图吗？", "周日"],
      ["self", "text", "我先导出无定位信息的版本。", "周日"],
      ["self", "image", "[图片：雨夜街道]", "周日"],
      ["小顾", "text", "颜色很克制，我喜欢第二张。", "周日"],
      ["self", "text", "第二张快门慢了一点。", "周日"],
      ["小顾", "sticker", "[表情：鼓掌]", "周日"],
      ["小顾", "text", "下次借我那支小三脚架。", "周日"]
    ]),
    narrative: narrative("建立摄影爱好与隐私处理习惯。", "relationship", {
      characterTraitIds: ["ct.shenchuan.photo", "ct.shenchuan.archivist"]
    })
  },
  {
    id: "wechat.daily.property",
    title: "住户通知",
    avatar: "物",
    group: false,
    messages: messages("wechat.daily.property", [
      ["住户通知", "text", "本周三上午进行电梯例行保养。", "周五"],
      ["住户通知", "link", "[链接：七月公共区域维护安排]", "周五"],
      ["self", "text", "收到。", "周五"],
      ["住户通知", "text", "暴雨期间请勿将物品放在走廊。", "周六"],
      ["住户通知", "image", "[图片：公共区域排水提示]", "周六"],
      ["self", "text", "门口已经清空。", "周六"],
      ["住户通知", "sticker", "[表情：感谢配合]", "周六"]
    ]),
    narrative: narrative("增加普通居住环境通知。")
  },
  {
    id: "wechat.daily.book-club",
    title: "周三读书会",
    avatar: "读",
    group: true,
    muted: true,
    messages: messages("wechat.daily.book-club", [
      ["主持人", "text", "这周讨论第三章，照旧八点开始。", "周三"],
      ["阿哲", "text", "我可能晚到十分钟。", "周三"],
      ["self", "text", "我把划线段落整理成一页。", "周三"],
      ["self", "file", "[文件：第三章摘记.pdf]", "周三"],
      ["主持人", "text", "不用做成汇报，随便聊。", "周三"],
      ["阿哲", "sticker", "[表情：点头]", "周三"],
      ["self", "text", "好，那我少写两页。", "周三"]
    ]),
    narrative: narrative("表现角色把工作式整理习惯带入普通阅读。", "habit", {
      characterTraitIds: ["ct.shenchuan.archivist"]
    })
  },
  {
    id: "wechat.daily.neighbor",
    title: "楼下邻居",
    avatar: "邻",
    group: false,
    messages: messages("wechat.daily.neighbor", [
      ["楼下邻居", "text", "你的快递袋被风吹到我门口了。", "上周"],
      ["self", "text", "抱歉，我马上下来拿。", "上周"],
      ["楼下邻居", "text", "不急，我先帮你放门边。", "上周"],
      ["self", "sticker", "[表情：谢谢]", "上周"],
      ["楼下邻居", "image", "[图片：走廊门边纸袋]", "上周"],
      ["self", "text", "已经拿走了。", "上周"],
      ["楼下邻居", "text", "好。", "上周"]
    ]),
    narrative: narrative("填充可信的邻里日常，不承担线索功能。")
  },
  {
    id: "wechat.daily.delivery",
    title: "快递通知",
    avatar: "递",
    group: false,
    muted: true,
    messages: messages("wechat.daily.delivery", [
      ["快递通知", "text", "包裹已放入智能柜，请及时取件。", "7月13日"],
      ["快递通知", "link", "[链接：查看取件详情]", "7月13日"],
      ["self", "text", "已取。", "7月13日"],
      ["快递通知", "text", "包裹已由前台签收。", "7月8日"],
      ["快递通知", "link", "[链接：物流进度]", "7月8日"],
      ["self", "text", "收到。", "7月8日"],
      ["快递通知", "sticker", "[服务通知]", "7月8日"]
    ]),
    narrative: narrative("提供无案件含义的服务类消息。")
  },
  {
    id: "wechat.daily.chen",
    title: "摄影店陈师傅",
    avatar: "陈",
    group: false,
    messages: messages("wechat.daily.chen", [
      ["摄影店陈师傅", "text", "你送洗的两卷已经好了。", "7月11日"],
      ["self", "text", "周末过去拿。", "7月11日"],
      ["摄影店陈师傅", "image", "[图片：装袋的冲洗照片]", "7月11日"],
      ["self", "text", "麻烦不要裁边。", "7月11日"],
      ["摄影店陈师傅", "text", "按原比例留白。", "7月11日"],
      ["self", "sticker", "[表情：谢谢]", "7月11日"],
      ["摄影店陈师傅", "text", "营业到晚上八点。", "7月11日"]
    ]),
    narrative: narrative("补充摄影消费与原比例保存习惯。", "habit", {
      characterTraitIds: ["ct.shenchuan.photo", "ct.shenchuan.archivist"]
    })
  },
  {
    id: "wechat.daily-gym",
    title: "羽毛球约球",
    avatar: "羽",
    group: true,
    muted: true,
    messages: messages("wechat.daily-gym", [
      ["小周", "text", "周四晚七点还有一块场。", "7月9日"],
      ["self", "text", "我能到，带一筒球。", "7月9日"],
      ["阿哲", "text", "我晚半小时。", "7月9日"],
      ["小周", "location", "[位置：社区体育馆]", "7月9日"],
      ["self", "text", "我从公司直接过去。", "7月9日"],
      ["阿哲", "recalled", "阿哲撤回了一条消息", "7月9日"],
      ["小周", "voice", "记得穿防滑鞋，地板刚保养。", "7月9日", 6.1]
    ]),
    narrative: narrative("建立普通运动安排，不延伸现场音频含义。")
  },
  {
    id: "wechat.daily-cloud",
    title: "云服务助手",
    avatar: "云",
    group: false,
    muted: true,
    messages: messages("wechat.daily-cloud", [
      ["云服务助手", "text", "你的月度存储账单已生成。", "7月6日"],
      ["云服务助手", "link", "[链接：查看账单]", "7月6日"],
      ["self", "text", "已查看。", "7月6日"],
      ["云服务助手", "text", "一台设备完成登录。", "6月30日"],
      ["self", "text", "是我本人操作。", "6月30日"],
      ["云服务助手", "file", "[文件：账户活动摘要.pdf]", "6月30日"],
      ["云服务助手", "text", "如有疑问请在安全中心处理。", "6月30日"]
    ]),
    narrative: narrative("增加普通云服务通知并支撑设备使用连续性。", "world_context", {
      worldFactIds: ["wf.device.offline"]
    })
  },
  {
    id: "wechat.daily-self",
    title: "文件传输助手",
    avatar: "文",
    group: false,
    pinned: true,
    messages: messages("wechat.daily-self", [
      ["self", "file", "[文件：访谈提纲_v4.docx]", "周二"],
      ["self", "image", "[图片：雨后墙面纹理]", "周二"],
      ["self", "link", "[链接：网页长期保存方法]", "周二"],
      ["self", "text", "周末整理移动硬盘。", "周三"],
      ["self", "file", "[文件：照片命名规则.txt]", "周三"],
      ["self", "voice", "买一根短充电线放办公室。", "周四", 4.7],
      ["self", "sticker", "[表情：待办]", "周四"]
    ]),
    narrative: narrative("提供个人跨设备传输和待办痕迹。", "habit", {
      worldFactIds: ["wf.shenchuan.job"],
      characterTraitIds: ["ct.shenchuan.archivist", "ct.shenchuan.charger"]
    })
  }
];

const xhsMedia = [
  "/media/case-001/daily/temporary-rainy-cafe.jpg",
  "/media/case-001/daily/temporary-archive-desk.jpg",
  "/media/case-001/daily/temporary-weekday-lunch.jpg",
  "/media/case-001/daily/temporary-summer-outfit.jpg",
  "/media/case-001/daily/temporary-train-tote.jpg",
  "/media/case-001/daily/temporary-noodle-bowl.jpg",
  "/media/case-001/daily/temporary-rainy-street.jpg",
  "/media/case-001/daily/temporary-cat-window.jpg",
  "/media/case-001/daily/temporary-balcony-plants.jpg"
];

const xhsSeeds: Array<[string, string, string, string, string, number, number]> = [
  ["雨停再走", "雨停后的十五分钟，街边反光比晴天更有层次。", "城市散步", "南岸慢慢走", "杭州市", 428, 36],
  ["一页一页存", "整理旧文件时，先把来源和日期写清楚。", "数码整理", "橙色文件夹", "杭州", 1380, 92],
  ["今天的午饭很普通", "工作日的一荤一素，吃完继续开会。", "日常饮食", "午间十分钟", "杭州", 216, 18],
  ["不费力的夏天穿搭", "薄衬衫和宽松短裤，雨天也不用担心衣角拖地。", "穿搭", "白色鞋带", "杭州", 389, 27],
  ["短途只带一个布袋", "车上要看的书和一瓶水，轻一点反而更自在。", "旅行", "接口旁边", "杭州", 842, 61],
  ["路边小店的清汤面", "雨天想吃一点热的，清汤比重口更舒服。", "日常饮食", "今天吃什么呀", "杭州", 973, 74],
  ["阴天怎么拍树影", "不要急着拉高对比，灰色也可以很有层次。", "摄影", "慢快门小顾", "杭州", 1206, 83],
  ["猫在窗边睡了一下午", "雨声很轻，它换了两个姿势也没有醒。", "宠物", "八点四十二", "杭州", 632, 49],
  ["周末书桌复位", "把外置硬盘接好，给下周留一个空桌面。", "居家", "木桌边", "杭州", 517, 33],
  ["一小时读完短篇", "手机开勿扰，纸笔放在手边。", "阅读", "第三章以后", "杭州", 305, 21],
  ["雨后自行车道", "积水退了以后，树下这一段很好走。", "城市散步", "沿河但不靠河", "杭州", 711, 58],
  ["别把截图当备份", "截图适合记录当下，长期保存还得留原文件。", "数码整理", "硬盘灯还亮着", "杭州", 2115, 146],
  ["今天不想做很多事情", "下班后只绕了一小段路，也算给一天留了空白。", "普通情绪", "写字楼观察员", "杭州", 344, 26],
  ["普通相机也能拍夜路", "先稳住，别急着把暗部全部提亮。", "摄影", "一档欠曝", "杭州", 1762, 101],
  ["本周买菜清单", "青菜、番茄、鸡蛋和一小袋米。", "居家", "冰箱便签", "杭州", 188, 12],
  ["会议录音怎么归档", "先保留原始录音，再单独做逐字稿。", "工作方法", "研究提纲", "杭州", 906, 67],
  ["雨天鞋子怎么干得快", "先吸水，再通风，不要直接贴着热源。", "生活经验", "鞋柜观察", "杭州", 756, 52],
  ["拍照前先擦镜头", "最简单的一步，常常能解决大部分雾蒙蒙。", "摄影", "镜头布不见了", "杭州", 1444, 95],
  ["今天不做复杂菜", "青菜、米饭和一碗汤也够了。", "日常饮食", "灶台很小", "杭州", 269, 17],
  ["文件名里到底写什么", "日期、主题、版本和是否脱敏，足够了。", "工作方法", "版本号从一开始", "杭州", 1887, 120],
  ["城市里适合独处的十分钟", "下班后绕一小段路，听完一首歌再回家。", "城市生活", "耳机只戴一边", "杭州", 668, 44],
  ["阳台小植物恢复了", "连续阴雨后终于见到一点新叶。", "居家", "窗台三号盆", "杭州", 452, 39],
  ["如何减少每天的小摩擦", "把常用东西放回固定位置，真的有用。", "通勤", "今天没迟到", "杭州", 1118, 86],
  ["周末照片只整理一百张", "给任务设上限，反而更容易开始。", "数码整理", "照片很多但不慌", "杭州", 1529, 108]
];

export const ordinaryXhsNotes: OrdinaryXhsNote[] = xhsSeeds.map(([title, body, category, author, location, likes, commentCount], index) => ({
  id: `xhs.ordinary.${String(index + 1).padStart(2, "0")}`,
  author,
  avatar: author.slice(0, 1),
  category,
  title,
  body: [
    body,
    index % 3 === 0
      ? "这只是当天随手记下的一件小事，没有特别的结论。"
      : index % 3 === 1
        ? "做法不复杂，能长期坚持比一次整理完更重要。"
        : "吃饭、走路和收拾桌面，本来就是一天的大部分。"
  ],
  date: `2026-07-${String(15 - (index % 12)).padStart(2, "0")}`,
  location,
  likes,
  comments: [
    { id: `xhs.ordinary.${index + 1}.comment.1`, author: "普通路过", text: "这个方法很实用，先收藏周末试试。", likes: Math.max(2, Math.floor(commentCount / 3)) },
    { id: `xhs.ordinary.${index + 1}.comment.2`, author: index % 2 === 0 ? "今天也下雨" : "收纳慢慢来", text: index % 2 === 0 ? "雨天确实更适合慢一点走。" : "固定位置以后找东西快多了。", likes: Math.max(1, Math.floor(commentCount / 5)) }
  ],
  media: xhsMedia[index % xhsMedia.length]!,
  mediaSet: index % 4 === 0
    ? [xhsMedia[index % xhsMedia.length]!, xhsMedia[(index + 3) % xhsMedia.length]!]
    : [xhsMedia[index % xhsMedia.length]!],
  mediaType: index % 7 === 0 ? "video" : "image",
  narrative: narrative(`以${category}内容构成平台普通信息流。`, category === "工作方法" ? "profession" : "world_context", {
    worldFactIds: category === "工作方法" ? ["wf.shenchuan.job"] : ["wf.hangzhou.daily"],
    characterTraitIds: category === "摄影"
      ? ["ct.shenchuan.photo"]
      : category === "数码整理" || category === "工作方法"
        ? ["ct.shenchuan.archivist"]
        : []
  })
}));

export const ordinaryXhsDrafts: OrdinaryXhsDraft[] = [
  {
    id: "xhs.draft.daily.01",
    title: "周末只整理一百张照片",
    body: "先按日期分组，再把明显重复的挑出来。草稿还没写完。",
    updatedAt: "昨天 22:16",
    media: xhsMedia[1]!,
    narrative: narrative("保留尚未发布的普通照片整理草稿。", "habit", {
      characterTraitIds: ["ct.shenchuan.photo", "ct.shenchuan.archivist"]
    })
  },
  {
    id: "xhs.draft.daily.02",
    title: "阴雨天通勤包清单",
    body: "折叠伞、干袜子、纸巾和短充电线。待补一张包内照片。",
    updatedAt: "7月12日",
    media: xhsMedia[0]!,
    narrative: narrative("保留与通勤习惯一致的普通生活草稿。", "habit", {
      characterTraitIds: ["ct.shenchuan.charger"]
    })
  }
];

const mailSeeds: Array<[
  OrdinaryMail["folder"],
  OrdinaryMail["senderType"],
  string,
  string,
  string,
  string,
  boolean,
  string
]> = [
  ["收件箱", "organization", "用户研究招募组", "本周受访者排期确认", "周三与周五访谈时间已确认。", "7月15日", true, "research"],
  ["收件箱", "service", "云服务通知", "月度存储账单已生成", "账单可在账户中心查看。", "7月14日", true, "cloud"],
  ["星标邮件", "organization", "城市摄影小组", "周末外拍集合说明", "如遇阵雨活动顺延。", "7月13日", false, "photo"],
  ["收件箱", "person", "林工", "Re: 测试环境变更说明", "缓存问题已定位，请更新研究记录。", "7月12日", false, "project"],
  ["订阅邮件", "organization", "城市公共文化中心", "七月活动简报", "展览、讲座与周末公开活动。", "7月11日", false, "newsletter"],
  ["收件箱", "service", "铁路出行服务", "行程积分月报", "本月积分变动与到期提醒。", "7月10日", false, "service"],
  ["已发送", "person", "项目经理", "访谈原始材料与脱敏版本", "两套文件已分别归档。", "7月9日", false, "research"],
  ["收件箱", "organization", "物业服务中心", "公共区域维护安排", "电梯例行保养时间如下。", "7月8日", false, "property"],
  ["归档", "person", "小顾", "雨夜照片原图", "已收到无定位信息版本，谢谢。", "7月7日", false, "photo"],
  ["订阅邮件", "service", "阅读周报", "你本周读了2小时16分", "继续阅读第三章。", "7月6日", false, "newsletter"],
  ["收件箱", "organization", "公司行政", "办公区空调维护通知", "周六上午进行例行维护。", "7月5日", false, "office"],
  ["草稿箱", "person", "摄影店陈师傅", "关于冲洗照片留白", "请保持原比例，不要裁边。", "7月4日", false, "photo"],
  ["归档", "service", "支付服务通知", "六月账单摘要", "本月主要支出为交通与餐饮。", "7月3日", false, "service"],
  ["收件箱", "person", "研究助理", "第二场访谈逐字稿", "已按新版模板完成初校。", "7月2日", true, "research"],
  ["星标邮件", "organization", "数据安全培训", "年度学习记录", "课程已完成，证书见附件。", "7月1日", false, "training"],
  ["订阅邮件", "organization", "摄影器材维护", "雨季相机防潮提示", "回家后及时擦干机身。", "6月30日", false, "newsletter"],
  ["已发送", "person", "林工", "研究记录中的环境版本", "已补充测试包版本号。", "6月29日", false, "project"],
  ["收件箱", "service", "网盘安全中心", "设备登录提醒", "登录设备为本人的常用设备。", "6月28日", false, "cloud"],
  ["归档", "organization", "社区体育馆", "场地预约确认", "周四晚七点场地已确认。", "6月27日", false, "service"],
  ["草稿箱", "person", "项目经理", "下周访谈提纲建议", "关于任务排序的问题还需调整。", "6月26日", false, "research"]
];

export const ordinaryMails: OrdinaryMail[] = mailSeeds.map(([folder, senderType, from, subject, preview, date, unread, threadId], index) => ({
  id: `mail.ordinary.${String(index + 1).padStart(2, "0")}`,
  threadId,
  folder,
  from,
  senderType,
  subject,
  preview,
  body: [
    `${from}：`,
    preview,
    index % 2 === 0
      ? "相关材料已按原始版本与处理版本分别保存，如需修改请直接回复本邮件。"
      : "这是一封普通事务邮件，不包含需要立即处理的异常情况。",
    "谢谢。"
  ],
  date,
  unread,
  starred: folder === "星标邮件",
  attachments: [0, 2, 6, 14].includes(index)
    ? [{ id: `mail.ordinary.${index + 1}.attachment.1`, name: ["排期表.xlsx", "集合说明.pdf", "材料清单.zip", "学习证书.pdf"][index === 0 ? 0 : index === 2 ? 1 : index === 6 ? 2 : 3]!, size: ["86 KB", "1.2 MB", "4.8 MB", "628 KB"][index === 0 ? 0 : index === 2 ? 1 : index === 6 ? 2 : 3]!, kind: index === 0 ? "表格" : "PDF" }]
    : undefined,
  narrative: narrative(`以${folder}中的普通事务邮件补充连续数字生活。`, senderType === "organization" ? "profession" : "world_context", {
    worldFactIds: threadId === "research" || threadId === "project" ? ["wf.shenchuan.job"] : ["wf.hangzhou.daily"],
    characterTraitIds: threadId === "research" ? ["ct.shenchuan.archivist"] : []
  })
}));

const videoSeeds: Array<[string, string, string, number, number, number]> = [
  ["雨停之后", "下班路上只拍了十秒积水反光。", "城市", 4210, 186, 12],
  ["桌面复位", "周末把线材和硬盘放回固定位置。", "收纳", 2960, 114, 18],
  ["普通午饭", "青菜米饭和一碗汤。", "美食", 1870, 62, 9],
  ["窗边新叶", "连续阴雨后终于冒出一片新叶。", "居家", 3380, 95, 15],
  ["通勤十分钟", "错开最挤的换乘口。", "通勤", 5210, 204, 14],
  ["擦镜头前后", "同一张照片的清晰度差别。", "摄影", 8460, 312, 11],
  ["冲洗照片开袋", "没有裁边的原比例相纸。", "摄影", 4110, 173, 20],
  ["清汤面", "雨天的一碗热面。", "美食", 6390, 244, 13],
  ["读书会摘记", "把一页划线整理成三个问题。", "阅读", 2740, 88, 17],
  ["晾伞", "湿伞展开十分钟再收。", "生活", 3560, 129, 8],
  ["备用充电线", "终于在办公室固定放了一根。", "数码", 7030, 266, 10],
  ["城市树影", "阴天也不用把对比拉满。", "摄影", 9240, 348, 16],
  ["一百张上限", "照片整理只做一百张就停。", "效率", 5870, 211, 19],
  ["冰箱补货", "工作日四样基础食材。", "居家", 1930, 57, 9],
  ["回家前绕一段路", "听完一首歌再进门。", "城市", 4680, 165, 21]
];

export const ordinaryVideos: OrdinaryVideo[] = videoSeeds.map(([author, caption, category, likes, comments, duration], index) => ({
  id: `douyin.ordinary.${String(index + 1).padStart(2, "0")}`,
  author,
  caption,
  category,
  likes,
  comments,
  duration,
  media: xhsMedia[index % xhsMedia.length]!,
  narrative: narrative(`以${category}短视频填充普通推荐流。`, category === "摄影" ? "habit" : "world_context", {
    characterTraitIds: category === "摄影" ? ["ct.shenchuan.photo"] : []
  })
}));

export const temporaryMapPois: TemporaryMapPoi[] = [
  { id: "poi.temp.01", name: "社区便利店", category: "购物", x: 18, y: 22, detail: "营业中 · 生活用品" },
  { id: "poi.temp.02", name: "街角咖啡", category: "餐饮", x: 31, y: 35, detail: "咖啡 · 简餐" },
  { id: "poi.temp.03", name: "社区体育馆", category: "运动", x: 72, y: 28, detail: "羽毛球 · 健身" },
  { id: "poi.temp.04", name: "公共图书馆", category: "文化", x: 62, y: 48, detail: "开放中 · 公共文化" },
  { id: "poi.temp.05", name: "地铁换乘口", category: "交通", x: 44, y: 68, detail: "公共交通" },
  { id: "poi.temp.06", name: "城市摄影集合点", category: "地点", x: 79, y: 72, detail: "公共开放区域" },
  { id: "poi.temp.07", name: "便民药房", category: "医疗", x: 23, y: 61, detail: "营业中" },
  { id: "poi.temp.08", name: "社区服务中心", category: "公共服务", x: 54, y: 18, detail: "便民服务" },
  { id: "poi.temp.09", name: "雨水花园", category: "公园", x: 88, y: 43, detail: "公共绿地" },
  { id: "poi.temp.10", name: "快递服务点", category: "生活", x: 12, y: 74, detail: "包裹寄取" },
  { id: "poi.temp.11", name: "摄影冲印店", category: "购物", x: 39, y: 12, detail: "照片冲印" },
  { id: "poi.temp.12", name: "社区菜场", category: "购物", x: 68, y: 84, detail: "生鲜食品" },
  { id: "poi.temp.13", name: "公交站", category: "交通", x: 7, y: 43, detail: "公共交通" },
  { id: "poi.temp.14", name: "旧园区外围入口", category: "地点", x: 48, y: 48, detail: "仅显示公共外围；地点令牌未绑定" },
  { id: "poi.temp.15", name: "河岸步道", category: "公园", x: 91, y: 65, detail: "公共步行区域" }
];

const toutiaoSeeds: Array<[string,string,string]> = [
  ["本周多阵雨，通勤请预留换乘时间","公共交通在晚高峰可能出现短时拥挤。","城市"],
  ["公共图书馆延长周末开放时段","新增摄影、城市观察与数字生活专题书架。","文化"],
  ["雨季相机和镜头如何防潮","擦干机身后再放入干燥箱，电池分开放置。","摄影"],
  ["社区体育馆公布七月场地安排","羽毛球场晚间预约较紧张，建议提前确认。","生活"],
  ["旧网页保存时应记录哪些信息","地址、时间、文件校验值和取得路径都值得保留。","数码"],
  ["工作日午餐不必追求复杂","稳定吃完一顿饭，比拿咖啡代替正餐更重要。","生活"],
  ["城市公共空间摄影边界提示","只在开放区域拍摄，不翻越围挡、不记录私人门牌。","摄影"],
  ["个人文件怎样建立可维护的版本号","日期、主题、版本与处理状态足以覆盖多数场景。","工作"],
  ["雨后道路积水逐步消退","部分低洼路段仍需绕行。","城市"],
  ["周末短途出行轻装清单","水、折叠伞、充电线和一本书已经足够。","出行"],
  ["研究访谈资料如何做最小化保存","原始记录、脱敏版本和结论稿应分开。","工作"],
  ["社区菜场夏季营业时间调整","早间营业提前，午后部分摊位短时休息。","生活"],
  ["家中常用物品固定位置更省时间","钥匙、充电线和雨伞最适合设置固定归位点。","居家"],
  ["七月公共文化活动清单发布","展览、讲座和周末公开活动均可预约。","文化"],
  ["手机照片整理先从重复项开始","一次只处理一百张，更容易长期坚持。","数码"],
  ["城市步行路线可尝试改变默认路径","沿公共道路绕行十分钟，就能看到不同街景。","城市"],
  ["室内植物连续阴雨后如何养护","减少浇水并保持通风，先观察新叶状态。","居家"],
  ["通勤包里值得长期保留的四样东西","纸巾、短充电线、折叠伞和一双干袜子。","生活"],
  ["普通录音也需要保留原始文件","转写稿不能代替母带，处理版应另存。","数码"],
  ["周末读书会本期讨论数字记忆","活动在公共文化中心举行，报名人数已满。","文化"]
];

const netdiskSeeds: Array<[string,string,string]> = [
  ["访谈提纲_v4.docx","文档 · 86 KB","工作"],
  ["雨夜照片_无定位.zip","压缩包 · 148 MB","摄影"],
  ["照片命名规则.txt","文档 · 4 KB","整理"],
  ["第三章摘记.pdf","PDF · 1.2 MB","阅读"],
  ["七月账单汇总.xlsx","表格 · 72 KB","生活"],
  ["城市散步_0712","文件夹 · 36 项","摄影"],
  ["设备活动摘要.pdf","PDF · 628 KB","账户"],
  ["外拍注意事项.pdf","PDF · 980 KB","摄影"],
  ["移动硬盘清单.xlsx","表格 · 55 KB","整理"],
  ["通勤备忘.m4a","音频 · 31 秒","生活"],
  ["冲洗照片扫描件","文件夹 · 24 项","摄影"],
  ["研究材料_脱敏版","文件夹 · 18 项","工作"]
];

const alipaySeeds: Array<[string,string,string,number]> = [
  ["社区便利店","生活用品","7月15日 20:18",28.60],
  ["城市公共交通","交通出行","7月15日 08:42",3.00],
  ["街角咖啡","餐饮","7月14日 16:05",24.00],
  ["社区菜场","生鲜食品","7月13日 10:26",46.80],
  ["摄影冲印店","照片冲印","7月12日 18:11",68.00],
  ["公共图书馆","逾期费用","7月11日 12:06",2.00],
  ["社区体育馆","场地预约","7月10日 19:02",45.00],
  ["便民药房","日常用品","7月9日 21:14",18.50],
  ["云存储服务","数字服务","7月8日 09:30",25.00],
  ["清汤面馆","餐饮","7月7日 18:44",19.00],
  ["铁路出行服务","交通出行","7月6日 14:26",73.50],
  ["物业服务中心","生活缴费","7月5日 11:20",126.40]
];

const didiSeeds: Array<[string,string,string]> = [
  ["公司园区 → 社区体育馆","快车 · 已完成","7月10日 18:32"],
  ["社区菜场 → 住处附近","快车 · 已完成","7月6日 11:18"],
  ["公共图书馆 → 街角咖啡","特惠快车 · 已完成","7月3日 16:42"],
  ["摄影冲印店 → 住处附近","快车 · 已完成","6月29日 19:06"],
  ["地铁换乘口 → 公司园区","快车 · 已完成","6月26日 09:12"],
  ["住处附近 → 铁路车站","快车 · 已完成","6月22日 07:36"],
  ["公共文化中心 → 住处附近","特惠快车 · 已完成","6月18日 21:14"],
  ["公司园区 → 便民药房","快车 · 已完成","6月14日 18:05"],
  ["社区体育馆 → 住处附近","快车 · 已完成","6月11日 21:22"],
  ["街角咖啡 → 城市摄影集合点","快车 · 已完成","6月8日 08:52"],
  ["社区服务中心 → 公司园区","快车 · 已完成","6月4日 10:10"],
  ["住处附近 → 公共图书馆","特惠快车 · 已完成","6月1日 13:28"]
];

const meituanSeeds: Array<[string,string,string,number]> = [
  ["清汤面馆","清汤面、时蔬","7月15日 18:44",26.00],
  ["街角咖啡","冰美式、贝果","7月14日 09:12",31.50],
  ["社区牛肉饭","牛肉饭、紫菜汤","7月13日 12:06",29.00],
  ["家常小炒","番茄炒蛋、米饭","7月12日 18:38",24.80],
  ["社区水果店","香蕉、桃子","7月11日 20:14",35.60],
  ["馄饨小铺","鲜肉馄饨","7月10日 19:26",21.00],
  ["轻食厨房","鸡肉沙拉、面包","7月9日 12:18",32.00],
  ["便利早餐","豆浆、饭团","7月8日 08:20",12.50],
  ["社区药房","创可贴、酒精棉片","7月7日 21:05",17.80],
  ["雨天热饮","热牛奶、曲奇","7月6日 16:34",22.00],
  ["小份砂锅","菌菇砂锅、米饭","7月5日 18:52",27.00],
  ["社区烘焙","全麦吐司","7月4日 10:16",18.00]
];

const taobaoSeeds: Array<[string,string,string,number]> = [
  ["镜头清洁纸","已签收","7月14日",19.90],
  ["短款充电线","已签收","7月12日",26.80],
  ["照片无酸收纳袋","运输中","7月10日",32.50],
  ["移动硬盘标签贴","已签收","7月8日",12.90],
  ["折叠伞防水袋","已签收","7月6日",16.00],
  ["帆布通勤袋","已签收","7月3日",49.00],
  ["相机电池收纳盒","已签收","6月29日",28.00],
  ["文件分类索引卡","已签收","6月26日",14.60],
  ["小型桌面台灯","已签收","6月22日",86.00],
  ["照片角贴","已签收","6月18日",9.90],
  ["外置硬盘保护套","已签收","6月14日",38.00],
  ["防滑羽毛球袜","已签收","6月10日",24.50]
];

function platformRecords(
  appId: OrdinaryPlatformRecord["appId"],
  seeds: Array<[string,string,string] | [string,string,string,number]>
): OrdinaryPlatformRecord[] {
  return seeds.map(([title,subtitle,dateOrCategory,amount],index)=>({
    id:`${appId.replace("app.","")}.ordinary.${String(index+1).padStart(2,"0")}`,
    appId,
    title,
    subtitle,
    date:appId==="app.toutiao"?`7月${15-index%12}日`:dateOrCategory,
    category:appId==="app.toutiao"?dateOrCategory:appId==="app.baidunetdisk"?dateOrCategory:"普通生活",
    amount,
    narrative:narrative(`以${title}补充${appId}中的普通数字生活记录。`,appId==="app.toutiao"?"world_context":"habit",{
      worldFactIds:["wf.hangzhou.daily"],
      characterTraitIds:["app.baidunetdisk","app.taobao"].includes(appId)?["ct.shenchuan.archivist"]:[]
    })
  }));
}

export const ordinaryPlatformRecords: OrdinaryPlatformRecord[] = [
  ...platformRecords("app.toutiao",toutiaoSeeds),
  ...platformRecords("app.baidunetdisk",netdiskSeeds),
  ...platformRecords("app.alipay",alipaySeeds),
  ...platformRecords("app.didi",didiSeeds),
  ...platformRecords("app.meituan",meituanSeeds),
  ...platformRecords("app.taobao",taobaoSeeds)
];

export const realismContentSummary = {
  wechatThreads: ordinaryWechatThreads.length,
  wechatMessages: ordinaryWechatThreads.reduce((sum, thread) => sum + thread.messages.length, 0),
  wechatGroups: ordinaryWechatThreads.filter((thread) => thread.group).length,
  xhsNotes: ordinaryXhsNotes.length,
  xhsAuthors: new Set(ordinaryXhsNotes.map((note) => note.author)).size,
  xhsCategories: new Set(ordinaryXhsNotes.map((note) => note.category)).size,
  xhsComments: ordinaryXhsNotes.reduce((sum, note) => sum + note.comments.length, 0),
  xhsDefaultFavorites: 6,
  xhsDefaultHistory: 4,
  xhsDrafts: ordinaryXhsDrafts.length,
  mails: ordinaryMails.length,
  mailFolders: new Set(ordinaryMails.map((mail) => mail.folder)).size,
  mailAttachments: ordinaryMails.reduce((sum, mail) => sum + (mail.attachments?.length ?? 0), 0),
  mailThreads: new Set(ordinaryMails.map((mail) => mail.threadId)).size,
  videos: ordinaryVideos.length,
  mapPois: temporaryMapPois.length,
  platformRecords: ordinaryPlatformRecords.length
} as const;
