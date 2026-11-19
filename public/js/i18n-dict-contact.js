(function () {
  const dict = window.NIARIM_I18N_DICT;
  const contact = {
    ja: {
      "contact.email.support": "NIARIMのサポート",
      "contact.email.studio": "MIRANIMA Studioの総合窓口",
      "contact.form.attachmentRemove": "外す",
      "contact.form.attachmentRemoveNamed": "%sを外す",
      "contact.error.attachmentCount": "添付は3件までです。",
      "contact.error.attachmentFormat":
        "「%s」は対応形式ではないか、中身がありません。",
      "contact.error.attachmentSize":
        "「%s」は1件あたりのサイズ上限を超えています。",
      "contact.error.attachmentTotal":
        "添付の合計は20MBまでです。ファイルを減らしてください。",
      "contact.error.attachmentRejected":
        "添付を読み込めませんでした。ファイルが開けることと形式を確認してください。",
    },
    en: {
      "contact.email.support": "NIARIM support",
      "contact.email.studio": "MIRANIMA Studio general inquiries",
      "contact.form.attachmentRemove": "Remove",
      "contact.form.attachmentRemoveNamed": "Remove %s",
      "contact.error.attachmentCount": "You can attach up to 3 files.",
      "contact.error.attachmentFormat":
        "%s is empty or uses an unsupported format.",
      "contact.error.attachmentSize":
        "%s exceeds the size limit for a single file.",
      "contact.error.attachmentTotal":
        "Attachments may total up to 20 MB. Remove a file and try again.",
      "contact.error.attachmentRejected":
        "An attachment could not be read. Check that each file opens and uses a supported format.",
    },
    "zh-Hans": {
      "contact.email.support": "NIARIM 支持",
      "contact.email.studio": "MIRANIMA Studio 综合咨询",
      "contact.form.attachmentRemove": "移除",
      "contact.form.attachmentRemoveNamed": "移除 %s",
      "contact.error.attachmentCount": "最多可添加 3 个附件。",
      "contact.error.attachmentFormat": "“%s”为空或格式不受支持。",
      "contact.error.attachmentSize": "“%s”超出单个文件的大小限制。",
      "contact.error.attachmentTotal":
        "附件总大小不能超过 20 MB。请减少附件后重试。",
      "contact.error.attachmentRejected":
        "无法读取附件。请确认每个文件都能打开且格式受支持。",
    },
    "zh-Hant": {
      "contact.email.support": "NIARIM 支援",
      "contact.email.studio": "MIRANIMA Studio 一般聯絡",
      "contact.form.attachmentRemove": "移除",
      "contact.form.attachmentRemoveNamed": "移除 %s",
      "contact.error.attachmentCount": "最多可加入 3 個附件。",
      "contact.error.attachmentFormat": "「%s」是空檔案或格式不受支援。",
      "contact.error.attachmentSize": "「%s」超過單一檔案的大小上限。",
      "contact.error.attachmentTotal":
        "附件總大小不得超過 20 MB。請移除檔案後再試一次。",
      "contact.error.attachmentRejected":
        "無法讀取附件。請確認每個檔案可開啟且格式受支援。",
    },
    ko: {
      "contact.email.support": "NIARIM 지원",
      "contact.email.studio": "MIRANIMA Studio 일반 문의",
      "contact.form.attachmentRemove": "제거",
      "contact.form.attachmentRemoveNamed": "%s 제거",
      "contact.error.attachmentCount":
        "첨부 파일은 최대 3개까지 추가할 수 있습니다.",
      "contact.error.attachmentFormat":
        "‘%s’ 파일이 비어 있거나 지원되지 않는 형식입니다.",
      "contact.error.attachmentSize":
        "‘%s’ 파일이 개별 크기 제한을 초과했습니다.",
      "contact.error.attachmentTotal":
        "첨부 파일은 총 20MB까지 가능합니다. 파일을 줄이고 다시 시도해 주세요.",
      "contact.error.attachmentRejected":
        "첨부 파일을 읽을 수 없습니다. 파일이 열리는지, 지원되는 형식인지 확인해 주세요.",
    },
    fr: {
      "contact.email.support": "Assistance NIARIM",
      "contact.email.studio": "Demandes générales à MIRANIMA Studio",
      "contact.form.attachmentRemove": "Retirer",
      "contact.form.attachmentRemoveNamed": "Retirer %s",
      "contact.error.attachmentCount":
        "Vous pouvez joindre jusqu’à 3 fichiers.",
      "contact.error.attachmentFormat":
        "Le fichier « %s » est vide ou son format n’est pas pris en charge.",
      "contact.error.attachmentSize":
        "Le fichier « %s » dépasse la taille maximale par fichier.",
      "contact.error.attachmentTotal":
        "Les pièces jointes sont limitées à 20 Mo au total. Retirez un fichier et réessayez.",
      "contact.error.attachmentRejected":
        "Impossible de lire une pièce jointe. Vérifiez que chaque fichier s’ouvre et que son format est pris en charge.",
    },
    es: {
      "contact.email.support": "Soporte de NIARIM",
      "contact.email.studio": "Consultas generales a MIRANIMA Studio",
      "contact.form.attachmentRemove": "Quitar",
      "contact.form.attachmentRemoveNamed": "Quitar %s",
      "contact.error.attachmentCount": "Puedes adjuntar hasta 3 archivos.",
      "contact.error.attachmentFormat":
        "El archivo «%s» está vacío o tiene un formato incompatible.",
      "contact.error.attachmentSize":
        "El archivo «%s» supera el tamaño máximo por archivo.",
      "contact.error.attachmentTotal":
        "Los archivos adjuntos pueden sumar hasta 20 MB. Quita un archivo y vuelve a intentarlo.",
      "contact.error.attachmentRejected":
        "No se pudo leer un archivo adjunto. Comprueba que todos se puedan abrir y tengan un formato compatible.",
    },
  };
  for (const [lang, table] of Object.entries(contact))
    Object.assign(dict[lang], table);
})();
