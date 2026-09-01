# NIARIM Web Design System

> このファイルは NIARIM 公式サイトの視覚設計を AI / 開発者が一貫して扱うためのデザイン契約です。
> 実在サイトの DESIGN.md は「技術・設計思想の参考」に留め、構成・役割・表現をそのままコピーしません。

## 1. Design intent

NIARIM は手描きアニメーション制作アプリです。サイトも「AIサービス」「SaaSダッシュボード」ではなく、創作道具の公式サイトとして見せます。

目標は以下です。

- 親しみやすいが子供っぽくしない
- クリエイティブだが装飾過多にしない
- アプリ本体との一体感を最優先する
- 作品制作を邪魔しない道具のような静かな精度を持たせる
- `#FF5C7A` をブランドの句読点として使い、画面全体をピンクにしない
- 大量の影・ガラス・極端な角丸・意味のない浮遊カードなど、典型的なAI生成LPの癖を避ける

キーワード: **warm / tactile / precise / playful / creator-first**

## 2. Core visual model

### Canvas and surfaces

ページ全体は暖かい紙色のキャンバス。その上に白いカードやUI面を置きます。

- Page canvas: `#F7F4F3`
- Primary surface: `#FFFFFF`
- Soft surface: `#FBF9F8`
- Pink tint: `#FFF0F3`
- Dark island: `#17161C`
- Hairline border: `rgba(40, 36, 44, 0.09)`
- Strong border: `rgba(40, 36, 44, 0.16)`

カード同士を大量のシャドウで分離しません。通常カードは hairline border を基本にし、影は「本当に浮いている」要素へ限定します。

### Brand color

- Accent: `#FF5C7A`
- Accent dark: `#E8425F`
- Brand brown: `#4A4636`
- Brand dark brown: `#322F24`

`#FF5C7A` の役割:

- 主要CTA
- 選択状態
- アクティブ表示
- アイコン背景
- 小さな線・点・下線
- ヒーローの限定的な強調

禁止:

- すべての見出しをピンクにする
- 複数のピンク系CTAを同じ画面に並べる
- 大面積の蛍光ピンク背景を連続して使う

## 3. Typography

アプリ本体と同じフォントを最優先します。

- Body: `HakkouMincho`
- Heading: `Kuramubon`
- Fallback は既存 `variables.css` の指定を使用

### Hierarchy

- Hero: 最大 `5.5rem` 程度。短いキャッチコピーを強く見せる
- H1: 最大 `3.55rem`
- H2: 最大 `2.5rem`
- H3: 最大 `1.6rem`
- Body: `1rem` 前後
- Small/UI: `0.875rem`

見出しは大きくしても行間を詰めすぎない。日本語・中国語・韓国語で不自然な改行を生まない既存ルールを維持します。

## 4. Spacing rhythm

既存の余白トークンを使用します。

- 8px: micro gap
- 16px: small gap
- 24px: component internal gap
- 40px: large component separation
- 64px: section internal rhythm
- 96px 前後: major section separation

セクション間を詰めすぎない一方、カード内部で大きな空白を作りすぎません。

## 5. Shape language

- Small controls: `8px`
- Standard cards: `14px`
- Hero / large visual panels: `24px`
- Pills: `999px` only when the object is semantically a pill/tag/control

禁止:

- 何でも 24–32px 以上で丸める
- 長方形カードを意味なくカプセル状にする
- 同一画面で多数の異なるradiusを混在させる

## 6. Elevation

基本原則は **border first, shadow second**。

Shadowを許可する場所:

- sticky header after scroll
- dropdown / modal
- product/app mockup
- primary CTA where depth improves affordance
- floating scroll-to-top control
- hero visual

通常の情報カードは border のみを基本とします。

## 7. Components

### Primary CTA

- Accent `#FF5C7A` または dark ink のどちらか一つを画面の主役として使う
- 白文字
- 高さ 44–48px 以上
- hover は 1–2px 程度の移動または色変化に留める

### Secondary CTA

- transparent / light tint / outline
- primary CTA と競合する彩度を持たせない

### Cards

標準カード:

- white surface
- 1px hairline border
- 14px radius
- no decorative hover when not clickable
- 24–40px padding depending on density

クリック可能カード:

- hover/focus feedback is allowed
- feedback must communicate interactivity, not decoration

### Eyebrow / tag

- pill shape allowed
- accent tint or subtle border
- small type
- section labelとしてのみ使用し、大量に並べない

### Icons

絵文字は禁止。`/assets/icons/ui/sprite.svg` の既存アイコンを使います。

標準アイコン表現:

- 角丸四角
- NIARIM accent / brand gradient background
- white glyph

ただし、すべてのアイコンを必ず箱に入れる必要はありません。ナビ・小さなUIでは線/単色アイコンの方が自然ならそちらを使います。

## 8. Motion

Motion must explain hierarchy or state.

通常:

- fast interaction: `180ms`
- component transition: `360ms`
- reveal / hero: `760ms` 前後

許可:

- dropdown open/close
- button feedback
- accordion
- active tab state
- scroll reveal
- hero-level drawing / parallax
- product UI state change

禁止:

- 非クリック要素がhoverで浮く
- 全カードが常時ふわふわ動く
- 無関係な回転バッジ
- コンテンツ理解を邪魔する連続パララックス
- `prefers-reduced-motion` を無視する

## 9. Layout

- Max content width: about `1220px`
- Heroは内容に応じて1〜2カラム
- Feature sectionsは左右交互レイアウトを利用してよい
- カードグリッドは情報密度と意味で列数を決める
- 同じページでカード・カード・カードと連続させない。plain section / tinted section / dark island / product visual を使ってリズムを作る

### Mobile

- デスクトップ版の縮小コピーにしない
- 読み順を優先して1カラム化
- CTAは押しやすいサイズを維持
- 長いナビは既存ハンバーガーへ
- 横スクロールを発生させない

## 10. Imagery and product representation

NIARIM はアプリそのものを見せるサイトです。

優先順位:

1. 実際のアプリUI / 実装に基づくモック
2. NIARIMロゴ / タイトルロゴ
3. アプリで作れる表現を説明する抽象的な線・フレーム・タイムライン表現
4. 必要な場合のみ補助イラスト

避ける:

- generic stock photos
- 無関係な3Dオブジェクト
- AIロボット表現
- 実装されていない機能を示す架空UI

## 11. Content truthfulness

サイト上の機能説明は必ず NIARIM アプリ本体リポジトリの実装・仕様を根拠にします。

- 実装未確認の機能をデザイン都合で追加しない
- 将来仕様は実装済みのように見せない
- コミュニティ等、準備中のものは準備中と分かる表現にする

Visual polish must never outrun product truth.

## 12. Accessibility

- WCAGを意識したコントラスト
- focus-visible を消さない
- colorだけで状態を伝えない
- target sizeを十分に取る
- keyboardで操作可能にする
- reduced motion対応
- semantic HTMLを優先

## 13. Reference usage rule

外部デザインを参考にするときは、以下の順序で変換します。

1. 何が良いかを「原理」に分解する
2. NIARIMで同じ役割が必要か確認する
3. NIARIMの色・フォント・コンテンツ・アプリUIへ置き換える
4. 元サイトと同じ役割・同じ構図・同じ演出の組み合わせになっていないか確認する
5. 必要ならさらに崩してNIARIM固有の表現にする

Copy the system, not the website.

## 14. AI implementation checklist

UIを新規作成・修正するAIは、実装前後に以下を確認してください。

- `README.md` と `HANDOFF.md` を読んだか
- この `DESIGN.md` を読んだか
- `variables.css` の既存トークンを再利用したか
- 新しい色・radius・shadowを勝手に増やしていないか
- 非クリック要素へhoverを付けていないか
- 絵文字を追加していないか
- `sprite.svg` で代用できるか確認したか
- 7言語で破綻しないか
- mobileで横スクロールがないか
- reduced motionで問題ないか
- 実装済み機能だけを表示しているか

## 15. Current visual direction summary

NIARIM Web is a **warm creative-tool website** built on a tactile paper canvas, crisp white surfaces, quiet hairline borders, restrained depth, expressive app-native typography, and a single coral-pink accent. Motion is purposeful and concentrated around creation itself: drawing, frames, state changes, and meaningful interactions.
