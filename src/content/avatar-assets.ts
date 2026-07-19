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
};

const identityAvatarPaths: Record<string, string> = {
  player: "/media/case-001/daily/temporary-archive-desk.jpg",
  investigation: "/media/case-001/daily/temporary-rainy-street.jpg",
  "妈妈": "/media/case-001/daily/temporary-balcony-plants.jpg",
  "李女士": "/media/case-001/daily/temporary-balcony-plants.jpg",
  "爸爸": "/media/case-001/daily/temporary-weekday-lunch.jpg",
  "阿序": "/media/case-001/daily/temporary-train-tote.jpg",
};

export function realisticWechatAvatar(threadIdOrName: string, fallbackSlot = 0): string {
  const filename = wechatAvatarFiles[threadIdOrName];
  return filename ? assetUrl(`${REALISTIC_AVATAR_ROOT}/${filename}`)! : generatedAvatar(fallbackSlot);
}

export function identityAvatar(identity: string, fallbackSlot = 120): string {
  const path = identityAvatarPaths[identity];
  return path ? assetUrl(path)! : generatedAvatar(fallbackSlot);
}
