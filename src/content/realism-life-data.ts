import type { NarrativeMetadata } from "@/contracts/content";
import longFormXhsNotes from "../../content/case-001/apps/long-form-xhs-notes.json";

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

export interface WechatThreadSupplement {
  thread: string;
  messages: OrdinaryMessage[];
  narrative: NarrativeMetadata;
}

export interface OrdinaryXhsNote {
  id: string;
  author: string;
  avatar: string;
  category: string;
  title: string;
  summary: string;
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
  to: string;
  cc?: string[];
  sentAt: string;
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

export const wechatThreadSupplements: WechatThreadSupplement[] = [
  {
    thread: "妈妈",
    messages: messages("wechat.supplement.mom", [
      ["妈妈", "text", "早上出门带伞了吗？天气预报说下午还有一阵雨。", "周一 08:02"],
      ["self", "text", "带了，放在包侧袋里。", "周一 08:06"],
      ["妈妈", "text", "那就好。冰箱里的菜记得先吃，别又点太晚的外卖。", "周一 08:07"],
      ["self", "image", "[图片：楼下清汤面]", "周一 19:14"],
      ["妈妈", "text", "看着还行，汤别全喝，早点回去。", "周一 19:16"],
      ["self", "text", "已经到家了，明晚给你打电话。", "周一 21:32"]
    ]),
    narrative: narrative("以天气、吃饭和报平安构成自然的家庭聊天背景。", "relationship", {
      relationshipBeatIds: ["rb.player.parents"]
    })
  },
  {
    thread: "爸爸",
    messages: messages("wechat.supplement.dad", [
      ["爸爸", "text", "快递柜给我发了个取件码，是不是你上次寄的那盒照片？", "周二 17:21"],
      ["self", "text", "是，外面套了硬纸板，拆的时候别用刀划太深。", "周二 17:25"],
      ["爸爸", "text", "知道。阳台那盆薄荷又长起来了，周末拍给你看。", "周二 17:29"],
      ["self", "text", "好，最近雨多，别一直放外面淋。", "周二 17:31"],
      ["爸爸", "image", "[图片：阳台上的薄荷]", "周六 09:46"],
      ["self", "text", "比上次精神多了，窗边光也挺好。", "周六 10:02"]
    ]),
    narrative: narrative("用快递、照片和阳台植物呈现稳定的父子日常联系。", "relationship", {
      relationshipBeatIds: ["rb.player.parents"]
    })
  },
  {
    thread: "阿序",
    messages: messages("wechat.supplement.axu", [
      ["阿序", "text", "你昨晚发的那个页面我在手机上看了，按钮离底边有点近。", "周三 10:18"],
      ["self", "text", "我也觉得，横屏更明显，晚上把安全区再调一下。", "周三 10:22"],
      ["阿序", "text", "别光测你那台，窄屏也跑一遍。上次就是小屏先挤掉标题。", "周三 10:24"],
      ["self", "file", "[文件：移动端检查清单.pdf]", "周三 10:27"],
      ["阿序", "text", "收到了。中午还去楼下那家面馆吗？", "周三 11:41"],
      ["self", "text", "十二点十分下楼，靠窗那排见。", "周三 11:43"]
    ]),
    narrative: narrative("用移动端工作讨论和午饭约定建立阿序与玩家的熟悉关系。", "relationship", {
      characterTraitIds: ["ct.axu.friend"],
      relationshipBeatIds: ["rb.player.axu"]
    })
  },
  {
    thread: "妈",
    messages: messages("wechat.supplement.investigation-mom", [
      ["妈", "text", "换季的薄被我晒过了，你回来时记得带走。", "7月9日 09:12"],
      ["self", "text", "好，周末如果不下雨我过去。", "7月9日 09:20"],
      ["妈", "text", "门口那双旧球鞋还要不要？鞋底已经有点硬了。", "7月9日 09:22"],
      ["self", "text", "先留着，我打球穿新的，那双下雨天走路还行。", "7月9日 09:27"],
      ["妈", "voice", "回来前说一声，我把汤提前热上。", "7月12日 18:06", 5.1],
      ["self", "text", "知道了，不用等我吃饭。", "7月12日 18:09"]
    ]),
    narrative: narrative("保留沈川与家人的普通生活往来，避免联系人只剩案件信息。", "relationship")
  },
  {
    thread: "PB_0425",
    messages: messages("wechat.supplement.pb0425", [
      ["PB_0425", "text", "你上次问的旧页面，我只留了浏览器导出的那一份。", "7月11日 22:14"],
      ["self", "text", "够了，文件名和导出时间先别改。", "7月11日 22:17"],
      ["PB_0425", "text", "明白。我把公开页面和本机缓存分了两个文件夹，免得混在一起。", "7月11日 22:21"],
      ["self", "text", "这样最好，来源不同就不要放成一条记录。", "7月11日 22:25"],
      ["PB_0425", "text", "还有一张加载失败的截图，周末整理硬盘时再发你。", "7月11日 22:28"],
      ["self", "text", "不用急，原文件在就行。", "7月11日 22:30"]
    ]),
    narrative: narrative("以普通的文件整理沟通承托后续缓存线索，不提前增加结论。", "habit", {
      characterTraitIds: ["ct.shenchuan.archivist"]
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

interface LongFormXhsSeed {
  title: string;
  summary: string;
  paragraphs: string[];
  category: string;
  author: string;
  location: string;
  likes: number;
  comments: Array<{ author: string; text: string; likes: number }>;
  mediaIndex: number;
  mediaSetOffset?: number;
  mediaType: "image" | "video";
}

const xhsSeeds = longFormXhsNotes as LongFormXhsSeed[];

export const ordinaryXhsNotes: OrdinaryXhsNote[] = xhsSeeds.map((seed, index) => ({
  id: `xhs.ordinary.${String(index + 1).padStart(2, "0")}`,
  author: seed.author,
  avatar: seed.author.slice(0, 1),
  category: seed.category,
  title: seed.title,
  summary: seed.summary,
  body: seed.paragraphs,
  date: `2026-07-${String(15 - (index % 12)).padStart(2, "0")}`,
  location: seed.location,
  likes: seed.likes,
  comments: seed.comments.map((comment, commentIndex) => ({
    id: `xhs.ordinary.${index + 1}.comment.${commentIndex + 1}`,
    ...comment
  })),
  media: xhsMedia[seed.mediaIndex % xhsMedia.length]!,
  mediaSet: seed.mediaSetOffset === undefined
    ? [xhsMedia[seed.mediaIndex % xhsMedia.length]!]
    : [
        xhsMedia[seed.mediaIndex % xhsMedia.length]!,
        xhsMedia[(seed.mediaIndex + seed.mediaSetOffset) % xhsMedia.length]!
      ],
  mediaType: seed.mediaType,
  narrative: narrative(`以${seed.category}内容构成平台普通信息流。`, seed.category === "工作方法" ? "profession" : "world_context", {
    worldFactIds: seed.category === "工作方法" ? ["wf.shenchuan.job"] : ["wf.hangzhou.daily"],
    characterTraitIds: seed.category === "摄影"
      ? ["ct.shenchuan.photo"]
      : seed.category === "数码整理" || seed.category === "工作方法"
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

const mailDetails: Array<{to:string;cc?:string[];sentAt:string;body:string[]}> = [
  {
    to:"沈川",
    cc:["项目经理","研究助理"],
    sentAt:"2026年7月15日 09:18",
    body:[
      "沈川你好，",
      "本周两场受访者访谈已经完成最终确认：周三 10:30 为 U-0715-03，远程会议；周五 14:00 为 U-0717-02，线下访谈室 B。两位受访者均已收到参与说明和会前提醒。",
      "周三场请使用“支付流程_任务二”的提纲版本，周五场增加一次文件上传回顾。招募组已在附件排期表中标出联系方式与特殊说明，转发或下载后请继续按脱敏要求处理。",
      "请在今天 18:00 前回复确认主持人与记录分工。如果测试环境或会议链接有变化，也请直接在本邮件线程中更新，避免不同群里的信息不一致。",
      "谢谢。\n用户研究招募组\n产品体验中心"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月14日 20:06",
    body:[
      "你好，",
      "你的云存储账户 2026 年 6 月账单已经生成。本期基础空间与历史文件保留服务合计 25.00 元，已使用账户余额自动支付。",
      "截至账单日，账户已使用 186.4 GB，其中照片与视频 112.8 GB、文档 41.6 GB、其他备份 32.0 GB。最近删除中的文件不会立即计入可用空间，彻底释放可能需要一定时间。",
      "如需核对明细，请在账户中心进入“账单与订阅”。本邮件不会要求你回复密码或验证码；若对登录或扣费有疑问，请从客户端内的安全中心提交。",
      "云服务通知\n此邮件由系统自动发送，请勿直接回复"
    ]
  },
  {
    to:"沈川",
    cc:["周末摄影群"],
    sentAt:"2026年7月13日 16:42",
    body:[
      "沈川你好，",
      "本周六的城市步行拍摄暂定 08:30 在公共图书馆东侧入口集合，路线只经过开放街道、河岸步道和公共绿地，全程约两小时。",
      "天气预报显示上午可能有阵雨，请自备雨具并给相机做好防潮。若 07:30 前仍有强降水，活动顺延到周日上午，最终安排会通过群消息和邮件同时通知。",
      "附件中有集合位置、公共交通建议和拍摄边界说明。请不要进入施工围挡、封闭校园或住宅区域，也请避免拍摄可识别的私人门牌。",
      "城市摄影小组\n联络人：顾言"
    ]
  },
  {
    to:"沈川",
    cc:["项目经理","研究助理"],
    sentAt:"2026年7月12日 18:27",
    body:[
      "沈川，",
      "你上午提到的缓存问题已经定位。旧测试包在切换账号后仍会读取上一环境的本地配置，导致首页模块顺序与受访者实际看到的版本不一致。",
      "研发侧已在 build 20260712.3 中修复，并清理了测试账号的历史配置。请把今天两场记录里的环境版本补充为 20260712.2，同时在分析表中标记受影响任务，不需要重做用户原话。",
      "明天开始的访谈统一使用 20260712.3。若仍出现顺序差异，请保留截图、发生时间和账号编号，不要只写“缓存异常”，这样便于继续定位。",
      "林工\n客户端研发"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月11日 10:05",
    body:[
      "读者你好，",
      "城市公共文化中心七月活动简报已经发布。本月安排包括城市影像展、非虚构写作讲座、数字生活主题书架和两场周末纪录片放映。",
      "7 月 19 日的“如何整理个人照片”分享将在二层报告厅举行，活动免费，需提前预约。未预约成功的读者可以在活动结束后查看公开书单与讲义摘要。",
      "如遇强降水，室外活动可能调整时间；室内展览正常开放。请以活动前一天的短信或服务号通知为准。",
      "城市公共文化中心\n公共教育部"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月10日 08:12",
    body:[
      "尊敬的会员，",
      "你的六月铁路出行积分月报已生成。本月新增积分 438 分，兑换使用 0 分，当前可用积分 2,164 分。",
      "其中 320 分将在 2026 年 12 月 31 日到期。积分可用于符合规则的车票和服务兑换，具体可用范围以提交订单时页面显示为准。",
      "如发现行程或积分记录与本人实际情况不符，请通过官方客户端“我的—帮助与反馈”提交订单号。请勿向邮件回复身份证号码、密码或验证码。",
      "铁路出行服务\n会员中心"
    ]
  },
  {
    to:"项目经理",
    cc:["研究助理"],
    sentAt:"2026年7月9日 18:54",
    body:[
      "你好，",
      "本轮访谈的原始材料与脱敏版本已经分别归档。原始录音、同意记录和招募联系方式位于受限目录；分析目录中只保留编号化逐字稿、观察笔记和脱敏截图。",
      "附件“材料清单.zip”仅包含文件索引、版本号与校验记录，不包含受访者个人信息。逐字稿初校完成后，我会把状态从 v01 更新为 v02，并保留原始导出文件。",
      "请确认下周评审使用的是“分析摘要_v03”，不要从共享群里的旧附件继续修改。如需新增成员访问原始目录，请走权限申请，不直接转发链接。",
      "沈川\n用户研究"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月8日 17:20",
    body:[
      "住户您好，",
      "本周六 09:00—12:00 将对 2 号楼两部电梯进行例行保养。维护期间两部电梯会分时停运，不会同时关闭，现场工作人员将设置引导标识。",
      "如需搬运大件物品，请尽量避开上述时段。行动不便或有临时协助需求的住户，可在周五 18:00 前联系物业前台登记。",
      "维护结束后将恢复正常运行。如现场进度变化，我们会通过门厅公告和住户群同步通知。",
      "物业服务中心\n客服前台"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月7日 22:11",
    body:[
      "沈川，",
      "雨夜那组照片已经收到，我核对了 24 个原始文件和你另外导出的 8 张预览图。原图文件名连续，预览图没有保留定位信息，适合发到群里讨论构图。",
      "有两张隔着玻璃拍的画面反光比较明显，我没有替你处理。你如果只是做城市记录，建议把原图保留，再单独导出一版调整后的文件。",
      "冲洗那四张我会按原比例留白，不做满版裁切。周五下班前可以来取，我到时再把纸张样本一起给你看。",
      "小顾"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月6日 21:30",
    body:[
      "这是你的本周阅读报告。",
      "本周累计阅读 2 小时 16 分，完成 3 个阅读日，最长连续阅读 47 分钟。当前正在阅读的《城市与记忆》进度为 38%，上次停留在第三章第二节。",
      "你本周新增 12 条划线和 3 条笔记，其中两条笔记设置了下周回顾。阅读时长只用于个人统计，不代表阅读质量；你可以在隐私设置中关闭周报。",
      "阅读周报\n由系统自动生成"
    ]
  },
  {
    to:"全体员工",
    cc:["园区物业"],
    sentAt:"2026年7月5日 15:08",
    body:[
      "各位同事，",
      "办公区空调系统将在本周六 09:00—11:30 进行例行清洗和滤网更换。维护期间 7—9 层制冷将暂停，其他区域不受影响。",
      "周六到岗的同事请优先使用六层临时工位。需要持续运行的测试设备请在周五下班前确认散热条件，个人桌面上的文件与杯具请妥善收好。",
      "维护完成后行政会在办公群发布恢复通知。如有机房或特殊温控需求，请在周五 17:00 前联系行政支持。",
      "公司行政部"
    ]
  },
  {
    to:"摄影店陈师傅",
    sentAt:"草稿保存于 2026年7月4日 22:16",
    body:[
      "陈师傅您好，",
      "想确认一下上周送去的四张照片，冲洗时请保持原始比例，不做满版裁切。手机截图和相机原图的长宽比不一样，希望四周都留出自然白边。",
      "背面如果方便，请用铅笔标注拍摄日期和原文件名，不需要加店铺水印。相纸仍按上次看过的哑光纸即可。",
      "我计划周五下班后过去取。如果成片前需要确认裁切范围，可以先把预览发我。",
      "沈川"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月3日 09:10",
    body:[
      "你好，",
      "你的 2026 年 6 月支付账单摘要已经生成。本月总支出主要分布在交通、餐饮、生活缴费和数字服务，退款与余额调整已在明细中单独列出。",
      "账单摘要只按交易分类展示，不会改变原始交易记录。你可以在客户端中按商户、时间或金额筛选，也可以导出个人对账文件。",
      "如对某笔交易有疑问，请从对应账单详情发起申诉。官方客服不会通过邮件索要支付密码或短信验证码。",
      "支付服务通知\n账单中心"
    ]
  },
  {
    to:"沈川",
    cc:["项目经理"],
    sentAt:"2026年7月2日 19:42",
    body:[
      "沈川你好，",
      "第二场访谈逐字稿已经按新版模板完成初校，录音时间码与段落编号均已补齐。受访者姓名、联系方式和具体公司信息已替换为编号。",
      "有三处产品名称听写不确定，我在文档中使用黄色标记，并附上对应录音时间。另有一段环境噪声较大，只保留了能够确认的内容，没有根据上下文补写。",
      "请你在周四中午前复核标记段落。确认后我会生成 v02，并把本轮分析引用统一指向初校后的版本，原始转写文件继续只读保留。",
      "研究助理\n许言"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年7月1日 16:18",
    body:[
      "你好，",
      "你已完成 2026 年度数据安全基础课程和测验，最终成绩 92 分。学习记录已同步到员工培训平台。",
      "本年度新增内容包括个人信息最小化、共享链接有效期和移动存储介质管理。证书 PDF 随邮件附上，可用于内部学习记录，无需对外提交。",
      "如果平台中的部门或姓名信息有误，请在五个工作日内联系培训管理员更正；课程答案和账号密码无需通过邮件发送。",
      "数据安全培训中心"
    ]
  },
  {
    to:"订阅读者",
    sentAt:"2026年6月30日 08:36",
    body:[
      "雨季器材维护提示",
      "相机从空调房进入潮湿室外，或从雨中直接放进密闭包内，都可能出现凝露。拍摄结束后先擦干机身，打开包通风，等温差缓和后再收纳。",
      "镜片上的水滴应使用干净镜头布轻按吸走，不要用高温吹风。长期保存可使用有湿度显示的防潮箱，电池和存储卡分别检查，照片完成第二份备份后再格式化。",
      "若镜头内部持续起雾、出现霉斑或机身进水，请停止通电并送专业维修。日常防潮不能替代进水后的拆检。",
      "摄影器材维护编辑部"
    ]
  },
  {
    to:"林工",
    cc:["项目经理","研究助理"],
    sentAt:"2026年6月29日 17:58",
    body:[
      "林工你好，",
      "我已经在研究记录中补充了两场测试使用的环境版本：6 月 27 日上午为 20260626.5，下午切换到 20260627.2。两版首页卡片顺序不同，任务完成路径本身没有变化。",
      "逐字稿和观察表中的相关段落已经加上版本标签，没有改写受访者原话。对比截图放在脱敏材料目录，文件名含日期、账号编号和版本号。",
      "请帮忙确认 20260627.2 是否还包含实验开关 B。确认结果直接回复本线程即可，我会把它补进分析限制说明。",
      "沈川\n用户研究"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年6月28日 22:04",
    body:[
      "账户安全提醒",
      "你的网盘账户于 2026 年 6 月 28 日 21:58 在常用手机上完成一次登录，登录方式为本机生物识别确认，网络位置与近期使用记录一致。",
      "如果这是本人操作，无需处理。你可以在客户端安全中心查看设备名称、最近活动与已授权会话，并移除不再使用的设备。",
      "如果不是本人操作，请立即从官方客户端修改密码并退出其他设备。不要回复本邮件，也不要向任何人提供验证码。",
      "网盘安全中心"
    ]
  },
  {
    to:"沈川",
    sentAt:"2026年6月27日 18:05",
    body:[
      "预约成功通知",
      "你已成功预约 7 月 2 日（周四）19:00—20:00 的 3 号羽毛球场，使用人数登记为 4 人。请在开场前十五分钟到前台签到。",
      "如无法到场，请至少提前两小时在预约页面取消，以便释放公共时段。场馆提供基础照明和更衣柜，球拍、球和饮水需自行准备。",
      "近期阵雨较多，入口处可能湿滑，请将雨伞放入指定区域。场地调整或临时维护会通过原账户通知。",
      "社区体育馆\n预约服务"
    ]
  },
  {
    to:"项目经理",
    sentAt:"草稿保存于 2026年6月26日 23:10",
    body:[
      "你好，",
      "我重新看了下周访谈提纲，任务排序还需要调整。现在的版本先问整体评价，再让受访者完成具体操作，容易让前面的态度影响后续描述。",
      "建议把最近一次真实经历放在开头，再进入任务一和任务二；每个任务结束后只追问当时的判断和原因，整体评价放到最后。关于新功能的概念题继续保留，但不和真实使用经历混在同一组问题里。",
      "我明早会把 v05 放到共享目录，并保留 v04 作为对照。你如果同意这个顺序，我再请研究助理更新记录模板。",
      "沈川"
    ]
  }
];

export const ordinaryMails: OrdinaryMail[] = mailSeeds.map(([folder, senderType, from, subject, preview, date, unread, threadId], index) => ({
  id: `mail.ordinary.${String(index + 1).padStart(2, "0")}`,
  threadId,
  folder,
  from,
  senderType,
  subject,
  preview,
  body: mailDetails[index]!.body,
  to: mailDetails[index]!.to,
  cc: mailDetails[index]!.cc,
  sentAt: mailDetails[index]!.sentAt,
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
  wechatMessages: ordinaryWechatThreads.reduce((sum, thread) => sum + thread.messages.length, 0)
    + wechatThreadSupplements.reduce((sum, thread) => sum + thread.messages.length, 0),
  wechatSupplementThreads: wechatThreadSupplements.length,
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
