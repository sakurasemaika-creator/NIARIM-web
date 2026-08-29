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
      "「NIARIM作品広場」への公開は、NIARIMアプリ内からYouTubeへ動画を投稿することで行われますが、NIARIM作品広場での公開・非公開はYouTube側の公開範囲とは独立した設定です。YouTube側を「限定公開」にしていても、NIARIMアプリ内の作品広場では通常どおり公開・再生でき、YouTube側の検索やおすすめには表示されにくくなります（URLを知っている人だけが直接YouTube上でも視聴できる状態です）。逆に、YouTube側を「非公開」にしたり動画を削除したりすると、再生用URLが機能しなくなるため、NIARIM側の公開設定に関わらず作品広場での表示は自動的に停止します（NIARIM側の公開設定自体は保持されるため、YouTube側の状態を戻せば表示も自動的に復帰します）。URLを知っている人にコメントされたくない場合は、YouTube側でコメントを無効にしておくと安心です。"
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
      "Publishing to the NIARIM Gallery happens by uploading a video to YouTube from within the NIARIM app, but the Gallery's own public/private setting is independent of YouTube's visibility setting. Even if the YouTube video is set to \"Unlisted,\" it still displays and plays normally in the NIARIM Gallery, while staying largely hidden from YouTube's own search and recommendations (only people with the direct link can view it there). Conversely, if the YouTube video is set to \"Private\" or deleted, its playback URL stops working, so display in the Gallery is automatically suspended regardless of your NIARIM-side setting (your NIARIM setting itself is preserved, so display resumes automatically if the YouTube status is restored). If you don't want comments from people who have the link, you can disable comments on the YouTube side for peace of mind."
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
      "发布到「NIARIM作品广场」是通过在 NIARIM 应用内将视频上传到 YouTube 来实现的，但作品广场自身的公开/非公开设置与 YouTube 的公开范围是相互独立的。即使将 YouTube 视频设为「不公开列出」，它仍会在 NIARIM 作品广场中正常显示和播放，同时在 YouTube 自身的搜索和推荐中基本不会出现（只有知道链接的人才能在 YouTube 上直接观看）。相反，如果将 YouTube 视频设为「私享」或将其删除，播放链接将失效，因此无论 NIARIM 侧的设置如何，作品广场中的显示都会自动停止（NIARIM 侧的设置本身会被保留，一旦 YouTube 状态恢复，显示也会自动恢复）。如果不希望被知道链接的人评论，建议在 YouTube 侧关闭评论功能。"
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
      "發布到「NIARIM作品廣場」是透過在 NIARIM App 內將影片上傳到 YouTube 來實現的，但作品廣場本身的公開/非公開設定與 YouTube 的公開範圍是彼此獨立的。即使將 YouTube 影片設為「不公開」，它仍會在 NIARIM 作品廣場中正常顯示與播放，同時在 YouTube 自身的搜尋與推薦中基本不會出現（只有知道連結的人才能在 YouTube 上直接觀看）。相反地，如果將 YouTube 影片設為「私人」或將其刪除，播放連結將失效，因此無論 NIARIM 端的設定為何，作品廣場中的顯示都會自動停止（NIARIM 端的設定本身會被保留，一旦 YouTube 狀態恢復，顯示也會自動恢復）。如果不希望被知道連結的人留言，建議在 YouTube 端關閉留言功能。"
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
      "「NIARIM 작품 광장」 공개는 NIARIM 앱 안에서 YouTube로 동영상을 업로드함으로써 이루어지지만, 작품 광장 자체의 공개/비공개 설정은 YouTube의 공개 범위와는 독립된 설정입니다. YouTube 동영상을 「일부 공개(URL 공개)」로 설정해도 NIARIM 작품 광장에서는 평소대로 공개・재생되며, YouTube 자체의 검색이나 추천에는 거의 노출되지 않습니다（링크를 아는 사람만 YouTube에서 직접 시청할 수 있는 상태입니다）. 반대로 YouTube 동영상을 「비공개」로 설정하거나 삭제하면 재생용 URL이 작동하지 않게 되므로, NIARIM 측 공개 설정과 관계없이 작품 광장에서의 표시가 자동으로 중단됩니다（NIARIM 측 공개 설정 자체는 유지되므로, YouTube 상태가 복구되면 표시도 자동으로 복구됩니다）. 링크를 아는 사람에게 댓글을 받고 싶지 않다면 YouTube 쪽에서 댓글을 비활성화해 두면 안심할 수 있습니다."
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
      "La publication dans la Galerie NIARIM se fait en mettant en ligne une vidéo sur YouTube depuis l'application NIARIM, mais le réglage public/privé de la Galerie elle-même est indépendant du réglage de visibilité de YouTube. Même si la vidéo YouTube est définie sur « Non répertoriée », elle continue de s'afficher et de se lire normalement dans la Galerie NIARIM, tout en restant largement invisible dans la recherche et les recommandations de YouTube (seules les personnes disposant du lien direct peuvent la visionner là-bas). À l'inverse, si la vidéo YouTube est définie sur « Privée » ou supprimée, son URL de lecture cesse de fonctionner, donc l'affichage dans la Galerie est automatiquement suspendu quel que soit votre réglage côté NIARIM (votre réglage NIARIM lui-même est conservé, donc l'affichage reprend automatiquement si le statut YouTube est rétabli). Si vous ne voulez pas de commentaires de la part des personnes ayant le lien, vous pouvez désactiver les commentaires côté YouTube par précaution."
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
      "Publicar en la Galería NIARIM se hace subiendo un vídeo a YouTube desde dentro de la app NIARIM, pero el ajuste de público/privado de la propia Galería es independiente de la configuración de visibilidad de YouTube. Aunque el vídeo de YouTube esté configurado como «Oculto», seguirá mostrándose y reproduciéndose con normalidad en la Galería NIARIM, mientras permanece prácticamente invisible en la búsqueda y las recomendaciones de YouTube (solo quienes tengan el enlace directo podrán verlo allí). Por el contrario, si el vídeo de YouTube se configura como «Privado» o se elimina, su URL de reproducción deja de funcionar, por lo que la visualización en la Galería se suspende automáticamente sin importar tu configuración en NIARIM (tu configuración de NIARIM se conserva, así que la visualización se reanuda automáticamente si se restablece el estado en YouTube). Si no quieres recibir comentarios de quienes tengan el enlace, puedes desactivar los comentarios en YouTube para mayor tranquilidad."
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
