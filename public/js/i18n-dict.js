/**
 * NIARIM公式サイト 翻訳辞書
 *
 * ja (日本語) を正本として作成し、他言語は日本語の意味を保つよう翻訳している。
 * 各言語の内容は実装後に日本語へ逆翻訳し、意図した表現になっているかを確認済み
 * (確認結果は README.md の「多言語対応について」を参照)。
 *
 * 法的文書(プライバシーポリシー・利用規約)の本文自体はここでは翻訳せず、
 * 日本語を正本としてHTMLに直接記述し、他言語では案内バナーのみ表示する。
 *
 * 他の i18n-dict-*.js と同様、既存のDICTへキーをマージする方式にしている
 * （<script>の読み込み順に依存して既存の翻訳を丸ごと上書きしないため）。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var BASE = {
  ja: {
    "nav.features": "機能",
    "nav.news": "お知らせ",
    "nav.faq": "よくある質問",
    "nav.contact": "お問い合わせ",
    "nav.download": "ダウンロード",
    "lang.switch": "言語を切り替える",

    "common.readMore": "詳しく見る",
    "common.backHome": "ホームへ戻る",

    "meta.home.title": "NIARIM（ニアリム）| 描く、動かす、物語にするアニメーション制作アプリ",
    "meta.home.description":
      "NIARIMは、自分の手で描いた絵を動かし、アニメーション作品として書き出せる制作アプリです。ペン・タイムライン・レイヤーで、あなたの物語を動かしましょう。",

    "hero.eyebrow": "Animation Creation App",
    "hero.title.line1": "描く。動かす。",
    "hero.title.line2": "みつける。",
    "hero.subtitle": "クリエイターと視聴者の境界を曖昧に。",
    "hero.lead":
      "NIARIMは、スマートフォンから本格的な手描きアニメーションをつくれる制作アプリです。一枚ずつ絵を描いて動かす手描きアニメーションはもちろん、キーフレームを使ったモーションアニメーションや、画像を組み合わせたストップモーションまで。描画からアニメーション、編集、音入れ、書き出しまで、一つのアプリで作品を完成させられます。",
    "hero.bridge.html":
      "そして、つくった作品は<a href=\"/community/\">「作品広場」</a>へ。誰かの作品をみて、次の作品をつくる。人から作品へ。作品から人へ。",
    "hero.cta.primary": "アプリをダウンロード",
    "hero.cta.secondary": "機能を見る",
    "hero.note": "対応端末・提供状況は Google Play のページをご確認ください。",

    "intro.eyebrow": "About NIARIM",
    "intro.title": "NIARIMとは",
    "intro.lead":
      "描いた絵の一枚一枚に、あなたの手で命を吹き込む。線を引く工程から動かし、仕上げるところまで、すべてをあなた自身の手で完結できる制作アプリです。",
    "intro.card1.title": "Drawing",
    "intro.card1.body":
      "Gペン・ペン・エアブラシなど複数のブラシと、色・透明度・ズームまで、描く工程にこだわりました。",
    "intro.card2.title": "Animation",
    "intro.card2.body":
      "フレームを重ね、タイムラインで編集し、プレビューしながら動きを組み立てられます。",
    "intro.card3.title": "Export",
    "intro.card3.body":
      "描いた作品は動画として書き出し、あなたの手で完成させ、共有できます。",

    "features.eyebrow": "Core Features",
    "features.title": "主要機能",
    "features.lead": "「あったら便利」と思う機能を、妥協なく全部詰め込みました。",
    "features.drawing.title": "思い通りに描ける、描画ツール",
    "features.drawing.body":
      "Gペン・ペン・エアブラシ・ユーザーペンなど、目的に合わせてブラシを使い分けられます。色選択・透明色・不透明度の調整、ズームやパンで細部まで描き込めます。",
    "features.animation.title": "フレームを重ねて、動きをつくる",
    "features.animation.body":
      "フレームの追加・編集をタイムライン上で管理し、アニメーションプレビューで動きを確認しながら制作できます。",
    "features.editing.title": "編集を、やり直せる自由さ",
    "features.editing.body":
      "塗りつぶしや許容値の調整、レイヤーで分けた管理で、納得のいくまで描き直せます。",
    "features.export.title": "作品を書き出し、届ける",
    "features.export.body":
      "最大1920×1920までの解像度、自由な縦横比の設定に対応し、完成した作品を動画として書き出せます。",
    "features.linkAll": "すべての機能を見る",

    "screenshots.eyebrow": "App Preview",
    "screenshots.title": "アプリ画面紹介",
    "screenshots.placeholder": "画面キャプチャ準備中",

    "download.title": "NIARIMを\nはじめよう",
    "download.body":
      "あなたの手で描いた絵を、あなたの手でアニメーションにする。今すぐNIARIMをダウンロードして、物語を動かしはじめましょう。",
    "download.cta.googlePlay": "Google Playで手に入れる",
    "download.cta.notReady": "近日公開予定",

    "faq.eyebrow": "FAQ",
    "faq.title": "よくある質問",
    "faq.q1": "NIARIMとは、どんなアプリですか？",
    "faq.a1":
      "NIARIMは、自分で描いた絵を自分の手で動かし、アニメーション作品として制作できるスマートフォン向けアプリです。",
    "faq.q2": "無料で使えますか？",
    "faq.a2":
      "料金プランの詳細は、Google Playのアプリページでご確認いただけます。",
    "faq.q3": "対応端末を教えてください。",
    "faq.a3":
      "対応OS・対応端末の詳細は、Google Playのアプリページに記載の情報をご確認ください。",
    "faq.q4": "作った作品を書き出せますか？",
    "faq.a4":
      "はい。最大1920×1920までの解像度、自由な縦横比で動画として書き出せます。",
    "faq.q5": "作った作品を共有できますか？",
    "faq.q6": "アカウント登録は必要ですか？",
    "faq.a6":
      "アカウントの要否については、正式リリース時の仕様をご確認ください。",
    "faq.q7": "不具合や要望はどこに連絡すればいいですか？",
    "faq.a7":
      "このサイトのお問い合わせフォームから、不具合報告・機能要望などをお送りください。",

    "cta.title": "あなたの物語を、動かそう。",
    "cta.body": "NIARIMで、次のアニメーション作品をはじめましょう。",

    "footer.tagline": "Animation made by your hands.",
    "footer.product": "Product",
    "footer.support": "Support",
    "footer.legal": "Legal",
    "footer.privacy": "プライバシーポリシー",
    "footer.terms": "利用規約",
    "footer.x": "X（旧Twitter）",
    "footer.rights": "All Rights Reserved.",

    "contact.eyebrow": "Contact",
    "contact.title": "お問い合わせ",
    "contact.lead":
      "不具合報告・機能要望・使い方に関するご質問は、まず公式Xへお気軽にご連絡ください。",
    "contact.channel.title": "まずは公式Xへ",
    "contact.channel.body":
      "不具合報告・機能要望・使い方のご質問は、公式Xへのリプライやダイレクトメッセージでお気軽にどうぞ。",
    "contact.channel.link": "公式Xでお問い合わせ",
    "contact.personalNote":
      "アカウントやメールアドレスなど、個人情報に関わるお問い合わせは、Xではお答えできません。恐れ入りますが、右記のフォームからご連絡ください。",
    "contact.personalNote.formNote": "※⁠フォームの内容はメールで受け付けます。",
    "contact.form.type": "お問い合わせ種別",
    "contact.form.type.bug": "不具合報告",
    "contact.form.type.request": "機能要望",
    "contact.form.type.usage": "使い方について",
    "contact.form.type.account": "アカウントについて",
    "contact.form.type.other": "その他",
    "contact.form.name": "お名前",
    "contact.form.namePlaceholder": "例）ニアリ 太郎",
    "contact.form.email": "メールアドレス",
    "contact.form.emailPlaceholder": "例）example@niarim.com",
    "contact.form.message": "お問い合わせ内容",
    "contact.form.messagePlaceholder": "できるだけ詳しくご記入ください",
    "contact.form.messageHint": "1,000文字以内でご記入ください。",
    "contact.form.attachments": "画像・動画を添付する（任意）",
    "contact.form.attachmentsHint":
      "画像は1枚5MBまで、動画は1本15MBまで、合計20MB・最大3件まで添付できます（PNG・JPEG・WebP・GIF、MP4・MOV・WebM）。",
    "contact.error.attachments": "添付ファイルの件数またはサイズが上限を超えています。",
    "contact.form.agree.pre": "",
    "contact.form.agree.link": "プライバシーポリシー",
    "contact.form.agree.post": "に同意のうえ送信する",
    "contact.form.submit": "送信する",
    "contact.form.submitting": "送信中...",
    "contact.error.required": "この項目は必須です。",
    "contact.error.email": "メールアドレスの形式が正しくありません。",
    "contact.error.tooLong": "文字数が上限を超えています。",
    "contact.error.agree": "プライバシーポリシーへの同意が必要です。",
    "contact.status.successTitle": "お問い合わせを受け付けました。",
    "contact.status.successBody":
      "ご連絡ありがとうございます。内容を確認のうえ、必要に応じてご返信いたします。",
    "contact.status.errorTitle": "送信できませんでした。",
    "contact.status.errorBody": "時間をおいて、もう一度お試しください。",
    "contact.status.rateLimitBody":
      "短時間に送信が集中しています。しばらく時間をおいてお試しください。",

    "meta.contact.title": "お問い合わせ | NIARIM",
    "meta.contact.description":
      "NIARIMへのお問い合わせはこちらから。不具合報告・機能要望・使い方に関するご質問を受け付けています。",

    "meta.features.title": "機能紹介 | NIARIM",
    "meta.features.description":
      "NIARIMの描画・アニメーション・編集・音声・書き出し機能をご紹介します。",
    "featuresPage.eyebrow": "Features",
    "featuresPage.title": "NIARIMでできること",
    "featuresPage.lead":
      "描く工程から、動かし、書き出すところまで。制作の全工程をNIARIMがサポートします。",
    "featuresPage.nav.drawing": "描画",
    "featuresPage.nav.animation": "アニメーション",
    "featuresPage.nav.editing": "編集",
    "featuresPage.nav.audio": "音声",
    "featuresPage.nav.export": "書き出し",

    "featuresPage.drawing.title": "Drawing｜描画",
    "featuresPage.drawing.lead": "目的に合わせて選べる、複数のブラシと描画設定。",
    "featuresPage.drawing.item1.title": "Gペン",
    "featuresPage.drawing.item1.body": "強弱のついた、輪郭線に向いたペン。",
    "featuresPage.drawing.item2.title": "ペン",
    "featuresPage.drawing.item2.body": "均一な線を描ける、標準的なペン。",
    "featuresPage.drawing.item3.title": "エアブラシ",
    "featuresPage.drawing.item3.body": "やわらかいグラデーションを表現できます。",
    "featuresPage.drawing.item4.title": "ユーザーペン",
    "featuresPage.drawing.item4.body": "自分好みの描き心地に調整できます。",
    "featuresPage.drawing.item5.title": "色選択・透明色",
    "featuresPage.drawing.item5.body": "自由な色選択と、透明色による消しゴム的な描画に対応。",
    "featuresPage.drawing.item6.title": "不透明度",
    "featuresPage.drawing.item6.body": "ブラシの不透明度を細かく調整できます。",
    "featuresPage.drawing.item7.title": "ズーム・パン",
    "featuresPage.drawing.item7.body": "細部まで拡大して描き込めます。",
    "featuresPage.drawing.item8.title": "消しゴム",
    "featuresPage.drawing.item8.body": "描いた線を部分的に消せる、標準的な消しゴムです。",
    "featuresPage.drawing.item9.title": "バケツ・投げ縄塗り",
    "featuresPage.drawing.item9.body": "囲まれた範囲を塗りつぶす「バケツ」と、なげなわで囲んだ範囲を塗る「投げ縄塗り」に対応しています。",
    "featuresPage.drawing.item10.title": "スポイト",
    "featuresPage.drawing.item10.body": "キャンバス上の色を吸い取って、そのまま描画色に設定できます。",
    "featuresPage.drawing.item11.title": "選択ツール",
    "featuresPage.drawing.item11.body": "矩形やなげなわで範囲を選択し、移動・変形・削除などの編集ができます。",
    "featuresPage.drawing.item12.title": "指ツール（歪み）",
    "featuresPage.drawing.item12.body": "指でなぞるように色をぼかしたり、絵を歪ませたりできます。",
    "featuresPage.drawing.item13.title": "図形ツール",
    "featuresPage.drawing.item13.body": "直線・円・四角形など、きれいな図形をワンタッチで描けます。",
    "featuresPage.drawing.item14.title": "ブラシの詳細設定",
    "featuresPage.drawing.item14.body": "フェード・ストローク減衰・混色・筆圧カーブなど、ブラシの描き味を細部までカスタマイズできます。",

    "featuresPage.animation.title": "Animation｜アニメーション",
    "featuresPage.animation.lead": "フレームを重ね、タイムラインで動きを組み立てます。",
    "featuresPage.animation.item1.title": "フレーム",
    "featuresPage.animation.item1.body": "一枚ずつフレームを追加し、絵を積み重ねます。",
    "featuresPage.animation.item2.title": "タイムライン",
    "featuresPage.animation.item2.body": "フレームだけでなく、画像・動画・音声・共通レイヤー・カメラキーフレームなどを一つのタイムラインで管理できます。シーンを分けて作品を整理することもできます。",
    "featuresPage.animation.item3.title": "フレーム編集",
    "featuresPage.animation.item3.body": "任意のフレームを選び、描き直せます。",
    "featuresPage.animation.item4.title": "アニメーションプレビュー",
    "featuresPage.animation.item4.body": "制作中の動きを、いつでも確認できます。",
    "featuresPage.animation.item5.title": "カメラワーク（キーフレームアニメーション）",
    "featuresPage.animation.item5.body": "XY移動・拡大・回転をキーフレームで指定すると、なめらかなカメラワークを自動で補間してくれます。レイヤー自体を描き直す必要はありません。",
    "featuresPage.animation.item6.title": "レイヤーグループ",
    "featuresPage.animation.item6.body": "複数のレイヤーをグループ化すれば、1つのキーフレームでまとめて動かせます。",

    "featuresPage.editing.title": "Editing｜編集",
    "featuresPage.editing.lead": "納得がいくまで描き直せる、編集の自由さ。",
    "featuresPage.editing.item1.title": "レイヤーを分けて描き直せる",
    "featuresPage.editing.item1.body": "線画・色・背景などをレイヤーで分けておけば、色だけをやり直したいときも線画に手を加えずに調整できます。",
    "featuresPage.editing.item2.title": "塗りつぶし",
    "featuresPage.editing.item2.body": "囲まれた領域を素早く塗りつぶせます。",
    "featuresPage.editing.item3.title": "許容値",
    "featuresPage.editing.item3.body": "塗りつぶし範囲の許容値を調整できます。",
    "featuresPage.editing.item4.title": "レイヤー",
    "featuresPage.editing.item4.body": "要素ごとにレイヤーを分けて管理できます。",
    "featuresPage.editing.item5.title": "共通レイヤー",
    "featuresPage.editing.item5.body": "背景など複数フレームで使い回したい絵を1枚にまとめておけば、変更がすべてのフレームへ自動的に反映されます。",
    "featuresPage.editing.item6.title": "ブレンドモード",
    "featuresPage.editing.item6.body": "乗算・スクリーンなど、レイヤー同士の重なり方を変えて表現の幅を広げられます。",
    "featuresPage.editing.item7.title": "クリッピング",
    "featuresPage.editing.item7.body": "下のレイヤーの形に合わせて、上のレイヤーの描画をその範囲だけに制限できます。",
    "featuresPage.editing.item8.title": "自由変形・メッシュ変形",
    "featuresPage.editing.item8.body": "描いた絵を自由変形やメッシュ変形で、狙った形へ細かく調整できます。メッシュ変形では、最大10×10の格子を使って、レイヤーを自由に変形できます。",

    "featuresPage.audio.title": "Audio｜音声",
    "featuresPage.audio.lead": "作品に音を添える、基本的な音声機能。",
    "featuresPage.audio.item1.title": "音声の追加",
    "featuresPage.audio.item1.body": "作品に音声ファイルを追加できます。",
    "featuresPage.audio.item2.title": "音量",
    "featuresPage.audio.item2.body": "音量を調整できます。",
    "featuresPage.audio.item3.title": "開始フレーム",
    "featuresPage.audio.item3.body": "音声を再生し始めるフレームを指定できます。",
    "featuresPage.audio.item4.title": "フェードイン・フェードアウト",
    "featuresPage.audio.item4.body": "音声の始まりと終わりを滑らかに調整できます。",
    "featuresPage.audio.item5.title": "タイムスタンプ",
    "featuresPage.audio.item5.body": "特定のフレームにコメント付きの目印を打てます。音に合わせた口パクや動きのタイミングを確認する目印として使えます。",
    "featuresPage.audio.item6.title": "波形表示",
    "featuresPage.audio.item6.body": "音声クリップに波形が薄く重ねて表示され、音の強弱を見ながらタイムライン上の配置を調整できます。",

    "featuresPage.export.title": "Export｜書き出し",
    "featuresPage.export.lead": "完成した作品を、動画として届けます。",
    "featuresPage.export.item1.title": "解像度",
    "featuresPage.export.item1.body": "最大1920×1920までの解像度で書き出せます。",
    "featuresPage.export.item2.title": "縦横比",
    "featuresPage.export.item2.body": "縦横比を自由に設定できます。",
    "featuresPage.export.item3.title": "動画書き出し",
    "featuresPage.export.item3.body": "制作した作品を動画ファイルとして書き出せます。",
    "featuresPage.export.item4.title": "書き出し形式",
    "featuresPage.export.item4.body": "MP4・WebM・GIF・AVIに対応。透過WebMなら、背景を透明にしたアニメーション素材として利用できます。",
    "featuresPage.export.item5.title": "制作・書き出し時間の上限",
    "featuresPage.export.item5.body": "キャンバスサイズには上限がありますが、その範囲内で作品に合わせたサイズや縦横比を設定できます。無料版では1作品あたり90秒まで、プレミアムでは1作品あたり最大2時間まで制作・書き出しできます。作品数そのものに制限はありません。",

    "meta.news.title": "お知らせ | NIARIM",
    "meta.news.description": "NIARIMの正式リリース・アップデート・メンテナンス情報をお知らせします。",
    "newsPage.eyebrow": "News",
    "newsPage.title": "お知らせ",
    "newsPage.lead": "正式リリース・アップデート・メンテナンス情報などを、こちらでお知らせします。",
    "newsPage.empty": "現在、公開中のお知らせはありません。新しい情報が入り次第、こちらに掲載します。",

    "meta.privacy.title": "プライバシーポリシー | NIARIM",
    "meta.privacy.description": "NIARIM公式サイトおよびアプリのプライバシーポリシーです。",
    "legal.updated": "最終更新日：2026年8月26日",
    "legal.notice.privacy":
      "この文書は日本語を正本としています。表示言語を変更した場合も、本文は日本語で表示されます。",
    "legal.notice.terms":
      "この文書は日本語を正本としています。表示言語を変更した場合も、本文は日本語で表示されます。",

    "meta.terms.title": "利用規約 | NIARIM",
    "meta.terms.description": "NIARIM公式サイトおよびアプリの利用規約です。",

    "meta.404.title": "ページが見つかりません | NIARIM",
    "error404.eyebrow": "404",
    "error404.title": "このフレームは見つかりませんでした。",
    "error404.body":
      "お探しのページは、移動または削除された可能性があります。URLをご確認いただくか、ホームからやり直してください。",
    "error404.cta": "ホームへ戻る",
  },

  en: {
    "nav.features": "Features",
    "nav.news": "News",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.download": "Download",
    "lang.switch": "Change language",

    "common.readMore": "Learn more",
    "common.backHome": "Back to home",

    "meta.home.title": "NIARIM | An animation app for drawing, moving, and telling your story",
    "meta.home.description":
      "NIARIM is a creation app that turns the pictures you draw, frame by frame, into animation you export yourself. Drawing, a timeline, and layers bring your story to life.",

    "hero.eyebrow": "Animation Creation App",
    "hero.title.line1": "Draw. Move.",
    "hero.title.line2": "Discover.",
    "hero.subtitle": "Blurring the line between creators and viewers.",
    "hero.lead":
      "NIARIM is an app for creating full hand-drawn animation right from your smartphone. Draw and move one picture at a time, animate with keyframes, or even combine still images into stop motion. From drawing to animation, editing, sound, and export — finish your work in one single app.",
    "hero.bridge.html":
      "And once it's made, bring it to <a href=\"/community/\">the “Gallery.”</a> See someone else's work, and make your next one. From people to work. From work to people.",
    "hero.cta.primary": "Download the App",
    "hero.cta.secondary": "See the Features",
    "hero.note": "Please check the Google Play page for supported devices and availability.",

    "intro.eyebrow": "About NIARIM",
    "intro.title": "What is NIARIM",
    "intro.lead":
      "NIARIM lets you breathe life into every picture you draw, frame by frame — from the first line, to the motion, to the finished piece, all done with your own hands.",
    "intro.card1.title": "Drawing",
    "intro.card1.body":
      "Multiple brushes plus color, opacity, zoom, and pan — every drawing step is built with care.",
    "intro.card2.title": "Animation",
    "intro.card2.body":
      "Stack frames, edit them on a timeline, and preview the motion as you build it.",
    "intro.card3.title": "Export",
    "intro.card3.body":
      "Export what you've drawn as a video, finish it in your own hands, and share it.",

    "features.eyebrow": "Core Features",
    "features.title": "Core Features",
    "features.lead": "We packed in every feature we thought would be handy, without compromise.",
    "features.drawing.title": "Draw exactly the way you want",
    "features.drawing.body":
      "Switch between the G-pen, pen, airbrush, and a customizable user pen. Adjust color, transparency, and opacity, and zoom or pan in for fine detail.",
    "features.animation.title": "Build motion by stacking frames",
    "features.animation.body":
      "Add and edit frames on a timeline, and preview the animation as you work.",
    "features.editing.title": "Freedom to redo as many times as you like",
    "features.editing.body":
      "Fill with adjustable tolerance and layer-separated management let you keep refining until it's right.",
    "features.export.title": "Export and share your work",
    "features.export.body":
      "Export at resolutions up to 1920×1920, with a freely configurable aspect ratio.",
    "features.linkAll": "See all features",

    "screenshots.eyebrow": "App Preview",
    "screenshots.title": "App Screens",
    "screenshots.placeholder": "Screenshots coming soon",

    "download.title": "Start creating with NIARIM.",
    "download.body":
      "Turn what you've drawn into animation, with your own hands. Download NIARIM now and start moving your story.",
    "download.cta.googlePlay": "Get it on Google Play",
    "download.cta.notReady": "Coming soon",

    "faq.eyebrow": "FAQ",
    "faq.title": "Frequently Asked Questions",
    "faq.q1": "What kind of app is NIARIM?",
    "faq.a1":
      "NIARIM is a mobile app for creating animation from artwork you draw and move yourself.",
    "faq.q2": "Is it free to use?",
    "faq.a2":
      "Pricing details are available on the Google Play listing.",
    "faq.q3": "Which devices are supported?",
    "faq.a3":
      "Please check the Google Play listing for supported OS versions and devices.",
    "faq.q4": "Can I export what I've made?",
    "faq.a4":
      "Yes. You can export your work as video, at resolutions up to 1920×1920, with a freely configurable aspect ratio.",
    "faq.q5": "Can I share what I've made?",
    "faq.q6": "Do I need to create an account?",
    "faq.a6": "Please check the official launch specification for this.",
    "faq.q7": "Where can I report a bug or request a feature?",
    "faq.a7": "Please use the contact form on this site to send bug reports or feature requests.",

    "cta.title": "Set your story in motion.",
    "cta.body": "Start your next animation with NIARIM.",

    "footer.tagline": "Animation made by your hands.",
    "footer.product": "Product",
    "footer.support": "Support",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.x": "X (formerly Twitter)",
    "footer.rights": "All Rights Reserved.",

    "contact.eyebrow": "Contact",
    "contact.title": "Contact Us",
    "contact.lead":
      "For bug reports, feature requests, or questions about how to use the app, please reach out to us on X first.",
    "contact.channel.title": "Start with official X",
    "contact.channel.body":
      "For bug reports, feature requests, or questions about how to use the app, feel free to reply or send a direct message to our official X account.",
    "contact.channel.link": "Contact us on X",
    "contact.personalNote":
      "We can't handle inquiries involving personal information, such as your account or email address, on X. Please use the form on the right instead.",
    "contact.personalNote.formNote": "※ Submissions are received by email.",
    "contact.form.type": "Inquiry type",
    "contact.form.type.bug": "Bug report",
    "contact.form.type.request": "Feature request",
    "contact.form.type.usage": "How to use the app",
    "contact.form.type.account": "About your account",
    "contact.form.type.other": "Other",
    "contact.form.name": "Name",
    "contact.form.namePlaceholder": "e.g. Taro Niari",
    "contact.form.email": "Email address",
    "contact.form.emailPlaceholder": "e.g. example@niarim.com",
    "contact.form.message": "Message",
    "contact.form.messagePlaceholder": "Please share as much detail as you can.",
    "contact.form.messageHint": "Please keep it within 1,000 characters.",
    "contact.form.attachments": "Attach images or videos (optional)",
    "contact.form.attachmentsHint":
      "Up to 5MB per image, up to 15MB per video, 20MB total, and up to 3 files (PNG, JPEG, WebP, GIF, MP4, MOV, or WebM).",
    "contact.error.attachments": "Too many files, or the total size exceeds the limit.",
    "contact.form.agree.pre": "I agree to the",
    "contact.form.agree.link": "Privacy Policy",
    "contact.form.agree.post": "and consent to submit this form",
    "contact.form.submit": "Send",
    "contact.form.submitting": "Sending...",
    "contact.error.required": "This field is required.",
    "contact.error.email": "Please enter a valid email address.",
    "contact.error.tooLong": "This exceeds the character limit.",
    "contact.error.agree": "You must agree to the Privacy Policy.",
    "contact.status.successTitle": "Your message has been received.",
    "contact.status.successBody":
      "Thank you for reaching out. We'll review your message and reply if needed.",
    "contact.status.errorTitle": "Something went wrong.",
    "contact.status.errorBody": "Please wait a moment and try again.",
    "contact.status.rateLimitBody":
      "Too many submissions in a short time. Please wait a while and try again.",

    "meta.contact.title": "Contact | NIARIM",
    "meta.contact.description":
      "Get in touch with the NIARIM team for bug reports, feature requests, or usage questions.",

    "meta.features.title": "Features | NIARIM",
    "meta.features.description":
      "Explore NIARIM's drawing, animation, editing, audio, and export features.",
    "featuresPage.eyebrow": "Features",
    "featuresPage.title": "What You Can Do with NIARIM",
    "featuresPage.lead":
      "From drawing to animating to exporting — NIARIM supports every step of the creation process.",
    "featuresPage.nav.drawing": "Drawing",
    "featuresPage.nav.animation": "Animation",
    "featuresPage.nav.editing": "Editing",
    "featuresPage.nav.audio": "Audio",
    "featuresPage.nav.export": "Export",

    "featuresPage.drawing.title": "Drawing",
    "featuresPage.drawing.lead": "Multiple brushes and drawing settings for every purpose.",
    "featuresPage.drawing.item1.title": "G-pen",
    "featuresPage.drawing.item1.body": "A pressure-sensitive pen well suited to outlines.",
    "featuresPage.drawing.item2.title": "Pen",
    "featuresPage.drawing.item2.body": "A standard pen that draws even, uniform lines.",
    "featuresPage.drawing.item3.title": "Airbrush",
    "featuresPage.drawing.item3.body": "Create soft gradients.",
    "featuresPage.drawing.item4.title": "User pen",
    "featuresPage.drawing.item4.body": "Fine-tune the feel to match your own style.",
    "featuresPage.drawing.item5.title": "Color & transparent color",
    "featuresPage.drawing.item5.body": "Free color picking, plus an eraser-like transparent color.",
    "featuresPage.drawing.item6.title": "Opacity",
    "featuresPage.drawing.item6.body": "Fine-tune brush opacity.",
    "featuresPage.drawing.item7.title": "Zoom & pan",
    "featuresPage.drawing.item7.body": "Zoom in for fine detail work.",
    "featuresPage.drawing.item8.title": "Eraser",
    "featuresPage.drawing.item8.body": "A standard eraser for removing parts of what you've drawn.",
    "featuresPage.drawing.item9.title": "Bucket & lasso fill",
    "featuresPage.drawing.item9.body": "Fill an enclosed area with the “bucket,” or a lassoed area with “lasso fill.”",
    "featuresPage.drawing.item10.title": "Eyedropper",
    "featuresPage.drawing.item10.body": "Pick up a color from the canvas and set it as your drawing color instantly.",
    "featuresPage.drawing.item11.title": "Selection tool",
    "featuresPage.drawing.item11.body": "Select an area with a rectangle or lasso, then move, transform, or delete it.",
    "featuresPage.drawing.item12.title": "Finger tool (distortion)",
    "featuresPage.drawing.item12.body": "Smudge colors or distort your drawing as if tracing it with a finger.",
    "featuresPage.drawing.item13.title": "Shape tool",
    "featuresPage.drawing.item13.body": "Draw clean lines, circles, and rectangles with a single tap.",
    "featuresPage.drawing.item14.title": "Detailed brush settings",
    "featuresPage.drawing.item14.body": "Fine-tune your brush feel with fade, stroke decay, color mixing, pressure curves, and more.",

    "featuresPage.animation.title": "Animation",
    "featuresPage.animation.lead": "Stack frames and build motion on a timeline.",
    "featuresPage.animation.item1.title": "Frames",
    "featuresPage.animation.item1.body": "Add frames one at a time, building up your artwork.",
    "featuresPage.animation.item2.title": "Timeline",
    "featuresPage.animation.item2.body": "Manage more than just frames on one timeline — images, video, audio, common layers, and camera keyframes all live there too. You can also split your work into scenes to keep it organized.",
    "featuresPage.animation.item3.title": "Frame editing",
    "featuresPage.animation.item3.body": "Select any frame and redraw it.",
    "featuresPage.animation.item4.title": "Animation preview",
    "featuresPage.animation.item4.body": "Check your motion at any point while you work.",
    "featuresPage.animation.item5.title": "Camera work (keyframe animation)",
    "featuresPage.animation.item5.body": "Set position, zoom, and rotation as keyframes, and the app smoothly interpolates the camera movement for you — no need to redraw the layer itself.",
    "featuresPage.animation.item6.title": "Layer groups",
    "featuresPage.animation.item6.body": "Group multiple layers together and move them all at once with a single keyframe.",

    "featuresPage.editing.title": "Editing",
    "featuresPage.editing.lead": "The freedom to redo your work until it feels right.",
    "featuresPage.editing.item1.title": "Redraw freely with separate layers",
    "featuresPage.editing.item1.body": "Keep line art, color, and backgrounds on separate layers, so you can redo just the coloring without touching the line art.",
    "featuresPage.editing.item2.title": "Fill",
    "featuresPage.editing.item2.body": "Quickly fill in enclosed areas.",
    "featuresPage.editing.item3.title": "Tolerance",
    "featuresPage.editing.item3.body": "Adjust the tolerance used for fill areas.",
    "featuresPage.editing.item4.title": "Layers",
    "featuresPage.editing.item4.body": "Manage elements separately with layers.",
    "featuresPage.editing.item5.title": "Common layers",
    "featuresPage.editing.item5.body": "Keep artwork you reuse across multiple frames — like a background — on one shared layer, and any change reflects automatically across every frame.",
    "featuresPage.editing.item6.title": "Blend modes",
    "featuresPage.editing.item6.body": "Change how layers combine, with modes like multiply and screen, to broaden your range of expression.",
    "featuresPage.editing.item7.title": "Clipping",
    "featuresPage.editing.item7.body": "Restrict a layer's drawing to the shape of the layer beneath it.",
    "featuresPage.editing.item8.title": "Free & mesh transform",
    "featuresPage.editing.item8.body": "Fine-tune the shape of your artwork with free transform and mesh transform. Mesh transform uses a grid of up to 10×10 to freely reshape a layer.",

    "featuresPage.audio.title": "Audio",
    "featuresPage.audio.lead": "Basic audio features to add sound to your work.",
    "featuresPage.audio.item1.title": "Add audio",
    "featuresPage.audio.item1.body": "Add an audio file to your project.",
    "featuresPage.audio.item2.title": "Volume",
    "featuresPage.audio.item2.body": "Adjust the volume.",
    "featuresPage.audio.item3.title": "Start frame",
    "featuresPage.audio.item3.body": "Specify which frame the audio starts playing from.",
    "featuresPage.audio.item4.title": "Fade in & fade out",
    "featuresPage.audio.item4.body": "Smooth out the start and end of your audio.",
    "featuresPage.audio.item5.title": "Timestamps",
    "featuresPage.audio.item5.body": "Drop a commented marker on a specific frame — handy as a reference point for lip-syncing or timing movement to sound.",
    "featuresPage.audio.item6.title": "Waveform display",
    "featuresPage.audio.item6.body": "Audio clips show a faint waveform overlay, letting you adjust their placement on the timeline while seeing the sound's loudness.",

    "featuresPage.export.title": "Export",
    "featuresPage.export.lead": "Deliver your finished work as a video.",
    "featuresPage.export.item1.title": "Resolution",
    "featuresPage.export.item1.body": "Export at resolutions up to 1920×1920.",
    "featuresPage.export.item2.title": "Aspect ratio",
    "featuresPage.export.item2.body": "Set the aspect ratio freely.",
    "featuresPage.export.item3.title": "Video export",
    "featuresPage.export.item3.body": "Export your finished work as a video file.",
    "featuresPage.export.item4.title": "Export formats",
    "featuresPage.export.item4.body": "Supports MP4, WebM, GIF, and AVI. Transparent WebM lets you use your work as animation material with a see-through background.",
    "featuresPage.export.item5.title": "Time limit per work",
    "featuresPage.export.item5.body": "Canvas size has an upper limit, but within it you can set the size and aspect ratio to fit your work. The free plan supports up to 90 seconds per work; Premium supports up to 2 hours per work. There's no limit on the number of works you can make.",

    "meta.news.title": "News | NIARIM",
    "meta.news.description": "Official launch, update, and maintenance announcements for NIARIM.",
    "newsPage.eyebrow": "News",
    "newsPage.title": "News",
    "newsPage.lead": "Official launch, update, and maintenance announcements will be posted here.",
    "newsPage.empty": "There are no announcements at this time. New updates will be posted here.",

    "meta.privacy.title": "Privacy Policy | NIARIM",
    "meta.privacy.description": "The privacy policy for the NIARIM official site and app.",
    "legal.updated": "Last updated: August 26, 2026",
    "legal.notice.privacy":
      "The Japanese version of this document is authoritative. The body text below is shown in Japanese regardless of the selected display language.",
    "legal.notice.terms":
      "The Japanese version of this document is authoritative. The body text below is shown in Japanese regardless of the selected display language.",

    "meta.terms.title": "Terms of Service | NIARIM",
    "meta.terms.description": "The terms of service for the NIARIM official site and app.",

    "meta.404.title": "Page Not Found | NIARIM",
    "error404.eyebrow": "404",
    "error404.title": "This frame couldn't be found.",
    "error404.body":
      "The page you're looking for may have been moved or removed. Please check the URL, or start again from the home page.",
    "error404.cta": "Back to home",
  },
  };
  for (var lang in BASE) {
    DICT[lang] = Object.assign(DICT[lang] || {}, BASE[lang]);
  }
})();
