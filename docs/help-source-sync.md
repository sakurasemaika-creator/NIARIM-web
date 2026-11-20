# App help source synchronization

Source repository: `sakurasemaika-creator/NIARIM`
Source branch: `dev_branch`
Source commit verified: `f90df4833bde1c2abfadb67723ba6db1c666241d`
Source entries: `lib/screens/help/help_screen.dart` (81 entries)
Source translations: `lib/l10n/app_{ja,en,zh,zh_Hant,ko,fr,es}.arb`

Web files: `public/help/index.html`, `public/js/help-topics/*.json`.

Both titles and descriptions are copied verbatim for each entry and language. The Worker renders the requested language in the initial HTML. The static preview and subsequent language switches fetch one language at a time and reuse it. Run `node tools/sync-app-help.mjs ../NIARIM --write` to regenerate the dictionaries before a website release and pass `--check` to verify them.
