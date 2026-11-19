(() => {
  const translations = {
    ja: {
      "accountDeletion.title": "NIARIMアカウントを削除",
      "accountDeletion.warning":
        "削除したアカウントと関連データは復元できません。",
      "accountDeletion.removed": "削除されるデータ",
      "accountDeletion.profile":
        "プロフィール、作品広場の投稿・ブックマーク・フォロー",
      "accountDeletion.rewards":
        "オパール残高、交換した特典、ミッションや通知の履歴",
      "accountDeletion.elsewhere":
        "端末に保存した作品とYouTube上の動画は手元に残ります。",
      "accountDeletion.subscriptions":
        "Google Playの定期購入は別途管理してください",
      "accountDeletion.signIn":
        "削除するNIARIMアカウントと同じGoogleアカウントで本人確認してください。",
      "accountDeletion.understood": "削除後に復元できないことを確認しました",
      "accountDeletion.delete": "アカウントを完全に削除する",
      "accountDeletion.retry": "やり直す",
      "accountDeletion.loading": "本人確認を読み込んでいます。",
      "accountDeletion.verified":
        "本人確認が完了しました。表示されたアカウントを確認してください。",
      "accountDeletion.pending":
        "削除を処理しています。このページを閉じても処理は続きます。",
      "accountDeletion.complete": "NIARIMアカウントの削除が完了しました。",
      "accountDeletion.noAccount":
        "このGoogleアカウントに紐づくNIARIMアカウントは見つかりませんでした。",
      "accountDeletion.error":
        "手続きを続けられませんでした。時間をおいてやり直してください。",
    },
    en: {
      "accountDeletion.title": "Delete your NIARIM account",
      "accountDeletion.warning":
        "You can’t recover your account or its associated data after deletion.",
      "accountDeletion.removed": "Data that will be deleted",
      "accountDeletion.profile":
        "Your profile, Work Plaza posts, bookmarks, and follows",
      "accountDeletion.rewards":
        "Your Opal balance, redeemed benefits, mission history, and notification history",
      "accountDeletion.elsewhere":
        "Projects saved on your device and videos on YouTube stay with you.",
      "accountDeletion.subscriptions":
        "Manage your Google Play subscription separately",
      "accountDeletion.signIn":
        "Verify your identity with the Google account you use for the NIARIM account you want to delete.",
      "accountDeletion.understood":
        "I understand that deletion can’t be undone",
      "accountDeletion.delete": "Permanently delete my account",
      "accountDeletion.retry": "Start again",
      "accountDeletion.loading": "Loading identity verification…",
      "accountDeletion.verified":
        "Your identity has been verified. Check the account shown above.",
      "accountDeletion.pending":
        "Deletion is in progress. It will continue if you close this page.",
      "accountDeletion.complete": "Your NIARIM account has been deleted.",
      "accountDeletion.noAccount":
        "We couldn’t find a NIARIM account linked to this Google account.",
      "accountDeletion.error":
        "We couldn’t continue. Wait a moment and try again.",
    },
    "zh-Hans": {
      "accountDeletion.title": "删除 NIARIM 账号",
      "accountDeletion.warning": "账号及相关数据删除后无法恢复。",
      "accountDeletion.removed": "将删除的数据",
      "accountDeletion.profile": "个人资料、作品广场的投稿、收藏和关注",
      "accountDeletion.rewards": "欧泊余额、已兑换的权益、任务及通知记录",
      "accountDeletion.elsewhere":
        "设备上保存的作品和 YouTube 上的视频会保留。",
      "accountDeletion.subscriptions": "请另行管理 Google Play 订阅",
      "accountDeletion.signIn":
        "请使用与要删除的 NIARIM 账号关联的 Google 账号验证身份。",
      "accountDeletion.understood": "我了解删除后无法恢复",
      "accountDeletion.delete": "永久删除我的账号",
      "accountDeletion.retry": "重新开始",
      "accountDeletion.loading": "正在加载身份验证…",
      "accountDeletion.verified": "身份验证成功。请核对上方显示的账号。",
      "accountDeletion.pending": "正在删除账号。关闭此页面后，删除仍会继续。",
      "accountDeletion.complete": "你的 NIARIM 账号已删除。",
      "accountDeletion.noAccount": "未找到与此 Google 账号关联的 NIARIM 账号。",
      "accountDeletion.error": "无法继续操作。请稍后重试。",
    },
    "zh-Hant": {
      "accountDeletion.title": "刪除 NIARIM 帳號",
      "accountDeletion.warning": "帳號及相關資料刪除後無法復原。",
      "accountDeletion.removed": "將刪除的資料",
      "accountDeletion.profile": "個人資料、作品廣場的投稿、書籤和追蹤",
      "accountDeletion.rewards": "歐泊餘額、已兌換的權益、任務及通知記錄",
      "accountDeletion.elsewhere":
        "儲存在裝置上的作品和 YouTube 上的影片會保留。",
      "accountDeletion.subscriptions": "請另行管理 Google Play 訂閱",
      "accountDeletion.signIn":
        "請使用與要刪除的 NIARIM 帳號連結的 Google 帳號驗證身分。",
      "accountDeletion.understood": "我了解刪除後無法復原",
      "accountDeletion.delete": "永久刪除我的帳號",
      "accountDeletion.retry": "重新開始",
      "accountDeletion.loading": "正在載入身分驗證…",
      "accountDeletion.verified": "身分驗證成功。請核對上方顯示的帳號。",
      "accountDeletion.pending": "正在刪除帳號。關閉此頁面後，刪除仍會繼續。",
      "accountDeletion.complete": "你的 NIARIM 帳號已刪除。",
      "accountDeletion.noAccount":
        "找不到與這個 Google 帳號連結的 NIARIM 帳號。",
      "accountDeletion.error": "無法繼續操作。請稍後再試。",
    },
    ko: {
      "accountDeletion.title": "NIARIM 계정 삭제",
      "accountDeletion.warning":
        "삭제한 계정과 관련 데이터는 복구할 수 없습니다.",
      "accountDeletion.removed": "삭제되는 데이터",
      "accountDeletion.profile": "프로필, 작품 광장 게시물, 북마크 및 팔로우",
      "accountDeletion.rewards": "보유한 오팔, 교환한 혜택, 미션 및 알림 기록",
      "accountDeletion.elsewhere":
        "기기에 저장한 작품과 YouTube 동영상은 그대로 남습니다.",
      "accountDeletion.subscriptions":
        "Google Play 구독은 별도로 관리해 주세요",
      "accountDeletion.signIn":
        "삭제하려는 NIARIM 계정에 연결된 Google 계정으로 본인 확인을 해 주세요.",
      "accountDeletion.understood": "삭제 후 복구할 수 없음을 확인했습니다",
      "accountDeletion.delete": "내 계정 영구 삭제",
      "accountDeletion.retry": "처음부터 다시 시작",
      "accountDeletion.loading": "본인 확인을 불러오는 중입니다.",
      "accountDeletion.verified":
        "본인 확인이 완료되었습니다. 위에 표시된 계정을 확인해 주세요.",
      "accountDeletion.pending":
        "삭제를 처리하는 중입니다. 이 페이지를 닫아도 계속 진행됩니다.",
      "accountDeletion.complete": "NIARIM 계정이 삭제되었습니다.",
      "accountDeletion.noAccount":
        "이 Google 계정에 연결된 NIARIM 계정을 찾을 수 없습니다.",
      "accountDeletion.error":
        "진행할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    },
    fr: {
      "accountDeletion.title": "Supprimer votre compte NIARIM",
      "accountDeletion.warning":
        "Après la suppression, vous ne pourrez plus récupérer votre compte ni les données associées.",
      "accountDeletion.removed": "Données supprimées",
      "accountDeletion.profile":
        "Votre profil, vos publications dans la Place des œuvres, vos favoris et vos abonnements aux créateurs",
      "accountDeletion.rewards":
        "Votre solde d’opales, les avantages obtenus en échange, l’historique des missions et des notifications",
      "accountDeletion.elsewhere":
        "Vos projets enregistrés sur votre appareil et vos vidéos sur YouTube restent accessibles.",
      "accountDeletion.subscriptions":
        "Gérez votre abonnement Google Play séparément",
      "accountDeletion.signIn":
        "Vérifiez votre identité avec le compte Google associé au compte NIARIM à supprimer.",
      "accountDeletion.understood":
        "Je comprends que la suppression est irréversible",
      "accountDeletion.delete": "Supprimer définitivement mon compte",
      "accountDeletion.retry": "Recommencer",
      "accountDeletion.loading": "Chargement de la vérification d’identité…",
      "accountDeletion.verified":
        "Votre identité est vérifiée. Vérifiez le compte affiché ci-dessus.",
      "accountDeletion.pending":
        "La suppression est en cours. Elle se poursuit si vous fermez cette page.",
      "accountDeletion.complete": "Votre compte NIARIM a été supprimé.",
      "accountDeletion.noAccount":
        "Aucun compte NIARIM associé à ce compte Google n’a été trouvé.",
      "accountDeletion.error":
        "Impossible de continuer. Réessayez dans un instant.",
    },
    es: {
      "accountDeletion.title": "Eliminar tu cuenta de NIARIM",
      "accountDeletion.warning":
        "Una vez eliminada tu cuenta, ni la cuenta ni sus datos asociados podrán recuperarse.",
      "accountDeletion.removed": "Datos que se eliminarán",
      "accountDeletion.profile":
        "Tu perfil, tus publicaciones en la Plaza de Obras, tus marcadores y las cuentas que sigues",
      "accountDeletion.rewards":
        "Tu saldo de ópalos, las ventajas canjeadas y el historial de misiones y notificaciones",
      "accountDeletion.elsewhere":
        "Los proyectos guardados en tu dispositivo y tus vídeos de YouTube seguirán disponibles.",
      "accountDeletion.subscriptions":
        "Gestiona tu suscripción a Google Play por separado",
      "accountDeletion.signIn":
        "Verifica tu identidad con la cuenta de Google vinculada a la cuenta de NIARIM que quieres eliminar.",
      "accountDeletion.understood":
        "Entiendo que la eliminación es irreversible",
      "accountDeletion.delete": "Eliminar mi cuenta permanentemente",
      "accountDeletion.retry": "Volver a empezar",
      "accountDeletion.loading": "Cargando la verificación de identidad…",
      "accountDeletion.verified":
        "Tu identidad se ha verificado. Comprueba la cuenta que aparece arriba.",
      "accountDeletion.pending":
        "La eliminación está en curso. Continuará si cierras esta página.",
      "accountDeletion.complete": "Tu cuenta de NIARIM se ha eliminado.",
      "accountDeletion.noAccount":
        "No encontramos ninguna cuenta de NIARIM vinculada a esta cuenta de Google.",
      "accountDeletion.error":
        "No se pudo continuar. Espera un momento e inténtalo de nuevo.",
    },
  };
  const dict = window.NIARIM_I18N_DICT;
  for (const [lang, messages] of Object.entries(translations)) {
    Object.assign(dict[lang], messages);
  }
})();
