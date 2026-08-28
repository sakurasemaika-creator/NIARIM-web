/**
 * NIARIM公式サイト 読み物形式の見出し・本文（narrative block）翻訳辞書
 *
 * ユーザーから提供された「修正版のHP全文」を、既存のカード形式のレイアウトは
 * 維持したまま、各セクションの冒頭に見出し＋本文という読み物形式のブロックとして
 * 追加するためのキー群。本文はできる限り原文のまま使用する。
 *
 * 例外（別途ご指示いただいた表現を優先し、原文から意図的に変更している箇所）：
 * - 「つくる人と、みる人の境界を曖昧に」系の表現 → 「クリエイターと視聴者の
 *   境界を曖昧に」系の表現に統一（hero.subtitle / about.name.body で対応済み）
 * - 「みんなの作品をみる」という名称 → 「NIARIM作品広場」に統一
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
  "ja": {
    "narrative.home.cta.heading": "実際にアニメーションをつくってみよう！",
    "narrative.home.cta.body": "描きたいと思ったら、すぐに始められる。一枚の絵からでも、何十枚ものフレームを使った作品でも。手描きで動かす。キーフレームで動かす。画像や音を組み合わせる。仕上げまでこだわって、自分だけの作品にする。そして完成したら、「NIARIM作品広場」へ。つくって、公開して、みつけよう。NIARIMで、アニメーションをつくってみよう！",

    "narrative.drawing.1.heading": "描きたいものを、思い通りに。",
    "narrative.drawing.1.body": "ペンで描く。消す。塗る。選ぶ。変形する。必要な道具を使い分けながら、一枚の絵を仕上げていけます。",
    "narrative.drawing.2.heading": "自分の描き味をつくる。",
    "narrative.drawing.2.body": "Gペンやペン、エアブラシなどのブラシを使い分けるだけでなく、ブラシそのものを細かく調整できます。",
    "narrative.drawing.3.heading": "ブラシ設定",
    "narrative.drawing.3.body": "太さや不透明度はもちろん、フェードやストローク減衰、混色などを設定できます。水彩のように色をなじませたり、線の端をかすれさせたり。描き方に合わせて、自分好みの描き味に調整できます。",
    "narrative.drawing.4.heading": "筆圧と傾きにも対応",
    "narrative.drawing.4.body": "板タブ・液晶タブレットでは筆圧や傾きを利用できます。筆圧カーブを調整すれば、弱い力でも太く描けるようにするなど、自分の手癖に合わせて描き心地を変えられます。対応するペンのボタンには、消しゴムやスポイトなどの操作を割り当てることもできます。",

    "narrative.animation.1.heading": "手描きアニメーションをつくろう！",
    "narrative.animation.1.body": "一枚ずつ絵を描いて、フレームを重ねる。オニオンスキンで前後のフレームを確認しながら、動きのつながりを調整する。タイムラインでフレームやシーンを整理し、音にタイミングを合わせて絵を動かす。描いた絵が動き出すところまで、NIARIMひとつで完結します。",
    "narrative.animation.2.heading": "キャンバスモードとタイムラインモード",
    "narrative.animation.2.body": "NIARIMは、描くための「キャンバスモード」と、動かすための「タイムラインモード」に分かれています。お絵描きアプリと動画編集アプリを行き来する必要はありません。絵を描いて、そのまま動かして、音を合わせて仕上げる。制作の流れを一つのアプリにまとめています。",
    "narrative.animation.3.heading": "手描きだけじゃない。表現方法はひとつではありません。",
    "narrative.animation.3.body": "",
    "narrative.animation.4.heading": "キーフレームで動かす",
    "narrative.animation.4.body": "レイヤーの位置・拡大縮小・回転をキーフレームで指定。キーフレームの間は自動で補間されるので、パーツを動かしたモーションアニメーションもつくれます。複数のレイヤーをグループ化して、一緒に動かすこともできます。カメラキーフレームを使えば、パンやズームなどのカメラワークも設定できます。",
    "narrative.animation.5.heading": "画像や動画を使う",
    "narrative.animation.5.body": "画像や動画素材をタイムラインに配置して、手描きの絵と組み合わせられます。",
    "narrative.animation.6.heading": "ストップモーションも",
    "narrative.animation.6.body": "画像をフレームとして並べれば、ストップモーションのような作品も制作できます。手描きアニメーションを中心に、さまざまな表現方法を組み合わせられます。",

    "narrative.audio.1.heading": "音にタイミングを合わせて絵を動かす",
    "narrative.audio.1.body": "音声をタイムラインに配置して、音量やフェードイン・フェードアウトを調整できます。さらにタイムスタンプを打てば、音に合わせた口パクや動きのタイミングを確認する目印として使えます。",

    "narrative.editing.1.heading": "仕上げまで、しっかりこだわる。",
    "narrative.editing.1.body": "描いた後の調整も、NIARIMの中で。",
    "narrative.editing.2.heading": "レイヤー",
    "narrative.editing.2.body": "線画・色・背景などを分けて管理できます。レイヤーフォルダで整理したり、クリッピングを使ってはみ出しを防いだり。レイヤーのブレンドモードも豊富に用意しています。乗算、スクリーン、オーバーレイ、加算、減算などを使って、光や影の表現をつくれます。",
    "narrative.editing.3.heading": "アニメーションを、もっと効率よく。",
    "narrative.editing.3.body": "",
    "narrative.editing.4.heading": "共通レイヤー",
    "narrative.editing.4.body": "複数のフレームやシーンで同じ内容を表示できるレイヤーです。背景などの固定された要素を毎フレーム描き直す必要がありません。キャラクターを共通レイヤーにして、口だけを通常レイヤーに分けることもできます。キャラクター本体はそのまま表示しながら、口だけをフレームごとに描き替えて口パクさせることも可能です。",
    "narrative.editing.5.heading": "自動塗り",
    "narrative.editing.5.body": "線画をもとに、あらかじめ設定したパーツごとの色やトーンを使って自動で塗り分けます。同じキャラクターを何度も描く手描きアニメーションでは、色塗りの負担を大きく減らせます。グラデーションや縁取り、線画になじませる色トレスにも対応しています。※自動塗りは生成AIを使用した機能ではありません。設定したルールに基づいて色を塗り分けます。",

    "narrative.advanced.1.heading": "いつもの作業を、もっとスムーズに。",
    "narrative.advanced.1.body": "",
    "narrative.advanced.2.heading": "早替えツール",
    "narrative.advanced.2.body": "よく使うブラシやツールの組み合わせを登録して、ボタン一つで切り替え。「線画用」「色塗り用」「仕上げ用」など、自分だけの作業環境をつくれます。",
    "narrative.advanced.3.heading": "お気に入り",
    "narrative.advanced.3.body": "よく使うブラシやスタンプなどをお気に入りに登録。必要なものだけをすぐに呼び出せます。",
    "narrative.advanced.4.heading": "カラーピッカー",
    "narrative.advanced.4.body": "HSVとRGBを切り替えて色を選択。よく使うカラーセットはパレットに保存できます。",
    "narrative.advanced.5.heading": "トーンとスタンプで、表現を広げる。",
    "narrative.advanced.5.body": "",
    "narrative.advanced.6.heading": "トーン",
    "narrative.advanced.6.body": "トーンは色情報を持たないため、そのとき指定している色でトーンの模様を描画できます。網点やライン柄など、さまざまなパターンを組み合わせて作品を仕上げられます。",
    "narrative.advanced.7.heading": "スタンプ",
    "narrative.advanced.7.body": "スタンプは画像そのものが色情報を持っています。そのため、カラーチップで指定している色に関係なく、スタンプ固有の色で描画されます。効果線や背景パターン、小物などを登録して、必要なときにすぐ配置できます。回転や拡大縮小にも対応しています。",
    "narrative.advanced.8.heading": "ピクセルモード",
    "narrative.advanced.8.body": "ブラシ・フォント・スタンプにピクセルモードを適用できます。アンチエイリアスを取り除き、くっきりとしたドット絵風の表現に。スタンプをピクセルモードで加工して、ドット絵風の素材として使うこともできます。",
    "narrative.advanced.9.heading": "描画フィルター",
    "narrative.advanced.9.body": "レイヤーごとにフィルターを適用できます。ぼかし、シャープ、アンシャープマスク、トーンカーブ、レベル補正、周辺減光、ノイズ、レトロアニメ、ブラウン管、アニメ調、縁取り、ピクセレート、魚眼レンズなど。さらに、眼鏡断層フィルターでは、レンズの度数によってレンズ越しの景色がどのように歪んで見えるかを再現できます。",
    "narrative.advanced.10.heading": "演出フィルター",
    "narrative.advanced.10.body": "こちらはフレームやシーンごとに適用できる映像効果です。複数フレームをまとめて処理できるので、作品全体や一つのシーンに同じ演出を加えることもできます。ノイズや雨などの演出を重ねて、作品全体の雰囲気を仕上げられます。レイヤーを直接加工するなら描画フィルター。フレームやシーン全体を演出するなら演出フィルター。用途に合わせて使い分けられます。",

    "narrative.save.1.heading": "作品を軽く。制作を快適に。",
    "narrative.save.1.body": "アニメーション制作では、フレーム数やレイヤー数が増えるほどデータも大きくなります。NIARIMでは、長く制作を続けられるようにさまざまな軽量化の仕組みを用意しています。",
    "narrative.save.2.heading": "品質設定",
    "narrative.save.2.body": "低品質・中品質・高品質から選べるだけでなく、カスタム設定にも対応。保存方式やUndo回数、オニオンスキン、傾き検知など、端末の容量やスペックに合わせて細かな項目を調整できます。「容量を優先したい」「動作を軽くしたい」「Undoをもっと残したい」そんな使い方に合わせて、自分の環境を調整できます。",
    "narrative.save.3.heading": "自動保存",
    "narrative.save.3.body": "万が一アプリが異常終了した場合に備えて、復元用の自動保存を行います。",
    "narrative.save.4.heading": "セーブスロット",
    "narrative.save.4.body": "重要な状態を自分で選んで保存。",
    "narrative.save.5.heading": "セーブツリー",
    "narrative.save.5.body": "保存した状態から枝分かれして別の制作パターンを試せます。「この時点に戻って、別の展開を試したい」そんなときにも便利です。",
    "narrative.save.6.heading": "作品を、別の端末へ。",
    "narrative.save.6.body": ".niashareでプロジェクトを共有。NIARIMのプロジェクトを.niashare形式で共有できます。自分の別端末へ移したり、ほかの人へプロジェクトを渡したりできます。書き出すときには、プロジェクト本体・画像や動画・音声などの素材・フォント・その他のデータを項目ごとに含めるか選択できます。必要なものだけを含めて、ファイルを軽くすることもできます。受け取った.niashareファイルは、自分のプロジェクトとして複製して利用できます。",
    "narrative.save.7.heading": "環境まるごと、引き継ぐ。",
    "narrative.save.7.body": ".niatraでアプリ環境を移行。新しい端末へ乗り換えるときは、.niatra形式の引き継ぎ機能が使えます。設定や素材だけでなく、ブラシ・自動塗り設定・テーマ・フォント・その他のアプリ設定などをまとめて移行できます。引き継ぎたい項目はチェックボックスから個別に選択できます。",
    "narrative.save.8.heading": "",
    "narrative.save.8.body": "作品を渡すなら.niashare。制作環境を引き継ぐなら.niatra。用途に合わせて使い分けられます。",

    "narrative.workspace.1.heading": "自分に合った制作環境へ。",
    "narrative.workspace.1.body": "",
    "narrative.workspace.2.heading": "テーマ・外観設定",
    "narrative.workspace.2.body": "アプリ全体のテーマや差し色を自分好みにカスタマイズできます。毎日使うアプリだからこそ、自分が使いやすい見た目に。",
    "narrative.workspace.3.heading": "ワークスペース設定",
    "narrative.workspace.3.body": "PC・DeXモードへの切り替えや、作業環境に合わせた設定を用意。左利きモードにも対応しています。※左利きモードはスマートフォンモードでは利用できません。",
    "narrative.workspace.4.heading": "ジェスチャー設定",
    "narrative.workspace.4.body": "2本指タップ、3本指タップ、スワイプ、長押しなどにUndo・Redo・フレーム移動・スポイトなどの操作を割り当てられます。よく使う操作を自分の手に合わせてカスタマイズできます。",

    "narrative.export.1.heading": "つくった作品を、もっと広く届けよう",
    "narrative.export.1.body": "完成した作品は動画として書き出せます。MP4、WebM、GIFに対応。透過WebMなら、背景を透明にしたアニメーション素材として利用できます。キャンバスサイズには上限がありますが、その範囲内で作品に合わせたサイズや縦横比を設定できます。無料版では1作品あたり90秒まで。プレミアムでは1作品あたり最大2時間まで制作・書き出しできます。作品数そのものに制限はありません。",

    "narrative.premium.1.heading": "プレミアムでもっと自由に。",
    "narrative.premium.1.body": "プレミアムでは、制作だけでなく作品の公開もさらに快適になります。",
    "narrative.premium.2.heading": "",
    "narrative.premium.2.body": "無料版では、書き出した作品の最後にNIARIMのエンドカードが追加されます。プレミアムなら、作品ごとにエンドカードを削除したり、アプリの共通設定からエンドカードを追加しないように設定できます。コミュニティへの投稿も、無料版の1日1作品から1日3作品へ。たくさんつくって、たくさん届けられます。",

    "narrative.community.1.heading": "NIARIM作品広場",
    "narrative.community.1.body": "NIARIMでつくられた作品を、誰でも気軽にみられる場所です。ログインしなくても作品を閲覧できます。",
    "narrative.community.2.heading": "新着順で、最新作をチェック",
    "narrative.community.2.body": "投稿されたばかりの作品を新着順でチェック。まだ知られていない作品の中から、あなた好みの作品が見つかるかもしれません。",
    "narrative.community.3.heading": "ランキングで、今話題の作品をチェック",
    "narrative.community.3.body": "ランキングは1日2回更新。更新されたら、今注目されている作品をチェックしてみましょう。あなたが公開した作品がランキングに入っているかもしれません。",
    "narrative.community.4.heading": "キーワードで探す",
    "narrative.community.4.body": "気になる言葉で検索すれば、関連する作品を探せます。",
    "narrative.community.5.heading": "タグから探す",
    "narrative.community.5.body": "好きなジャンルや興味のあるテーマのタグから作品を探せます。そのとき流行しているコンテンツを探したり、自分の好きなジャンルを掘り下げたり。検索するほど、まだ知らなかった作品との出会いが広がります。",
    "narrative.community.6.heading": "作者から探す",
    "narrative.community.6.body": "気になる作品を見つけたら、その作者が公開しているほかの作品もチェックできます。お気に入りの作者を見つけて、新しい作品を追いかけることもできます。",
    "narrative.community.7.heading": "あなたの作品を投稿しよう。",
    "narrative.community.7.body": "完成した作品は、「NIARIM作品広場」に投稿できます。自分の作品を誰かにみてもらう。誰かが気に入ってブックマークしてくれるかもしれませんし、ランキングに入るかもしれません。無料会員は1日1作品まで。プレミアムなら1日3作品まで投稿できます。作品をつくったら、次は誰かに届けてみましょう。",
    "narrative.community.8.heading": "ログインもシンプルに。",
    "narrative.community.8.body": "NIARIM独自の会員登録は必要ありません。作品投稿、ブックマーク、通報・ブロックは、Googleアカウントでログインすると利用できます。作品をみるだけならログイン不要です。",
    "narrative.community.9.heading": "人から作品へ。作品から人へ。",
    "narrative.community.9.body": "誰かの作品をみて、新しいアイデアが生まれる。つくった作品を公開して、また誰かがそれをみる。「自分もつくってみたい」そんな気持ちが、次の作品につながっていきます。あなたの作品が、誰かのお気に入りになる。そして、その作品をみた誰かが、また新しい作品をつくる。"
  },
  "en": {
    "narrative.home.cta.heading": "Let's actually make an animation!",
    "narrative.home.cta.body": "The moment you feel like drawing, you can just start. Whether it's a single picture or a piece built from dozens of frames. Animate it by hand. Animate it with keyframes. Combine images and sound. Polish it all the way through and make it truly yours. And once it's done, take it to the NIARIM Gallery. Make it, publish it, discover it. Let's make an animation with NIARIM!",

    "narrative.drawing.1.heading": "Draw exactly what you have in mind.",
    "narrative.drawing.1.body": "Draw with a pen. Erase. Fill. Select. Transform. Switch between the tools you need to finish a single piece.",
    "narrative.drawing.2.heading": "Build a drawing feel that's yours.",
    "narrative.drawing.2.body": "Beyond switching between brushes like the G-pen, pen, and airbrush, you can fine-tune the brushes themselves.",
    "narrative.drawing.3.heading": "Brush settings",
    "narrative.drawing.3.body": "Adjust thickness and opacity, of course, plus fade, stroke decay, color mixing, and more. Blend colors together like watercolor, or fade out the end of a line. Adjust the feel of your strokes to match the way you draw.",
    "narrative.drawing.4.heading": "Pressure and tilt support",
    "narrative.drawing.4.body": "Pen tablets and pen displays let you use pressure and tilt. Adjust the pressure curve so a light touch can still draw a thick line, tailoring the feel of drawing to your own habits. You can also assign actions like eraser or eyedropper to your pen's buttons.",

    "narrative.animation.1.heading": "Let's make a hand-drawn animation!",
    "narrative.animation.1.body": "Draw one picture at a time and stack the frames. Check the onion skin to see the frames before and after, and refine how the motion connects. Organize frames and scenes on the timeline, and time the drawings to the sound. From the first stroke to the moment it moves, it's all done in NIARIM.",
    "narrative.animation.2.heading": "Canvas mode and Timeline mode",
    "narrative.animation.2.body": "NIARIM is split into a \"Canvas mode\" for drawing and a \"Timeline mode\" for animating. There's no need to bounce back and forth between a drawing app and a video editor. Draw, animate it right there, add sound, and finish. The whole creative flow is kept in a single app.",
    "narrative.animation.3.heading": "Not just hand-drawn. There's more than one way to express yourself.",
    "narrative.animation.3.body": "",
    "narrative.animation.4.heading": "Animate with keyframes",
    "narrative.animation.4.body": "Set a layer's position, scale, and rotation with keyframes. The frames in between are interpolated automatically, so you can create motion animation by moving parts. You can also group multiple layers together and move them as one. Camera keyframes let you set up camera work like pans and zooms, too.",
    "narrative.animation.5.heading": "Use images and video",
    "narrative.animation.5.body": "Place image or video material on the timeline and combine it with your hand-drawn art.",
    "narrative.animation.6.heading": "Stop motion, too",
    "narrative.animation.6.body": "Arrange images as frames to create stop-motion-style work as well. With hand-drawn animation at its core, you can combine a wide range of expressive techniques.",

    "narrative.audio.1.heading": "Time your drawings to the sound",
    "narrative.audio.1.body": "Place audio on the timeline and adjust volume and fade-in/fade-out. You can also drop timestamps as markers to check lip-sync or movement timing against the sound.",

    "narrative.editing.1.heading": "Refine every detail, right to the finish.",
    "narrative.editing.1.body": "Adjustments after drawing happen right inside NIARIM, too.",
    "narrative.editing.2.heading": "Layers",
    "narrative.editing.2.body": "Manage line art, color, and backgrounds as separate layers. Organize them into layer folders, or use clipping to keep strokes from spilling over. A wide range of blend modes is available, too — use multiply, screen, overlay, add, subtract, and more to create light and shadow.",
    "narrative.editing.3.heading": "Make animation more efficient.",
    "narrative.editing.3.body": "",
    "narrative.editing.4.heading": "Common layers",
    "narrative.editing.4.body": "A layer that shows the same content across multiple frames or scenes. You don't need to redraw fixed elements like backgrounds on every frame. You can even turn a character into a common layer while keeping just the mouth on a regular layer — the character stays put while only the mouth is redrawn frame by frame, giving you lip-sync.",
    "narrative.editing.5.heading": "Auto-fill",
    "narrative.editing.5.body": "Colors in each part automatically, using colors and tones you set in advance, based on the line art. For hand-drawn animation where the same character is drawn again and again, this greatly reduces the coloring workload. It also supports gradients, outlines, and color trace that blends into the line art. Note: auto-fill is not a generative-AI feature. It colors things in based on rules you set.",

    "narrative.advanced.1.heading": "Make your everyday work smoother.",
    "narrative.advanced.1.body": "",
    "narrative.advanced.2.heading": "Quick-switch tools",
    "narrative.advanced.2.body": "Register combinations of brushes and tools you use often, and switch between them with a single button. Build your own workflow for line art, coloring, finishing touches, and more.",
    "narrative.advanced.3.heading": "Favorites",
    "narrative.advanced.3.body": "Register the brushes, stamps, and more you use often as favorites. Pull up just what you need, instantly.",
    "narrative.advanced.4.heading": "Color picker",
    "narrative.advanced.4.body": "Switch between HSV and RGB to pick a color. Save colors you use often to a palette.",
    "narrative.advanced.5.heading": "Expand your expression with tones and stamps.",
    "narrative.advanced.5.body": "",
    "narrative.advanced.6.heading": "Tones",
    "narrative.advanced.6.body": "A tone carries no color information of its own, so it draws its pattern in whatever color you currently have selected. Combine dot patterns, line patterns, and more to finish your work.",
    "narrative.advanced.7.heading": "Stamps",
    "narrative.advanced.7.body": "A stamp's image carries its own color information. That means it's drawn in the stamp's own colors, regardless of what's selected on the color chip. Register effect lines, background patterns, props, and more, and place them instantly whenever you need them. Rotation and scaling are supported, too.",
    "narrative.advanced.8.heading": "Pixel mode",
    "narrative.advanced.8.body": "Apply pixel mode to brushes, fonts, and stamps. It removes anti-aliasing for a crisp, pixel-art look. You can even process a stamp in pixel mode to use it as pixel-art-style material.",
    "narrative.advanced.9.heading": "Draw filters",
    "narrative.advanced.9.body": "Apply a filter to each layer. Blur, sharpen, unsharp mask, tone curve, levels, vignette, noise, retro anime, CRT, anime-style, outline, pixelate, fisheye lens, and more. A lens-prescription filter can even reproduce how a scene distorts when viewed through lenses of different strengths.",
    "narrative.advanced.10.heading": "Effect filters",
    "narrative.advanced.10.body": "These are visual effects you can apply per frame or per scene. Since multiple frames can be processed together, you can add the same effect across an entire piece or a single scene. Layer on effects like noise or rain to finish the mood of the whole piece. Use a draw filter when you want to work on a layer directly; use an effect filter when you want to direct a whole frame or scene. Pick whichever fits what you're doing.",

    "narrative.save.1.heading": "Keep your work light. Keep creating comfortably.",
    "narrative.save.1.body": "In animation production, data grows larger as frame and layer counts increase. NIARIM provides a range of mechanisms to help you keep creating for the long haul.",
    "narrative.save.2.heading": "Quality settings",
    "narrative.save.2.body": "Choose from Low, Medium, or High quality, or use a custom setting. Fine-tune things like the save method, undo count, onion skin, and tilt detection to match your device's storage and specs. Whether you want to prioritize storage space, lighten performance, or keep more undo history, you can tune your own environment to fit.",
    "narrative.save.3.heading": "Autosave",
    "narrative.save.3.body": "In case the app ever closes unexpectedly, NIARIM autosaves for recovery.",
    "narrative.save.4.heading": "Save slots",
    "narrative.save.4.body": "Choose important states yourself and save them.",
    "narrative.save.5.heading": "Save tree",
    "narrative.save.5.body": "Branch off from a saved state to try a different creative direction. It's handy whenever you think, \"I want to go back to this point and try something different.\"",
    "narrative.save.6.heading": "Send your work to another device.",
    "narrative.save.6.body": "Share your project as a .niashare file. Move it to another device of your own, or hand a project over to someone else. When exporting, you can choose whether to include the project itself, materials like images/video/audio, fonts, and other data, item by item. Include only what you need to keep the file light. A received .niashare file can be duplicated and used as your own project.",
    "narrative.save.7.heading": "Carry your whole setup with you.",
    "narrative.save.7.body": "Use .niatra to migrate your app environment. When switching to a new device, the .niatra transfer feature has you covered. Beyond settings and materials, you can migrate brushes, auto-fill settings, themes, fonts, and other app settings all together. Pick exactly which items to carry over using checkboxes.",
    "narrative.save.8.heading": "",
    "narrative.save.8.body": "Use .niashare to hand off a piece of work; use .niatra to carry over your production environment. Pick whichever fits what you need.",

    "narrative.workspace.1.heading": "A workspace that fits you.",
    "narrative.workspace.1.body": "",
    "narrative.workspace.2.heading": "Theme & appearance settings",
    "narrative.workspace.2.body": "Customize the app's overall theme and accent color to your liking. It's an app you use every day, so make it look the way that works for you.",
    "narrative.workspace.3.heading": "Workspace settings",
    "narrative.workspace.3.body": "Switch between PC/DeX mode and adjust settings to fit your working style. Left-handed mode is supported, too. Note: left-handed mode isn't available in Smartphone mode.",
    "narrative.workspace.4.heading": "Gesture settings",
    "narrative.workspace.4.body": "Assign actions like undo, redo, frame navigation, or the eyedropper to two-finger tap, three-finger tap, swipe, long-press, and more. Customize the gestures you use often to fit your own hand.",

    "narrative.export.1.heading": "Share your work with more people.",
    "narrative.export.1.body": "Export finished work as video. MP4, WebM, and GIF are supported. Transparent WebM lets you export animation material with a transparent background. There's an upper limit on canvas size, but within that range you can set a size and aspect ratio that fits your work. The free version allows up to 90 seconds per piece; Premium lets you create and export up to 2 hours per piece. There's no limit on the number of pieces you can make.",

    "narrative.premium.1.heading": "More freedom with Premium.",
    "narrative.premium.1.body": "Premium makes not just creating, but also publishing your work, even more comfortable.",
    "narrative.premium.2.heading": "",
    "narrative.premium.2.body": "In the free version, the NIARIM end card is added to the end of every exported work. With Premium, you can remove the end card per piece, or set it in the app's shared settings so it's never added at all. Community posting also goes from 1 piece a day on the free plan to 3 a day. Make more, and share more.",

    "narrative.community.1.heading": "NIARIM Gallery",
    "narrative.community.1.body": "A place where anyone can casually browse work made with NIARIM. You can view work without logging in.",
    "narrative.community.2.heading": "Check the newest work, newest first",
    "narrative.community.2.body": "Check freshly posted work in order of newest first. You might find something you love among pieces nobody's discovered yet.",
    "narrative.community.3.heading": "Check what's trending on the rankings",
    "narrative.community.3.body": "The rankings update twice a day. Each time they update, take a look at what's getting attention right now. Your own published work might be on there.",
    "narrative.community.4.heading": "Search by keyword",
    "narrative.community.4.body": "Search a word you're curious about to find related work.",
    "narrative.community.5.heading": "Browse by tag",
    "narrative.community.5.body": "Browse work by genre or by a tag for a theme you're interested in. Discover whatever's trending right now, or dig deeper into your favorite genre. The more you search, the more you'll run into work you never knew existed.",
    "narrative.community.6.heading": "Find work by creator",
    "narrative.community.6.body": "Find a piece you like, and you can check out the other work its creator has published, too. Find a favorite creator and follow along as they post new work.",
    "narrative.community.7.heading": "Post your own work.",
    "narrative.community.7.body": "Finished work can be posted to the NIARIM Gallery. Let someone else see what you made. Someone might love it enough to bookmark it, and it might even land in the rankings. Free members can post up to 1 piece a day; Premium members up to 3. Once you've made something, it's time to share it with someone.",
    "narrative.community.8.heading": "Logging in stays simple, too.",
    "narrative.community.8.body": "There's no separate NIARIM account to register for. Posting work, bookmarking, and reporting/blocking are available once you log in with a Google account. You don't need to log in at all just to browse.",
    "narrative.community.9.heading": "From people to work. From work to people.",
    "narrative.community.9.body": "See someone's work, and a new idea is born. Publish what you made, and someone else sees it in turn. That feeling of \"I want to try making something too\" carries into the next piece. Your work becomes someone's favorite. And whoever saw it goes on to make something new of their own."
  }
};
  for (var lang in DATA) {
    if (!DICT[lang]) DICT[lang] = {};
    var entries = DATA[lang];
    for (var key in entries) {
      DICT[lang][key] = entries[key];
    }
  }
})();
