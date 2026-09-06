# CSSの読み込み順と詳細度

**このリポジトリで一番事故が多い場所です。CSSを1行足す前に読んでください。**

症状はいつも同じ形で現れます。「`!important` を付けたのに効かない」
「直したはずなのに見た目が変わらない」。原因はほぼ必ず、
**書いた場所が悪い（読み込み順で負けている）** か
**詳細度が足りない** のどちらかです。

---

## 1. 実際の読み込み順（実測）

`<head>` の4枚だけが静的で、残りは `public/js/main.js` の
`loadDesignLayers()` が実行時に `<link>` を足しています。
さらに `@import` があるので、最終的な順序は次のとおりです
（ブラウザの `document.styleSheets` を辿って実測した結果）。

```
 1  reset.css
 2  variables.css                    ← デザイントークンの定義
 3  common.css                       ← @font-face（build-fonts.py が生成）
 4  pages/<そのページ>.css
 5  polish.css
 6  responsive-consistency.css
 7  screen-mock-accuracy.css
 7a   ├ screen-mock-accuracy-base.css     ← 再現図の土台
 7b   ├ visual-finish.css
 7c   └ screen-mock-fidelity.css
 7c1      ├ mobile-first-view.css
 7c2      ├ screen-mock-theme-showcase.css
 7c3      ├ manual-visual-audit-fixes.css
 7c4      ├ manual-visual-audit-final.css
 7c5      └ manual-visual-audit-continuation.css
 8  screen-mock-palette.css          ← 節ごとの配色（#drawing など）
 9  screen-mock-layout-fix.css
10  line-break.css
10a   ├ manual-visual-audit-continuation.css   ← ★2回目
10b   ├ screen-mock-contrast-palettes.css      ← 配色の最終上書き
10c   ├ features-source-normalization.css
10d   ├ visual-audit-tail.css
10e   ├ mobile-first-view.css                  ← ★2回目
10f   └ theme-accent-only.css
```

**後にあるほど強い**（同じ詳細度なら後勝ち）。

### 罠1: `@import` は「そのファイルの先頭」に巻き上がる

`@import` はファイルのどこに書いても、**そのファイルの全ルールより前**に
適用されます。つまり `line-break.css` の中に自分でルールを書いても、
同じファイルが `@import` している `visual-audit-tail.css` より**後**に
なります。上の図で `10a`〜`10f` が `line-break.css` 本体より先に
並んでいるのはそのためです。

### 罠2: 同じファイルが2回読まれている

`manual-visual-audit-continuation.css` と `mobile-first-view.css` は
2か所から `@import` されています。**後の位置（10a / 10e）が有効**です。
この2つを編集するときは「7c5 のつもりで書いたのに 10a として効く」ことを
意識してください。

### 罠3: `loadDesignLayers()` は非同期

`<head>` の4枚が当たった状態で一度描画され、そのあと 5〜10 が届きます。
撮影・測定でここを踏むと途中状態が写ります。
`tools/shot.mjs` は `document.fonts.ready` ＋待ち時間で回避しています。

---

## 2. どこに書けばいいか（決定表）

| 直したいもの                                 | 書く場所                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| デザイントークン（色・余白・フォントの定義） | `variables.css`                                                                         |
| ページ固有のレイアウト                       | `pages/<page>.css`                                                                      |
| 全ページ共通の部品                           | `common.css`                                                                            |
| 画面再現図の**構造・寸法**                   | `screen-mock-layout-fix.css`（末尾に節番号を振って追記）                                |
| 画面再現図の**配色**                         | `screen-mock-palette.css`（節ごと）／ `screen-mock-contrast-palettes.css`（最終上書き） |
| レスポンシブの調整                           | `responsive-consistency.css`                                                            |

**新しいCSSファイルを増やさないこと。** 増やすと読み込み順の管理が
さらに難しくなります。`screen-mock-layout-fix.css` は末尾に
`/* ---- NN. 見出し ---- */` を付けて追記していく運用になっています
（現在25節まで）。**何を直したのか・なぜそうしたのかをコメントに書く**のが
このリポジトリの慣習です。後から読む人が同じ罠を踏まないための記録です。

---

## 3. 詳細度の実際

このリポジトリは `!important` が大量にあります。**`!important` 同士では
詳細度で決まる**ので、「!important を足す」だけでは勝てません。

実際に効いている代表的なセレクタの強さ:

| セレクタ                                                                    | 詳細度    |
| --------------------------------------------------------------------------- | --------- |
| `.fd-canvas-screen`                                                         | 0,1,0     |
| `.hero-visual.fd-app-screen`                                                | 0,2,0     |
| `html body .fd-canvas-screen.fd-canvas-screen`                              | 0,3,2     |
| `html body :is(.feature-section, .screenshot-card) .feature-diagram :is(…)` | 0,3,2     |
| `html body :is(#drawing, #editing, …) > .feature-diagram`                   | **1,1,2** |
| `html body :is(#drawing, …) > .feature-diagram.fd-canvas-screen`            | **1,2,2** |

**IDが1つ入ると、クラスを何個重ねても勝てません。**
`screen-mock-contrast-palettes.css` は節ID（`#drawing` など）で配色を
当てているので、そこを上書きするには**こちらもIDを含める**か、
**そのルール自体を直す**しかありません。

### 実例（実際に起きた事故）

キャンバス画面の下地を外周色にしたかったが、
`html body .fd-canvas-screen.fd-canvas-screen`（0,3,2）を書いても
節の中では効かなかった。`#drawing > .feature-diagram`（1,1,2）が
勝っていたため。**IDを含む版を併記して解決**した:

```css
html body .fd-canvas-screen.fd-canvas-screen,
html
  body
  :is(#drawing, #editing, #advanced)
  > .feature-diagram.fd-canvas-screen {
  background: var(--fd-outside) !important;
}
```

### 勝てないときの調べ方

推測せず、**実際にどのルールが勝っているかをブラウザに聞く**のが速いです。

```js
const cdp = await context.newCDPSession(page);
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");
const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
const { nodeId } = await cdp.send("DOM.querySelector", {
  nodeId: root.nodeId,
  selector: "#drawing .fd-toolbar",
});
const m = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
// matchedCSSRules は「弱い順」。最後に出てくるものが勝っている。
for (const r of m.matchedCSSRules) {
  const p = r.rule.style.cssProperties.find(
    (c) => c.name === "background-color",
  );
  if (p)
    console.log(
      r.rule.selectorList.text,
      "->",
      p.value,
      p.important ? "!imp" : "",
    );
}
```

---

## 4. 矛盾するルールを見つけたら

複数のセッションが同時に触っているため、**同じ要素に対して逆のことを
指定しているルールが両方生きている**ことがあります。実際にありました。

- `screen-mock-layout-fix.css`: コマ一覧を `justify-content: center` で中央寄せ
- `visual-audit-tail.css`: 同じ要素に `padding-left: calc(50% - 125px)`

中央寄せの flex 行が親より広い場合、はみ出しは左右へ均等に出るため
padding が打ち消され、選択中のコマがちょうど1マスぶんずれていました。

**このときは、勝っているほうに合わせて負けているルールを消す**のが正解です。
「上書きするルールをもう1枚足す」と、矛盾が3重になって次の人が詰みます。
消すときは**なぜ消したのかをコメントに残す**こと。

---

## 5. 既知のCSSの罠

`HANDOFF.md` 3節に、これまでに踏んだCSSの罠が実例つきでまとまっています。
特に次の2つは再発しやすいので、そちらも読んでください。

- `word-break: keep-all` と `overflow-wrap: break-word` の組み合わせ
- `IntersectionObserver` の `threshold` が要素の高さに左右される件
