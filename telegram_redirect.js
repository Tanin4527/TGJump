/**
 * 电报跳转 - Telegram External Link Redirect for Loon (Full Fixed)
 * Intercept:
 *  - https://t.me/*
 *  - https://telegram.me/*
 *  - https://telegram.dog/*
 *  - https://telegram.org/*
 *
 * Respond:
 *  - 302 Location: <target scheme>
 *  - OR HTML page that opens scheme
 *
 * Key fixes:
 * 1) Allow telegram.org host (Safari often lands on telegram.org after t.me 302)
 * 2) For telegram.org, do NOT attempt to parse paths—just feed original https URL into target scheme.
 */

function args() {
  const a = (typeof $argument === "object" && $argument) ? $argument : {};
  return {
    on: String(a.redir_on ?? "true") === "true",
    client: String(a.client ?? "Telegram(官方/默认)"),
    method: String(a.method ?? "302重定向"),
    keepHttps: String(a.keep_https ?? "false") === "true",
    customTpl: String(a.custom_tpl ?? "").trim(),
    log: String(a.log ?? "true") === "true",
  };
}

const enc = encodeURIComponent;

function parseTelegramLink(u) {
  try {
    const url = new URL(u);
    const host = url.hostname.toLowerCase();

    // ✅ FIX: include telegram.org
    const allowed = ["t.me", "telegram.me", "telegram.dog", "telegram.org"];
    if (!allowed.includes(host)) return null;

    // For telegram.org: do not parse, return raw only (most robust)
    if (host === "telegram.org") {
      return { host, rawHttps: u, tg: null };
    }

    const path = url.pathname.replace(/^\/+/, "");
    const parts = path.split("/").filter(Boolean);
    const rawHttps = u;

    if (parts.length === 0) return { host, rawHttps, tg: null };

    const p0 = parts[0];

    // joinchat / +invite
    if (p0 === "joinchat" && parts[1]) {
      return { host, tg: `tg://join?invite=${enc(parts[1])}`, rawHttps };
    }
    if (p0.startsWith("+") && p0.length > 1) {
      return { host, tg: `tg://join?invite=${enc(p0.slice(1))}`, rawHttps };
    }

    // stickers
    if (p0 === "addstickers" && parts[1]) {
      return { host, tg: `tg://addstickers?set=${enc(parts[1])}`, rawHttps };
    }

    // t.me/s/channel
    if (p0 === "s" && parts[1]) {
      return { host, tg: `tg://resolve?domain=${enc(parts[1])}`, rawHttps };
    }

    // username[/post]
    const username = p0;
    if (parts[1] && /^\d+$/.test(parts[1])) {
      return { host, tg: `tg://resolve?domain=${enc(username)}&post=${enc(parts[1])}`, rawHttps };
    }
    return { host, tg: `tg://resolve?domain=${enc(username)}`, rawHttps };
  } catch (_) {
    return null;
  }
}

function buildTarget(a, parsed, originalUrl) {
  const raw = originalUrl;
  const url = enc(originalUrl);

  // Swiftgram (known): sg://parseurl?url=<url>
  if (a.client === "Swiftgram") return `sg://parseurl?url=${url}`;

  // Custom template
  if (a.client === "自定义") {
    if (!a.customTpl) return parsed.tg || raw;
    return a.customTpl.replaceAll("{url}", url).replaceAll("{raw}", raw);
  }

  // Others: either keep HTTPS (universal link) or fallback to tg://
  if (a.keepHttps) return raw;

  // telegram.org 没有 tg:// 可解析的稳定统一映射，这里直接回 raw 最合理
  if (parsed.host === "telegram.org") return raw;

  return parsed.tg || raw;
}

function htmlJump(target) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Redirecting…</title>
</head><body>
<p style="font-family:-apple-system,system-ui;padding:16px;">正在跳转…</p>
<script>
(function(){
  var t=${JSON.stringify(target)};
  window.location.href=t;
  setTimeout(function(){
    document.body.innerHTML='<p style="font-family:-apple-system,system-ui;padding:16px;">如果未自动跳转，请点击：<a href="'+t+'">打开客户端</a></p>';
  }, 600);
})();
</script>
</body></html>`;
}

(function main() {
  const a = args();
  if (!a.on) return $done({});

  const reqUrl = $request.url;
  const parsed = parseTelegramLink(reqUrl);
  if (!parsed) return $done({});

  const target = buildTarget(a, parsed, reqUrl);

  if (a.log) console.log(`[TGJump] ${reqUrl} -> ${target}`);

  if (a.method === "HTML页面跳转") {
    return $done({
      response: {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
        body: htmlJump(target),
      },
    });
  }

  return $done({
    response: {
      status: 302,
      headers: {
        "Location": target,
        "Cache-Control": "no-store",
      },
      body: "",
    },
  });
})();
