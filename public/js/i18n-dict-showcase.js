(function () {
  "use strict";
  const dictionary = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  const copy = {
  "ja": {
    "viewer.open": "拡大する",
    "viewer.phone": "スマートフォン",
    "viewer.desktop": "PC / DeX",
    "viewer.close": "閉じる",
    "viewer.zoom": "原寸表示",
    "feature.title": "線の表情も、カメラの動きも。",
    "feature.lead": "ブラシで線を作り、形を整え、カメラで見せ方を決められます。",
    "feature.brush": "カスタムブラシ",
    "feature.brushBody": "形状やストロークを調整して、自分の線が描けるブラシを作れます。",
    "feature.mesh": "自由変形・メッシュ変形",
    "feature.meshBody": "描いたパーツの輪郭や位置を、描き直さずに整えられます。",
    "feature.camera": "カメラキーフレーム",
    "feature.cameraBody": "カメラの位置とタイミングを指定して、シーンに動きを付けられます。"
  },
  "en": {
    "viewer.open": "Enlarge",
    "viewer.phone": "Phone",
    "viewer.desktop": "PC / DeX",
    "viewer.close": "Close",
    "viewer.zoom": "Actual size",
    "feature.title": "Shape the line. Move the camera.",
    "feature.lead": "Design a brush, reshape a drawing, then decide how the camera moves through the scene.",
    "feature.brush": "Custom brushes",
    "feature.brushBody": "Adjust the tip and stroke to make a brush that draws your line.",
    "feature.mesh": "Free and mesh transform",
    "feature.meshBody": "Refine the shape and position of a drawn part without redrawing it.",
    "feature.camera": "Camera keyframes",
    "feature.cameraBody": "Set camera positions and timing to give a scene its movement."
  },
  "zh-Hans": {
    "viewer.open": "放大查看",
    "viewer.phone": "手机",
    "viewer.desktop": "PC / DeX",
    "viewer.close": "关闭",
    "viewer.zoom": "原始大小",
    "feature.title": "从线条到镜头。",
    "feature.lead": "自定义画笔，调整画好的形状，再安排镜头如何移动。",
    "feature.brush": "自定义画笔",
    "feature.brushBody": "调整笔尖和笔触，画出自己想要的线条。",
    "feature.mesh": "自由变形与网格变形",
    "feature.meshBody": "不必重画，也能调整已绘制部分的轮廓与位置。",
    "feature.camera": "相机关键帧",
    "feature.cameraBody": "设置镜头位置和时间，让画面动起来。"
  },
  "zh-Hant": {
    "viewer.open": "放大查看",
    "viewer.phone": "手機",
    "viewer.desktop": "PC / DeX",
    "viewer.close": "關閉",
    "viewer.zoom": "原始大小",
    "feature.title": "從線條到鏡頭。",
    "feature.lead": "自訂筆刷、調整畫好的形狀，再安排鏡頭如何移動。",
    "feature.brush": "自訂筆刷",
    "feature.brushBody": "調整筆尖和筆觸，畫出自己想要的線條。",
    "feature.mesh": "自由變形與網格變形",
    "feature.meshBody": "不必重畫，也能調整已繪製部分的輪廓與位置。",
    "feature.camera": "攝影機關鍵影格",
    "feature.cameraBody": "設定鏡頭位置與時間，讓畫面動起來。"
  },
  "ko": {
    "viewer.open": "확대하기",
    "viewer.phone": "스마트폰",
    "viewer.desktop": "PC / DeX",
    "viewer.close": "닫기",
    "viewer.zoom": "원본 크기",
    "feature.title": "선의 느낌부터 카메라의 움직임까지",
    "feature.lead": "브러시를 만들고 그림의 형태를 다듬은 뒤, 장면 속 카메라의 움직임을 정하세요.",
    "feature.brush": "사용자 지정 브러시",
    "feature.brushBody": "펜촉과 획을 조절해 원하는 선을 그리는 브러시를 만드세요.",
    "feature.mesh": "자유 변형 및 메시 변형",
    "feature.meshBody": "다시 그리지 않고도 그려 놓은 파츠의 윤곽과 위치를 조절할 수 있어요.",
    "feature.camera": "카메라 키프레임",
    "feature.cameraBody": "카메라 위치와 타이밍을 정해 장면에 움직임을 더하세요."
  },
  "fr": {
    "viewer.open": "Agrandir",
    "viewer.phone": "Téléphone",
    "viewer.desktop": "PC / DeX",
    "viewer.close": "Fermer",
    "viewer.zoom": "Taille réelle",
    "feature.title": "Du trait au mouvement de caméra",
    "feature.lead": "Créez une brosse, ajustez votre dessin et choisissez comment la caméra parcourt la scène.",
    "feature.brush": "Brosses personnalisées",
    "feature.brushBody": "Réglez la pointe et le trait pour créer votre propre brosse.",
    "feature.mesh": "Transformation libre et par maillage",
    "feature.meshBody": "Ajustez le contour et la position d’un élément sans le redessiner.",
    "feature.camera": "Images clés de caméra",
    "feature.cameraBody": "Placez la caméra à différents instants pour mettre la scène en mouvement."
  },
  "es": {
    "viewer.open": "Ampliar",
    "viewer.phone": "Móvil",
    "viewer.desktop": "PC / DeX",
    "viewer.close": "Cerrar",
    "viewer.zoom": "Tamaño real",
    "feature.title": "Del trazo al movimiento de cámara",
    "feature.lead": "Crea un pincel, ajusta el dibujo y elige cómo se mueve la cámara por la escena.",
    "feature.brush": "Pinceles personalizados",
    "feature.brushBody": "Ajusta la punta y el trazo para crear tu propio pincel.",
    "feature.mesh": "Transformación libre y de malla",
    "feature.meshBody": "Ajusta el contorno y la posición de una pieza sin volver a dibujarla.",
    "feature.camera": "Fotogramas clave de cámara",
    "feature.cameraBody": "Define la posición de la cámara en distintos momentos para dar movimiento a la escena."
  }
};
  for (const [lang, labels] of Object.entries(copy)) {
    Object.assign(dictionary[lang] || (dictionary[lang] = {}), labels);
  }
})();
