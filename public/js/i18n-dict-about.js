/**
 * NIARIM公式サイト About(NIARIMとは)ページ 翻訳辞書 (v2)
 *
 * 「NIARIMだけのうれしい機能」セクションは、一般的なイラスト制作アプリ
 * (アイビスペイント・CLIP STUDIO PAINT等)にも搭載されがちな機能
 * (ブレンドモード・クリッピング・レイヤーフォルダ・投げ縄塗り等)を除外し、
 * 自動塗り・テーマ外観設定・活用Tips・演出フィルター・トーン塗り・
 * ピクセルモード・コミュニティ機能のみに絞っている。
 * 生成AIについての記述は、開発者の思想や賛否には触れず、生成AI機能を
 * 実装していないという事実のみを簡潔に述べる(開発自体でのAI活用にも言及しない)。
 * 「誰でも手軽にアニメをつくれる」「誰もがクリエイターに」は開発動機の説明ではなく
 * 売り文句・キャッチコピーとして表現する。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    ja: {
      "about.name.glossNear": "近く",
      "about.name.glossRim": "縁・境界",
      "about.eyebrow": "About NIARIM",
      "about.title": "NIARIMとは",
      "about.lead":
        "誰でも手軽にアニメがつくれる。誰もがクリエイターに。NIARIMは、老若男女誰もが手軽にアニメーション制作を楽しめる手描きアニメーション制作アプリです。直感的な操作性へのこだわりと、本格的な作り込みの自由度を両立させています。",
      "about.name.eyebrow": "The Name",
      "about.name.title": "NIARIMってどんな意味？",
      "about.name.body":
        "アニメ制作をもっと身近に。クリエイターと視聴者の境界を曖昧に。誰でもいつでも、つくる人にもみる人にもなれる。",
      "about.modes.title": "キャンバスモードとタイムラインモード",
      "about.modes.body":
        "NIARIMは、描くための「キャンバスモード」と、動かすための「タイムラインモード」に分かれています。お絵描きアプリと動画編集アプリを行き来する必要はありません。絵を描いて、そのまま動かして、音を合わせて仕上げる。制作の流れを一つのアプリにまとめています。",
      "about.philosophy.eyebrow": "Philosophy",
      "about.philosophy.title": "NIARIMが大切にしていること",
      "about.philosophy.item1.title": "誰でも手軽に、アニメをつくれる。",
      "about.philosophy.item1.body":
        "専門的な知識や特別な道具は必要ありません。スマートフォン一つで、誰もがクリエイターに。NIARIMが目指すのは、そんな世界です。",
      "about.philosophy.item2.title": "アプリの軽量化への取り組み",
      "about.philosophy.item2.body":
        "アニメーション制作はフレーム数やレイヤー数が増えるほどデータが重くなりがちです。NIARIMでは、共通レイヤーやキャッシュ管理、容量削減機能に加え、パフォーマンス設定で画質プリセットや各項目を端末に合わせて調整できるようにするなど、端末への負荷を抑えるための工夫を重ねて開発しています。特別な機材がなくても、本格的な制作を始められます。",
      "about.philosophy.item3.title": "妥協しない、作り込みの自由度",
      "about.philosophy.item3.body":
        "手軽さを大切にしながらも、レイヤーやブラシ、仕上げのフィルターまで、こだわって作り込みたい人の要望にも応えられる自由度を用意しています。",
      "about.aiStance.title": "生成AIについて",
      "about.aiStance.body": "本アプリには生成AI機能は実装していません。",
      "about.device.eyebrow": "Supported Environment",
      "about.device.title": "対応環境",
      "about.device.lead":
        "スマートフォン単体はもちろん、外部機器を接続した本格的な制作環境にも対応しています。",
      "about.device.item1.title": "Android端末全般",
      "about.device.item1.body": "幅広いAndroid端末に対応しています。",
      "about.device.item2.title": "板タブ・液晶タブレット接続",
      "about.device.item2.body":
        "外部の板タブレット・液晶タブレットを接続して、より本格的な作画環境で制作できます。",
      "about.device.item3.title": "Galaxy DeXモード・Sペン",
      "about.device.item3.body":
        "Galaxy端末のDeXモードでのデスクトップ的な操作や、Sペンでの筆圧・傾き検知に対応しています。",
      "about.unique.title": "NIARIMでできること",
      "about.unique.pointer": "主な機能は、トップページの「おすすめ機能」で、実際の画面と描いた結果を見せながら紹介しています。機能ページには、種類ごとの詳しい説明があります。",
      "about.unique.linkHome": "おすすめ機能を見る",
      "about.unique.linkFeatures": "機能ページを見る",
      "about.cta.title": "使い方をもっと詳しく知りたい方へ",
      "about.cta.body":
        "アプリ内のヘルプと同じ内容を、ウェブ上のガイドページでも検索・閲覧いただけます。",
      "about.cta.tips": "アプリの中の「活用Tips」では、実践的な使い方のコツをキーワードで検索しながら読めます。",
      "about.cta.link": "使い方ガイドを見る",
    },
    en: {
      "about.name.glossNear": "near",
      "about.name.glossRim": "edge, boundary",
      "about.eyebrow": "About NIARIM",
      "about.title": "About NIARIM",
      "about.lead":
        "Anyone can make animation, easily. Anyone can become a creator. NIARIM is a hand-drawn animation app built for people of every age to enjoy making animation easily. We’ve focused on intuitive, approachable controls while also offering plenty of creative freedom to dig into the details.",
      "about.name.eyebrow": "The Name",
      "about.name.title": "What does “NIARIM” mean?",
      "about.name.body":
        "Bringing animation closer to everyone. Blurring the line between creators and viewers. Anyone, anytime, can be both the one who makes and the one who watches.",
      "about.modes.title": "Canvas Mode and Timeline Mode",
      "about.modes.body":
        "NIARIM is split into a “Canvas Mode” for drawing and a “Timeline Mode” for bringing it to motion. There’s no need to bounce between a drawing app and a video editor. Draw a picture, animate it right away, and finish it off in sync with sound — the whole workflow lives in one app.",
      "about.philosophy.eyebrow": "Philosophy",
      "about.philosophy.title": "What NIARIM values",
      "about.philosophy.item1.title": "Anyone can make animation with ease.",
      "about.philosophy.item1.body":
        "No specialized knowledge or special tools required. Just a smartphone — and anyone can become a creator. That’s the world NIARIM is building toward.",
      "about.philosophy.item2.title": "Working to keep the app lightweight",
      "about.philosophy.item2.body":
        "Animation work tends to get heavier as frame and layer counts grow. Alongside common layers, cache management, and storage-reduction tools, we’ve also added performance settings that let you choose a quality preset — or tune individual settings — to match your device, all as part of easing the load it carries. You don’t need any special equipment to start creating seriously.",
      "about.philosophy.item3.title": "No compromise on creative freedom",
      "about.philosophy.item3.body":
        "While keeping things approachable, we also provide the depth — layers, brushes, finishing filters — for those who want to dig in and craft their work in detail.",
      "about.aiStance.title": "About generative AI",
      "about.aiStance.body":
        "NIARIM does not include any generative-AI features.",
      "about.device.eyebrow": "Supported Environment",
      "about.device.title": "Supported Environment",
      "about.device.lead":
        "NIARIM supports both standalone smartphone use and a more serious setup with external devices connected.",
      "about.device.item1.title": "Android devices in general",
      "about.device.item1.body":
        "NIARIM supports a wide range of Android devices.",
      "about.device.item2.title": "Drawing tablet / pen display support",
      "about.device.item2.body":
        "Connect an external drawing tablet or pen display for a more serious drawing setup.",
      "about.device.item3.title": "Galaxy DeX mode & S Pen",
      "about.device.item3.body":
        "Supports desktop-like operation via Galaxy DeX mode, plus pressure and tilt detection with the S Pen.",
      "about.unique.title": "What you can do in NIARIM",
      "about.unique.pointer": "The home page’s “Featured tools in NIARIM” shows the main features with real screens and drawn results. The Features page explains them in detail, area by area.",
      "about.unique.linkHome": "See the featured tools",
      "about.unique.linkFeatures": "See the Features page",
      "about.cta.title": "Want to learn more about using NIARIM?",
      "about.cta.body":
        "Search and browse the same content as the app’s built-in Help screen, right here on the web.",
      "about.cta.tips": "In the app, the Tips screen lets you search practical tips and techniques by keyword.",
      "about.cta.link": "View the guide",
    },
    "zh-Hans": {
      "about.name.glossNear": "近",
      "about.name.glossRim": "边缘、边界",
      "about.eyebrow": "About NIARIM",
      "about.title": "关于 NIARIM",
      "about.lead":
        "人人都能轻松制作动画。人人都能成为创作者。NIARIM 是一款手绘动画制作应用，希望不分年龄、不论男女，任何人都能轻松享受动画制作的乐趣。我们兼顾了直观易用的操作体验与可以深入打磨作品的创作自由度。",
      "about.name.eyebrow": "The Name",
      "about.name.title": "“NIARIM”是什么意思？",
      "about.name.body":
        "让动画创作变得更贴近生活。让创作者与观众之间的界限变得模糊。任何人、任何时候，都能既是创作者，也是观众。",
      "about.modes.title": "画布模式与时间轴模式",
      "about.modes.body":
        "NIARIM 分为用于绘图的“画布模式”与用于让画面动起来的“时间轴模式”。无需在绘图应用和视频编辑应用之间来回切换。画好图，直接让它动起来，再配上声音完成作品——整个制作流程都汇集在一个应用中。",
      "about.philosophy.eyebrow": "Philosophy",
      "about.philosophy.title": "NIARIM 重视的事",
      "about.philosophy.item1.title": "人人都能轻松制作动画。",
      "about.philosophy.item1.body":
        "不需要专业知识或特殊工具。只要一部智能手机，人人都能成为创作者。这正是 NIARIM 所追求的世界。",
      "about.philosophy.item2.title": "致力于让应用更轻量",
      "about.philosophy.item2.body":
        "随着帧数和图层数量的增加，动画制作容易让数据变得沉重。除了公共图层、缓存管理、释放空间等功能外，NIARIM 还提供性能设置，可以选择画质预设，或按需单独调整各项设置以适配你的设备，努力减轻对设备的负担。不需要特殊设备，也能开始真正的创作。",
      "about.philosophy.item3.title": "毫不妥协的创作自由度",
      "about.philosophy.item3.body":
        "在保持易用性的同时，也为想要深入打磨作品的用户准备了图层、画笔、后期滤镜等丰富的自由度。",
      "about.aiStance.title": "关于生成式 AI",
      "about.aiStance.body": "本应用并未搭载生成式 AI 功能。",
      "about.device.eyebrow": "Supported Environment",
      "about.device.title": "支持的环境",
      "about.device.lead":
        "无论是仅使用手机，还是连接外部设备打造更专业的创作环境，NIARIM 都能支持。",
      "about.device.item1.title": "支持各类 Android 设备",
      "about.device.item1.body": "NIARIM 支持广泛的 Android 设备。",
      "about.device.item2.title": "支持连接数位板与数位屏",
      "about.device.item2.body":
        "可连接外部数位板或数位屏，打造更专业的作画环境。",
      "about.device.item3.title": "Galaxy DeX 模式与 S Pen",
      "about.device.item3.body":
        "支持 Galaxy 设备 DeX 模式下的桌面式操作，以及 S Pen 的压感与倾斜检测。",
      "about.unique.title": "在 NIARIM 中可以做的事",
      "about.unique.pointer": "首页的“NIARIM 的推荐功能”用实际画面和绘制结果介绍主要功能。功能页面按类别详细说明。",
      "about.unique.linkHome": "查看推荐功能",
      "about.unique.linkFeatures": "查看功能页面",
      "about.cta.title": "想更详细了解使用方法？",
      "about.cta.body":
        "与应用内“帮助”画面相同的内容，也可以在网页版的指南页面中搜索、浏览。",
      "about.cta.tips": "在应用的“使用技巧”画面中，可以用关键词搜索并阅读实用的使用技巧。",
      "about.cta.link": "查看使用指南",
    },
    "zh-Hant": {
      "about.name.glossNear": "近",
      "about.name.glossRim": "邊緣、邊界",
      "about.eyebrow": "About NIARIM",
      "about.title": "關於 NIARIM",
      "about.lead":
        "人人都能輕鬆製作動畫。人人都能成為創作者。NIARIM 是一款手繪動畫製作應用程式，希望不分年齡、不分男女，任何人都能輕鬆享受動畫製作的樂趣。我們兼顧了直覺易用的操作體驗與可以深入琢磨作品的創作自由度。",
      "about.name.eyebrow": "The Name",
      "about.name.title": "「NIARIM」是什麼意思？",
      "about.name.body":
        "讓動畫創作變得更貼近生活。讓創作者與觀眾之間的界線變得模糊。任何人、任何時候，都能既是創作者，也是觀眾。",
      "about.modes.title": "畫布模式與時間軸模式",
      "about.modes.body":
        "NIARIM 分為用於繪圖的「畫布模式」與用於讓畫面動起來的「時間軸模式」。不需要在繪圖應用程式和影片編輯應用程式之間來回切換。畫好圖，直接讓它動起來，再配上聲音完成作品——整個製作流程都彙整在一個應用程式中。",
      "about.philosophy.eyebrow": "Philosophy",
      "about.philosophy.title": "NIARIM 重視的事",
      "about.philosophy.item1.title": "人人都能輕鬆製作動畫。",
      "about.philosophy.item1.body":
        "不需要專業知識或特殊工具。只要一支智慧型手機，人人都能成為創作者。這正是 NIARIM 所追求的世界。",
      "about.philosophy.item2.title": "致力於讓應用程式更輕量",
      "about.philosophy.item2.body":
        "隨著影格數和圖層數量的增加，動畫製作容易讓資料變得沉重。除了共用圖層、快取管理、釋放空間等功能外，NIARIM 還提供效能設定，可以選擇畫質預設，或依需求單獨調整各項設定以配合你的裝置，努力減輕對裝置的負擔。不需要特殊設備，也能開始真正的創作。",
      "about.philosophy.item3.title": "毫不妥協的創作自由度",
      "about.philosophy.item3.body":
        "在保持易用性的同時，也為想要深入琢磨作品的使用者準備了圖層、畫筆、後製濾鏡等豐富的自由度。",
      "about.aiStance.title": "關於生成式 AI",
      "about.aiStance.body": "本應用程式並未搭載生成式 AI 功能。",
      "about.device.eyebrow": "Supported Environment",
      "about.device.title": "支援的環境",
      "about.device.lead":
        "無論是僅使用手機，還是連接外部裝置打造更專業的創作環境，NIARIM 都能支援。",
      "about.device.item1.title": "支援各類 Android 裝置",
      "about.device.item1.body": "NIARIM 支援廣泛的 Android 裝置。",
      "about.device.item2.title": "支援連接繪圖板與繪圖螢幕",
      "about.device.item2.body":
        "可連接外部繪圖板或繪圖螢幕，打造更專業的作畫環境。",
      "about.device.item3.title": "Galaxy DeX 模式與 S Pen",
      "about.device.item3.body":
        "支援 Galaxy 裝置 DeX 模式下的桌面式操作，以及 S Pen 的壓感與傾斜偵測。",
      "about.unique.title": "在 NIARIM 中可以做的事",
      "about.unique.pointer": "首頁的「NIARIM 的推薦功能」用實際畫面和繪製結果介紹主要功能。功能頁面按類別詳細說明。",
      "about.unique.linkHome": "查看推薦功能",
      "about.unique.linkFeatures": "查看功能頁面",
      "about.cta.title": "想更詳細了解使用方法？",
      "about.cta.body":
        "與應用程式內「說明」畫面相同的內容，也可以在網頁版的指南頁面中搜尋、瀏覽。",
      "about.cta.tips": "在應用程式的「使用技巧」畫面中，可以用關鍵字搜尋並閱讀實用的使用技巧。",
      "about.cta.link": "查看使用指南",
    },
    ko: {
      "about.name.glossNear": "가까이",
      "about.name.glossRim": "가장자리, 경계",
      "about.eyebrow": "About NIARIM",
      "about.title": "NIARIM 소개",
      "about.lead":
        "누구나 손쉽게 애니메이션을 만든다. 누구나 크리에이터가 된다. NIARIM은 남녀노소 누구나 손쉽게 애니메이션 제작을 즐길 수 있는 손그림 애니메이션 제작 앱입니다. 직관적인 조작감을 중시하면서, 세밀하게 다듬을 수 있는 제작 자유도도 함께 갖추고 있습니다.",
      "about.name.eyebrow": "The Name",
      "about.name.title": "NIARIM은 어떤 의미인가요?",
      "about.name.body":
        "애니메이션 제작을 더 가깝게. 크리에이터와 시청자의 경계를 흐리게. 누구나 언제든, 만드는 사람도 보는 사람도 될 수 있습니다.",
      "about.modes.title": "캔버스 모드와 타임라인 모드",
      "about.modes.body":
        "NIARIM은 그림을 그리기 위한 「캔버스 모드」와, 움직이기 위한 「타임라인 모드」로 나뉘어 있습니다. 그림 앱과 영상 편집 앱을 오갈 필요가 없습니다. 그림을 그리고, 그대로 움직이고, 소리를 맞춰 완성한다. 제작의 흐름을 하나의 앱에 담았습니다.",
      "about.philosophy.eyebrow": "Philosophy",
      "about.philosophy.title": "NIARIM이 소중히 여기는 것",
      "about.philosophy.item1.title": "누구나 손쉽게, 애니메이션을 만들 수 있다.",
      "about.philosophy.item1.body":
        "전문적인 지식이나 특별한 도구는 필요 없습니다. 스마트폰 하나로, 누구나 크리에이터가 된다. NIARIM이 지향하는 세상입니다.",
      "about.philosophy.item2.title": "앱 경량화를 위한 노력",
      "about.philosophy.item2.body":
        "프레임 수와 레이어 수가 늘어날수록 애니메이션 제작은 데이터가 무거워지기 쉽습니다. NIARIM은 공통 레이어, 캐시 관리, 용량 확보 기능뿐 아니라, 성능 설정에서 화질 프리셋을 고르거나 각 항목을 기기에 맞게 개별 조정할 수 있도록 마련해 기기에 걸리는 부담을 줄이기 위해 노력하며 개발하고 있습니다. 특별한 장비가 없어도 본격적인 제작을 시작할 수 있습니다.",
      "about.philosophy.item3.title": "타협하지 않는 제작 자유도",
      "about.philosophy.item3.body":
        "손쉬움을 소중히 하면서도, 레이어와 브러시, 마무리 필터까지 세밀하게 다듬고 싶은 사용자의 요구에도 응할 수 있는 자유도를 갖추고 있습니다.",
      "about.aiStance.title": "생성형 AI에 대해",
      "about.aiStance.body": "본 앱에는 생성형 AI 기능을 탑재하지 않았습니다.",
      "about.device.eyebrow": "Supported Environment",
      "about.device.title": "지원 환경",
      "about.device.lead":
        "스마트폰 단독 사용은 물론, 외부 기기를 연결한 본격적인 제작 환경도 지원합니다.",
      "about.device.item1.title": "Android 기기 전반",
      "about.device.item1.body": "NIARIM은 폭넓은 Android 기기를 지원합니다.",
      "about.device.item2.title": "판 태블릿·액정 태블릿 연결",
      "about.device.item2.body":
        "외부 판 태블릿이나 액정 태블릿을 연결하여 더욱 본격적인 작화 환경에서 제작할 수 있습니다.",
      "about.device.item3.title": "Galaxy DeX 모드·S펜",
      "about.device.item3.body":
        "Galaxy 기기의 DeX 모드를 통한 데스크톱 방식 조작과, S펜의 필압·기울기 감지를 지원합니다.",
      "about.unique.title": "NIARIM으로 할 수 있는 것",
      "about.unique.pointer": "홈페이지의 ‘NIARIM의 추천 기능’에서 주요 기능을 실제 화면과 그린 결과로 소개합니다. 기능 페이지에는 분야별로 자세한 설명이 있습니다.",
      "about.unique.linkHome": "추천 기능 보기",
      "about.unique.linkFeatures": "기능 페이지 보기",
      "about.cta.title": "사용법을 더 자세히 알고 싶다면",
      "about.cta.body":
        "앱 내 도움말과 동일한 내용을 웹 가이드 페이지에서도 검색·열람하실 수 있습니다.",
      "about.cta.tips": "앱의 ‘활용 팁’ 화면에서는 실전적인 사용 요령과 테크닉을 키워드로 검색하며 읽을 수 있습니다.",
      "about.cta.link": "이용 가이드 보기",
    },
    fr: {
      "about.name.glossNear": "proche",
      "about.name.glossRim": "bord, frontière",
      "about.eyebrow": "About NIARIM",
      "about.title": "À propos de NIARIM",
      "about.lead":
        "Créer de l’animation, facilement, pour tous. Faire de chacun un créateur. NIARIM est une application de création d’animation dessinée à la main, pensée pour que chacun, quel que soit son âge, puisse profiter facilement de la création d’animation. Nous mettons l’accent sur une prise en main intuitive, tout en offrant une grande liberté créative pour peaufiner chaque détail.",
      "about.name.eyebrow": "The Name",
      "about.name.title": "Que signifie « NIARIM » ?",
      "about.name.body":
        "Rapprocher l’animation de tout le monde. Estomper la frontière entre créateurs et spectateurs. Chacun, à tout moment, peut être à la fois créateur et spectateur.",
      "about.modes.title": "Mode Canevas et Mode Timeline",
      "about.modes.body":
        "NIARIM se divise en un « Mode Canevas » pour dessiner et un « Mode Timeline » pour donner du mouvement. Plus besoin de jongler entre une appli de dessin et un logiciel de montage vidéo. Dessinez, animez aussitôt, et peaufinez en musique — tout le flux de création tient dans une seule application.",
      "about.philosophy.eyebrow": "Philosophy",
      "about.philosophy.title": "Ce à quoi NIARIM tient",
      "about.philosophy.item1.title": "Tout le monde peut faire de l’animation facilement.",
      "about.philosophy.item1.body":
        "Aucune connaissance ni outil spécialisé requis. Un simple smartphone suffit pour que chacun devienne créateur. C’est le monde vers lequel NIARIM tend.",
      "about.philosophy.item2.title":
        "Des efforts pour garder l’application légère",
      "about.philosophy.item2.body":
        "La création d’animation a tendance à alourdir les données à mesure que le nombre d’images et de calques augmente. En plus des calques communs, de la gestion du cache et des outils de libération d’espace, nous avons aussi ajouté des réglages de performance qui permettent de choisir un préréglage de qualité — ou d’ajuster chaque paramètre individuellement — selon votre appareil, pour alléger la charge qu’il supporte. Pas besoin d’équipement particulier pour vous lancer sérieusement.",
      "about.philosophy.item3.title": "Aucun compromis sur la liberté créative",
      "about.philosophy.item3.body":
        "Tout en restant accessible, NIARIM offre aussi la profondeur — calques, pinceaux, filtres de finition — pour celles et ceux qui veulent peaufiner leur œuvre dans le détail.",
      "about.aiStance.title": "À propos de l’IA générative",
      "about.aiStance.body":
        "NIARIM n’intègre aucune fonctionnalité d’IA générative.",
      "about.device.eyebrow": "Supported Environment",
      "about.device.title": "Environnements pris en charge",
      "about.device.lead":
        "NIARIM fonctionne aussi bien sur smartphone seul qu’avec des périphériques externes pour une configuration plus poussée.",
      "about.device.item1.title": "Appareils Android en général",
      "about.device.item1.body":
        "NIARIM prend en charge un large éventail d’appareils Android.",
      "about.device.item2.title": "Tablette graphique / écran-tablette",
      "about.device.item2.body":
        "Connectez une tablette graphique ou un écran-tablette externe pour une configuration de dessin plus poussée.",
      "about.device.item3.title": "Mode Galaxy DeX et S Pen",
      "about.device.item3.body":
        "Prend en charge une utilisation façon bureau via le mode DeX de Galaxy, ainsi que la détection de la pression et de l’inclinaison du S Pen.",
      "about.unique.title":
        "Ce que vous pouvez faire dans NIARIM",
      "about.unique.pointer": "Sur la page d’accueil, « Fonctions phares de NIARIM » présente les fonctions principales avec de vrais écrans et des résultats dessinés. La page Fonctions les explique en détail, par domaine.",
      "about.unique.linkHome": "Voir les fonctions phares",
      "about.unique.linkFeatures": "Voir la page Fonctions",
      "about.cta.title":
        "Vous voulez en savoir plus sur l’utilisation de NIARIM ?",
      "about.cta.body":
        "Retrouvez ici, sur le web, le même contenu que l’écran d’aide intégré à l’application.",
      "about.cta.tips": "Dans l’application, l’écran Astuces permet de rechercher des astuces et techniques pratiques par mot-clé.",
      "about.cta.link": "Voir le guide",
    },
    es: {
      "about.name.glossNear": "cerca",
      "about.name.glossRim": "borde, frontera",
      "about.eyebrow": "About NIARIM",
      "about.title": "Acerca de NIARIM",
      "about.lead":
        "Crear animación, fácil, para todos. Que cualquiera pueda crear. NIARIM es una app de animación dibujada a mano, pensada para que cualquier persona, sin importar su edad, disfrute de crear animación fácilmente. Cuidamos que el manejo sea intuitivo, además de ofrecer una gran libertad creativa para perfeccionar cada detalle.",
      "about.name.eyebrow": "The Name",
      "about.name.title": "¿Qué significa «NIARIM»?",
      "about.name.body":
        "Acercar la animación a todo el mundo. Difuminar la frontera entre creadores y espectadores. Cualquiera, en cualquier momento, puede ser quien crea y quien mira.",
      "about.modes.title": "Modo Lienzo y Modo Línea de Tiempo",
      "about.modes.body":
        "NIARIM se divide en un «Modo Lienzo» para dibujar y un «Modo Línea de Tiempo» para dar movimiento. No hace falta ir y venir entre una app de dibujo y un editor de vídeo. Dibuja, anímalo al instante y remátalo con sonido: todo el flujo de creación cabe en una sola app.",
      "about.philosophy.eyebrow": "Philosophy",
      "about.philosophy.title": "Lo que valora NIARIM",
      "about.philosophy.item1.title": "Cualquiera puede hacer animación con facilidad.",
      "about.philosophy.item1.body":
        "No hace falta conocimiento ni herramientas especializadas. Con solo un smartphone, cualquiera puede crear. Ese es el mundo al que aspira NIARIM.",
      "about.philosophy.item2.title": "Trabajando para mantener la app ligera",
      "about.philosophy.item2.body":
        "Crear animación tiende a generar más datos a medida que aumentan los fotogramas y las capas. Además de las capas comunes, la gestión de caché y las herramientas para liberar espacio, también hemos añadido ajustes de rendimiento que te permiten elegir un preajuste de calidad, o ajustar cada opción individualmente, según tu dispositivo, para aliviar la carga que soporta. No necesitas equipo especial para empezar a crear en serio.",
      "about.philosophy.item3.title": "Sin concesiones en la libertad creativa",
      "about.philosophy.item3.body":
        "Sin dejar de ser accesible, NIARIM también ofrece profundidad —capas, pinceles, filtros de acabado— para quienes quieran perfeccionar su obra al detalle.",
      "about.aiStance.title": "Sobre la IA generativa",
      "about.aiStance.body":
        "NIARIM no incluye ninguna función de IA generativa.",
      "about.device.eyebrow": "Supported Environment",
      "about.device.title": "Entornos compatibles",
      "about.device.lead":
        "NIARIM funciona con el teléfono por sí solo y también con dispositivos externos conectados para una configuración más avanzada.",
      "about.device.item1.title": "Dispositivos Android en general",
      "about.device.item1.body":
        "NIARIM es compatible con una amplia variedad de dispositivos Android.",
      "about.device.item2.title": "Tableta gráfica / pantalla con lápiz",
      "about.device.item2.body":
        "Conecta una tableta gráfica o una pantalla con lápiz externa para un entorno de dibujo más avanzado.",
      "about.device.item3.title": "Modo Galaxy DeX y S Pen",
      "about.device.item3.body":
        "Compatible con un uso tipo escritorio mediante el modo DeX de Galaxy, además de la detección de presión e inclinación del S Pen.",
      "about.unique.title": "Lo que puedes hacer en NIARIM",
      "about.unique.pointer": "En la página de inicio, «Funciones destacadas de NIARIM» muestra las funciones principales con pantallas reales y resultados dibujados. La página Funciones las explica en detalle, por áreas.",
      "about.unique.linkHome": "Ver las funciones destacadas",
      "about.unique.linkFeatures": "Ver la página Funciones",
      "about.cta.title": "¿Quieres saber más sobre cómo usar NIARIM?",
      "about.cta.body":
        "Consulta aquí, en la web, el mismo contenido que la pantalla de ayuda integrada en la app.",
      "about.cta.tips": "En la app, la pantalla Consejos te permite buscar consejos y técnicas prácticas por palabra clave.",
      "about.cta.link": "Ver la guía",
    },
  };
  for (var lang in DATA) {
    if (!DICT[lang]) DICT[lang] = {};
    var entries = DATA[lang];
    for (var key in entries) {
      DICT[lang][key] = entries[key];
    }
  }
})();
