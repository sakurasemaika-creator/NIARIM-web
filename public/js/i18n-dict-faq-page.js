/**
 * NIARIM公式サイト /faq/ ページ追加項目 翻訳辞書
 *
 * - faq.a5: 「NIARIM作品広場」への投稿経路を正しく説明する（作品の共有・公開手段）。
 *   data-i18n-html を使うためリンクタグを含む。
 * - faq.a8: プレミアムプランページへのリンクを含める。同じくdata-i18n-htmlで使用。
 * - faq.q9/a9: 「NIARIM作品広場」に公開した作品のYouTube側の公開範囲・
 *   コメント可否・NIARIM内限定公開との違いを説明する新規項目。
 *   docs/AI設計書/29_動画投稿・ランキング機能仕様.md に基づく。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
  "ja": {
    "meta.faq.title": "よくある質問 | NIARIM",
    "meta.faq.description": "NIARIMに関するよくある質問と回答をまとめています。",
    "faq.a5.html":
      "書き出した動画ファイルは、お使いの端末やSNSアプリを通じて自由に共有いただけます。また、NIARIMアプリ内から直接YouTubeへ投稿することで、<a href=\"/community/\">「NIARIM作品広場」</a>に作品を公開することもできます。",
    "faq.q8": "プレミアムプランでは何ができますか？",
    "faq.a8.html":
      "広告非表示、エンドロゴの編集・削除、ユーザーウォーターマーク、トーンカーブ、レベル補正などをご利用いただけます。詳しくは<a href=\"/premium/\">プレミアムプランのページ</a>をご覧ください。",
    "faq.q9": "作品を「NIARIM作品広場」に公開すると、YouTubeでも誰でも見られてしまいますか？",
    "faq.a9":
      "「NIARIM作品広場」への公開は、NIARIMアプリ内からYouTubeへ動画を投稿することで行われます。その動画のYouTube側の公開範囲を「限定公開」に設定すれば、NIARIM作品広場内とURLを知っている人以外には表示されません。URLを知っている人にコメントされたくない場合は、YouTube側でコメントを無効にしておくと安心です。逆に、YouTubeには公開したまま「NIARIM作品広場」には載せたくない場合は、NIARIMアプリ内の投稿設定で「作品広場に公開しない」を選択すると、作品広場の一覧には表示されなくなります。"
  },
  "en": {
    "meta.faq.title": "FAQ | NIARIM",
    "meta.faq.description": "Frequently asked questions and answers about NIARIM.",
    "faq.a5.html":
      "You can freely share your exported video files through your device or other apps. You can also publish your work to the <a href=\"/community/\">NIARIM Gallery</a> by posting it to YouTube directly from within the NIARIM app.",
    "faq.q8": "What can I do with the Premium plan?",
    "faq.a8.html":
      "Premium removes ads and adds end-card editing/removal, a custom watermark, a tone curve, and levels adjustment. See the <a href=\"/premium/\">Premium plan page</a> for details.",
    "faq.q9": "If I publish my work to the NIARIM Gallery, can anyone see it on YouTube too?",
    "faq.a9":
      "Publishing to the NIARIM Gallery works by uploading your video to YouTube from inside the NIARIM app. If you set that video's YouTube visibility to \"Unlisted,\" it won't be visible to the public — only people browsing the NIARIM Gallery, or anyone with the direct link, can view it. If you don't want people who have the link to leave comments, you can disable comments on YouTube's side. Conversely, if you want to keep the video public on YouTube but keep it off the NIARIM Gallery, choose \"Don't publish to the Gallery\" in the app's posting settings — it just won't be listed in the Gallery."
  },
  "zh-Hans": {
    "meta.faq.title": "常见问题 | NIARIM",
    "meta.faq.description": "汇总了关于 NIARIM 的常见问题与解答。",
    "faq.a5.html":
      "导出的视频文件可以自由地通过设备或其他应用进行分享。您还可以在 NIARIM 应用内直接将作品投稿至 YouTube，从而发布到 <a href=\"/community/\">「NIARIM作品广场」</a>。",
    "faq.q8": "高级会员方案能做什么？",
    "faq.a8.html":
      "可移除广告、编辑或删除片尾标志、使用自定义水印、色调曲线、色阶调整等。详情请参阅<a href=\"/premium/\">高级会员方案页面</a>。",
    "faq.q9": "把作品发布到「NIARIM作品广场」后，在 YouTube 上是不是谁都能看到？",
    "faq.a9":
      "发布到「NIARIM作品广场」，是通过在 NIARIM 应用内将视频投稿至 YouTube 来实现的。如果将该视频的 YouTube 公开范围设置为「不公开列出」，则除了在 NIARIM 作品广场内浏览的人和知道链接的人之外，其他人都无法看到。如果不希望知道链接的人发表评论，可以在 YouTube 一侧关闭评论功能。反过来，如果希望在 YouTube 上保持公开，但不想出现在「NIARIM作品广场」中，只需在应用内的发布设置中选择「不发布到作品广场」，这样就不会出现在作品广场的列表中了。"
  },
  "zh-Hant": {
    "meta.faq.title": "常見問題 | NIARIM",
    "meta.faq.description": "彙整了關於 NIARIM 的常見問題與解答。",
    "faq.a5.html":
      "匯出的影片檔案可自由地透過裝置或其他應用程式進行分享。您也可以在 NIARIM 應用程式內直接將作品投稿至 YouTube，藉此發布到 <a href=\"/community/\">「NIARIM作品廣場」</a>。",
    "faq.q8": "高級會員方案能做什麼？",
    "faq.a8.html":
      "可移除廣告、編輯或刪除片尾標誌、使用自訂浮水印、色調曲線、色階調整等。詳情請參閱<a href=\"/premium/\">高級會員方案頁面</a>。",
    "faq.q9": "把作品發布到「NIARIM作品廣場」後，在 YouTube 上是不是任何人都能看到？",
    "faq.a9":
      "發布到「NIARIM作品廣場」，是透過在 NIARIM 應用程式內將影片投稿至 YouTube 來實現的。若將該影片的 YouTube 公開範圍設為「不公開放送」，除了在 NIARIM 作品廣場中瀏覽的人與知道連結的人之外，其他人都無法看到。若不希望知道連結的人留言，可以在 YouTube 端關閉留言功能。反之，若希望在 YouTube 上維持公開，卻不想出現在「NIARIM作品廣場」中，只需在應用程式內的發布設定選擇「不發布到作品廣場」，就不會出現在作品廣場的列表中。"
  },
  "ko": {
    "meta.faq.title": "자주 묻는 질문 | NIARIM",
    "meta.faq.description": "NIARIM에 관한 자주 묻는 질문과 답변을 정리했습니다.",
    "faq.a5.html":
      "내보낸 영상 파일은 사용 중인 기기나 다른 앱을 통해 자유롭게 공유하실 수 있습니다. 또한 NIARIM 앱 안에서 바로 YouTube에 작품을 업로드하여 <a href=\"/community/\">「NIARIM 작품 광장」</a>에 공개할 수도 있습니다.",
    "faq.q8": "프리미엄 플랜으로 무엇을 할 수 있나요?",
    "faq.a8.html":
      "광고 비표시, 엔드 카드 편집・삭제, 사용자 워터마크, 톤 커브, 레벨 보정 등을 이용하실 수 있습니다. 자세한 내용은 <a href=\"/premium/\">프리미엄 플랜 페이지</a>를 확인해 주세요.",
    "faq.q9": "작품을 「NIARIM 작품 광장」에 공개하면 YouTube에서도 누구나 볼 수 있게 되나요?",
    "faq.a9":
      "「NIARIM 작품 광장」 공개는 NIARIM 앱 안에서 YouTube로 영상을 업로드하는 방식으로 이루어집니다. 해당 영상의 YouTube 공개 범위를 「일부 공개」로 설정하면, NIARIM 작품 광장 안에서 보는 사람과 URL을 아는 사람 외에는 표시되지 않습니다. URL을 아는 사람에게 댓글을 받고 싶지 않다면 YouTube 쪽에서 댓글을 비활성화해 두면 안심할 수 있습니다. 반대로 YouTube에는 공개해 두면서 「NIARIM 작품 광장」에만 올리고 싶지 않다면, 앱 내 게시 설정에서 「작품 광장에 공개하지 않음」을 선택하면 작품 광장 목록에는 표시되지 않습니다."
  },
  "fr": {
    "meta.faq.title": "FAQ | NIARIM",
    "meta.faq.description": "Questions fréquentes et réponses à propos de NIARIM.",
    "faq.a5.html":
      "Vous pouvez partager librement vos fichiers vidéo exportés via votre appareil ou d'autres applications. Vous pouvez aussi publier votre œuvre dans la <a href=\"/community/\">« Galerie NIARIM »</a> en la postant directement sur YouTube depuis l'application NIARIM.",
    "faq.q8": "Que puis-je faire avec l'offre Premium ?",
    "faq.a8.html":
      "Premium supprime les publicités et ajoute l'édition/suppression du générique de fin, un filigrane personnalisé, une courbe de tons et le réglage des niveaux. Voir la <a href=\"/premium/\">page Premium</a> pour plus de détails.",
    "faq.q9": "Si je publie mon œuvre dans la Galerie NIARIM, tout le monde peut-il la voir aussi sur YouTube ?",
    "faq.a9":
      "Publier dans la Galerie NIARIM revient à mettre en ligne votre vidéo sur YouTube depuis l'application NIARIM. Si vous réglez la visibilité YouTube de la vidéo sur « Non répertoriée », elle ne sera visible que dans la Galerie NIARIM et par les personnes possédant le lien direct. Si vous ne voulez pas recevoir de commentaires de personnes ayant le lien, vous pouvez désactiver les commentaires côté YouTube. À l'inverse, si vous souhaitez garder la vidéo publique sur YouTube sans l'afficher dans la Galerie NIARIM, choisissez « Ne pas publier dans la Galerie » dans les paramètres de publication de l'application : elle n'apparaîtra alors pas dans la liste de la Galerie."
  },
  "es": {
    "meta.faq.title": "Preguntas frecuentes | NIARIM",
    "meta.faq.description": "Preguntas frecuentes y respuestas sobre NIARIM.",
    "faq.a5.html":
      "Puedes compartir libremente tus archivos de video exportados a través de tu dispositivo u otras apps. También puedes publicar tu obra en la <a href=\"/community/\">«Galería NIARIM»</a> subiéndola directamente a YouTube desde la app NIARIM.",
    "faq.q8": "¿Qué puedo hacer con el plan Premium?",
    "faq.a8.html":
      "Premium elimina los anuncios y añade edición/eliminación de la placa de cierre, marca de agua personalizada, curva de tonos y ajuste de niveles. Consulta la <a href=\"/premium/\">página de Premium</a> para más detalles.",
    "faq.q9": "Si publico mi obra en la Galería NIARIM, ¿podrá verla cualquiera también en YouTube?",
    "faq.a9":
      "Publicar en la Galería NIARIM consiste en subir tu video a YouTube desde dentro de la app NIARIM. Si configuras la visibilidad del video en YouTube como \"Oculto\", solo podrán verlo quienes naveguen la Galería NIARIM o quienes tengan el enlace directo. Si no quieres que quienes tengan el enlace puedan comentar, puedes desactivar los comentarios desde YouTube. Por el contrario, si quieres mantener el video público en YouTube pero no mostrarlo en la Galería NIARIM, elige \"No publicar en la Galería\" en los ajustes de publicación de la app: así no aparecerá en el listado de la Galería."
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
