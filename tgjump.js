function enc(s){
  return encodeURIComponent(s).replace(/[!'()*]/g,c=>"%"+c.charCodeAt(0).toString(16).toUpperCase());
}

const arg = $argument || {};
const client = (arg.client || "Swiftgram").toLowerCase();
const url = $request.url;

function stripQ(s){ return (s||"").split("?")[0]; }

function toTg(raw){
  const u = new URL(raw);
  const p = u.pathname.replace(/^\/+/, "");

  if (p.startsWith("joinchat/")) return "tg://join?invite=" + stripQ(p.slice(9));
  if (p.startsWith("+")) return "tg://join?invite=" + stripQ(p.slice(1));
  if (p.startsWith("addstickers/")) return "tg://addstickers?set=" + stripQ(p.slice(12));

  if (p.startsWith("s/")) {
    const seg = p.split("/");
    if (seg[1]) return "tg://resolve?domain=" + stripQ(seg[1]);
  }

  return "tg://resolve?domain=" + stripQ(p.split("/")[0]);
}

let location;

// Swiftgram：专属解析（最强）
if (client.includes("swiftgram")) {
  location = "sg://parseurl?url=" + enc(url);
} else {
  // 所有其他第三方 / 官方：统一 tg://（最大兼容）
  location = toTg(url);
}

$done({
  status: 302,
  headers: { Location: location, "Cache-Control": "no-store" },
  body: ""
});
