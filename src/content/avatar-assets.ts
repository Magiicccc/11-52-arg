import { assetUrl } from "@/lib/asset-url";

export const GENERATED_AVATAR_COUNT = 128;

export function generatedAvatar(slot: number): string {
  const normalized = ((Math.trunc(slot) % GENERATED_AVATAR_COUNT) + GENERATED_AVATAR_COUNT) % GENERATED_AVATAR_COUNT;
  return assetUrl(`/media/case-001/avatars/generated-avatar-${String(normalized + 1).padStart(3, "0")}.png`)!;
}

const REALISTIC_AVATAR_ROOT = "/media/case-001/avatars/realistic";

const wechatAvatarFiles: Record<string, string> = {
  "wechat.daily.chenyu": "wechat-chenyu-umbrella.png",
  "陈屿": "wechat-chenyu-umbrella.png",
  "wechat.daily.photo-group": "wechat-weekend-photo-group.png",
  "wechat.daily.research-group": "wechat-research-team.png",
  "wechat.daily.family": "wechat-family-dinner.png",
  "一家人": "wechat-family-dinner.png",
  "wechat.daily.xu": "wechat-reception-xu.png",
  "wechat.daily.lin": "wechat-engineer-lin.png",
  "wechat.daily.gu": "wechat-photographer-gu.png",
  "wechat.daily.property": "wechat-property-building.png",
  "wechat.daily.book-club": "wechat-book-club.png",
  "wechat.daily.neighbor": "wechat-neighbor-cat.png",
  "wechat.daily.delivery": "wechat-delivery-service.png",
  "wechat.daily.chen": "wechat-photo-shop-camera.png",
  "wechat.daily-gym": "wechat-badminton-group.png",
  "wechat.daily-cloud": "wechat-cloud-service.png",
  "wechat.daily-self": "wechat-file-transfer.png",
  "文件传输助手": "wechat-file-transfer.png",
  "actor.zhoulan": "wechat-zhoulan-roses.png",
  "周岚": "wechat-zhoulan-roses.png",
  "南岸慢慢走": "xhs-nanan-rain-walk.png",
  "橙色文件夹": "xhs-orange-folder.png",
  "午间十分钟": "xhs-lunch-ten-min.png",
  "白色鞋带": "xhs-white-shoelace.png",
  "接口旁边": "xhs-window-outlet.png",
  "今天吃什么呀": "xhs-food-noodles.png",
  "慢快门小顾": "wechat-photographer-gu.png",
  "八点四十二": "xhs-eight-forty-two-cat.png",
  "木桌边": "xhs-wood-desk.png",
  "第三章以后": "xhs-after-chapter-three.png",
  "沿河但不靠河": "xhs-riverside-bike.png",
  "硬盘灯还亮着": "xhs-hard-drive-light.png",
  "南岸没有风": "social-nanan-no-wind-selfie.png",
  "旧雨17": "social-old-rain-17-window.png",
  "沿河慢慢走": "social-river-greenway-bike.png",
  "普通路过": "social-sleepy-orange-cat.png",
  "一只普通用户": "social-ordinary-user-selfie.png",
  "收纳慢慢来": "social-slow-organizing-duck.png",
  "今天也下雨": "social-today-rain-umbrella.png",
  "写字楼观察员": "xhs-office-building-observer.png",
  "一档欠曝": "xhs-one-stop-underexposed.png",
  "冰箱便签": "xhs-fridge-note.png",
  "研究提纲": "xhs-research-outline.png",
  "鞋柜观察": "xhs-shoe-cabinet.png",
  "镜头布不见了": "xhs-lens-cloth-missing.png",
  "灶台很小": "xhs-small-stove.png",
  "版本号从一开始": "xhs-version-from-one.png",
  "耳机只戴一边": "xhs-one-earbud.png",
  "窗台三号盆": "xhs-window-pot-three.png",
  "今天没迟到": "xhs-not-late-today.png",
  "照片很多但不慌": "xhs-many-photos-calm.png",
};

const identityAvatarPaths: Record<string, string> = {
  player: "/media/case-001/daily/temporary-archive-desk.jpg",
  investigation: "/media/case-001/daily/temporary-rainy-street.jpg",
  "妈妈": "/media/case-001/daily/temporary-balcony-plants.jpg",
  "李女士": "/media/case-001/daily/temporary-balcony-plants.jpg",
  "爸爸": "/media/case-001/daily/temporary-weekday-lunch.jpg",
  "阿序": "/media/case-001/daily/temporary-train-tote.jpg",
  "川流档案": "/media/case-001/daily/temporary-archive-desk.jpg",
  "沈川": "/media/case-001/daily/temporary-archive-desk.jpg",
};

export function realisticWechatAvatar(threadIdOrName: string, fallbackSlot = 0): string {
  const filename = wechatAvatarFiles[threadIdOrName];
  return filename ? assetUrl(`${REALISTIC_AVATAR_ROOT}/${filename}`)! : generatedAvatar(fallbackSlot);
}

export function identityAvatar(identity: string, fallbackSlot = 120): string {
  const path = identityAvatarPaths[identity];
  return path ? assetUrl(path)! : generatedAvatar(fallbackSlot);
}

export function realisticInternetAvatar(identity: string, fallbackSlot = 0): string {
  const filename = wechatAvatarFiles[identity];
  if (filename) return assetUrl(`${REALISTIC_AVATAR_ROOT}/${filename}`)!;
  const identityPath = identityAvatarPaths[identity];
  return identityPath ? assetUrl(identityPath)! : generatedAvatar(fallbackSlot);
}
