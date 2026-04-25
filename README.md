# Moncchichi Park

개인 블로그용 GitHub Pages 사이트입니다.

## 글 추가하기

공개 페이지에 영구 반영할 글은 `data/posts.json` 배열 맨 위에 아래 형식으로 추가합니다.

```json
{
  "title": "새로 산 곰돌이 키링",
  "category": "cute",
  "tag": "키링 · 소품",
  "excerpt": "가방에 달았더니 하루가 조금 더 폭신해졌다.",
  "visual": "sticker",
  "likes": 0
}
```

카테고리는 `cute`, `food`, `character`, `daily` 중 하나를 씁니다.
표지 느낌은 `sticker`, `cake`, `mascot`, `pasta` 중 하나를 씁니다.

홈페이지의 글쓰기 폼에서 쓴 글은 현재 브라우저에 임시 저장되어 바로 보입니다. 다른 사람에게도 보이게 하려면 `data/posts.json`에 추가해서 커밋해야 합니다.
