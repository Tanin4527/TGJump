# 电报跳转（Loon 插件）

将 `t.me / telegram.me / telegram.dog` 等 Telegram 外部链接 **定向跳转**到你指定的 TG 客户端（Swiftgram 专用 scheme + tg:// 兜底 + 自定义 Scheme 模板）。
同时提供 Telegram 相关域名的 **PROXY 分流**（可在 Loon 插件页把 `PROXY` 映射到你自己的策略组）。

## 兼容性（你的环境）
- 设备：iPhone
- 系统：iOS 26.1
- Loon：3.3.8（924）

> 只要 Loon 的脚本/插件功能正常、MITM 证书已正确安装并信任，本插件即可工作（下方有排错清单）。

## 功能
- ✅ 跳转开关（启用/关闭）
- ✅ 跳转客户端选择（Swiftgram 专用 + tg:// 兜底 + 自定义模板）
- ✅ 跳转方式：`302重定向` / `HTML页面跳转`（更兼容）
- ✅ 可选：保留 HTTPS（让系统/已装客户端自行接管 Universal Link）
- ✅ 策略组选项：插件 Rule 使用 `PROXY`，在 Loon 插件页映射到策略组即可

## 安装（GitHub Raw）
- 插件（建议订阅这个）：
  - `https://raw.githubusercontent.com/Tanin4527/TGJump/main/电报跳转.plugin`
- 脚本（插件里已引用，一般不用单独加）：
  - `https://raw.githubusercontent.com/Tanin4527/TGJump/main/telegram_redirect.js`

## 使用
1. Loon 导入/订阅插件后，进入插件配置：
   - 跳转开关：开启
   - 跳转客户端：例如 Swiftgram
   - 跳转方式：默认 302；若不跳则改 HTML 页面跳转
2. MITM：
   - 确保已启用并信任证书
   - 本插件已自动追加：`t.me, telegram.me, telegram.dog`
3. 策略组选项：
   - 插件里 Rule 写的是 `PROXY`
   - 在插件详情页把 **PROXY 映射**到你想用的策略组即可（例如「TG」/「Proxy」/「国外」等）

## 自定义 Scheme 模板
当你选择「自定义」客户端时生效：
- 支持占位符：
  - `{url}`：encode 后的原链接
  - `{raw}`：原始链接
- 示例：
  - `xxx://parseurl?url={url}`
  - `xxx://open?link={raw}`

## 排错（非常重要）
- **打不开/不跳转**：
  - 先把「跳转方式」切换为 `HTML页面跳转`
  - 打开「日志输出」，在 Loon 日志中检查是否生成了目标链接
- **完全没触发**：
  - 检查 MITM 是否开启、证书是否信任
  - 检查是否命中域名：t.me / telegram.me / telegram.dog

## 贡献
欢迎提交 PR：补充更多第三方客户端的 scheme（或给出可验证的资料/抓包证据）。

## 免责声明
仅做链接跳转与规则分流；第三方客户端可用性与安全性由用户自行判断。
