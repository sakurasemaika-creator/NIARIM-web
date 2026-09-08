import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("public/js");
const files = fs
  .readdirSync(dir)
  .filter((name) => /^i18n-dict-.*\.js$/.test(name));

const banned = [
  /\bgonna\b/gi,
  /\bwanna\b/gi,
  /\bgotta\b/gi,
  /\bkinda\b/gi,
  /\bsorta\b/gi,
  /\blol\b/gi,
  /\bomg\b/gi,
  /\bnope\b/gi,
  /\byep\b/gi,
  /\bsuper cool\b/gi,
  /\bguay\b/gi,
  /\bcurro\b/gi,
  /\bchulo\b/gi,
  /\bflipante\b/gi,
  /\bouais\b/gi,
  /\bbosser\b/gi,
  /\btrop cool\b/gi,
  /ㅋㅋ/g,
  /ㅎㅎ/g,
  /대박/g,
  /짱/g,
  /꿀팁/g,
  /牛逼/g,
  /超赞/g,
  /超讚/g,
  /绝绝子/g,
  /絕絕子/g,
  /YYDS/gi,
];

const errors = [];
for (const file of files) {
  const text = fs.readFileSync(path.join(dir, file), "utf8");
  for (const pattern of banned) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match)
      errors.push(
        `${file}: slang/casual expression ${JSON.stringify(match[0])}`,
      );
  }
  const emphatic = text.match(/!{2,}|\?{2,}|!\?|\?!/g);
  if (emphatic)
    errors.push(
      `${file}: excessive emphatic punctuation ${JSON.stringify(emphatic.slice(0, 5))}`,
    );
}

if (errors.length) {
  console.error("Web translation tone audit failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Web translation tone audit passed across ${files.length} i18n dictionary files.`,
);
