(function () {
  const dictionary = window.NIARIM_I18N_DICT;
  const licenses = {
    ja: {
      "fontLicenses.title": "フォントライセンス",
      "fontLicenses.lead":
        "NIARIMの公式サイトでは「くらむぼん」を見出し・タブ・項目名に、「白光明朝」を本文・説明・注意書きに使用しています。下記の著作権表示とSIL Open Font License 1.1に基づいてフォントを配信しています。",
      "fontLicenses.rights": "権利とライセンス",
      "fontLicenses.designDistribution": "制作・配布",
      "fontLicenses.designer": "フロップデザイン",
      "fontLicenses.adapted": "lavsicによる制作・調整",
      "fontLicenses.download": "公式配布ページ",
      "fontLicenses.sourceCopyright": "改変元の著作権表示",
      "fontLicenses.derived":
        "Source Han Serif／Noto Serif JPから派生しています。",
      "fontLicenses.fallback":
        "韓国語・中国語の補完表示にはNoto Serif KR／SCおよびNoto Sans KR／SCのサブセットを使用しています。派生フォントを含め、ライセンスを同梱しています。",
      "fontLicenses.fullText": "SIL Open Font License 1.1（全文）",
      "fontLicenses.homeLink": "NIARIM トップページに戻る",
      "meta.font-licenses.title": "フォントライセンス | NIARIM",
      "meta.font-licenses.description":
        "NIARIM公式サイトで配信するフォントの権利表示とSIL Open Font License 1.1の全文。",
    },
    en: {
      "fontLicenses.title": "Font licenses",
      "fontLicenses.lead":
        "The NIARIM website uses Kuramubon for headings, tabs and labels, and HakkouMincho for body text, explanations and notices. The fonts are distributed under the copyright notices below and the SIL Open Font License 1.1.",
      "fontLicenses.rights": "Copyright and licenses",
      "fontLicenses.designDistribution": "Design and distribution",
      "fontLicenses.designer": "Flop Design",
      "fontLicenses.adapted": "Designed and adapted by lavsic",
      "fontLicenses.download": "Official download page",
      "fontLicenses.sourceCopyright": "Copyright notice for the source font",
      "fontLicenses.derived": "Derived from Source Han Serif / Noto Serif JP.",
      "fontLicenses.fallback":
        "Subsets of Noto Serif KR / SC and Noto Sans KR / SC provide Korean and Chinese fallback. The licenses are included with these fonts and their derivatives.",
      "fontLicenses.fullText": "SIL Open Font License 1.1 (full text)",
      "fontLicenses.homeLink": "Return to the NIARIM home page",
      "meta.font-licenses.title": "Font licenses | NIARIM",
      "meta.font-licenses.description":
        "Copyright notices for the fonts distributed on the NIARIM website and the full SIL Open Font License 1.1.",
    },
    "zh-Hans": {
      "fontLicenses.title": "字体许可证",
      "fontLicenses.lead":
        "NIARIM 官网的标题、标签页和项目名称使用 Kuramubon，正文、说明和提示使用 HakkouMincho。字体依据下列版权声明及 SIL Open Font License 1.1 分发。",
      "fontLicenses.rights": "版权与许可",
      "fontLicenses.designDistribution": "设计与分发",
      "fontLicenses.designer": "Flop Design",
      "fontLicenses.adapted": "由 lavsic 设计和调整",
      "fontLicenses.download": "官方下载页面",
      "fontLicenses.sourceCopyright": "原始字体的版权声明",
      "fontLicenses.derived": "派生自 Source Han Serif / Noto Serif JP。",
      "fontLicenses.fallback":
        "韩语和中文的补充显示使用 Noto Serif KR / SC 和 Noto Sans KR / SC 的子集。这些字体及其衍生字体均附带许可证。",
      "fontLicenses.fullText": "SIL Open Font License 1.1（全文）",
      "fontLicenses.homeLink": "返回 NIARIM 首页",
      "meta.font-licenses.title": "字体许可证 | NIARIM",
      "meta.font-licenses.description":
        "NIARIM 官网所分发字体的版权声明及 SIL Open Font License 1.1 全文。",
    },
    "zh-Hant": {
      "fontLicenses.title": "字型授權",
      "fontLicenses.lead":
        "NIARIM 官網的標題、分頁與項目名稱採用 Kuramubon，內文、說明與提示採用 HakkouMincho。字型依下列著作權聲明與 SIL Open Font License 1.1 散布。",
      "fontLicenses.rights": "著作權與授權",
      "fontLicenses.designDistribution": "設計與散布",
      "fontLicenses.designer": "Flop Design",
      "fontLicenses.adapted": "由 lavsic 設計與調整",
      "fontLicenses.download": "官方下載頁面",
      "fontLicenses.sourceCopyright": "原始字型的著作權聲明",
      "fontLicenses.derived": "衍生自 Source Han Serif / Noto Serif JP。",
      "fontLicenses.fallback":
        "韓文與中文的補充顯示採用 Noto Serif KR / SC 與 Noto Sans KR / SC 的子集。這些字型及其衍生字型皆附有授權條款。",
      "fontLicenses.fullText": "SIL Open Font License 1.1（全文）",
      "fontLicenses.homeLink": "返回 NIARIM 首頁",
      "meta.font-licenses.title": "字型授權 | NIARIM",
      "meta.font-licenses.description":
        "NIARIM 官網所散布字型的著作權聲明與 SIL Open Font License 1.1 全文。",
    },
    ko: {
      "fontLicenses.title": "글꼴 라이선스",
      "fontLicenses.lead":
        "NIARIM 공식 사이트는 제목, 탭, 항목 이름에 Kuramubon을, 본문, 설명, 안내에 HakkouMincho를 사용합니다. 글꼴은 아래의 저작권 고지와 SIL Open Font License 1.1에 따라 배포합니다.",
      "fontLicenses.rights": "저작권 및 라이선스",
      "fontLicenses.designDistribution": "디자인 및 배포",
      "fontLicenses.designer": "Flop Design",
      "fontLicenses.adapted": "lavsic이 디자인하고 수정함",
      "fontLicenses.download": "공식 다운로드 페이지",
      "fontLicenses.sourceCopyright": "원본 글꼴의 저작권 고지",
      "fontLicenses.derived":
        "Source Han Serif / Noto Serif JP에서 파생되었습니다.",
      "fontLicenses.fallback":
        "한국어와 중국어 표기를 보완하기 위해 Noto Serif KR / SC와 Noto Sans KR / SC의 서브셋을 사용합니다. 이 글꼴과 파생 글꼴에 라이선스가 포함되어 있습니다.",
      "fontLicenses.fullText": "SIL Open Font License 1.1 전문",
      "fontLicenses.homeLink": "NIARIM 홈페이지로 돌아가기",
      "meta.font-licenses.title": "글꼴 라이선스 | NIARIM",
      "meta.font-licenses.description":
        "NIARIM 공식 사이트에서 배포하는 글꼴의 저작권 고지 및 SIL Open Font License 1.1 전문입니다.",
    },
    fr: {
      "fontLicenses.title": "Licences des polices",
      "fontLicenses.lead":
        "Le site NIARIM utilise Kuramubon pour les titres, les onglets et les libellés, et HakkouMincho pour le texte courant, les explications et les remarques. Les polices sont distribuées selon les mentions ci-dessous et la SIL Open Font License 1.1.",
      "fontLicenses.rights": "Droits d’auteur et licences",
      "fontLicenses.designDistribution": "Conception et distribution",
      "fontLicenses.designer": "Flop Design",
      "fontLicenses.adapted": "Conçue et adaptée par lavsic",
      "fontLicenses.download": "Page officielle de téléchargement",
      "fontLicenses.sourceCopyright":
        "Mention de droits d’auteur de la police d’origine",
      "fontLicenses.derived": "Dérivée de Source Han Serif / Noto Serif JP.",
      "fontLicenses.fallback":
        "Des sous-ensembles de Noto Serif KR / SC et de Noto Sans KR / SC complètent l’affichage du coréen et du chinois. Les licences sont fournies avec ces polices et leurs dérivées.",
      "fontLicenses.fullText": "SIL Open Font License 1.1 (texte intégral)",
      "fontLicenses.homeLink": "Retour à l’accueil de NIARIM",
      "meta.font-licenses.title": "Licences des polices | NIARIM",
      "meta.font-licenses.description":
        "Mentions de droits d’auteur des polices distribuées sur le site NIARIM et texte intégral de la SIL Open Font License 1.1.",
    },
    es: {
      "fontLicenses.title": "Licencias de las fuentes",
      "fontLicenses.lead":
        "El sitio de NIARIM usa Kuramubon en títulos, pestañas y etiquetas, y HakkouMincho en textos, explicaciones y avisos. Las fuentes se distribuyen bajo los avisos de derechos de autor indicados a continuación y la SIL Open Font License 1.1.",
      "fontLicenses.rights": "Derechos de autor y licencias",
      "fontLicenses.designDistribution": "Diseño y distribución",
      "fontLicenses.designer": "Flop Design",
      "fontLicenses.adapted": "Diseñada y adaptada por lavsic",
      "fontLicenses.download": "Página oficial de descarga",
      "fontLicenses.sourceCopyright":
        "Aviso de derechos de autor de la fuente original",
      "fontLicenses.derived": "Derivada de Source Han Serif / Noto Serif JP.",
      "fontLicenses.fallback":
        "Para complementar la visualización del coreano y el chino se usan subconjuntos de Noto Serif KR / SC y Noto Sans KR / SC. Las licencias se incluyen con estas fuentes y sus derivados.",
      "fontLicenses.fullText": "SIL Open Font License 1.1 (texto íntegro)",
      "fontLicenses.homeLink": "Volver al inicio de NIARIM",
      "meta.font-licenses.title": "Licencias de las fuentes | NIARIM",
      "meta.font-licenses.description":
        "Avisos de derechos de autor de las fuentes distribuidas en el sitio de NIARIM y texto íntegro de la SIL Open Font License 1.1.",
    },
  };
  for (const [language, messages] of Object.entries(licenses)) {
    Object.assign(dictionary[language], messages);
  }
})();
