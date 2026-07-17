# 生成与编辑提示模板

## 1. 人物身份包（英文母提示）
```
Photorealistic identity reference sheet for [CHARACTER_ID], East Asian [age/gender presentation], neutral documentary lighting, plain soft-gray background, consistent facial geometry, natural skin texture, no beauty retouching, front view, three-quarter view, side profile, half body and full body. Preserve: [ANCHORS]. Wardrobe: [WARDROBE]. 50mm equivalent lens, realistic proportions, no cinematic grading.
```

## 2. 真实手机随手拍
```
A candid smartphone photo taken by an ordinary person, [SCENE], [TIME/WEATHER], imperfect framing, slight automatic exposure adjustment, subtle sensor noise, realistic HDR, mild motion blur, social-media compression. The scene must match location pack [LOCATION_ID] and character pack [CHARACTER_ID]. No cinematic lighting, no staged horror, no text artifacts.
```

## 3. 家庭旧照
```
A believable Chinese family snapshot from [YEAR], ordinary home interior, casual posture, mixed household lighting, natural age-appropriate clothing, slightly imperfect focus, realistic phone camera quality for that year. Preserve exact face identity and object continuity for [CHARACTER_REFS] and [OBJECT_REFS].
```

## 4. R阶段局部编辑
```
Edit the approved base image [BASE_ASSET_ID]. Change only: [ALLOWED_CHANGE]. Preserve every other pixel-level relationship: camera viewpoint, crop, focal length, lighting direction, shadows, background geometry, clothing folds, skin texture, compression artifacts and color balance. The result must look as if it had always been photographed this way, not like an erased object or a newly generated image.
```

## 5. 错层地点异常
```
Using the approved ordinary location photo as the base, introduce one physically coherent discrepancy: [DOOR / WINDOW FIGURE / SIGN NUMBER / CRACK]. Keep the scene mundane. The anomaly must be discoverable only by close comparison, with correct perspective, occlusion, reflections and shadows. Do not add fog, blood, glowing eyes, VHS noise or horror color grading.
```

## 6. 视频图生视频
```
Animate approved keyframes with subtle handheld smartphone motion, breathing-level camera shake, autofocus hesitation and exposure adaptation. Preserve identity, clothing, architecture and object positions. Avoid cinematic camera moves, morphing faces, rubber limbs, background regeneration and temporal texture drift.
```

## 通用负面约束
- no extra fingers / fused hands / duplicated people / floating objects
- no incorrect Chinese text, fake logos or warped signage
- no face drift, age drift, wardrobe drift or glasses changes
- no cinematic teal-orange grading, horror fog, blood, red glitch overlays or jump-scare framing
- no impossible reflections, inconsistent shadows or changing architecture
