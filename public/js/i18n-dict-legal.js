/**
 * NIARIM公式サイト プライバシーポリシー・利用規約 翻訳辞書
 *
 * 本文はNIARIMアプリ本体(dev_branch)の lib/l10n/app_*.arb に定義された
 * 実際のプライバシーポリシー・利用規約の条文(7言語)をそのまま転記したもの。
 * アプリ側で既にAI翻訳・逆翻訳照合を経ているが、専門家（弁護士等）による
 * 正式な法的確認は経ていない点はアプリ側と同様。
 *
 * 2026/08/31付でアプリ側dev_branchの最新版(第7条「作品広場：コミュニティ
 * 投稿機能における情報の取扱い」新設に伴うプライバシーポリシーの9条化、
 * 第12条「作品広場：コミュニティ投稿機能」新設に伴う利用規約の13条化、
 * および対応端末の記載見直し等)へ再同期した。
 *
 * 2026/09/02付でプライバシーポリシー第3条(第三者サービスによる情報の取得)を
 * 再同期した。アプリ側に【追加フォントのダウンロード(GitHub)】のブロックが
 * 追加されたため(設定画面「フォント管理」から追加フォントを取得する操作を
 * したときだけGitHubへ通信が発生する旨の開示)。差分はこの1キー×7言語のみで、
 * 他の45キーはアプリ側と一致していることを突き合わせて確認済み。
 *
 * 差分: プライバシーポリシー第9条（お問い合わせ）は、アプリ側では
 * 連絡先未確定のプレースホルダーのままだが、本サイトには実際に機能する
 * お問い合わせフォーム(/contact/)があるため、そちらへ案内する文言に
 * 差し替えている（data-i18n-htmlで挿入）。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var LEGAL = {
    ja: {
      "legal.notice.privacy":
        "本文はNIARIMアプリの正式なプライバシーポリシーと共通の内容です。",
      "legal.notice.terms":
        "本文はNIARIMアプリの正式な利用規約と共通の内容です（フォント・OSSライセンス等の記載を除く）。",
      "legal.privacy.art1.title": "第1条（本ポリシーの位置づけ）",
      "legal.privacy.art1.body":
        "このプライバシーポリシー（以下「本ポリシー」といいます。）は、本アプリ「NIARIM」（以下「本アプリ」といいます。）における情報の取扱いについて定めるものです。本アプリの利用条件全般については別途「利用規約・ライセンス」画面をご確認ください。",
      "legal.privacy.art2.title": "第2条（本アプリが取得しないデータ）",
      "legal.privacy.art2.body":
        "本アプリは、ユーザーが作成したイラスト・アニメーション等のコンテンツ（プロジェクトデータ・書き出し画像・動画等を含みます。以下同じです。）を、開発者のサーバーへ送信・収集・保存する機能を提供していません。これらのデータは、原則としてユーザーの端末内にのみ保存されます。（クラウド同期機能は搭載していません。）開発者はこれらのコンテンツを自ら保存する機能を持たないため、開発者側での保存期間という概念自体がありません。端末内に保存されたデータは、本アプリの削除機能により随時削除できるほか、アプリをアンインストールした場合はプロジェクト・設定・追加したフォント等のデータも併せて削除されます。（ただし、ユーザーが自らの意思で作品広場機能を利用して作品を投稿する場合の情報の取扱いについては、第7条によります。）",
      "legal.privacy.art3.title": "第3条（第三者サービスによる情報の取得）",
      "legal.privacy.art3.body":
        "本アプリは、以下の第三者サービスを組み込んでおり、それぞれのサービス提供者が、サービス提供に必要な範囲で情報を取得する場合があります。本アプリの開発者は、これらの情報を独自に取得・保存する機能を実装していません。（各サービスが取得した情報の管理は、それぞれのサービス提供者のプライバシーポリシーに従います。）\n\n【広告配信（Google AdMob）】\n無料版では、Google AdMobを通じて広告を配信しています。広告の配信、効果測定、不正防止等の目的で、広告識別子（Advertising ID）その他の端末情報が、Googleまたはその関連事業者によって取得・利用される場合があります。取得・利用の詳細は、Googleのプライバシーポリシー（https://policies.google.com/privacy）をご確認ください。端末の設定（Android設定アプリの「プライバシー」等）から、広告識別子のリセットや、パーソナライズ広告の無効化が可能です。欧州経済領域（EEA）・英国・スイスにお住まいの場合は、起動時等に表示される同意フォームで、広告のパーソナライズに関する同意設定を選択できます。設定はいつでも本画面下部の「広告の同意設定を変更」ボタンから変更できます。\n\n【アプリ内課金（Google Play Billing）】\nプレミアム機能の購入は、Google Playの決済システムを通じて行われます。クレジットカード番号等の決済情報は、開発者側が直接取得・保持することはありません。決済に関する情報の取扱いは、Google Playの規定に従います。\n\n【追加フォントのダウンロード（GitHub）】\n設定画面の「フォント管理」から追加フォントをダウンロードする操作を行った場合に限り、フォントの配布元であるGitHub（GitHub, Inc.）のサーバーへ通信が発生します。この通信はお客様がダウンロードを選択したときにのみ行われ、アプリの起動時や通常の利用では発生しません。送信されるのは通信に必要な情報（IPアドレス、取得するフォントファイルの指定等）のみで、作品データやお客様を特定する情報を送信することはありません。取得された情報の取扱いは、GitHubのプライバシーポリシー（https://docs.github.com/site-policy/privacy-policies/github-privacy-statement）に従います。\n\n【クラッシュ解析・利用状況分析】\n本アプリは、現時点でクラッシュ解析・利用状況分析を目的としたSDKを組み込んでいません。将来これらのサービスを導入する場合は、本ポリシーを更新し、本アプリ内で告知します。",
      "legal.privacy.art4.title": "第4条（Cookie等のトラッキング技術について）",
      "legal.privacy.art4.body":
        "本アプリ自体はCookieを使用しませんが、第3条記載の広告配信サービス（Google AdMob）が、広告の配信・効果測定のために、これに類する識別技術（広告識別子等）を使用する場合があります。",
      "legal.privacy.art5.title": "第5条（お子様の個人情報について）",
      "legal.privacy.art5.body":
        "本アプリは、13歳未満のお子様を主な対象として意図的に情報を収集するものではありません。保護者の方は、お子様が本アプリを利用する際、必要に応じて端末の設定からパーソナライズ広告の無効化等をご検討ください。",
      "legal.privacy.art6.title": "第6条（情報の越境移転について）",
      "legal.privacy.art6.body":
        "第3条記載の第三者サービス（Google AdMob、Google Play Billing）は、Google社が世界各地で運用するサーバー上で処理される場合があります。これらの取扱いについては、各サービスのプライバシーポリシーが適用されます。",
      "legal.privacy.art7.title":
        "第7条（作品広場：コミュニティ投稿機能における情報の取扱い）",
      "legal.privacy.art7.body":
        "1. 本アプリは、ユーザーが自らの意思で「作品広場」機能（利用規約第12条）を利用する場合に限り、以下の情報を開発者のサーバーで管理します。\n・投稿作品を識別・表示するための情報（YouTube動画ID、タイトル、統計情報、投稿日時、タグ等）\n・投稿・通報・ブロック・フォロー・ブックマーク等の機能の利用にあたり発行するNIARIM User ID（Googleアカウントとは別に本アプリ内部で発行する識別子）\n・連携したYouTubeチャンネルの公開情報（チャンネル名、チャンネルアイコンの画像URL）。これは投稿者名・アイコンの表示に用いるため、開発者のサーバーに複製して保持します\n・通報機能を利用した場合の通報内容および通報者のNIARIM User ID\n・ブロックした相手のNIARIM User ID\n・フォローした相手のNIARIM User ID、およびフォロー数・フォロワー数\n・ブックマークした作品のIDおよびブックマークした日時\n・リポストした作品のIDおよびリポストした日時\n・作品に付けられたタグ（第4項参照）\n・プッシュ通知を有効にした場合の端末トークン（通知の宛先を特定するために端末が発行する識別子。通知の送信のみに用います）\n2. 投稿された動画ファイル本体はYouTube上に保存され、開発者のサーバーには保存されません。\n3. 前2項の情報は、本コミュニティ機能の提供（作品の一覧表示・ランキング・検索、通報への対応、投稿上限の管理、フォロー・ブックマーク・リポストの反映、通知の送信等）の目的の範囲内でのみ利用します。開発者はこれらの情報を広告配信の目的で第三者へ提供しません。\n4. タグは、投稿者以外のユーザーも追加・削除できます（投稿者は自分の作品のタグをロックして編集を禁止できます）。タグは作品広場上で公開され、誰が付けたかは表示されません。\n5. 次の情報は既定で非公開であり、ユーザーが本アプリ内で公開設定へ切り替えた場合に限り他のユーザーへ表示されます。\n・ブックマークした作品の一覧\n・フォロー中／フォロワーの一覧\nなお、フォロー数・フォロワー数（人数）は公開設定にかかわらず常に表示されます。\n6. 投稿作品を非公開にする、または削除した場合、当該作品は作品広場の一覧・ランキングから表示されなくなります。開発者のサーバー上の記録の削除を希望する場合は、第9条の窓口へご連絡ください。\n7. 本コミュニティ機能を利用しない場合、本条に基づく情報の取扱いは発生しません。（第2条の原則どおり、開発者のサーバーへの送信は行われません。）",
      "legal.privacy.art8.title": "第8条（本ポリシーの変更）",
      "legal.privacy.art8.body":
        "開発者は、法令の改正、本アプリの内容の変更その他必要と判断した場合、本ポリシーを変更することがあります。本ポリシーを変更する場合、変更内容および効力発生日を、本アプリ内その他適切な方法により、事前に周知します。",
      "legal.privacy.art9.title": "第9条（お問い合わせ）",
      "legal.privacy.art9.body.html":
        '本ポリシーに関するお問い合わせは、本サイトの<a href="/contact/">お問い合わせフォーム</a>よりご連絡ください。',
      "legal.terms.art8.privacyLink.html":
        'プライバシーポリシーは<a href="/privacy/">こちら</a>。',
      "legal.terms.contact.title": "お問い合わせ窓口",
      "legal.terms.contact.body.html":
        '本規約に関するお問い合わせは、<a href="/contact/">お問い合わせフォーム</a>よりご連絡ください。',
      "legal.terms.art1.title": "第1条（適用）",
      "legal.terms.art1.body":
        "この利用規約（以下「本規約」といいます。）は、本アプリ「NIARIM」（以下「本アプリ」といいます。）の利用条件を定めるものです。ユーザーは、本規約に同意の上、本アプリをご利用いただくものとします。本アプリを利用することにより、本規約に同意したものとみなします。",
      "legal.terms.art2.title": "第2条（利用資格・対応環境）",
      "legal.terms.art2.body":
        "1. 本アプリの対応OSや推奨動作環境の詳細は、各配布ストアおよび本アプリ内の表示に従います。\n2. 本アプリは、多様な性能の端末でも快適にご利用いただけるよう工夫していますが、端末の性能・OSのバージョン・空き容量・設定その他の利用環境によっては、一部機能が制限される、または正常に動作しない場合があります。",
      "legal.terms.art3.title": "第3条（禁止事項）",
      "legal.terms.art3.body":
        "ユーザーは本アプリの利用にあたり、以下の行為をしてはなりません。\n・法令または公序良俗に違反する行為\n・本アプリ、開発者または第三者の著作権・商標権その他の知的財産権、肖像権、プライバシーその他の権利または利益を侵害する行為\n・本アプリの逆コンパイル、逆アセンブル、リバースエンジニアリングその他解析を目的とする行為（法令上認められる場合を除く）\n・本アプリの不正な改造、複製または再配布\n・本アプリまたはその提供基盤に対する不正アクセス、過度な負荷その他、正常な提供を妨げる行為\n・その他、開発者が合理的な理由に基づき不適切と判断する行為",
      "legal.terms.art4.title": "第4条（作成コンテンツの権利）",
      "legal.terms.art4.body":
        "1. ユーザーが本アプリを利用して作成したイラスト・アニメーション等のコンテンツ（プロジェクトデータ・書き出した画像・動画等を含みます。以下「作成コンテンツ」といいます。）に関する著作権その他の権利は、法令上認められる範囲において、当該コンテンツについて権利を有するユーザーまたは第三者に帰属します。\n2. 本アプリは、作成コンテンツを開発者のサーバーへ送信・収集・同期する機能を提供していません。プロジェクトデータは、原則としてユーザーの端末内にのみ保存されます。（ユーザーが自らの意思で作品広場機能を利用して作成コンテンツを投稿する場合の取扱いについては、第12条によります。）\n3. 無料版・プレミアム版のいずれを利用して作成した場合であっても、本アプリの利用料金やエディションを理由として、開発者が作成コンテンツの商用利用を制限することはありません。（無料版・プレミアム版の違いは、エンドカード表示や書き出し時間の上限等の機能面に限られます。）\n4. 前項にかかわらず、ユーザーが本アプリに追加したフォント・画像・素材等、第三者が権利を有するものについては、それぞれの利用条件（第5条）に従う必要があります。",
      "legal.terms.art5.title": "第5条（同梱フォント・追加素材について）",
      "legal.terms.art5.body":
        "1. 本アプリに同梱されるフォントその他の素材は、本画面「使用フォントについて」に記載された各ライセンス条件に従い利用されています。\n2. ユーザーが本アプリに追加登録・読み込みしたフォント、画像、トーン、スタンプ等の素材の権利関係については、ユーザー自身の責任において、必要な権利または許諾を取得の上、適法にご利用ください。\n3. ユーザーによる第三者素材の利用に起因して第三者との間で紛争等が生じた場合、開発者は、法令上の責任を負う場合を除き、その責任を負いません。",
      "legal.terms.art6.title": "第6条（プレミアム機能・課金）",
      "legal.terms.art6.body":
        "1. 本アプリには、無料でご利用いただける機能のほか、アプリ内課金（月額プラン、年額プランその他のプレミアムプラン）により利用可能となるプレミアム機能があります。\n2. プレミアム機能の価格、提供内容、購入方法その他の条件は、購入時点における本アプリ内または配布ストアの表示に従います。\n3. 購入後のキャンセル・返金その他決済に関する事項については、Google Playその他ご利用の決済プラットフォームの規定が適用されます。ただし、法令に別段の定めがある場合は、その定めに従います。\n4. 開発者は、法令の改正、技術上の必要性、本アプリの改善その他の合理的な理由により、プレミアム機能の内容を変更することがあります。重要な変更を行う場合は、可能な限り事前に本アプリ内その他適切な方法でお知らせします。",
      "legal.terms.art7.title": "第7条（広告表示）",
      "legal.terms.art7.body":
        "1. 無料版では、第三者の広告配信サービスを通じた広告が表示される場合があります。\n2. 広告配信事業者による情報の取得・利用その他の取扱いについては、各広告配信事業者のプライバシーポリシーが適用されます。",
      "legal.terms.art8.title": "第8条（情報の取扱い）",
      "legal.terms.art8.body":
        "1. 本アプリは、ユーザーが作成したイラスト・アニメーション等のコンテンツおよびプロジェクトデータを、開発者のサーバーへ送信・収集する機能を提供していません。これらは原則としてユーザーの端末内にのみ保存されており、開発者はこれらを自ら保存する機能を持たないため、開発者側での保存期間という概念自体がありません。\n2. 本アプリが組み込む第三者サービス（広告配信・アプリ内課金等）による情報の取得その他ユーザーの情報の取扱いについては、別途定める「プライバシーポリシー」の定めに従うものとします。\n3. 本アプリをアンインストールした場合、端末内に保存されたデータ（プロジェクト、設定、追加したフォント等）は削除されます。",
      "legal.terms.art9.title": "第9条（提供の停止・変更・終了）",
      "legal.terms.art9.body":
        "1. 開発者は、本アプリの保守・更新・修正を行う場合、提供基盤に不具合が生じた場合その他やむを得ない事情がある場合、本アプリの全部または一部の提供を一時的に停止することがあります。\n2. 開発者は、必要に応じて本アプリの内容を変更し、または本アプリの提供を終了することがあります。\n3. 前2項の場合、緊急のときを除き、可能な限り事前に本アプリ内その他適切な方法で告知します。\n4. 本条に基づく変更・停止・終了によってユーザーに生じた損害について、開発者は、法令上の責任を負う場合を除き、責任を負いません。",
      "legal.terms.art10.title": "第10条（免責事項）",
      "legal.terms.art10.body":
        "1. 開発者は、本アプリについて、事実上または法律上の瑕疵（安全性・信頼性・正確性・完全性・特定目的への適合性・バグや不具合がないこと等を含みます。）がないことを保証するものではありません。\n2. ユーザーは、本アプリを自己の責任においてご利用いただくものとします。端末の故障・誤操作・OSの更新その他の事情によりデータが失われる場合がありますので、作成中のデータについては、書き出し・共有機能等を利用した定期的なバックアップを推奨します。\n3. 本アプリの利用によってユーザーに生じた損害について、開発者は、法令上認められる範囲で責任を負いません。ただし、開発者に故意または重過失がある場合はこの限りではなく、その場合であっても、開発者が負う損害賠償責任は、通常生じうる直接損害に限り、ユーザーが本アプリに関し直近1年間に実際に支払った金額（無料でご利用の場合は0円）を上限とします。",
      "legal.terms.art11.title": "第11条（本規約の変更）",
      "legal.terms.art11.body":
        "1. 開発者は、法令の改正、本アプリの内容の変更その他必要と判断した場合、本規約を変更することがあります。\n2. 本規約を変更する場合、変更内容および効力発生日を、本アプリ内その他適切な方法により、事前に周知します。\n3. 変更後の本規約は、法令上認められる範囲において、前項の効力発生日から適用されます。",
      "legal.terms.art12.title": "第12条（作品広場：コミュニティ投稿機能）",
      "legal.terms.art12.body":
        "1. 本アプリは、ユーザーが作成したアニメーション作品を、ユーザー自身のGoogleアカウントを通じてYouTubeへ投稿し、「作品広場」上で公開・閲覧できる機能（以下「本コミュニティ機能」といいます。）を任意で提供します。作品の閲覧・作成自体は、本コミュニティ機能を利用しなくても行えます。\n2. 投稿された動画ファイル本体はYouTube上に保存され、開発者のサーバーには保存されません。一方、投稿作品の識別・表示に必要な情報（YouTube動画ID、タイトル、統計情報、通報情報等）、および投稿・通報・ブロック機能の利用にあたり発行されるNIARIM User ID（Googleアカウントとは別に本アプリ内部で発行する識別子）は、開発者のサーバーで管理します。\n3. 本コミュニティ機能のうち、作品の投稿、通報およびユーザーのブロックには、Googleアカウントによるログインが必要です。\n4. 投稿できる作品数には1日あたりの上限があります。（無料会員・プレミアム会員で上限が異なります。）当該上限は、運営上の都合により変更されることがあります。\n5. ユーザーは、他のユーザーが投稿した作品のうち、法令もしくは公序良俗に違反する、または第3条各号に該当するおそれがあると考えるものについて、本アプリ内の通報機能を通じて開発者に報告できます。開発者は、通報の内容を確認のうえ、合理的な理由に基づき当該作品の一覧からの非表示その他の必要な措置を講じることがあります。虚偽の通報または通報機能の濫用は禁止します。\n6. ユーザーが投稿を削除した場合、または本アプリにおけるGoogleアカウント連携を解除した場合、当該投稿に対応するYouTube動画が削除されることがあります。また、YouTube側で動画が非公開または削除された場合、当該作品は作品広場上でも表示されなくなります。\n7. 本コミュニティ機能の利用にあたっては、本規約に加えてYouTubeの利用規約およびコミュニティガイドラインが適用されます。\n8. ユーザーは、他のユーザーをフォローし、他のユーザーの作品をブックマークまたはリポストできます。フォロー中／フォロワーの一覧およびブックマークした作品の一覧は既定で非公開であり、公開するかどうかはユーザーが本アプリ内で選択できます。フォロー数・フォロワー数は公開設定にかかわらず表示されます。\n9. 作品に付けるタグは、投稿者以外のユーザーも追加・削除できます。投稿者は、自分の作品のタグをロックして他のユーザーによる編集を禁止できます。ユーザーは、他人を誹謗中傷するタグ、作品の内容と無関係なタグその他不適切なタグを付けてはなりません。開発者は、不適切なタグを削除することがあります。\n10. 開発者は、フォローされた場合等に本アプリ内の通知一覧へ通知を表示します。ユーザーが端末の通知を許可した場合は、プッシュ通知が送信されることがあります。通知は本アプリの設定または端末の設定から無効にできます。\n11. ユーザーは、本コミュニティ機能を、他のユーザーへの嫌がらせ、宣伝・勧誘、その他本来の目的（作品の公開と閲覧）から外れる目的で利用してはなりません。ブロック機能を利用した場合、ブロックした相手の作品は自分の一覧に表示されなくなります。",
      "legal.terms.art13.title": "第13条（準拠法・裁判管轄）",
      "legal.terms.art13.body":
        "1. 本規約の解釈にあたっては、日本法を準拠法とします。\n2. 本アプリに関して紛争が生じた場合には、訴額に応じて開発者の所在地を管轄する地方裁判所または簡易裁判所を第一審の専属的合意管轄裁判所とします。",
    },
    en: {
      "legal.notice.privacy":
        "This text is shared with the official Privacy Policy inside the NIARIM app.",
      "legal.notice.terms":
        "This text is shared with the official Terms of Service inside the NIARIM app (excluding font/OSS license credits).",
      "legal.privacy.art1.title": "Article 1 (Purpose of This Policy)",
      "legal.privacy.art1.body":
        'This Privacy Policy (the "Policy") sets out how information is handled in the app "NIARIM" (the "App"). For the general terms of use of the App, please refer separately to the "Terms of Service / License" screen.',
      "legal.privacy.art2.title": "Article 2 (Data the App Does Not Collect)",
      "legal.privacy.art2.body":
        "The App does not provide any function to transmit, collect, or store on the developer's servers the illustrations, animations, and other content created by users (including project data, exported images, videos, etc.; the same applies hereinafter). This data is, in principle, stored only on the user's device (the App does not include a cloud sync feature). Because the developer has no function to store this content on its own, there is no concept of a retention period on the developer's side. Data stored on your device can be deleted at any time using the App's deletion features, and if you uninstall the App, data stored on your device — including projects, settings, and added fonts — will also be deleted (for the handling of information when a user chooses to post a work using the Work Plaza feature, see Article 7).",
      "legal.privacy.art3.title":
        "Article 3 (Information Collected by Third-Party Services)",
      "legal.privacy.art3.body":
        'The App incorporates the following third-party services, and each service provider may collect information to the extent necessary to provide its respective service. The developer of the App has not implemented any function to independently acquire or store this information (the handling of information collected by each service is governed by that service provider\'s own privacy policy).\n\n[Advertising Delivery (Google AdMob)]\nIn the free version, advertisements are delivered through Google AdMob. For purposes such as ad delivery, effectiveness measurement, and fraud prevention, the Advertising ID and other device information may be collected and used by Google or its affiliated companies. For details on the collection and use of this information, please refer to Google\'s Privacy Policy (https://policies.google.com/privacy). You can reset your Advertising ID or disable personalized ads from your device settings (e.g., "Privacy" in the Android Settings app). If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, you can choose your ad personalization consent settings via a consent form shown at launch, and change this choice at any time using the "Manage ad consent settings" button at the bottom of this screen.\n\n[In-App Purchases (Google Play Billing)]\nPurchases of premium features are made through Google Play\'s payment system. The developer does not directly acquire or hold payment information such as credit card numbers. The handling of payment-related information is governed by Google Play\'s rules.\n\n[Downloading Additional Fonts (GitHub)]\nCommunication with GitHub (GitHub, Inc.), the distributor of the font files, occurs only when you choose to download an additional font from "Font Management" in the settings screen. It does not occur when the app starts or during normal use. Only information required for the request (such as your IP address and which font file is requested) is sent; no artwork data or information identifying you is sent. Handling of the information obtained is governed by the GitHub Privacy Statement (https://docs.github.com/site-policy/privacy-policies/github-privacy-statement).\n\n[Crash Analytics / Usage Analytics]\nThe App does not currently incorporate any SDK for crash analytics or usage analytics. If such services are introduced in the future, this Policy will be updated and announced within the App.',
      "legal.privacy.art4.title":
        "Article 4 (Cookies and Other Tracking Technologies)",
      "legal.privacy.art4.body":
        "The App itself does not use cookies, but the advertising delivery service referred to in Article 3 (Google AdMob) may use similar identification technologies (such as the Advertising ID) for ad delivery and effectiveness measurement.",
      "legal.privacy.art5.title": "Article 5 (Children's Personal Information)",
      "legal.privacy.art5.body":
        "The App is not intentionally designed to collect information primarily targeting children under the age of 13. Parents and guardians should consider disabling personalized ads from their device settings as needed when their children use the App.",
      "legal.privacy.art6.title":
        "Article 6 (Cross-Border Transfer of Information)",
      "legal.privacy.art6.body":
        "The third-party services referred to in Article 3 (Google AdMob, Google Play Billing) may process data on servers operated by Google in various locations around the world. The handling of such data is governed by the privacy policy of each respective service.",
      "legal.privacy.art7.title":
        "Article 7 (Handling of Information in the Work Plaza: Community Posting Feature)",
      "legal.privacy.art7.body":
        "1. Only when a user chooses, of their own accord, to use the \"the Work Plaza\" feature (Article 12 of the Terms of Service), the developer manages the following information on its servers:\n・Information needed to identify and display a posted work (YouTube video ID, title, statistics, posting date and time, tags, etc.)\n・The NIARIM User ID issued for use of features such as posting, reporting, blocking, following, and bookmarking (an identifier issued within the App, separate from the Google account)\n・Public information about the linked YouTube channel (channel name and channel icon image URL). This is copied to and retained on the developer's servers in order to display the poster's name and icon\n・The content of any report submitted using the reporting feature, and the reporting user's NIARIM User ID\n・The NIARIM User ID of any user you block\n・The NIARIM User ID of any user you follow, and your following and follower counts\n・The IDs of works you bookmark and the date and time of each bookmark\n・The IDs of works you repost and the date and time of each repost\n・Tags attached to a work (see paragraph 4)\n・If you enable push notifications, your device token (an identifier issued by your device to identify the destination of a notification; used solely to send notifications)\n2. The video file itself is stored on YouTube, not on the developer's servers.\n3. The information described in the preceding two paragraphs is used only for the purposes of providing the Community Feature (displaying listings, rankings and search results, responding to reports, managing posting limits, reflecting follows, bookmarks and reposts, sending notifications, etc.). The developer does not provide this information to third parties for advertising purposes.\n4. Tags may be added or removed by users other than the poster (a poster may lock the tags on their own work to prohibit editing). Tags are public on the Work Plaza, and the identity of the user who added a tag is not displayed.\n5. The following information is private by default and is shown to other users only if you switch it to public within the App:\n・The list of works you have bookmarked\n・Your following / follower lists\nYour following and follower counts (the numbers themselves) are always displayed regardless of this setting.\n6. If you make a posted work private or delete it, that work will no longer appear in the Work Plaza listings or rankings. If you wish to have the records on the developer's servers deleted, please contact us using the channel described in Article 9.\n7. If a user does not use the Community Feature, no handling of information under this Article occurs. (In line with the principle in Article 2, nothing is transmitted to the developer's servers.)",
      "legal.privacy.art8.title": "Article 8 (Changes to This Policy)",
      "legal.privacy.art8.body":
        "The developer may change this Policy in the event of a change in applicable laws, a change in the content of the App, or other circumstances the developer deems necessary. When changing this Policy, the developer will give advance notice of the content of the change and its effective date, within the App or by other appropriate means.",
      "legal.privacy.art9.title": "Article 9 (Contact)",
      "legal.privacy.art9.body.html":
        'If you have any inquiries regarding this Policy, please contact us via the <a href="/contact/">contact form</a> on this site.',
      "legal.terms.art8.privacyLink.html":
        'See the <a href="/privacy/">Privacy Policy</a> here.',
      "legal.terms.contact.title": "Contact",
      "legal.terms.contact.body.html":
        'If you have any inquiries regarding these Terms, please contact us via the <a href="/contact/">contact form</a>.',
      "legal.terms.art1.title": "Article 1 (Application)",
      "legal.terms.art1.body":
        'These Terms of Service (the "Terms") set forth the conditions of use for the app "NIARIM" (the "App"). By using the App, you agree to these Terms. Use of the App constitutes agreement to these Terms.',
      "legal.terms.art2.title":
        "Article 2 (Eligibility to Use / Supported Environment)",
      "legal.terms.art2.body":
        "1. For details on the App's supported OS versions and recommended operating environments, please refer to the relevant distribution store and the information displayed within the App.\n2. The App aims to run comfortably on devices with a wide range of performance levels; however, depending on your device's performance, OS version, available storage, settings, and other conditions of use, some features may be limited or may not function correctly.",
      "legal.terms.art3.title": "Article 3 (Prohibited Acts)",
      "legal.terms.art3.body":
        "When using the App, users must not engage in any of the following acts:\n・Acts that violate laws, regulations, or public order and morals\n・Acts that infringe the copyrights, trademark rights, or other intellectual property rights, portrait rights, privacy, or other rights or interests of the App, the developer, or third parties\n・Decompiling, disassembling, reverse engineering, or otherwise analyzing the App (except where permitted by law)\n・Unauthorized modification, duplication, or redistribution of the App\n・Unauthorized access to the App or the platform on which it is provided, imposing excessive load, or otherwise interfering with its normal operation\n・Any other act that the developer reasonably determines to be inappropriate",
      "legal.terms.art4.title": "Article 4 (Rights to Created Content)",
      "legal.terms.art4.body":
        "1. Copyright and other rights relating to illustrations, animations, and other content created by users using the App (including project data, exported images, videos, etc.; hereinafter \"Created Content\") belong, to the extent permitted by law, to the user or third party who holds rights in such content.\n2. The App does not provide any function to transmit, collect, or synchronize Created Content to the developer's servers. Project data is, in principle, stored only on the user's device (see Article 12 for the handling that applies when a user chooses to post Created Content using the Work Plaza feature).\n3. Regardless of whether the free version or the premium version is used to create it, the developer will not restrict commercial use of Created Content based on the App's usage fee or edition (the differences between the free and premium versions are limited to functional aspects such as the display of the end card and the upper limit on export time).\n4. Notwithstanding the preceding paragraph, fonts, images, materials, and other items that users add to the App and for which third parties hold rights are subject to the respective terms of use described in Article 5.",
      "legal.terms.art5.title": "Article 5 (Bundled Fonts and Added Materials)",
      "legal.terms.art5.body":
        '1. The fonts and other materials bundled with the App are used in accordance with the license terms listed on this screen under "About Fonts Used."\n2. Regarding the rights relating to fonts, images, tones, stamps, and other materials that a user has additionally registered or loaded into the App, the user is responsible for obtaining any necessary rights or permissions and using them lawfully.\n3. If a dispute arises with a third party arising from a user\'s use of third-party materials, the developer bears no responsibility for it, except where legally required to do so.',
      "legal.terms.art6.title": "Article 6 (Premium Features / Billing)",
      "legal.terms.art6.body":
        "1. In addition to features available free of charge, the App offers premium features that become available through in-app purchases (a monthly plan, an annual plan, or other premium plans).\n2. The price, content, purchase method, and other conditions of the premium features are as displayed within the App or on the distribution store at the time of purchase.\n3. Cancellations, refunds, and other matters relating to payment after purchase are governed by the rules of Google Play or the payment platform you use. However, where the law provides otherwise, such provisions shall apply.\n4. The developer may change the content of the premium features for reasonable grounds, such as changes in law, technical necessity, or improvements to the App. Where a significant change is made, the developer will provide advance notice within the App or by other appropriate means whenever reasonably possible.",
      "legal.terms.art7.title": "Article 7 (Advertising)",
      "legal.terms.art7.body":
        "1. In the free version, advertisements may be displayed through third-party advertising delivery services.\n2. The acquisition, use, and other handling of information by advertising providers is governed by the privacy policy of each respective advertising provider.",
      "legal.terms.art8.title": "Article 8 (Handling of Information)",
      "legal.terms.art8.body":
        "1. The App does not provide any function to transmit or collect to the developer's servers the illustrations, animations, and other content, or project data, created by users. These are, in principle, stored only on the user's device, and because the developer has no function to store this content on its own, there is no concept of a retention period on the developer's side.\n2. The handling of user information — including information collected by third-party services incorporated into the App (such as advertising delivery and in-app purchases) — is governed by the separately established Privacy Policy.\n3. If you uninstall the App, data stored on your device (projects, settings, added fonts, etc.) will be deleted.",
      "legal.terms.art9.title":
        "Article 9 (Suspension, Modification, and Termination of Provision)",
      "legal.terms.art9.body":
        "1. The developer may temporarily suspend the provision of all or part of the App when performing maintenance, updates, or corrections to the App, when a failure occurs in the provision infrastructure, or for other unavoidable reasons.\n2. The developer may change the content of the App or terminate its provision as necessary.\n3. In the cases described in the preceding two paragraphs, the developer will give notice in advance, where possible, within the App or by other appropriate means, except in urgent cases.\n4. Except where required by law, the developer bears no responsibility for any damage incurred by users as a result of changes, suspension, or termination under this Article.",
      "legal.terms.art10.title": "Article 10 (Disclaimer)",
      "legal.terms.art10.body":
        "1. The developer does not warrant that the App is free of factual or legal defects (including safety, reliability, accuracy, completeness, fitness for a particular purpose, and the absence of bugs or malfunctions).\n2. Users shall use the App at their own responsibility. Data may be lost due to device malfunction, misoperation, OS updates, or other circumstances; users are therefore recommended to make regular backups of work in progress using the export and share functions, among others.\n3. Except to the extent permitted by law, the developer bears no responsibility for damage incurred by users as a result of using the App. However, this does not apply where the developer is guilty of willful misconduct or gross negligence, and even in that case, the developer's liability for damages is limited to ordinary direct damages, up to the amount actually paid by the user in connection with the App during the preceding one year (or JPY 0 if used free of charge).",
      "legal.terms.art11.title": "Article 11 (Amendment of These Terms)",
      "legal.terms.art11.body":
        "1. The developer may amend these Terms in the event of a change in applicable laws, a change in the content of the App, or other circumstances the developer deems necessary.\n2. When amending these Terms, the developer will give advance notice of the content of the amendment and its effective date, within the App or by other appropriate means.\n3. The amended Terms will apply from the effective date referred to in the preceding paragraph, to the extent permitted by law.",
      "legal.terms.art12.title":
        "Article 12 (Work Plaza: Community Posting Feature)",
      "legal.terms.art12.body":
        "1. The App optionally provides a feature that lets users post animation works they have created, via their own Google account, to YouTube, and publish and browse them on \"the Work Plaza\" (the \"Community Feature\"). Browsing and creating works is possible without using the Community Feature.\n2. The video files themselves are stored on YouTube, not on the developer's servers. However, the information needed to identify and display posted works (YouTube video ID, title, statistics, report information, etc.) and the NIARIM User ID issued for use of the posting, reporting, and blocking features (an identifier issued within the App, separate from the Google account) are managed on the developer's servers.\n3. Posting works, reporting, and blocking other users under the Community Feature require the user to be signed in with a Google account.\n4. There is a daily limit on the number of works that can be posted (the limit differs between free members and Premium members). This limit may be changed for operational reasons.\n5. If a user believes another user's posted work violates the law or public order and morals, or may fall under any item of Article 3, the user may report it to the developer through the App's reporting feature. After reviewing a report, the developer may take necessary measures, such as hiding the work from listings, for reasonable cause. False reports and abuse of the reporting feature are prohibited.\n6. If a user deletes a post, or disconnects their Google account from the App, the corresponding YouTube video may be deleted. If a video is made private or deleted on YouTube's side, the work will also stop being displayed on the Work Plaza.\n7. Use of the Community Feature is subject to YouTube's Terms of Service and Community Guidelines, in addition to these Terms.\n8. Users may follow other users and may bookmark or repost other users' works. Your following / follower lists and the list of works you have bookmarked are private by default; whether to make them public is your choice within the App. Your following and follower counts are displayed regardless of that setting.\n9. Tags attached to a work may be added or removed by users other than the poster. A poster may lock the tags on their own work to prohibit editing by other users. Users must not attach tags that defame others, tags unrelated to the content of the work, or otherwise inappropriate tags. The developer may remove inappropriate tags.\n10. The developer displays notifications in the App's notification list, for example when you are followed. If you have permitted notifications on your device, push notifications may be sent. Notifications can be disabled from the App's settings or from your device settings.\n11. Users must not use the Community Feature to harass other users, for advertising or solicitation, or for any other purpose outside its intended purpose (publishing and viewing works). If you use the blocking feature, works by the user you blocked will no longer appear in your listings.",
      "legal.terms.art13.title": "Article 13 (Governing Law / Jurisdiction)",
      "legal.terms.art13.body":
        "1. These Terms shall be governed by and construed in accordance with the laws of Japan.\n2. In the event a dispute arises in connection with the App, the district court or summary court having jurisdiction over the developer's place of business, depending on the amount in dispute, shall have exclusive agreed jurisdiction as the court of first instance.",
    },
    "zh-Hans": {
      "legal.notice.privacy": "本文与NIARIM应用内的正式隐私政策内容相同。",
      "legal.notice.terms":
        "本文与NIARIM应用内的正式使用条款内容相同（不含字体/开源许可等信息）。",
      "legal.privacy.art1.title": "第1条（本政策的定位）",
      "legal.privacy.art1.body":
        "本隐私政策（以下称「本政策」）规定了本应用「NIARIM」（以下称「本应用」）中信息的处理方式。有关本应用使用条件的整体内容，请另行参阅「使用条款・许可」画面。",
      "legal.privacy.art2.title": "第2条（本应用不会获取的数据）",
      "legal.privacy.art2.body":
        "本应用未提供将用户制作的插画、动画等内容（包括项目数据、导出的图片、视频等，以下同）发送、收集或保存至开发者服务器的功能。这些数据原则上仅保存在用户设备内（本应用未搭载云同步功能）。由于开发者自身不具备保存此类内容的功能，因此开发者一方不存在所谓的保存期限概念。设备内保存的数据可随时通过本应用的删除功能予以删除；卸载本应用后，保存在设备内的项目、设置、已添加字体等数据也将一并删除（用户自行选择使用作品广场功能发布作品时的信息处理方式，参见第7条）。",
      "legal.privacy.art3.title": "第3条（第三方服务获取的信息）",
      "legal.privacy.art3.body":
        "本应用内置以下第三方服务，各服务提供商可能在提供各自服务所需的范围内获取信息。本应用的开发者未实现独立获取或保存这些信息的功能（各服务所获取信息的管理，依照该服务提供商各自的隐私政策办理）。\n\n【广告投放（Google AdMob）】\n免费版通过Google AdMob投放广告。出于广告投放、效果测量、防止不正当行为等目的，Google或其关联公司可能会获取并使用广告标识符（Advertising ID）等设备信息。有关获取及使用的详情，请参阅Google隐私政策（https://policies.google.com/privacy）。用户可通过设备设置（如Android设置应用中的「隐私」等）重置广告标识符或停用个性化广告。若您位于欧洲经济区（EEA）、英国或瑞士，可在启动时显示的同意表单中选择广告个性化相关的同意设置，并可随时通过本画面下方的「变更广告同意设置」按钮进行修改。\n\n【应用内购买（Google Play Billing）】\n高级功能的购买通过Google Play的结算系统进行。开发者不会直接获取或保存信用卡号等结算信息。结算相关信息的处理依照Google Play的规定。\n\n【下载附加字体（GitHub）】\n仅当您在设置界面的「字体管理」中选择下载附加字体时，才会与字体文件的分发方 GitHub（GitHub, Inc.）的服务器进行通信。该通信仅在您选择下载时发生，应用启动时或正常使用过程中不会发生。发送的仅为通信所必需的信息（IP 地址、所请求的字体文件等），不会发送作品数据或可识别您身份的信息。所获取信息的处理遵循 GitHub 的隐私声明（https://docs.github.com/site-policy/privacy-policies/github-privacy-statement）。\n\n【崩溃分析・使用情况分析】\n本应用目前未内置以崩溃分析、使用情况分析为目的的SDK。今后如引入此类服务，将更新本政策并在本应用内进行公告。",
      "legal.privacy.art4.title": "第4条（关于Cookie等跟踪技术）",
      "legal.privacy.art4.body":
        "本应用本身不使用Cookie，但第3条所述的广告投放服务（Google AdMob）可能会出于广告投放、效果测量的目的，使用与之类似的识别技术（如广告标识符等）。",
      "legal.privacy.art5.title": "第5条（关于儿童个人信息）",
      "legal.privacy.art5.body":
        "本应用并非以未满13岁的儿童为主要对象而有意收集信息。建议家长在孩子使用本应用时，根据需要通过设备设置停用个性化广告等。",
      "legal.privacy.art6.title": "第6条（关于信息的跨境转移）",
      "legal.privacy.art6.body":
        "第3条所述的第三方服务（Google AdMob、Google Play Billing）可能在Google公司于全球各地运营的服务器上进行处理。相关处理适用各服务各自的隐私政策。",
      "legal.privacy.art7.title": "第7条（作品广场：社区发布功能中的信息处理）",
      "legal.privacy.art7.body":
        "1. 仅当用户出于自身意愿使用「作品广场」功能（用户协议第12条）时，本应用才会在开发者的服务器上管理以下信息。\n・用于识别和展示已发布作品的信息（YouTube 视频 ID、标题、统计信息、发布时间、标签等）\n・使用发布、举报、拉黑、关注、收藏等功能时发放的 NIARIM User ID（与 Google 账号分开、在本应用内部发放的标识符）\n・已关联 YouTube 频道的公开信息（频道名称、频道图标的图片 URL）。为展示发布者名称与图标，会复制并保存在开发者的服务器上\n・使用举报功能时的举报内容以及举报者的 NIARIM User ID\n・所拉黑对象的 NIARIM User ID\n・所关注对象的 NIARIM User ID，以及关注数与粉丝数\n・已收藏作品的 ID 及收藏时间\n・已转发作品的 ID 及转发时间\n・作品上的标签（参见第4款）\n・启用推送通知时的设备令牌（设备为确定通知送达对象而发放的标识符，仅用于发送通知）\n2. 已发布的视频文件本身保存在 YouTube 上，不保存在开发者的服务器上。\n3. 前两款所述信息仅在提供本社区功能所需的范围内使用（作品列表展示、排行、搜索、举报处理、发布上限管理、关注・收藏・转发的体现、通知发送等）。开发者不会为广告投放目的向第三方提供这些信息。\n4. 标签也可由发布者以外的用户添加或删除（发布者可锁定自己作品的标签以禁止编辑）。标签在作品广场上公开，且不显示由谁添加。\n5. 以下信息默认不公开，仅当用户在本应用内切换为公开设置时才会向其他用户展示。\n・已收藏作品的列表\n・关注中／粉丝列表\n其中，关注数与粉丝数（人数）无论公开设置如何均始终显示。\n6. 将已发布作品设为不公开或删除后，该作品将不再显示在作品广场的列表与排行中。如希望删除开发者服务器上的记录，请通过第9条的联系方式与我们联系。\n7. 不使用本社区功能时，不会发生本条所述的信息处理。（依照第2条的原则，不会向开发者的服务器发送任何内容。）",
      "legal.privacy.art8.title": "第8条（本政策的变更）",
      "legal.privacy.art8.body":
        "因法令修订、本应用内容变更或其他开发者认为必要的情形，开发者可能变更本政策。变更本政策时，开发者将事先通过本应用内或其他适当方式，公告变更内容及生效日期。",
      "legal.privacy.art9.title": "第9条（咨询）",
      "legal.privacy.art9.body.html":
        '有关本政策的咨询，请通过本网站的<a href="/contact/">联系表单</a>与我们联系。',
      "legal.terms.art8.privacyLink.html":
        '隐私政策请见<a href="/privacy/">这里</a>。',
      "legal.terms.contact.title": "咨询窗口",
      "legal.terms.contact.body.html":
        '有关本条款的咨询，请通过<a href="/contact/">联系表单</a>与我们联系。',
      "legal.terms.art1.title": "第1条（适用）",
      "legal.terms.art1.body":
        "本使用条款（以下称「本条款」）规定了本应用「NIARIM」（以下称「本应用」）的使用条件。用户须在同意本条款的前提下使用本应用。使用本应用即视为已同意本条款。",
      "legal.terms.art2.title": "第2条（使用资格・适用环境）",
      "legal.terms.art2.body":
        "1. 有关支持的操作系统及推荐运行环境的详细信息，请以各分发商店及本应用内的显示内容为准。\n2. 本应用力求在各种性能的设备上都能流畅使用，但根据设备性能、操作系统版本、剩余存储空间、设置等使用环境的不同，部分功能可能受到限制或无法正常运作。",
      "legal.terms.art3.title": "第3条（禁止事项）",
      "legal.terms.art3.body":
        "用户在使用本应用时，不得实施以下行为：\n・违反法令或公序良俗的行为\n・侵害本应用、开发者或第三方的著作权、商标权等知识产权、肖像权、隐私权或其他权利或利益的行为\n・以反编译、反汇编、逆向工程或其他解析为目的的行为（法令允许的情况除外）\n・对本应用进行未经授权的改造、复制或再分发\n・对本应用或其提供基础设施进行未经授权的访问、施加过度负荷等妨碍其正常提供的行为\n・其他开发者基于合理理由判断为不当的行为",
      "legal.terms.art4.title": "第4条（创作内容的权利）",
      "legal.terms.art4.body":
        "1. 用户使用本应用制作的插画、动画等内容（包括项目数据、导出的图片、视频等，以下称「创作内容」）所涉及的著作权及其他权利，在法令允许的范围内，归属于对该内容享有权利的用户或第三方。\n2. 本应用未提供将创作内容发送、收集或同步至开发者服务器的功能。项目数据原则上仅保存在用户设备内（用户自行选择使用作品广场功能发布创作内容时的处理方式，参见第12条）。\n3. 无论使用免费版还是高级版制作，开发者均不会以本应用的使用费用或版本为由限制创作内容的商业使用（免费版与高级版的区别仅限于片尾卡显示、导出时长上限等功能方面）。\n4. 尽管有前项规定，用户添加至本应用中的字体、图片、素材等由第三方享有权利的内容，仍需遵守第5条规定的各自使用条件。",
      "legal.terms.art5.title": "第5条（内置字体・追加素材相关规定）",
      "legal.terms.art5.body":
        "1. 本应用内置的字体及其他素材，均依照本画面「关于使用字体」中所记载的各许可条款进行使用。\n2. 关于用户自行添加注册或读取至本应用中的字体、图片、色调、印章等素材的权利关系，应由用户自行负责，在取得必要权利或许可的前提下合法使用。\n3. 因用户使用第三方素材而与第三方产生纠纷的，除法令另有规定应承担责任的情形外，开发者不承担责任。",
      "legal.terms.art6.title": "第6条（高级功能・付费）",
      "legal.terms.art6.body":
        "1. 本应用除可免费使用的功能外，还提供通过应用内购买（月度方案、年度方案及其他高级方案）方可使用的高级功能。\n2. 高级功能的价格、提供内容、购买方式及其他条件，以购买时本应用内或分发商店的显示内容为准。\n3. 购买后的取消、退款及其他与结算相关的事项，适用Google Play或用户所使用的结算平台的规定；但法令另有规定的，从其规定。\n4. 开发者可能基于法令修订、技术上的必要性、本应用的改进等合理事由变更高级功能的内容。进行重大变更时，将在合理可行的范围内，通过本应用内或其他适当方式事先告知。",
      "legal.terms.art7.title": "第7条（广告展示）",
      "legal.terms.art7.body":
        "1. 免费版中，可能通过第三方广告投放服务展示广告。\n2. 广告投放商对信息的获取、使用及其他处理，适用各广告投放商各自的隐私政策。",
      "legal.terms.art8.title": "第8条（信息处理）",
      "legal.terms.art8.body":
        "1. 本应用未提供将用户制作的插画、动画等内容及项目数据发送或收集至开发者服务器的功能。这些数据原则上仅保存在用户设备内；由于开发者自身不具备保存此类内容的功能，因此开发者一方不存在所谓的保存期限概念。\n2. 本应用内置的第三方服务（广告投放、应用内购买等）所获取的信息及其他用户信息的处理，依照另行制定的《隐私政策》办理。\n3. 卸载本应用后，保存在设备内的数据（项目、设置、已添加的字体等）将被删除。",
      "legal.terms.art9.title": "第9条（提供的中止・变更・终止）",
      "legal.terms.art9.body":
        "1. 开发者在对本应用进行维护、更新、修正时，或提供基础设施发生故障时，或存在其他不可避免的情形时，可能暂时中止本应用全部或部分功能的提供。\n2. 开发者可根据需要变更本应用的内容，或终止本应用的提供。\n3. 前两项情形，除紧急情况外，开发者将尽可能在本应用内或以其他适当方式事先公告。\n4. 因本条所述变更、中止、终止而给用户造成的损害，除法令另有规定应承担责任的情形外，开发者不承担责任。",
      "legal.terms.art10.title": "第10条（免责事项）",
      "legal.terms.art10.body":
        "1. 开发者不保证本应用不存在事实上或法律上的瑕疵（包括安全性、可靠性、准确性、完整性、对特定目的的适用性、无错误或故障等）。\n2. 用户应自行负责使用本应用。由于设备故障、误操作、操作系统更新等原因，数据可能会丢失，因此建议用户利用导出、分享等功能对制作中的数据进行定期备份。\n3. 在法令允许的范围内，开发者对因使用本应用而给用户造成的损害不承担责任。但开发者存在故意或重大过失的情形除外；即便在该情形下，开发者所承担的损害赔偿责任也仅限于通常发生的直接损害，且以用户在最近一年内就本应用实际支付的金额为上限（免费使用的情况下为0日元）。",
      "legal.terms.art11.title": "第11条（本条款的变更）",
      "legal.terms.art11.body":
        "1. 因法令修订、本应用内容变更或其他开发者认为必要的情形，开发者可能变更本条款。\n2. 变更本条款时，开发者将事先通过本应用内或其他适当方式，公告变更内容及生效日期。\n3. 变更后的本条款，在法令允许的范围内，自前项所述生效日期起适用。",
      "legal.terms.art12.title": "第12条（作品广场：社区发布功能）",
      "legal.terms.art12.body":
        "1. 本应用可选择性地提供以下功能：用户可通过自己的Google账号，将自己制作的动画作品发布至YouTube，并在「作品广场」上公开、浏览（以下称「本社区功能」）。即使不使用本社区功能，用户也可以浏览和制作作品。\n2. 已发布的视频文件本身保存在YouTube上，不会保存在开发者的服务器上。另一方面，用于识别、显示已发布作品所需的信息（YouTube视频ID、标题、统计信息、举报信息等），以及用户使用发布、举报、屏蔽功能时颁发的NIARIM User ID（与Google账号不同、由本应用内部颁发的识别码），由开发者的服务器管理。\n3. 本社区功能中的作品发布、举报以及屏蔽其他用户，均需通过Google账号登录。\n4. 可发布的作品数量设有每日上限（免费会员与高级会员的上限不同）。该上限可能因运营原因而变更。\n5. 若用户认为其他用户发布的作品违反法令或公序良俗，或可能符合第3条各项所述情形，可通过本应用内的举报功能向开发者举报。开发者在确认举报内容后，可基于合理理由，对相关作品采取从列表中隐藏等必要措施。禁止进行虚假举报或滥用举报功能。\n6. 用户删除发布内容，或解除本应用与Google账号的关联时，对应的YouTube视频可能会被删除。此外，若视频在YouTube一方被设为非公开或被删除，该作品也将不再在作品广场上显示。\n7. 使用本社区功能时，除本条款外，还需遵守YouTube的服务条款及社区准则。\n8. 用户可以关注其他用户，并可收藏或转发其他用户的作品。关注中／粉丝列表以及已收藏作品的列表默认不公开，是否公开由用户在本应用内选择。关注数与粉丝数无论该设置如何均会显示。\n9. 作品上的标签也可由发布者以外的用户添加或删除。发布者可锁定自己作品的标签，以禁止其他用户编辑。用户不得添加诽谤他人的标签、与作品内容无关的标签或其他不当标签。开发者可能删除不当标签。\n10. 开发者会在被关注等情况下于本应用内的通知列表中显示通知。用户在设备上允许通知的情况下，可能会发送推送通知。通知可从本应用的设置或设备的设置中停用。\n11. 用户不得将本社区功能用于骚扰其他用户、宣传・招揽或其他偏离其本来目的（作品的公开与浏览）的目的。使用拉黑功能后，被拉黑对象的作品将不再显示在自己的列表中。",
      "legal.terms.art13.title": "第13条（准据法・裁判管辖）",
      "legal.terms.art13.body":
        "1. 本条款的解释以日本法为准据法。\n2. 若因本应用产生纠纷，根据诉讼标的额，以管辖开发者所在地的地方法院或简易法院作为第一审的专属合意管辖法院。",
    },
    "zh-Hant": {
      "legal.notice.privacy": "本文與NIARIM應用程式內的正式隱私政策內容相同。",
      "legal.notice.terms":
        "本文與NIARIM應用程式內的正式使用條款內容相同（不含字型/開源授權等資訊）。",
      "legal.privacy.art1.title": "第1條（本政策之定位）",
      "legal.privacy.art1.body":
        "本隱私權政策（以下稱「本政策」）規定本應用程式「NIARIM」（以下稱「本應用程式」）就資訊之處理方式。關於本應用程式使用條件之整體內容，請另行參閱「使用條款・授權」畫面。",
      "legal.privacy.art2.title": "第2條（本應用程式不蒐集之資料）",
      "legal.privacy.art2.body":
        "本應用程式未提供將使用者製作之插畫、動畫等內容（包括專案資料、匯出之圖片、影片等，以下同）傳送、蒐集或保存至開發者伺服器之功能。此等資料原則上僅保存於使用者裝置內（本應用程式未搭載雲端同步功能）。由於開發者本身不具備保存此類內容之功能，因此開發者端不存在所謂之保存期間概念。裝置內保存之資料，可隨時透過本應用程式之刪除功能予以刪除；解除安裝本應用程式後，保存於裝置內之專案、設定、已新增字型等資料亦將一併刪除（使用者自行選擇利用作品廣場功能發布作品時之資訊處理方式，請參見第7條）。",
      "legal.privacy.art3.title": "第3條（第三方服務所取得之資訊）",
      "legal.privacy.art3.body":
        "本應用程式內建下列第三方服務，各服務提供者得於提供各自服務所需之範圍內取得資訊。本應用程式之開發者並未實作獨立取得或保存此等資訊之功能（各服務所取得資訊之管理，依各該服務提供者之隱私權政策辦理）。\n\n【廣告投放（Google AdMob）】\n免費版透過Google AdMob投放廣告。基於廣告投放、成效衡量、防止不當行為等目的，Google或其關係企業可能取得並使用廣告識別碼（Advertising ID）等裝置資訊。關於取得及使用之詳情，請參閱Google隱私權政策（https://policies.google.com/privacy）。使用者可透過裝置設定（如Android設定應用程式之「隱私權」等）重設廣告識別碼或停用個人化廣告。若您位於歐洲經濟區（EEA）、英國或瑞士，可於啟動時顯示之同意表單中選擇廣告個人化相關之同意設定，亦可隨時透過本畫面下方之「變更廣告同意設定」按鈕進行修改。\n\n【應用程式內購買（Google Play Billing）】\n進階功能之購買透過Google Play之付款系統進行。開發者不會直接取得或保存信用卡卡號等付款資訊。付款相關資訊之處理依Google Play之規定辦理。\n\n【下載附加字型（GitHub）】\n僅當您在設定畫面的「字型管理」中選擇下載附加字型時，才會與字型檔案的散布方 GitHub（GitHub, Inc.）的伺服器進行通訊。該通訊僅在您選擇下載時發生，應用程式啟動時或正常使用過程中不會發生。傳送的僅為通訊所必需的資訊（IP 位址、所請求的字型檔案等），不會傳送作品資料或可識別您身分的資訊。所取得資訊的處理遵循 GitHub 的隱私權聲明（https://docs.github.com/site-policy/privacy-policies/github-privacy-statement）。\n\n【當機分析・使用狀況分析】\n本應用程式目前未內建以當機分析、使用狀況分析為目的之SDK。日後如導入此類服務，將更新本政策並於本應用程式內公告。",
      "legal.privacy.art4.title": "第4條（關於Cookie等追蹤技術）",
      "legal.privacy.art4.body":
        "本應用程式本身不使用Cookie，惟第3條所述廣告投放服務（Google AdMob）可能基於廣告投放、成效衡量之目的，使用與之類似之識別技術（如廣告識別碼等）。",
      "legal.privacy.art5.title": "第5條（關於兒童個人資料）",
      "legal.privacy.art5.body":
        "本應用程式並非以未滿13歲之兒童為主要對象而刻意蒐集資訊。建議家長於子女使用本應用程式時，視需要透過裝置設定停用個人化廣告等。",
      "legal.privacy.art6.title": "第6條（關於資訊之跨境傳輸）",
      "legal.privacy.art6.body":
        "第3條所述第三方服務（Google AdMob、Google Play Billing）可能於Google公司在全球各地營運之伺服器上進行處理。相關處理適用各服務各自之隱私權政策。",
      "legal.privacy.art7.title": "第7條（作品廣場：社群發布功能中之資訊處理）",
      "legal.privacy.art7.body":
        "1. 僅當使用者出於自身意願使用「作品廣場」功能（使用者條款第12條）時，本應用程式才會於開發者之伺服器上管理下列資訊。\n・用以識別及顯示已發布作品之資訊（YouTube 影片 ID、標題、統計資訊、發布時間、標籤等）\n・使用發布、檢舉、封鎖、追蹤、收藏等功能時所核發之 NIARIM User ID（與 Google 帳戶分開、於本應用程式內部核發之識別碼）\n・已連結 YouTube 頻道之公開資訊（頻道名稱、頻道圖示之圖片 URL）。為顯示發布者名稱與圖示，將複製並保存於開發者之伺服器\n・使用檢舉功能時之檢舉內容以及檢舉者之 NIARIM User ID\n・所封鎖對象之 NIARIM User ID\n・所追蹤對象之 NIARIM User ID，以及追蹤數與粉絲數\n・已收藏作品之 ID 及收藏時間\n・已轉發作品之 ID 及轉發時間\n・作品上之標籤（參見第4項）\n・啟用推播通知時之裝置權杖（裝置為確定通知送達對象所核發之識別碼，僅用於傳送通知）\n2. 已發布之影片檔案本身保存於 YouTube 上，不保存於開發者之伺服器。\n3. 前二項所述資訊僅於提供本社群功能所需之範圍內使用（作品清單顯示、排行、搜尋、檢舉處理、發布上限管理、追蹤・收藏・轉發之反映、通知傳送等）。開發者不會為廣告投放之目的向第三方提供此等資訊。\n4. 標籤亦得由發布者以外之使用者新增或刪除（發布者得鎖定自身作品之標籤以禁止編輯）。標籤於作品廣場上公開，且不顯示係由何人新增。\n5. 下列資訊預設為不公開，僅當使用者於本應用程式內切換為公開設定時，方會向其他使用者顯示。\n・已收藏作品之清單\n・追蹤中／粉絲清單\n其中，追蹤數與粉絲數（人數）不論公開設定為何均始終顯示。\n6. 將已發布作品設為不公開或予以刪除後，該作品將不再顯示於作品廣場之清單與排行中。如欲刪除開發者伺服器上之紀錄，請透過第9條之聯絡方式與我們聯繫。\n7. 未使用本社群功能時，不會發生本條所述之資訊處理。（依第2條之原則，不會向開發者之伺服器傳送任何內容。）",
      "legal.privacy.art8.title": "第8條（本政策之變更）",
      "legal.privacy.art8.body":
        "因法令修正、本應用程式內容變更或其他開發者認有必要之情形，開發者得變更本政策。變更本政策時，開發者將事先透過本應用程式內或其他適當方式，公告變更內容及生效日期。",
      "legal.privacy.art9.title": "第9條（聯絡方式）",
      "legal.privacy.art9.body.html":
        '有關本政策之相關詢問，請透過本網站的<a href="/contact/">聯絡表單</a>與我們聯繫。',
      "legal.terms.art8.privacyLink.html":
        '隱私政策請見<a href="/privacy/">這裡</a>。',
      "legal.terms.contact.title": "諮詢窗口",
      "legal.terms.contact.body.html":
        '有關本條款之相關詢問，請透過<a href="/contact/">聯絡表單</a>與我們聯繫。',
      "legal.terms.art1.title": "第1條（適用範圍）",
      "legal.terms.art1.body":
        "本使用條款（以下稱「本條款」）規定了本應用程式「NIARIM」（以下稱「本應用程式」）的使用條件。使用者應於同意本條款後方可使用本應用程式。使用本應用程式即視為已同意本條款。",
      "legal.terms.art2.title": "第2條（使用資格・適用環境）",
      "legal.terms.art2.body":
        "1. 關於支援的作業系統版本及建議操作環境的詳細資訊，請依各發布商店及本應用程式內之顯示內容為準。\n2. 本應用程式力求於各種效能之裝置皆能順暢使用，惟依裝置效能、作業系統版本、可用儲存空間、設定等使用環境之不同，部分功能可能受限或無法正常運作。",
      "legal.terms.art3.title": "第3條（禁止事項）",
      "legal.terms.art3.body":
        "使用者於使用本應用程式時，不得為下列行為：\n・違反法令或公序良俗之行為\n・侵害本應用程式、開發者或第三方之著作權、商標權等智慧財產權、肖像權、隱私權或其他權利或利益之行為\n・以反編譯、反組譯、逆向工程或其他解析為目的之行為（法令允許之情形除外）\n・對本應用程式進行未經授權之改造、重製或再散布\n・對本應用程式或其提供基礎設施進行未經授權之存取、施加過度負荷等妨礙其正常提供之行為\n・其他開發者基於合理理由判斷為不當之行為",
      "legal.terms.art4.title": "第4條（創作內容之權利）",
      "legal.terms.art4.body":
        "1. 使用者利用本應用程式製作之插畫、動畫等內容（包括專案資料、匯出之圖片、影片等，以下稱「創作內容」）所涉及之著作權及其他權利，於法令允許之範圍內，歸屬於就該內容享有權利之使用者或第三方。\n2. 本應用程式未提供將創作內容傳送、蒐集或同步至開發者伺服器之功能。專案資料原則上僅保存於使用者裝置內（使用者自行選擇利用作品廣場功能發布創作內容時之處理方式，請參見第12條）。\n3. 無論使用免費版或進階版製作，開發者均不會以本應用程式之使用費用或版本為由限制創作內容之商業使用（免費版與進階版之差異僅限於片尾卡顯示、匯出時長上限等功能面向）。\n4. 縱有前項規定，使用者新增至本應用程式中之字型、圖片、素材等由第三方享有權利之內容，仍應遵守第5條所定各自之使用條件。",
      "legal.terms.art5.title": "第5條（內建字型・新增素材相關規定）",
      "legal.terms.art5.body":
        "1. 本應用程式內建之字型及其他素材，均依照本畫面「關於使用字型」所載各授權條款使用。\n2. 關於使用者自行新增登錄或載入本應用程式之字型、圖片、色調、印章等素材之權利關係，應由使用者自行負責，於取得必要權利或授權之前提下合法使用。\n3. 因使用者利用第三方素材而與第三方發生紛爭者，除法令另有規定應負責任之情形外，開發者不負任何責任。",
      "legal.terms.art6.title": "第6條（進階功能・付費）",
      "legal.terms.art6.body":
        "1. 本應用程式除可免費使用之功能外，另提供透過應用程式內購買（月繳方案、年繳方案及其他進階方案）方可使用之進階功能。\n2. 進階功能之價格、提供內容、購買方式及其他條件，以購買當下本應用程式內或發布商店之顯示內容為準。\n3. 購買後之取消、退款及其他與付款相關之事項，適用Google Play或使用者所使用付款平台之規定；但法令另有規定者，從其規定。\n4. 開發者得基於法令修訂、技術上之必要性、本應用程式之改善等合理事由變更進階功能之內容。進行重大變更時，將於合理可行範圍內，透過本應用程式內或其他適當方式事先告知。",
      "legal.terms.art7.title": "第7條（廣告顯示）",
      "legal.terms.art7.body":
        "1. 免費版中，可能透過第三方廣告投放服務顯示廣告。\n2. 廣告投放業者對資訊之取得、使用及其他處理，適用各廣告投放業者各自之隱私權政策。",
      "legal.terms.art8.title": "第8條（資訊之處理）",
      "legal.terms.art8.body":
        "1. 本應用程式未提供將使用者製作之插畫、動畫等內容及專案資料傳送或蒐集至開發者伺服器之功能。此等資料原則上僅保存於使用者裝置內；由於開發者本身不具備保存此類內容之功能，因此開發者端不存在所謂之保存期間概念。\n2. 本應用程式內建之第三方服務（廣告投放、應用程式內購買等）所取得之資訊及其他使用者資訊之處理，依另行訂定之《隱私權政策》辦理。\n3. 解除安裝本應用程式後，保存於裝置內之資料（專案、設定、已新增字型等）將被刪除。",
      "legal.terms.art9.title": "第9條（提供之中止・變更・終止）",
      "legal.terms.art9.body":
        "1. 開發者於對本應用程式進行維護、更新、修正時，或提供基礎設施發生故障時，或有其他不得已之情形時，得暫時中止本應用程式全部或部分之提供。\n2. 開發者得視需要變更本應用程式之內容，或終止本應用程式之提供。\n3. 前二項情形，除緊急情況外，開發者將盡可能於本應用程式內或以其他適當方式事先公告。\n4. 因本條所定變更、中止、終止而致使用者受有損害者，除法令另有規定應負責任之情形外，開發者不負任何責任。",
      "legal.terms.art10.title": "第10條（免責事項）",
      "legal.terms.art10.body":
        "1. 開發者不保證本應用程式無事實上或法律上之瑕疵（包括安全性、可靠性、正確性、完整性、對特定目的之適用性、無錯誤或故障等）。\n2. 使用者應自負其責使用本應用程式。因裝置故障、誤操作、作業系統更新等因素，資料可能遺失，故建議使用者利用匯出、分享等功能，就製作中之資料定期進行備份。\n3. 於法令允許之範圍內，開發者對因使用本應用程式而致使用者受有之損害不負責任。惟開發者具故意或重大過失者不在此限；縱屬該情形，開發者所負損害賠償責任亦僅限於通常發生之直接損害，且以使用者於最近一年內就本應用程式實際支付之金額為上限（免費使用之情形為新臺幣0元）。",
      "legal.terms.art11.title": "第11條（本條款之變更）",
      "legal.terms.art11.body":
        "1. 因法令修正、本應用程式內容變更或其他開發者認有必要之情形，開發者得變更本條款。\n2. 變更本條款時，開發者將事先透過本應用程式內或其他適當方式，公告變更內容及生效日期。\n3. 變更後之本條款，於法令允許之範圍內，自前項所定生效日期起適用。",
      "legal.terms.art12.title": "第12條（作品廣場：社群發布功能）",
      "legal.terms.art12.body":
        "1. 本應用程式可選擇性地提供以下功能：使用者可透過自己的Google帳號，將自己製作之動畫作品發布至YouTube，並於「作品廣場」上公開、瀏覽（以下稱「本社群功能」）。縱使不使用本社群功能，使用者仍可瀏覽及製作作品。\n2. 已發布之影片檔案本身保存於YouTube上，不會保存於開發者之伺服器上。另一方面，用於識別、顯示已發布作品所需之資訊（YouTube影片ID、標題、統計資訊、檢舉資訊等），以及使用者利用發布、檢舉、封鎖功能時核發之NIARIM User ID（與Google帳號不同、由本應用程式內部核發之識別碼），由開發者之伺服器管理。\n3. 本社群功能中之作品發布、檢舉以及封鎖其他使用者，均須透過Google帳號登入。\n4. 可發布之作品數量設有每日上限（免費會員與進階會員之上限不同）。該上限可能因營運原因而變更。\n5. 若使用者認為其他使用者發布之作品違反法令或公序良俗，或可能符合第3條各款所述情形，得透過本應用程式內之檢舉功能向開發者檢舉。開發者於確認檢舉內容後，得基於合理理由，對相關作品採取自列表中隱藏等必要措施。禁止進行虛偽檢舉或濫用檢舉功能。\n6. 使用者刪除發布內容，或解除本應用程式與Google帳號之連結時，對應之YouTube影片可能會被刪除。此外，若影片於YouTube端被設為非公開或遭刪除，該作品亦將不再於作品廣場上顯示。\n7. 使用本社群功能時，除本條款外，亦應遵守YouTube之服務條款及社群規範。\n8. 使用者得追蹤其他使用者，並得收藏或轉發其他使用者之作品。追蹤中／粉絲清單以及已收藏作品之清單預設為不公開，是否公開由使用者於本應用程式內選擇。追蹤數與粉絲數不論該設定為何均會顯示。\n9. 作品上之標籤亦得由發布者以外之使用者新增或刪除。發布者得鎖定自身作品之標籤，以禁止其他使用者編輯。使用者不得新增誹謗他人之標籤、與作品內容無關之標籤或其他不當標籤。開發者得刪除不當標籤。\n10. 開發者將於遭追蹤等情形時，於本應用程式內之通知清單中顯示通知。使用者於裝置上允許通知之情形下，可能傳送推播通知。通知得自本應用程式之設定或裝置之設定予以停用。\n11. 使用者不得將本社群功能用於騷擾其他使用者、宣傳・招攬或其他偏離其本來目的（作品之公開與瀏覽）之目的。使用封鎖功能後，遭封鎖對象之作品將不再顯示於自身之清單中。",
      "legal.terms.art13.title": "第13條（準據法・管轄法院）",
      "legal.terms.art13.body":
        "1. 本條款之解釋以日本法為準據法。\n2. 因本應用程式發生紛爭時，依訴訟標的額，以管轄開發者所在地之地方法院或簡易法院為第一審之專屬合意管轄法院。",
    },
    ko: {
      "legal.notice.privacy":
        "본문은 NIARIM 앱 내 공식 개인정보처리방침과 동일한 내용입니다.",
      "legal.notice.terms":
        "본문은 NIARIM 앱 내 공식 이용약관과 동일한 내용입니다（폰트・OSS 라이선스 등 표기는 제외）.",
      "legal.privacy.art1.title": "제1조（본 정책의 위치）",
      "legal.privacy.art1.body":
        "본 개인정보처리방침（이하「본 방침」이라 합니다）은 본 앱「NIARIM」（이하「본 앱」이라 합니다）에서의 정보 취급에 대해 정하는 것입니다. 본 앱의 전반적인 이용 조건에 대해서는 별도로「이용약관・라이선스」화면을 확인해 주십시오.",
      "legal.privacy.art2.title": "제2조（본 앱이 취득하지 않는 데이터）",
      "legal.privacy.art2.body":
        "본 앱은 사용자가 제작한 일러스트・애니메이션 등의 콘텐츠（프로젝트 데이터・내보낸 이미지・동영상 등을 포함합니다. 이하 동일합니다）를 개발자의 서버로 전송・수집・저장하는 기능을 제공하지 않습니다. 이들 데이터는 원칙적으로 사용자의 단말기 내에만 저장됩니다（클라우드 동기화 기능은 탑재되어 있지 않습니다）. 개발자는 이러한 콘텐츠를 스스로 저장하는 기능을 가지고 있지 않으므로, 개발자 측에서의 보관 기간이라는 개념 자체가 존재하지 않습니다. 단말기 내에 저장된 데이터는 본 앱의 삭제 기능을 통해 언제든지 삭제할 수 있으며, 앱을 삭제（언인스톨）한 경우에는 프로젝트・설정・추가한 폰트 등의 데이터도 함께 삭제됩니다（사용자가 스스로의 의사로 작품 광장 기능을 이용하여 작품을 게시하는 경우의 정보 취급에 대해서는 제7조에 따릅니다）.",
      "legal.privacy.art3.title": "제3조（제3자 서비스에 의한 정보 취득）",
      "legal.privacy.art3.body":
        "본 앱은 다음의 제3자 서비스를 포함하고 있으며, 각 서비스 제공자가 서비스 제공에 필요한 범위 내에서 정보를 취득할 수 있습니다. 본 앱의 개발자는 이러한 정보를 독자적으로 취득・보관하는 기능을 구현하고 있지 않습니다（각 서비스가 취득한 정보의 관리는 해당 서비스 제공자의 개인정보처리방침에 따릅니다）.\n\n【광고 배포（Google AdMob）】\n무료판에서는 Google AdMob을 통해 광고를 배포하고 있습니다. 광고 배포, 효과 측정, 부정 방지 등의 목적으로 광고 식별자（Advertising ID） 기타 단말기 정보가 Google 또는 그 관계사에 의해 취득・이용될 수 있습니다. 취득・이용의 상세 내용은 Google 개인정보처리방침（https://policies.google.com/privacy）을 확인해 주십시오. 단말기 설정（Android 설정 앱의「개인정보 보호」등）에서 광고 식별자 재설정이나 맞춤형 광고 비활성화가 가능합니다. 유럽경제지역（EEA）・영국・스위스에 거주 중이신 경우, 실행 시 등에 표시되는 동의 양식에서 광고 맞춤화에 관한 동의 설정을 선택할 수 있습니다. 설정은 언제든지 본 화면 하단의「광고 동의 설정 변경」버튼에서 변경할 수 있습니다.\n\n【앱 내 결제（Google Play Billing）】\n프리미엄 기능의 구매는 Google Play의 결제 시스템을 통해 이루어집니다. 신용카드 번호 등의 결제 정보는 개발자 측이 직접 취득・보유하는 일은 없습니다. 결제에 관한 정보의 취급은 Google Play의 규정에 따릅니다.\n\n【추가 글꼴 다운로드（GitHub）】\n설정 화면의 「글꼴 관리」에서 추가 글꼴을 다운로드하는 조작을 한 경우에 한하여, 글꼴 파일의 배포처인 GitHub（GitHub, Inc.）의 서버로 통신이 발생합니다. 이 통신은 고객이 다운로드를 선택했을 때에만 이루어지며, 앱 실행 시나 통상적인 이용 중에는 발생하지 않습니다. 전송되는 것은 통신에 필요한 정보（IP 주소, 요청하는 글꼴 파일의 지정 등）뿐이며, 작품 데이터나 고객을 특정할 수 있는 정보를 전송하는 일은 없습니다. 취득된 정보의 취급은 GitHub의 개인정보 보호 정책（https://docs.github.com/site-policy/privacy-policies/github-privacy-statement）을 따릅니다.\n\n【크래시 분석・이용 현황 분석】\n본 앱은 현시점에서 크래시 분석・이용 현황 분석을 목적으로 한 SDK를 포함하고 있지 않습니다. 향후 이러한 서비스를 도입할 경우, 본 방침을 갱신하고 본 앱 내에서 고지합니다.",
      "legal.privacy.art4.title": "제4조（쿠키 등 추적 기술에 관하여）",
      "legal.privacy.art4.body":
        "본 앱 자체는 쿠키를 사용하지 않지만, 제3조에 기재된 광고 배포 서비스（Google AdMob）가 광고 배포・효과 측정을 위해 이와 유사한 식별 기술（광고 식별자 등）을 사용할 수 있습니다.",
      "legal.privacy.art5.title": "제5조（아동의 개인정보에 관하여）",
      "legal.privacy.art5.body":
        "본 앱은 만 13세 미만의 아동을 주된 대상으로 하여 의도적으로 정보를 수집하는 것이 아닙니다. 보호자께서는 자녀가 본 앱을 이용할 때 필요에 따라 단말기 설정에서 맞춤형 광고 비활성화 등을 검토해 주시기 바랍니다.",
      "legal.privacy.art6.title": "제6조（정보의 국외 이전에 관하여）",
      "legal.privacy.art6.body":
        "제3조에 기재된 제3자 서비스（Google AdMob, Google Play Billing）는 Google사가 전 세계에서 운용하는 서버상에서 처리될 수 있습니다. 이러한 취급에 대해서는 각 서비스의 개인정보처리방침이 적용됩니다.",
      "legal.privacy.art7.title":
        "제7조（작품 광장：커뮤니티 게시 기능에서의 정보 취급）",
      "legal.privacy.art7.body":
        "1. 본 앱은 사용자가 스스로의 의사로「작품 광장」기능（이용약관 제12조）을 이용하는 경우에 한하여, 다음 정보를 개발자의 서버에서 관리합니다.\n・게시 작품을 식별・표시하기 위한 정보（YouTube 동영상 ID, 제목, 통계 정보, 게시 일시, 태그 등）\n・게시・신고・차단・팔로우・북마크 등의 기능 이용 시 발급되는 NIARIM User ID（Google 계정과는 별도로 본 앱 내부에서 발급하는 식별자）\n・연동한 YouTube 채널의 공개 정보（채널명, 채널 아이콘의 이미지 URL）. 이는 게시자명・아이콘 표시에 사용하기 위해 개발자의 서버에 복제하여 보관합니다\n・신고 기능을 이용한 경우의 신고 내용 및 신고자의 NIARIM User ID\n・차단한 상대방의 NIARIM User ID\n・팔로우한 상대방의 NIARIM User ID 및 팔로잉 수・팔로워 수\n・북마크한 작품의 ID 및 북마크한 일시\n・리포스트한 작품의 ID 및 리포스트한 일시\n・작품에 부여된 태그（제4항 참조）\n・푸시 알림을 활성화한 경우의 단말기 토큰（알림의 수신처를 특정하기 위해 단말기가 발급하는 식별자. 알림 전송에만 사용합니다）\n2. 게시된 동영상 파일 자체는 YouTube상에 저장되며, 개발자의 서버에는 저장되지 않습니다.\n3. 전 2항의 정보는 본 커뮤니티 기능의 제공（작품 목록 표시・랭킹・검색, 신고 대응, 게시 상한 관리, 팔로우・북마크・리포스트의 반영, 알림 전송 등）목적 범위 내에서만 이용합니다. 개발자는 이러한 정보를 광고 배포 목적으로 제3자에게 제공하지 않습니다.\n4. 태그는 게시자 이외의 사용자도 추가・삭제할 수 있습니다（게시자는 자신의 작품의 태그를 잠가 편집을 금지할 수 있습니다）. 태그는 작품 광장에서 공개되며, 누가 부여했는지는 표시되지 않습니다.\n5. 다음 정보는 기본적으로 비공개이며, 사용자가 본 앱 내에서 공개 설정으로 전환한 경우에 한하여 다른 사용자에게 표시됩니다.\n・북마크한 작품의 목록\n・팔로잉／팔로워 목록\n다만, 팔로잉 수・팔로워 수（인원수）는 공개 설정과 관계없이 항상 표시됩니다.\n6. 게시 작품을 비공개로 하거나 삭제한 경우, 해당 작품은 작품 광장의 목록・랭킹에서 표시되지 않게 됩니다. 개발자의 서버상의 기록 삭제를 원하시는 경우에는 제9조의 창구로 연락해 주십시오.\n7. 본 커뮤니티 기능을 이용하지 않는 경우, 본 조에 따른 정보 취급은 발생하지 않습니다（제2조의 원칙대로 개발자의 서버로 전송되지 않습니다）.",
      "legal.privacy.art8.title": "제8조（본 방침의 변경）",
      "legal.privacy.art8.body":
        "개발자는 법령 개정, 본 앱 내용의 변경 기타 필요하다고 판단한 경우, 본 방침을 변경할 수 있습니다. 본 방침을 변경하는 경우, 변경 내용 및 효력 발생일을 본 앱 내 기타 적절한 방법으로 사전에 고지합니다.",
      "legal.privacy.art9.title": "제9조（문의）",
      "legal.privacy.art9.body.html":
        '본 방침에 관한 문의는 본 사이트의 <a href="/contact/">문의 양식</a>을 통해 연락해 주십시오.',
      "legal.terms.art8.privacyLink.html":
        '개인정보처리방침은 <a href="/privacy/">여기</a>를 확인해 주세요.',
      "legal.terms.contact.title": "문의처",
      "legal.terms.contact.body.html":
        '본 약관에 관한 문의는 <a href="/contact/">문의 양식</a>을 통해 연락해 주십시오.',
      "legal.terms.art1.title": "제1조（적용）",
      "legal.terms.art1.body":
        "본 이용약관（이하「본 약관」이라 합니다）은 본 앱「NIARIM」（이하「본 앱」이라 합니다）의 이용 조건을 정하는 것입니다. 사용자는 본 약관에 동의한 후 본 앱을 이용하는 것으로 합니다. 본 앱을 이용함으로써 본 약관에 동의한 것으로 간주합니다.",
      "legal.terms.art2.title": "제2조（이용 자격・지원 환경）",
      "legal.terms.art2.body":
        "1. 지원 OS 및 권장 운영 환경의 상세 내용은 각 배포 스토어 및 본 앱 내 표시에 따릅니다.\n2. 본 앱은 다양한 성능의 단말기에서도 쾌적하게 이용하실 수 있도록 노력하고 있으나, 단말기의 성능・OS 버전・여유 용량・설정 등 이용 환경에 따라 일부 기능이 제한되거나 정상적으로 작동하지 않을 수 있습니다.",
      "legal.terms.art3.title": "제3조（금지 사항）",
      "legal.terms.art3.body":
        "사용자는 본 앱 이용 시 다음 행위를 해서는 안 됩니다.\n・법령 또는 공서양속에 위반하는 행위\n・본 앱, 개발자 또는 제3자의 저작권・상표권 등 지적재산권, 초상권, 프라이버시 기타 권리 또는 이익을 침해하는 행위\n・본 앱의 디컴파일, 디스어셈블, 리버스 엔지니어링 기타 해석을 목적으로 하는 행위（법령상 인정되는 경우는 제외）\n・본 앱의 부정한 개조, 복제 또는 재배포\n・본 앱 또는 그 제공 기반에 대한 부정 접속, 과도한 부하 기타 정상적인 제공을 방해하는 행위\n・기타 개발자가 합리적인 이유에 근거하여 부적절하다고 판단하는 행위",
      "legal.terms.art4.title": "제4조（제작 콘텐츠의 권리）",
      "legal.terms.art4.body":
        "1. 사용자가 본 앱을 이용하여 제작한 일러스트・애니메이션 등의 콘텐츠（프로젝트 데이터・내보낸 이미지・동영상 등을 포함합니다. 이하「제작 콘텐츠」라 합니다）에 관한 저작권 기타 권리는, 법령상 인정되는 범위 내에서 해당 콘텐츠에 대해 권리를 가진 사용자 또는 제3자에게 귀속됩니다.\n2. 본 앱은 제작 콘텐츠를 개발자의 서버로 전송・수집・동기화하는 기능을 제공하지 않습니다. 프로젝트 데이터는 원칙적으로 사용자의 단말기 내에만 저장됩니다（사용자가 스스로의 의사로 작품 광장 기능을 이용하여 제작 콘텐츠를 게시하는 경우의 취급에 대해서는 제12조에 따릅니다）.\n3. 무료판・프리미엄판 중 어느 것을 이용하여 제작한 경우라도, 본 앱의 이용 요금이나 에디션을 이유로 개발자가 제작 콘텐츠의 상업적 이용을 제한하는 일은 없습니다（무료판・프리미엄판의 차이는 엔드카드 표시나 내보내기 시간 상한 등 기능 면에 한정됩니다）.\n4. 전항에도 불구하고, 사용자가 본 앱에 추가한 폰트・이미지・소재 등 제3자가 권리를 가진 것에 대해서는 각각의 이용 조건（제5조）에 따라야 합니다.",
      "legal.terms.art5.title": "제5조（내장 폰트・추가 소재에 관하여）",
      "legal.terms.art5.body":
        "1. 본 앱에 내장된 폰트 기타 소재는 본 화면「사용 폰트에 관하여」에 기재된 각 라이선스 조건에 따라 이용되고 있습니다.\n2. 사용자가 본 앱에 추가 등록・불러오기한 폰트, 이미지, 톤, 스탬프 등 소재의 권리 관계에 대해서는 사용자 본인의 책임하에 필요한 권리 또는 허락을 취득한 후 적법하게 이용해 주십시오.\n3. 사용자의 제3자 소재 이용에 기인하여 제3자와의 사이에 분쟁 등이 발생한 경우, 개발자는 법령상 책임을 지는 경우를 제외하고 그 책임을 지지 않습니다.",
      "legal.terms.art6.title": "제6조（프리미엄 기능・결제）",
      "legal.terms.art6.body":
        "1. 본 앱에는 무료로 이용할 수 있는 기능 외에, 앱 내 결제（월간 플랜, 연간 플랜 기타 프리미엄 플랜）를 통해 이용 가능한 프리미엄 기능이 있습니다.\n2. 프리미엄 기능의 가격, 제공 내용, 구매 방법 기타 조건은 구매 시점의 본 앱 내 또는 배포 스토어의 표시에 따릅니다.\n3. 구매 후 취소・환불 기타 결제에 관한 사항에는 Google Play 기타 이용하시는 결제 플랫폼의 규정이 적용됩니다. 다만, 법령에 별도의 정함이 있는 경우에는 그 정함에 따릅니다.\n4. 개발자는 법령 개정, 기술상의 필요성, 본 앱의 개선 기타 합리적인 사유에 의해 프리미엄 기능의 내용을 변경할 수 있습니다. 중요한 변경을 하는 경우에는 가능한 한 사전에 본 앱 내 기타 적절한 방법으로 안내합니다.",
      "legal.terms.art7.title": "제7조（광고 표시）",
      "legal.terms.art7.body":
        "1. 무료판에서는 제3자 광고 배포 서비스를 통한 광고가 표시될 수 있습니다.\n2. 광고 배포 사업자에 의한 정보의 취득・이용 기타 취급에 대해서는 각 광고 배포 사업자의 개인정보처리방침이 적용됩니다.",
      "legal.terms.art8.title": "제8조（정보의 취급）",
      "legal.terms.art8.body":
        "1. 본 앱은 사용자가 제작한 일러스트・애니메이션 등의 콘텐츠 및 프로젝트 데이터를 개발자의 서버로 전송・수집하는 기능을 제공하지 않습니다. 이들은 원칙적으로 사용자의 단말기 내에만 저장되며, 개발자는 이를 스스로 저장하는 기능을 가지고 있지 않으므로 개발자 측에서의 보관 기간이라는 개념 자체가 존재하지 않습니다.\n2. 본 앱이 포함하는 제3자 서비스（광고 배포・앱 내 결제 등）에 의한 정보 취득 기타 사용자 정보의 취급에 관해서는 별도로 정하는「개인정보처리방침」의 규정에 따릅니다.\n3. 본 앱을 삭제（언인스톨）한 경우, 단말기 내에 저장된 데이터（프로젝트, 설정, 추가한 폰트 등）는 삭제됩니다.",
      "legal.terms.art9.title": "제9조（제공의 중지・변경・종료）",
      "legal.terms.art9.body":
        "1. 개발자는 본 앱의 유지보수・업데이트・수정을 실시하는 경우, 제공 기반에 장애가 발생한 경우 기타 부득이한 사정이 있는 경우, 본 앱의 전부 또는 일부의 제공을 일시적으로 중지할 수 있습니다.\n2. 개발자는 필요에 따라 본 앱의 내용을 변경하거나 본 앱의 제공을 종료할 수 있습니다.\n3. 전 2항의 경우, 긴급한 경우를 제외하고 가능한 한 사전에 본 앱 내 기타 적절한 방법으로 고지합니다.\n4. 본 조에 근거한 변경・중지・종료로 인해 사용자에게 발생한 손해에 대해, 개발자는 법령상 책임을 지는 경우를 제외하고 책임을 지지 않습니다.",
      "legal.terms.art10.title": "제10조（면책 사항）",
      "legal.terms.art10.body":
        "1. 개발자는 본 앱에 대해 사실상 또는 법률상의 하자（안전성・신뢰성・정확성・완전성・특정 목적에의 적합성・버그나 결함이 없음 등을 포함합니다）가 없음을 보증하지 않습니다.\n2. 사용자는 본 앱을 자기 책임하에 이용하는 것으로 합니다. 단말기 고장・오조작・OS 업데이트 기타 사정으로 데이터가 소실될 수 있으므로, 제작 중인 데이터에 대해서는 내보내기・공유 기능 등을 이용한 정기적인 백업을 권장합니다.\n3. 본 앱의 이용으로 인해 사용자에게 발생한 손해에 대해, 개발자는 법령상 인정되는 범위에서 책임을 지지 않습니다. 다만 개발자에게 고의 또는 중대한 과실이 있는 경우는 그러하지 아니하며, 그 경우에도 개발자가 지는 손해배상 책임은 통상 발생할 수 있는 직접 손해에 한하며, 사용자가 본 앱에 관해 직전 1년간 실제로 지불한 금액（무료로 이용한 경우는 0원）을 상한으로 합니다.",
      "legal.terms.art11.title": "제11조（본 약관의 변경）",
      "legal.terms.art11.body":
        "1. 개발자는 법령 개정, 본 앱 내용의 변경 기타 필요하다고 판단한 경우, 본 약관을 변경할 수 있습니다.\n2. 본 약관을 변경하는 경우, 변경 내용 및 효력 발생일을 본 앱 내 기타 적절한 방법으로 사전에 고지합니다.\n3. 변경 후의 본 약관은 법령상 인정되는 범위 내에서 전항의 효력 발생일부터 적용됩니다.",
      "legal.terms.art12.title": "제12조（작품 광장：커뮤니티 게시 기능）",
      "legal.terms.art12.body":
        "1. 본 앱은 사용자가 제작한 애니메이션 작품을 사용자 본인의 Google 계정을 통해 YouTube에 게시하고, 「작품 광장」에서 공개・열람할 수 있는 기능（이하「본 커뮤니티 기능」이라 합니다）을 임의로 제공합니다. 작품의 열람・제작 자체는 본 커뮤니티 기능을 이용하지 않아도 가능합니다.\n2. 게시된 동영상 파일 자체는 YouTube상에 저장되며, 개발자의 서버에는 저장되지 않습니다. 한편 게시 작품의 식별・표시에 필요한 정보（YouTube 동영상 ID, 제목, 통계 정보, 신고 정보 등）및 게시・신고・차단 기능 이용 시 발급되는 NIARIM User ID（Google 계정과는 별도로 본 앱 내부에서 발급하는 식별자）는 개발자의 서버에서 관리합니다.\n3. 본 커뮤니티 기능 중 작품 게시, 신고 및 사용자 차단에는 Google 계정을 통한 로그인이 필요합니다.\n4. 게시할 수 있는 작품 수에는 1일당 상한이 있습니다（무료 회원・프리미엄 회원에 따라 상한이 다릅니다）. 해당 상한은 운영상의 사정에 따라 변경될 수 있습니다.\n5. 사용자는 다른 사용자가 게시한 작품 중 법령 또는 공서양속에 위반하거나 제3조 각호에 해당할 우려가 있다고 판단되는 작품에 대해, 본 앱 내 신고 기능을 통해 개발자에게 신고할 수 있습니다. 개발자는 신고 내용을 확인한 후, 합리적인 이유에 근거하여 해당 작품을 목록에서 비공개 처리하는 등 필요한 조치를 취할 수 있습니다. 허위 신고 또는 신고 기능의 남용은 금지됩니다.\n6. 사용자가 게시물을 삭제하거나 본 앱에서 Google 계정 연동을 해제한 경우, 해당 게시물에 대응하는 YouTube 동영상이 삭제될 수 있습니다. 또한 YouTube 측에서 동영상이 비공개 또는 삭제된 경우, 해당 작품은 작품 광장에서도 표시되지 않게 됩니다.\n7. 본 커뮤니티 기능의 이용에는 본 약관에 더하여 YouTube의 이용약관 및 커뮤니티 가이드라인이 적용됩니다.\n8. 사용자는 다른 사용자를 팔로우할 수 있으며, 다른 사용자의 작품을 북마크 또는 리포스트할 수 있습니다. 팔로잉／팔로워 목록 및 북마크한 작품의 목록은 기본적으로 비공개이며, 공개 여부는 사용자가 본 앱 내에서 선택할 수 있습니다. 팔로잉 수・팔로워 수는 공개 설정과 관계없이 표시됩니다.\n9. 작품에 부여하는 태그는 게시자 이외의 사용자도 추가・삭제할 수 있습니다. 게시자는 자신의 작품의 태그를 잠가 다른 사용자에 의한 편집을 금지할 수 있습니다. 사용자는 타인을 비방하는 태그, 작품의 내용과 무관한 태그 기타 부적절한 태그를 부여해서는 안 됩니다. 개발자는 부적절한 태그를 삭제할 수 있습니다.\n10. 개발자는 팔로우된 경우 등에 본 앱 내의 알림 목록에 알림을 표시합니다. 사용자가 단말기의 알림을 허용한 경우에는 푸시 알림이 전송될 수 있습니다. 알림은 본 앱의 설정 또는 단말기의 설정에서 비활성화할 수 있습니다.\n11. 사용자는 본 커뮤니티 기능을 다른 사용자에 대한 괴롭힘, 광고・권유 기타 본래의 목적（작품의 공개와 열람）에서 벗어나는 목적으로 이용해서는 안 됩니다. 차단 기능을 이용한 경우, 차단한 상대방의 작품은 자신의 목록에 표시되지 않게 됩니다.",
      "legal.terms.art13.title": "제13조（준거법・재판관할）",
      "legal.terms.art13.body":
        "1. 본 약관의 해석에 있어서는 일본법을 준거법으로 합니다.\n2. 본 앱에 관하여 분쟁이 발생한 경우에는, 소송가액에 따라 개발자의 소재지를 관할하는 지방재판소 또는 간이재판소를 제1심의 전속적 합의관할 법원으로 합니다.",
    },
    fr: {
      "legal.notice.privacy":
        "Ce texte est identique à la politique de confidentialité officielle de l'application NIARIM.",
      "legal.notice.terms":
        "Ce texte est identique aux conditions d'utilisation officielles de l'application NIARIM (à l'exclusion des mentions de polices/licences open source).",
      "legal.privacy.art1.title": "Article 1 (Objet de la présente Politique)",
      "legal.privacy.art1.body":
        "La présente politique de confidentialité (la « Politique ») décrit la manière dont les informations sont traitées dans l'application « NIARIM » (l'« Application »). Pour les conditions générales d'utilisation de l'Application, veuillez vous référer séparément à l'écran « Conditions d'utilisation / Licence ».",
      "legal.privacy.art2.title":
        "Article 2 (Données que l'Application ne collecte pas)",
      "legal.privacy.art2.body":
        "L'Application ne fournit aucune fonction permettant de transmettre, collecter ou stocker sur les serveurs du développeur les illustrations, animations et autres contenus créés par l'utilisateur (y compris les données de projet, les images et vidéos exportées, etc. ; il en va de même ci-après). Ces données sont, en principe, stockées uniquement sur l'appareil de l'utilisateur (l'Application n'intègre pas de fonction de synchronisation en nuage). Le développeur ne disposant d'aucune fonction lui permettant de stocker ce contenu par lui-même, la notion de durée de conservation du côté du développeur n'existe pas. Les données stockées sur votre appareil peuvent être supprimées à tout moment via les fonctions de suppression de l'Application ; si vous désinstallez l'Application, les données stockées sur votre appareil — projets, paramètres, polices ajoutées, etc. — seront également supprimées (pour le traitement de l'information lorsque l'utilisateur choisit de publier une œuvre au moyen de la fonction Place des œuvres, voir l'article 7).",
      "legal.privacy.art3.title":
        "Article 3 (Informations collectées par des services tiers)",
      "legal.privacy.art3.body":
        "L'Application intègre les services tiers suivants, et chaque fournisseur de services peut collecter des informations dans la mesure nécessaire à la fourniture de son service respectif. Le développeur de l'Application n'a mis en place aucune fonction lui permettant d'acquérir ou de stocker ces informations de manière autonome (le traitement des informations collectées par chaque service est régi par la politique de confidentialité propre à ce prestataire).\n\n[Diffusion publicitaire (Google AdMob)]\nDans la version gratuite, les publicités sont diffusées via Google AdMob. À des fins de diffusion publicitaire, de mesure d'efficacité et de prévention de la fraude, l'identifiant publicitaire et d'autres informations sur l'appareil peuvent être collectés et utilisés par Google ou ses sociétés affiliées. Pour plus de détails sur la collecte et l'utilisation de ces informations, veuillez consulter la politique de confidentialité de Google (https://policies.google.com/privacy). Vous pouvez réinitialiser votre identifiant publicitaire ou désactiver les publicités personnalisées depuis les paramètres de votre appareil (par exemple, « Confidentialité » dans l'application Paramètres d'Android). Si vous résidez dans l'Espace économique européen (EEE), au Royaume-Uni ou en Suisse, vous pouvez choisir vos préférences de consentement relatives à la personnalisation des publicités via un formulaire de consentement affiché au lancement, et modifier ce choix à tout moment via le bouton « Modifier les préférences de consentement publicitaire » en bas de cet écran.\n\n[Achats intégrés (Google Play Billing)]\nLes achats des fonctionnalités premium sont effectués via le système de paiement de Google Play. Le développeur n'acquiert ni ne conserve directement les informations de paiement telles que les numéros de carte bancaire. Le traitement des informations relatives au paiement est régi par les règles de Google Play.\n\n[Analyse des plantages / analyse d'utilisation]\nL'Application n'intègre actuellement aucun SDK à des fins d'analyse des plantages ou d'analyse d'utilisation. Si de tels services venaient à être introduits à l'avenir, la présente Politique serait mise à jour et annoncée dans l'Application.\n\n[Téléchargement de polices supplémentaires (GitHub)]\nUne communication avec GitHub (GitHub, Inc.), qui distribue les fichiers de polices, n'a lieu que lorsque vous choisissez de télécharger une police supplémentaire depuis « Gestion des polices » dans l'écran des réglages. Elle n'a pas lieu au démarrage de l'application ni lors d'une utilisation normale. Seules les informations nécessaires à la requête (comme votre adresse IP et le fichier de police demandé) sont transmises ; aucune donnée de vos œuvres ni information permettant de vous identifier n'est transmise. Le traitement des informations obtenues est régi par la Déclaration de confidentialité de GitHub (https://docs.github.com/site-policy/privacy-policies/github-privacy-statement).",
      "legal.privacy.art4.title":
        "Article 4 (Cookies et autres technologies de suivi)",
      "legal.privacy.art4.body":
        "L'Application elle-même n'utilise pas de cookies, mais le service de diffusion publicitaire mentionné à l'article 3 (Google AdMob) peut utiliser des technologies d'identification similaires (telles que l'identifiant publicitaire) à des fins de diffusion publicitaire et de mesure d'efficacité.",
      "legal.privacy.art5.title":
        "Article 5 (Informations personnelles des enfants)",
      "legal.privacy.art5.body":
        "L'Application n'est pas conçue pour collecter intentionnellement des informations principalement destinées aux enfants de moins de 13 ans. Les parents et tuteurs sont invités à envisager, si nécessaire, de désactiver les publicités personnalisées depuis les paramètres de l'appareil lorsque leurs enfants utilisent l'Application.",
      "legal.privacy.art6.title":
        "Article 6 (Transferts transfrontaliers d'informations)",
      "legal.privacy.art6.body":
        "Les services tiers mentionnés à l'article 3 (Google AdMob, Google Play Billing) peuvent traiter des données sur des serveurs exploités par Google dans divers pays du monde. Le traitement de ces données est régi par la politique de confidentialité de chaque service concerné.",
      "legal.privacy.art7.title":
        "Article 7 (Traitement de l'information dans la Place des œuvres : fonction de publication communautaire)",
      "legal.privacy.art7.body":
        "1. Uniquement lorsqu'un utilisateur choisit, de sa propre initiative, d'utiliser la fonction « la Place des Œuvres » (article 12 des Conditions d'utilisation), le développeur gère les informations suivantes sur ses serveurs :\n・Les informations nécessaires pour identifier et afficher une œuvre publiée (identifiant de la vidéo YouTube, titre, statistiques, date et heure de publication, tags, etc.)\n・Le NIARIM User ID émis pour l'utilisation de fonctions telles que la publication, le signalement, le blocage, l'abonnement et les favoris (un identifiant émis au sein de l'Application, distinct du compte Google)\n・Les informations publiques de la chaîne YouTube associée (nom de la chaîne et URL de l'image de l'icône de la chaîne). Elles sont copiées et conservées sur les serveurs du développeur afin d'afficher le nom et l'icône de l'auteur\n・Le contenu de tout signalement effectué au moyen de la fonction de signalement, ainsi que le NIARIM User ID de l'auteur du signalement\n・Le NIARIM User ID de tout utilisateur que vous bloquez\n・Le NIARIM User ID de tout utilisateur que vous suivez, ainsi que vos nombres d'abonnements et d'abonnés\n・Les identifiants des œuvres que vous mettez en favori et la date et l'heure de chaque mise en favori\n・Les identifiants des œuvres que vous repartagez et la date et l'heure de chaque repartage\n・Les tags attachés à une œuvre (voir le paragraphe 4)\n・Si vous activez les notifications push, le jeton de votre appareil (un identifiant émis par votre appareil pour déterminer la destination de la notification ; utilisé uniquement pour envoyer des notifications)\n2. Le fichier vidéo lui-même est stocké sur YouTube, et non sur les serveurs du développeur.\n3. Les informations décrites aux deux paragraphes précédents ne sont utilisées que pour fournir la Fonction Communautaire (affichage des listes, des classements et des résultats de recherche, traitement des signalements, gestion des limites de publication, prise en compte des abonnements, favoris et repartages, envoi des notifications, etc.). Le développeur ne communique pas ces informations à des tiers à des fins publicitaires.\n4. Les tags peuvent être ajoutés ou supprimés par des utilisateurs autres que l'auteur (l'auteur peut verrouiller les tags de sa propre œuvre pour en interdire la modification). Les tags sont publics sur la Place des Œuvres et l'identité de l'utilisateur ayant ajouté un tag n'est pas affichée.\n5. Les informations suivantes sont privées par défaut et ne sont montrées aux autres utilisateurs que si vous les rendez publiques dans l'Application :\n・La liste des œuvres que vous avez mises en favori\n・Vos listes d'abonnements / d'abonnés\nVos nombres d'abonnements et d'abonnés (les chiffres eux-mêmes) sont toujours affichés, indépendamment de ce réglage.\n6. Si vous rendez privée ou supprimez une œuvre publiée, celle-ci n'apparaîtra plus dans les listes ni les classements de la Place des Œuvres. Si vous souhaitez la suppression des enregistrements présents sur les serveurs du développeur, veuillez nous contacter par le moyen décrit à l'article 9.\n7. Si un utilisateur n'utilise pas la Fonction Communautaire, aucun traitement d'informations au titre du présent article n'a lieu. (Conformément au principe de l'article 2, rien n'est transmis aux serveurs du développeur.)",
      "legal.privacy.art8.title":
        "Article 8 (Modifications de la présente Politique)",
      "legal.privacy.art8.body":
        "Le développeur peut modifier la présente Politique en cas de changement de la législation applicable, de modification du contenu de l'Application ou pour toute autre raison qu'il juge nécessaire. En cas de modification de la présente Politique, le développeur en communiquera au préalable le contenu et la date d'entrée en vigueur, dans l'Application ou par tout autre moyen approprié.",
      "legal.privacy.art9.title": "Article 9 (Contact)",
      "legal.privacy.art9.body.html":
        'Pour toute question relative à la présente Politique, veuillez nous contacter via le <a href="/contact/">formulaire de contact</a> de ce site.',
      "legal.terms.art8.privacyLink.html":
        'Consultez la <a href="/privacy/">politique de confidentialité</a> ici.',
      "legal.terms.contact.title": "Contact",
      "legal.terms.contact.body.html":
        'Pour toute question relative aux présentes conditions, veuillez nous contacter via le <a href="/contact/">formulaire de contact</a>.',
      "legal.terms.art1.title": "Article 1 (Application)",
      "legal.terms.art1.body":
        "Les présentes conditions d'utilisation (les « Conditions ») définissent les conditions d'utilisation de l'application « NIARIM » (l'« Application »). L'utilisateur doit accepter les présentes Conditions avant d'utiliser l'Application. L'utilisation de l'Application vaut acceptation des présentes Conditions.",
      "legal.terms.art2.title":
        "Article 2 (Éligibilité à l'utilisation / environnement pris en charge)",
      "legal.terms.art2.body":
        "1. Pour plus de détails sur les versions du système d'exploitation prises en charge et l'environnement d'exploitation recommandé de l'Application, veuillez vous référer à la boutique de distribution concernée et aux informations affichées dans l'Application.\n2. Nous nous efforçons de faire fonctionner l'Application confortablement sur des appareils de performances variées ; toutefois, selon les performances de l'appareil, la version du système d'exploitation, l'espace de stockage disponible, les paramètres et d'autres conditions d'utilisation, certaines fonctionnalités peuvent être limitées ou ne pas fonctionner correctement.",
      "legal.terms.art3.title": "Article 3 (Actes interdits)",
      "legal.terms.art3.body":
        "Lors de l'utilisation de l'Application, l'utilisateur ne doit pas :\n・Commettre des actes contraires aux lois, règlements ou aux bonnes mœurs\n・Porter atteinte aux droits d'auteur, marques ou autres droits de propriété intellectuelle, au droit à l'image, à la vie privée ou à d'autres droits ou intérêts de l'Application, du développeur ou de tiers\n・Décompiler, désassembler, procéder à de l'ingénierie inverse ou toute autre analyse de l'Application (sauf dans les cas autorisés par la loi)\n・Modifier, dupliquer ou redistribuer l'Application sans autorisation\n・Accéder sans autorisation à l'Application ou à la plateforme qui la fournit, lui imposer une charge excessive ou entraver de toute autre manière son fonctionnement normal\n・Commettre tout autre acte que le développeur juge raisonnablement inapproprié",
      "legal.terms.art4.title": "Article 4 (Droits sur le contenu créé)",
      "legal.terms.art4.body":
        "1. Les droits d'auteur et autres droits relatifs aux illustrations, animations et autres contenus créés par l'utilisateur au moyen de l'Application (y compris les données de projet, les images et vidéos exportées, etc. ; ci-après le « Contenu créé ») appartiennent, dans la mesure permise par la loi, à l'utilisateur ou au tiers titulaire des droits sur ce contenu.\n2. L'Application ne fournit aucune fonction permettant de transmettre, collecter ou synchroniser le Contenu créé vers les serveurs du développeur. Les données de projet sont, en principe, stockées uniquement sur l'appareil de l'utilisateur (pour le traitement applicable lorsque l'utilisateur choisit de publier du Contenu créé au moyen de la fonction Place des œuvres, voir l'article 12).\n3. Que le Contenu créé ait été réalisé avec la version gratuite ou la version premium, le développeur ne restreindra pas son utilisation commerciale en raison des frais d'utilisation de l'Application ou de l'édition utilisée (les différences entre la version gratuite et la version premium se limitent à des aspects fonctionnels tels que l'affichage de la carte de fin ou la limite de durée d'exportation).\n4. Nonobstant le paragraphe précédent, les polices, images, matériaux et autres éléments ajoutés par l'utilisateur à l'Application et sur lesquels des tiers détiennent des droits restent soumis à leurs conditions d'utilisation respectives (article 5).",
      "legal.terms.art5.title":
        "Article 5 (Polices intégrées et matériaux ajoutés)",
      "legal.terms.art5.body":
        "1. Les polices et autres matériaux intégrés à l'Application sont utilisés conformément aux conditions de licence indiquées sur cet écran, sous « À propos des polices utilisées ».\n2. En ce qui concerne les droits relatifs aux polices, images, tons, tampons et autres matériaux que l'utilisateur ajoute ou charge lui-même dans l'Application, celui-ci est responsable de l'obtention des droits ou autorisations nécessaires et de leur utilisation licite.\n3. En cas de litige avec un tiers résultant de l'utilisation par l'utilisateur de matériaux tiers, le développeur n'en assume aucune responsabilité, sauf dans les cas où la loi l'exige.",
      "legal.terms.art6.title":
        "Article 6 (Fonctionnalités premium / facturation)",
      "legal.terms.art6.body":
        "1. Outre les fonctionnalités disponibles gratuitement, l'Application propose des fonctionnalités premium accessibles via des achats intégrés (une formule mensuelle, une formule annuelle ou d'autres formules premium).\n2. Le prix, le contenu, le mode d'achat et les autres conditions des fonctionnalités premium sont ceux affichés dans l'Application ou sur la boutique de distribution au moment de l'achat.\n3. Les annulations, remboursements et autres questions relatives au paiement après achat sont régis par les règles de Google Play ou de la plateforme de paiement utilisée. Toutefois, lorsque la loi en dispose autrement, ces dispositions s'appliquent.\n4. Le développeur peut modifier le contenu des fonctionnalités premium pour des motifs raisonnables, tels qu'une évolution législative, une nécessité technique ou une amélioration de l'Application. Lorsqu'un changement important est apporté, il en informera au préalable, dans la mesure du raisonnablement possible, au sein de l'Application ou par tout autre moyen approprié.",
      "legal.terms.art7.title": "Article 7 (Affichage publicitaire)",
      "legal.terms.art7.body":
        "1. Dans la version gratuite, des publicités peuvent être affichées via des services publicitaires tiers.\n2. L'acquisition, l'utilisation et le traitement des informations par les prestataires publicitaires sont régis par la politique de confidentialité de chaque prestataire concerné.",
      "legal.terms.art8.title": "Article 8 (Traitement des informations)",
      "legal.terms.art8.body":
        "1. L'Application ne fournit aucune fonction permettant de transmettre ou de collecter vers les serveurs du développeur les illustrations, animations et autres contenus, ni les données de projet, créés par l'utilisateur. Ceux-ci sont, en principe, stockés uniquement sur l'appareil de l'utilisateur, et le développeur ne disposant d'aucune fonction lui permettant de stocker ce contenu par lui-même, la notion de durée de conservation du côté du développeur n'existe pas.\n2. Le traitement des informations de l'utilisateur — y compris les informations collectées par les services tiers intégrés à l'Application (tels que la diffusion publicitaire et les achats intégrés) — est régi par la Politique de confidentialité établie séparément.\n3. Si vous désinstallez l'Application, les données stockées sur votre appareil (projets, paramètres, polices ajoutées, etc.) seront supprimées.",
      "legal.terms.art9.title":
        "Article 9 (Suspension, modification et cessation de la fourniture)",
      "legal.terms.art9.body":
        "1. Le développeur peut suspendre temporairement la fourniture de tout ou partie de l'Application lors d'opérations de maintenance, de mise à jour ou de correction, en cas de dysfonctionnement de l'infrastructure de fourniture, ou pour toute autre raison indépendante de sa volonté.\n2. Le développeur peut modifier le contenu de l'Application ou mettre fin à sa fourniture selon les besoins.\n3. Dans les cas visés aux deux paragraphes précédents, le développeur donnera, sauf urgence, un préavis dans la mesure du possible, dans l'Application ou par tout autre moyen approprié.\n4. Sauf obligation légale contraire, le développeur n'assume aucune responsabilité pour les dommages subis par l'utilisateur du fait des modifications, suspensions ou cessations visées au présent article.",
      "legal.terms.art10.title": "Article 10 (Clause de non-responsabilité)",
      "legal.terms.art10.body":
        "1. Le développeur ne garantit pas l'absence de défauts factuels ou juridiques de l'Application (y compris en matière de sécurité, de fiabilité, d'exactitude, d'exhaustivité, d'adéquation à un usage particulier, ou d'absence de bugs ou de dysfonctionnements).\n2. L'utilisateur utilise l'Application sous sa propre responsabilité. Des données peuvent être perdues en raison d'une panne de l'appareil, d'une erreur de manipulation, d'une mise à jour du système d'exploitation ou d'autres circonstances ; il est donc recommandé d'effectuer des sauvegardes régulières des données en cours de création à l'aide des fonctions d'exportation et de partage, entre autres.\n3. Dans la mesure permise par la loi, le développeur n'assume aucune responsabilité pour les dommages subis par l'utilisateur du fait de l'utilisation de l'Application. Cette limitation ne s'applique toutefois pas en cas de faute intentionnelle ou de négligence grave du développeur ; même dans ce cas, la responsabilité du développeur en matière de dommages-intérêts est limitée aux dommages directs ordinaires, dans la limite du montant effectivement payé par l'utilisateur au titre de l'Application au cours de l'année précédente (soit 0 yen en cas d'utilisation gratuite).",
      "legal.terms.art11.title":
        "Article 11 (Modification des présentes Conditions)",
      "legal.terms.art11.body":
        "1. Le développeur peut modifier les présentes Conditions en cas de changement de la législation applicable, de modification du contenu de l'Application ou pour toute autre raison qu'il juge nécessaire.\n2. En cas de modification des présentes Conditions, le développeur en communiquera au préalable le contenu et la date d'entrée en vigueur, dans l'Application ou par tout autre moyen approprié.\n3. Les Conditions modifiées s'appliqueront, dans la mesure permise par la loi, à compter de la date d'entrée en vigueur mentionnée au paragraphe précédent.",
      "legal.terms.art12.title":
        "Article 12 (Place des œuvres : fonction de publication communautaire)",
      "legal.terms.art12.body":
        "1. L'Application propose, à titre facultatif, une fonction permettant à l'utilisateur de publier, via son propre compte Google, les animations qu'il a créées sur YouTube, puis de les publier et de les consulter sur la « Place des œuvres » (la « Fonction Communautaire »). Il est possible de consulter et de créer des œuvres sans utiliser la Fonction Communautaire.\n2. Le fichier vidéo lui-même est stocké sur YouTube, et non sur les serveurs du développeur. En revanche, les informations nécessaires à l'identification et à l'affichage des œuvres publiées (identifiant de la vidéo YouTube, titre, statistiques, informations de signalement, etc.), ainsi que l'identifiant utilisateur NIARIM délivré lors de l'utilisation des fonctions de publication, de signalement et de blocage (un identifiant délivré au sein de l'Application, distinct du compte Google), sont gérés sur les serveurs du développeur.\n3. La publication d'œuvres, le signalement et le blocage d'autres utilisateurs dans le cadre de la Fonction Communautaire nécessitent une connexion via un compte Google.\n4. Le nombre d'œuvres pouvant être publiées est soumis à une limite quotidienne (différente entre les membres gratuits et les membres premium). Cette limite peut être modifiée pour des raisons d'exploitation.\n5. Si un utilisateur estime qu'une œuvre publiée par un autre utilisateur enfreint la loi ou les bonnes mœurs, ou pourrait relever de l'un des points de l'article 3, il peut la signaler au développeur via la fonction de signalement de l'Application. Après examen du signalement, le développeur pourra, pour un motif raisonnable, prendre les mesures nécessaires, telles que le retrait de l'œuvre des listes. Les signalements mensongers et l'usage abusif de la fonction de signalement sont interdits.\n6. Si un utilisateur supprime une publication, ou dissocie son compte Google de l'Application, la vidéo YouTube correspondante pourra être supprimée. De même, si la vidéo est rendue privée ou supprimée du côté de YouTube, l'œuvre cessera également d'être affichée sur la Place des œuvres.\n7. L'utilisation de la Fonction Communautaire est soumise, en plus des présentes Conditions, aux Conditions d'utilisation et aux Règles de la communauté de YouTube.\n8. Les utilisateurs peuvent s'abonner à d'autres utilisateurs et mettre en favori ou repartager les œuvres d'autres utilisateurs. Vos listes d'abonnements / d'abonnés et la liste des œuvres que vous avez mises en favori sont privées par défaut ; leur publication relève de votre choix au sein de l'Application. Vos nombres d'abonnements et d'abonnés sont affichés indépendamment de ce réglage.\n9. Les tags attachés à une œuvre peuvent être ajoutés ou supprimés par des utilisateurs autres que l'auteur. L'auteur peut verrouiller les tags de sa propre œuvre afin d'en interdire la modification par d'autres utilisateurs. Les utilisateurs ne doivent pas ajouter de tags diffamatoires, de tags sans rapport avec le contenu de l'œuvre, ni de tags inappropriés de quelque autre nature. Le développeur peut supprimer les tags inappropriés.\n10. Le développeur affiche des notifications dans la liste des notifications de l'Application, par exemple lorsque quelqu'un s'abonne à vous. Si vous avez autorisé les notifications sur votre appareil, des notifications push peuvent être envoyées. Les notifications peuvent être désactivées depuis les réglages de l'Application ou depuis les réglages de votre appareil.\n11. Les utilisateurs ne doivent pas utiliser la Fonction Communautaire pour harceler d'autres utilisateurs, à des fins publicitaires ou de démarchage, ni pour tout autre objectif étranger à sa finalité (publier et consulter des œuvres). Si vous utilisez la fonction de blocage, les œuvres de l'utilisateur bloqué n'apparaîtront plus dans vos listes.",
      "legal.terms.art13.title":
        "Article 13 (Droit applicable / juridiction compétente)",
      "legal.terms.art13.body":
        "1. Les présentes Conditions sont régies et interprétées conformément au droit japonais.\n2. En cas de litige relatif à l'Application, le tribunal de district ou le tribunal sommaire compétent pour le lieu d'établissement du développeur, selon le montant en litige, disposera d'une compétence exclusive convenue en tant que juridiction de première instance.",
    },
    es: {
      "legal.notice.privacy":
        "Este texto es el mismo que la política de privacidad oficial dentro de la app NIARIM.",
      "legal.notice.terms":
        "Este texto es el mismo que los términos de servicio oficiales dentro de la app NIARIM (excluyendo los créditos de fuentes/licencias de código abierto).",
      "legal.privacy.art1.title": "Artículo 1 (Finalidad de esta Política)",
      "legal.privacy.art1.body":
        "Esta política de privacidad (la «Política») describe el tratamiento de la información en la aplicación «NIARIM» (la «Aplicación»). Para conocer las condiciones generales de uso de la Aplicación, consulte por separado la pantalla «Términos de servicio / Licencia».",
      "legal.privacy.art2.title":
        "Artículo 2 (Datos que la Aplicación no recopila)",
      "legal.privacy.art2.body":
        "La Aplicación no ofrece ninguna función para transmitir, recopilar o almacenar en los servidores del desarrollador las ilustraciones, animaciones y demás contenidos creados por el usuario (incluidos los datos de proyecto, las imágenes y vídeos exportados, etc.; en lo sucesivo, lo mismo). Estos datos se almacenan, en principio, únicamente en el dispositivo del usuario (la Aplicación no incorpora una función de sincronización en la nube). Dado que el desarrollador no dispone de ninguna función para almacenar estos contenidos por su cuenta, no existe el concepto de un plazo de conservación por parte del desarrollador. Los datos almacenados en su dispositivo pueden eliminarse en cualquier momento mediante las funciones de eliminación de la Aplicación y, si desinstala la Aplicación, también se eliminarán los datos almacenados en su dispositivo, incluidos proyectos, ajustes y fuentes añadidas (en cuanto al tratamiento de la información cuando el usuario, por decisión propia, publica una obra mediante la función de la Plaza de Obras, véase el artículo 7).",
      "legal.privacy.art3.title":
        "Artículo 3 (Información recopilada por servicios de terceros)",
      "legal.privacy.art3.body":
        "La Aplicación incorpora los siguientes servicios de terceros, y cada proveedor de servicios puede recopilar información en la medida necesaria para prestar su respectivo servicio. El desarrollador de la Aplicación no ha implementado ninguna función para obtener o almacenar esta información por su cuenta (el tratamiento de la información recopilada por cada servicio se rige por la política de privacidad de ese proveedor).\n\n[Publicidad (Google AdMob)]\nEn la versión gratuita, los anuncios se distribuyen a través de Google AdMob. Con fines de distribución de anuncios, medición de eficacia y prevención de fraudes, Google o sus empresas afiliadas pueden recopilar y utilizar el identificador de publicidad y otra información del dispositivo. Para más detalles sobre la recopilación y el uso de esta información, consulte la Política de Privacidad de Google (https://policies.google.com/privacy). Puede restablecer su identificador de publicidad o desactivar los anuncios personalizados desde la configuración de su dispositivo (por ejemplo, «Privacidad» en la aplicación Ajustes de Android). Si se encuentra en el Espacio Económico Europeo (EEE), el Reino Unido o Suiza, podrá elegir sus preferencias de consentimiento para la personalización de anuncios mediante un formulario de consentimiento que se muestra al iniciar la aplicación, y podrá modificar esta elección en cualquier momento mediante el botón «Cambiar la configuración de consentimiento de anuncios» en la parte inferior de esta pantalla.\n\n[Compras dentro de la aplicación (Google Play Billing)]\nLas compras de funciones premium se realizan a través del sistema de pago de Google Play. El desarrollador no obtiene ni conserva directamente información de pago como números de tarjeta de crédito. El tratamiento de la información relacionada con los pagos se rige por las normas de Google Play.\n\n[Descarga de fuentes adicionales (GitHub)]\nLa comunicación con GitHub (GitHub, Inc.), distribuidor de los archivos de fuentes, solo se produce cuando eliges descargar una fuente adicional desde «Gestión de fuentes» en la pantalla de ajustes. No se produce al iniciar la aplicación ni durante el uso normal. Solo se envía la información necesaria para la solicitud (como tu dirección IP y qué archivo de fuente se solicita); no se envían datos de tus obras ni información que te identifique. El tratamiento de la información obtenida se rige por la Declaración de privacidad de GitHub (https://docs.github.com/site-policy/privacy-policies/github-privacy-statement).\n\n[Análisis de fallos / análisis de uso]\nLa Aplicación no incorpora actualmente ningún SDK con fines de análisis de fallos o de uso. Si en el futuro se introdujeran estos servicios, esta Política se actualizará y se anunciará dentro de la Aplicación.",
      "legal.privacy.art4.title":
        "Artículo 4 (Cookies y otras tecnologías de seguimiento)",
      "legal.privacy.art4.body":
        "La propia Aplicación no utiliza cookies, pero el servicio de publicidad mencionado en el artículo 3 (Google AdMob) puede utilizar tecnologías de identificación similares (como el identificador de publicidad) con fines de distribución de anuncios y medición de eficacia.",
      "legal.privacy.art5.title":
        "Artículo 5 (Información personal de menores)",
      "legal.privacy.art5.body":
        "La Aplicación no está diseñada para recopilar intencionadamente información dirigida principalmente a menores de 13 años. Se recomienda a los padres y tutores que, cuando sea necesario, consideren desactivar los anuncios personalizados desde la configuración del dispositivo cuando sus hijos utilicen la Aplicación.",
      "legal.privacy.art6.title":
        "Artículo 6 (Transferencia internacional de información)",
      "legal.privacy.art6.body":
        "Los servicios de terceros mencionados en el artículo 3 (Google AdMob, Google Play Billing) pueden procesar datos en servidores que Google opera en distintas partes del mundo. El tratamiento de estos datos se rige por la política de privacidad de cada servicio correspondiente.",
      "legal.privacy.art7.title":
        "Artículo 7 (Tratamiento de la información en la Plaza de Obras: función de publicación comunitaria)",
      "legal.privacy.art7.body":
        "1. Únicamente cuando un usuario decide, por su propia voluntad, utilizar la función «la Plaza de Obras» (artículo 12 de los Términos de Servicio), el desarrollador gestiona la siguiente información en sus servidores:\n・Información necesaria para identificar y mostrar una obra publicada (ID del vídeo de YouTube, título, estadísticas, fecha y hora de publicación, etiquetas, etc.)\n・El NIARIM User ID emitido para el uso de funciones como publicar, denunciar, bloquear, seguir y marcar (un identificador emitido dentro de la Aplicación, distinto de la cuenta de Google)\n・Información pública del canal de YouTube vinculado (nombre del canal y URL de la imagen del icono del canal). Se copia y conserva en los servidores del desarrollador para mostrar el nombre y el icono del autor\n・El contenido de cualquier denuncia enviada mediante la función de denuncia y el NIARIM User ID del denunciante\n・El NIARIM User ID de cualquier usuario que bloquees\n・El NIARIM User ID de cualquier usuario que sigas, así como tu número de seguidos y de seguidores\n・Los ID de las obras que marcas y la fecha y hora de cada marcador\n・Los ID de las obras que republicas y la fecha y hora de cada republicación\n・Las etiquetas asociadas a una obra (véase el apartado 4)\n・Si activas las notificaciones push, el token de tu dispositivo (un identificador emitido por tu dispositivo para determinar el destino de la notificación; se utiliza únicamente para enviar notificaciones)\n2. El archivo de vídeo en sí se almacena en YouTube, no en los servidores del desarrollador.\n3. La información descrita en los dos apartados anteriores se utiliza únicamente para prestar la Función Comunitaria (mostrar listados, clasificaciones y resultados de búsqueda, atender denuncias, gestionar los límites de publicación, reflejar seguimientos, marcadores y republicaciones, enviar notificaciones, etc.). El desarrollador no facilita esta información a terceros con fines publicitarios.\n4. Las etiquetas pueden ser añadidas o eliminadas por usuarios distintos del autor (el autor puede bloquear las etiquetas de su propia obra para impedir su edición). Las etiquetas son públicas en la Plaza de Obras y no se muestra qué usuario añadió cada una.\n5. La siguiente información es privada de forma predeterminada y solo se muestra a otros usuarios si la cambias a pública dentro de la Aplicación:\n・La lista de obras que has marcado\n・Tus listas de seguidos y seguidores\nEl número de seguidos y de seguidores (las cifras en sí) se muestra siempre, con independencia de este ajuste.\n6. Si haces privada o eliminas una obra publicada, esa obra dejará de aparecer en los listados y clasificaciones de la Plaza de Obras. Si deseas que se eliminen los registros de los servidores del desarrollador, ponte en contacto con nosotros por la vía descrita en el artículo 9.\n7. Si un usuario no utiliza la Función Comunitaria, no se produce ningún tratamiento de información conforme a este artículo. (Conforme al principio del artículo 2, no se transmite nada a los servidores del desarrollador.)",
      "legal.privacy.art8.title":
        "Artículo 8 (Modificaciones de esta Política)",
      "legal.privacy.art8.body":
        "El desarrollador podrá modificar esta Política en caso de cambios en la legislación aplicable, cambios en el contenido de la Aplicación u otras circunstancias que considere necesarias. Al modificar esta Política, el desarrollador comunicará con antelación el contenido de la modificación y su fecha de entrada en vigor, dentro de la Aplicación o por otros medios adecuados.",
      "legal.privacy.art9.title": "Artículo 9 (Contacto)",
      "legal.privacy.art9.body.html":
        'Si tiene alguna consulta sobre esta Política, póngase en contacto con nosotros a través del <a href="/contact/">formulario de contacto</a> de este sitio.',
      "legal.terms.art8.privacyLink.html":
        'Consulta la <a href="/privacy/">Política de Privacidad</a> aquí.',
      "legal.terms.contact.title": "Contacto",
      "legal.terms.contact.body.html":
        'Si tiene alguna consulta sobre estos Términos, póngase en contacto con nosotros a través del <a href="/contact/">formulario de contacto</a>.',
      "legal.terms.art1.title": "Artículo 1 (Aplicación)",
      "legal.terms.art1.body":
        "Estos Términos de Servicio (los «Términos») establecen las condiciones de uso de la aplicación «NIARIM» (la «Aplicación»). El usuario deberá aceptar estos Términos antes de utilizar la Aplicación. El uso de la Aplicación implica la aceptación de estos Términos.",
      "legal.terms.art2.title":
        "Artículo 2 (Requisitos de uso / entorno compatible)",
      "legal.terms.art2.body":
        "1. Para más información sobre las versiones de sistema operativo compatibles y el entorno operativo recomendado de la Aplicación, consulte la tienda de distribución correspondiente y la información mostrada dentro de la Aplicación.\n2. Procuramos que la Aplicación funcione de forma fluida en dispositivos de muy diversas prestaciones; no obstante, según el rendimiento del dispositivo, la versión del sistema operativo, el espacio de almacenamiento disponible, la configuración y otras condiciones de uso, algunas funciones pueden verse limitadas o no funcionar correctamente.",
      "legal.terms.art3.title": "Artículo 3 (Actos prohibidos)",
      "legal.terms.art3.body":
        "Al utilizar la Aplicación, el usuario no podrá:\n・Realizar actos contrarios a la ley o al orden público\n・Vulnerar los derechos de autor, marcas u otros derechos de propiedad intelectual, el derecho a la propia imagen, la privacidad u otros derechos o intereses de la Aplicación, del desarrollador o de terceros\n・Descompilar, desensamblar, aplicar ingeniería inversa o realizar cualquier otro análisis de la Aplicación (salvo en los casos permitidos por la ley)\n・Modificar, duplicar o redistribuir la Aplicación sin autorización\n・Acceder sin autorización a la Aplicación o a la infraestructura que la sustenta, imponerle una carga excesiva o interferir de cualquier otro modo en su funcionamiento normal\n・Realizar cualquier otro acto que el desarrollador considere razonablemente inapropiado",
      "legal.terms.art4.title":
        "Artículo 4 (Derechos sobre el contenido creado)",
      "legal.terms.art4.body":
        "1. Los derechos de autor y demás derechos relativos a las ilustraciones, animaciones y demás contenidos que el usuario cree mediante la Aplicación (incluidos los datos de proyecto, las imágenes y vídeos exportados, etc.; en adelante, el «Contenido creado») corresponden, en la medida permitida por la ley, al usuario o al tercero titular de los derechos sobre dicho contenido.\n2. La Aplicación no ofrece ninguna función para transmitir, recopilar o sincronizar el Contenido creado con los servidores del desarrollador. Los datos de proyecto se almacenan, en principio, únicamente en el dispositivo del usuario (en cuanto al tratamiento aplicable cuando el usuario, por decisión propia, publica Contenido creado mediante la función de la Plaza de Obras, véase el artículo 12).\n3. Con independencia de si el Contenido creado se elaboró con la versión gratuita o con la versión premium, el desarrollador no restringirá su uso comercial en función de la tarifa de uso de la Aplicación o de la edición utilizada (las diferencias entre la versión gratuita y la premium se limitan a aspectos funcionales como la visualización de la tarjeta final o el límite de duración de exportación).\n4. No obstante lo dispuesto en el párrafo anterior, las fuentes, imágenes, materiales y demás elementos que el usuario añada a la Aplicación y sobre los que terceros posean derechos quedarán sujetos a sus respectivas condiciones de uso (artículo 5).",
      "legal.terms.art5.title":
        "Artículo 5 (Fuentes incluidas y materiales añadidos)",
      "legal.terms.art5.body":
        "1. Las fuentes y demás materiales incluidos en la Aplicación se utilizan conforme a las condiciones de licencia indicadas en esta pantalla, en «Acerca de las fuentes utilizadas».\n2. En cuanto a los derechos relativos a las fuentes, imágenes, tonos, sellos y demás materiales que el propio usuario registre o cargue en la Aplicación, este será responsable de obtener los derechos o permisos necesarios y de utilizarlos de forma lícita.\n3. Si surgiera una disputa con un tercero derivada del uso por parte del usuario de materiales de terceros, el desarrollador no asumirá responsabilidad alguna al respecto, salvo en los casos en que la ley así lo exija.",
      "legal.terms.art6.title": "Artículo 6 (Funciones premium / facturación)",
      "legal.terms.art6.body":
        "1. Además de las funciones disponibles de forma gratuita, la Aplicación ofrece funciones premium que pueden utilizarse mediante compras dentro de la aplicación (un plan mensual, un plan anual u otros planes premium).\n2. El precio, el contenido, el método de compra y demás condiciones de las funciones premium serán los que se muestren dentro de la Aplicación o en la tienda de distribución en el momento de la compra.\n3. Las cancelaciones, reembolsos y demás cuestiones relativas al pago posteriores a la compra se rigen por las normas de Google Play o de la plataforma de pago que utilice. No obstante, cuando la ley disponga lo contrario, se aplicará dicha disposición.\n4. El desarrollador podrá modificar el contenido de las funciones premium por motivos razonables, como cambios legislativos, necesidades técnicas o mejoras de la Aplicación. Cuando se realice un cambio significativo, se lo notificará con antelación, en la medida de lo razonablemente posible, dentro de la Aplicación o por otro medio adecuado.",
      "legal.terms.art7.title": "Artículo 7 (Publicidad)",
      "legal.terms.art7.body":
        "1. En la versión gratuita, pueden mostrarse anuncios a través de servicios publicitarios de terceros.\n2. La obtención, el uso y demás tratamientos de la información por parte de los proveedores de publicidad se rigen por la política de privacidad de cada proveedor correspondiente.",
      "legal.terms.art8.title": "Artículo 8 (Tratamiento de la información)",
      "legal.terms.art8.body":
        "1. La Aplicación no ofrece ninguna función para transmitir o recopilar en los servidores del desarrollador las ilustraciones, animaciones y demás contenidos, ni los datos de proyecto, creados por el usuario. Estos se almacenan, en principio, únicamente en el dispositivo del usuario, y dado que el desarrollador no dispone de ninguna función para almacenar estos contenidos por su cuenta, no existe el concepto de un plazo de conservación por parte del desarrollador.\n2. El tratamiento de la información del usuario —incluida la información recopilada por los servicios de terceros integrados en la Aplicación (como la publicidad y las compras dentro de la aplicación)— se rige por la Política de Privacidad establecida por separado.\n3. Si desinstala la Aplicación, se eliminarán los datos almacenados en su dispositivo (proyectos, ajustes, fuentes añadidas, etc.).",
      "legal.terms.art9.title":
        "Artículo 9 (Suspensión, modificación y finalización del servicio)",
      "legal.terms.art9.body":
        "1. El desarrollador podrá suspender temporalmente la prestación total o parcial de la Aplicación al realizar tareas de mantenimiento, actualización o corrección, en caso de fallos en la infraestructura de prestación del servicio o por otras circunstancias inevitables.\n2. El desarrollador podrá modificar el contenido de la Aplicación o poner fin a su prestación cuando lo considere necesario.\n3. En los casos previstos en los dos párrafos anteriores, el desarrollador lo comunicará con antelación, en la medida de lo posible, dentro de la Aplicación o por otros medios adecuados, salvo en casos urgentes.\n4. Salvo que la ley exija lo contrario, el desarrollador no asumirá responsabilidad alguna por los daños que el usuario sufra como consecuencia de las modificaciones, suspensiones o finalizaciones previstas en este artículo.",
      "legal.terms.art10.title": "Artículo 10 (Exención de responsabilidad)",
      "legal.terms.art10.body":
        "1. El desarrollador no garantiza que la Aplicación esté libre de defectos de hecho o de derecho (incluidos aspectos de seguridad, fiabilidad, exactitud, integridad, idoneidad para un fin concreto, o ausencia de errores o fallos).\n2. El usuario utilizará la Aplicación bajo su propia responsabilidad. Los datos pueden perderse debido a averías del dispositivo, errores de manejo, actualizaciones del sistema operativo u otras circunstancias, por lo que se recomienda realizar copias de seguridad periódicas del trabajo en curso mediante las funciones de exportación y de compartir, entre otras.\n3. En la medida permitida por la ley, el desarrollador no asumirá responsabilidad alguna por los daños que el usuario sufra como consecuencia del uso de la Aplicación. Esta limitación no se aplicará, sin embargo, en caso de dolo o negligencia grave por parte del desarrollador; incluso en ese caso, la responsabilidad del desarrollador por daños y perjuicios se limitará a los daños directos habituales, hasta el importe efectivamente abonado por el usuario en relación con la Aplicación durante el año anterior (0 yenes si se utilizó de forma gratuita).",
      "legal.terms.art11.title": "Artículo 11 (Modificación de estos Términos)",
      "legal.terms.art11.body":
        "1. El desarrollador podrá modificar estos Términos en caso de cambios en la legislación aplicable, cambios en el contenido de la Aplicación u otras circunstancias que considere necesarias.\n2. Al modificar estos Términos, el desarrollador comunicará con antelación el contenido de la modificación y su fecha de entrada en vigor, dentro de la Aplicación o por otros medios adecuados.\n3. Los Términos modificados se aplicarán, en la medida permitida por la ley, a partir de la fecha de entrada en vigor mencionada en el párrafo anterior.",
      "legal.terms.art12.title":
        "Artículo 12 (Plaza de Obras: función de publicación comunitaria)",
      "legal.terms.art12.body":
        "1. La Aplicación ofrece de forma opcional una función que permite al usuario publicar, a través de su propia cuenta de Google, las animaciones que ha creado en YouTube, y publicarlas y consultarlas en la «Plaza de Obras» (en adelante, la «Función Comunitaria»). Es posible ver y crear obras sin utilizar la Función Comunitaria.\n2. El archivo de vídeo en sí se almacena en YouTube, no en los servidores del desarrollador. En cambio, la información necesaria para identificar y mostrar las obras publicadas (ID del vídeo de YouTube, título, estadísticas, información de denuncias, etc.), así como el ID de usuario de NIARIM emitido para el uso de las funciones de publicación, denuncia y bloqueo (un identificador emitido dentro de la Aplicación, distinto de la cuenta de Google), se gestionan en los servidores del desarrollador.\n3. Para publicar obras, denunciar y bloquear a otros usuarios dentro de la Función Comunitaria es necesario haber iniciado sesión con una cuenta de Google.\n4. Existe un límite diario en el número de obras que se pueden publicar (el límite difiere entre los miembros gratuitos y los miembros premium). Dicho límite puede modificarse por razones operativas.\n5. Si un usuario considera que una obra publicada por otro usuario infringe la ley o el orden público, o puede estar comprendida en alguno de los supuestos del artículo 3, puede denunciarla al desarrollador a través de la función de denuncia de la Aplicación. Tras revisar el contenido de la denuncia, el desarrollador podrá adoptar, por razones justificadas, las medidas necesarias, como ocultar dicha obra de los listados. Quedan prohibidas las denuncias falsas y el uso abusivo de la función de denuncia.\n6. Si el usuario elimina una publicación, o desvincula su cuenta de Google de la Aplicación, el vídeo de YouTube correspondiente podrá eliminarse. Asimismo, si el vídeo se hace privado o se elimina en YouTube, la obra dejará también de mostrarse en la Plaza de Obras.\n7. El uso de la Función Comunitaria está sujeto, además de a estos Términos, a las Condiciones del Servicio y las Normas de la Comunidad de YouTube.\n8. Los usuarios pueden seguir a otros usuarios y marcar o republicar obras de otros usuarios. Tus listas de seguidos y seguidores y la lista de obras que has marcado son privadas de forma predeterminada; hacerlas públicas es una elección tuya dentro de la Aplicación. Tu número de seguidos y de seguidores se muestra con independencia de ese ajuste.\n9. Las etiquetas asociadas a una obra pueden ser añadidas o eliminadas por usuarios distintos del autor. El autor puede bloquear las etiquetas de su propia obra para impedir su edición por otros usuarios. Los usuarios no deben añadir etiquetas que difamen a terceros, etiquetas ajenas al contenido de la obra ni etiquetas inapropiadas de cualquier otro tipo. El desarrollador podrá eliminar las etiquetas inapropiadas.\n10. El desarrollador muestra notificaciones en la lista de notificaciones de la Aplicación, por ejemplo cuando alguien te sigue. Si has permitido las notificaciones en tu dispositivo, podrán enviarse notificaciones push. Las notificaciones pueden desactivarse desde los ajustes de la Aplicación o desde los ajustes de tu dispositivo.\n11. Los usuarios no deben utilizar la Función Comunitaria para acosar a otros usuarios, para publicidad o captación, ni para ningún otro fin ajeno a su finalidad prevista (publicar y ver obras). Si utilizas la función de bloqueo, las obras del usuario bloqueado dejarán de aparecer en tus listados.",
      "legal.terms.art13.title": "Artículo 13 (Ley aplicable / jurisdicción)",
      "legal.terms.art13.body":
        "1. Estos Términos se regirán e interpretarán conforme a las leyes de Japón.\n2. En caso de que surja una disputa relacionada con la Aplicación, el tribunal de distrito o el tribunal sumario que tenga jurisdicción sobre el lugar de establecimiento del desarrollador, según la cuantía del litigio, tendrá jurisdicción exclusiva convenida como tribunal de primera instancia.",
    },
  };
  for (var lang in LEGAL) {
    if (!DICT[lang]) DICT[lang] = {};
    var entries = LEGAL[lang];
    for (var key in entries) {
      DICT[lang][key] = entries[key];
    }
  }
})();
