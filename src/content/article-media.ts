export interface ArticleMedia {
  src: string;
  alt: string;
  caption: string;
}

const mediaByTopic = {
  archive: {
    src: "/media/case-001/daily/temporary-archive-desk.jpg",
    alt: "桌面上的文件夹、硬盘与归档笔记",
    caption: "资料整理示意：原文件、导出副本和说明记录分开保存。"
  },
  photography: {
    src: "/media/case-001/daily/temporary-rainy-street.jpg",
    alt: "雨天街道上的拍摄场景",
    caption: "雨天拍摄示意：环境光、反射与拍摄位置会共同影响画面。"
  },
  city: {
    src: "/media/case-001/daily/temporary-rainy-cafe.jpg",
    alt: "雨天城市街角的咖啡店",
    caption: "城市生活配图：雨天街区仍保持普通的通勤与营业节奏。"
  },
  daily: {
    src: "/media/case-001/daily/temporary-balcony-plants.jpg",
    alt: "窗边与阳台上的日常绿植",
    caption: "普通生活记录配图。"
  }
} as const;

export function articleMediaFor(title: string, paragraphs: string[]): ArticleMedia {
  const copy = `${title}${paragraphs.join("")}`;
  if (/缓存|存档|文件|硬盘|网页|版本|数据/.test(copy)) return mediaByTopic.archive;
  if (/照片|摄影|相机|镜头|画面|视频/.test(copy)) return mediaByTopic.photography;
  if (/城市|通勤|社区|街道|杭州|生活/.test(copy)) return mediaByTopic.city;
  return mediaByTopic.daily;
}
