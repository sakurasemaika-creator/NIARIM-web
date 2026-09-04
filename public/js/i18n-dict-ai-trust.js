/** NIARIM AI/privacy reassurance shared by Home, FAQ, About and Privacy. */
(function () {
  "use strict";
  var COPY = {
    ja: {
      q: "作品はAIの学習に使用されますか？",
      a: "いいえ。NIARIMでは、ユーザーが作成・投稿したイラスト、アニメーション、プロジェクトデータなどの作品を、生成AIモデルの学習データとして使用しません。制作データや動画ファイルを開発者のサーバーへ送信・保存することもありません。「作品広場」へ作品を公開する場合、動画ファイルはYouTubeに保存され、NIARIMでは作品の表示に必要なYouTube動画IDやタイトルなどの情報のみを管理します。",
      about: "本アプリには生成AI機能を実装していません。また、ユーザーが作成・投稿した作品やプロジェクトデータを、生成AIモデルの学習データとして使用することもありません。",
      privacy: "開発者は、ユーザーが作成または投稿したコンテンツ、プロジェクトデータその他の制作データを、生成AIモデルその他の機械学習モデルの学習データとして利用しません。",
      updated: "最終更新日：2026年9月4日"
    },
    en: {
      q: "Is my work used to train AI?",
      a: "No. NIARIM does not use illustrations, animations, project data, or other works created or published by users as training data for generative AI models. Creation data and video files are not sent to or stored on the developer's servers. When you publish a work to the Gallery, the video file is stored on YouTube; NIARIM manages only information needed to display the work, such as the YouTube video ID and title.",
      about: "NIARIM does not include generative-AI features, and works or project data created or published by users are not used as training data for generative AI models.",
      privacy: "The developer does not use content created or published by users, project data, or other creation data as training data for generative AI models or other machine-learning models.",
      updated: "Last updated: September 4, 2026"
    },
    "zh-Hans": {
      q: "我的作品会被用于训练 AI 吗？",
      a: "不会。NIARIM 不会将用户创作或发布的插画、动画、项目数据等作品用于生成式 AI 模型的训练。创作数据和视频文件也不会发送或保存到开发者的服务器。将作品发布到「作品广场」时，视频文件保存在 YouTube；NIARIM 仅管理展示作品所需的信息，例如 YouTube 视频 ID 和标题。",
      about: "本应用未实现生成式 AI 功能，也不会将用户创作或发布的作品及项目数据用于生成式 AI 模型的训练。",
      privacy: "开发者不会将用户创作或发布的内容、项目数据及其他创作数据，用作生成式 AI 模型或其他机器学习模型的训练数据。",
      updated: "最后更新：2026年9月4日"
    },
    "zh-Hant": {
      q: "我的作品會被用於訓練 AI 嗎？",
      a: "不會。NIARIM 不會將使用者創作或發布的插畫、動畫、專案資料等作品用於生成式 AI 模型的訓練。創作資料與影片檔案也不會傳送或儲存至開發者的伺服器。將作品發布到「作品廣場」時，影片檔案儲存在 YouTube；NIARIM 僅管理顯示作品所需的資訊，例如 YouTube 影片 ID 與標題。",
      about: "本應用程式未實作生成式 AI 功能，也不會將使用者創作或發布的作品及專案資料用於生成式 AI 模型的訓練。",
      privacy: "開發者不會將使用者創作或發布的內容、專案資料及其他創作資料，用作生成式 AI 模型或其他機器學習模型的訓練資料。",
      updated: "最後更新：2026年9月4日"
    },
    ko: {
      q: "작품이 AI 학습에 사용되나요?",
      a: "아니요. NIARIM은 사용자가 제작하거나 공개한 일러스트, 애니메이션, 프로젝트 데이터 등의 작품을 생성형 AI 모델의 학습 데이터로 사용하지 않습니다. 제작 데이터와 동영상 파일을 개발자 서버로 전송하거나 저장하지도 않습니다. 「작품 광장」에 작품을 공개할 경우 동영상 파일은 YouTube에 저장되며, NIARIM은 작품 표시에 필요한 YouTube 동영상 ID와 제목 등의 정보만 관리합니다.",
      about: "본 앱에는 생성형 AI 기능이 구현되어 있지 않으며, 사용자가 제작하거나 공개한 작품 및 프로젝트 데이터를 생성형 AI 모델의 학습 데이터로 사용하지도 않습니다.",
      privacy: "개발자는 사용자가 제작하거나 게시한 콘텐츠, 프로젝트 데이터 및 기타 제작 데이터를 생성형 AI 모델 또는 기타 머신러닝 모델의 학습 데이터로 사용하지 않습니다.",
      updated: "최종 업데이트: 2026년 9월 4일"
    },
    fr: {
      q: "Mes œuvres sont-elles utilisées pour entraîner une IA ?",
      a: "Non. NIARIM n'utilise pas les illustrations, animations, données de projet ou autres œuvres créées ou publiées par les utilisateurs comme données d'entraînement de modèles d'IA générative. Les données de création et les fichiers vidéo ne sont pas envoyés ni stockés sur les serveurs du développeur. Lorsqu'une œuvre est publiée dans la Galerie, le fichier vidéo est stocké sur YouTube ; NIARIM ne gère que les informations nécessaires à son affichage, telles que l'identifiant de la vidéo YouTube et son titre.",
      about: "NIARIM n'intègre aucune fonctionnalité d'IA générative et n'utilise pas les œuvres ou données de projet créées ou publiées par les utilisateurs pour entraîner des modèles d'IA générative.",
      privacy: "Le développeur n’utilise pas les contenus créés ou publiés par les utilisateurs, les données de projet ni les autres données de création comme données d’entraînement pour des modèles d’IA générative ou d’autres modèles d’apprentissage automatique.",
      updated: "Dernière mise à jour : 4 septembre 2026"
    },
    es: {
      q: "¿Se usan mis obras para entrenar IA?",
      a: "No. NIARIM no utiliza ilustraciones, animaciones, datos de proyectos ni otras obras creadas o publicadas por los usuarios como datos de entrenamiento para modelos de IA generativa. Los datos de creación y los archivos de vídeo tampoco se envían ni almacenan en los servidores del desarrollador. Al publicar una obra en la Galería, el archivo de vídeo se almacena en YouTube; NIARIM solo gestiona la información necesaria para mostrarla, como el ID del vídeo de YouTube y el título.",
      about: "NIARIM no incluye funciones de IA generativa ni utiliza las obras o datos de proyectos creados o publicados por los usuarios para entrenar modelos de IA generativa.",
      privacy: "El desarrollador no utiliza el contenido creado o publicado por los usuarios, los datos de proyectos ni otros datos de creación como datos de entrenamiento para modelos de IA generativa u otros modelos de aprendizaje automático.",
      updated: "Última actualización: 4 de septiembre de 2026"
    }
  };
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  Object.keys(COPY).forEach(function (l) {
    if (!DICT[l]) DICT[l] = {};
    DICT[l]["faq.q10"] = COPY[l].q;
    DICT[l]["faq.a10"] = COPY[l].a;
    DICT[l]["about.aiStance.body"] = COPY[l].about;
  });
  function current() {
    var l = document.documentElement.getAttribute("lang") || "ja";
    return COPY[l] ? COPY[l] : COPY.en;
  }
  function ensureFaq() {
    var list = document.querySelector(".faq-list");
    if (!list || list.querySelector("[data-ai-training-faq]")) return;
    var item = document.createElement("div");
    item.className = "faq-item";
    item.setAttribute("data-ai-training-faq", "true");
    item.innerHTML = '<button class="faq-question" aria-expanded="false"><span data-ai-training-q></span><span class="icon" aria-hidden="true"></span></button><div class="faq-answer"><p data-ai-training-a></p></div>';
    list.appendChild(item);
  }
  function ensurePrivacyClause() {
    var art2 = document.querySelector('[data-i18n="legal.privacy.art2.body"]');
    if (!art2 || document.querySelector("[data-ai-training-privacy]")) return;
    var clause = document.createElement("p");
    clause.setAttribute("data-ai-training-privacy", "true");
    art2.insertAdjacentElement("afterend", clause);
  }
  function apply() {
    ensureFaq();
    ensurePrivacyClause();
    var text = current();
    document.querySelectorAll("[data-ai-training-q]").forEach(function (el) { el.textContent = text.q; });
    document.querySelectorAll("[data-ai-training-a]").forEach(function (el) { el.textContent = text.a; });
    document.querySelectorAll('[data-i18n="about.aiStance.body"]').forEach(function (el) { el.textContent = text.about; });
    document.querySelectorAll("[data-ai-training-privacy]").forEach(function (el) { el.textContent = text.privacy; });
    if (document.querySelector("[data-ai-training-privacy]")) {
      var updated = document.querySelector(".updated-at");
      if (updated) updated.textContent = text.updated;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
  document.addEventListener("niarim:langchange", function () { requestAnimationFrame(apply); });
})();
