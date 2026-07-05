import type { ReactNode, CSSProperties } from "react";

// 微信公众号「真的孙思远」订阅引导 + 可选的小宇宙播客关注卡片（紧凑版，放文章末尾）。
// 两张卡片用同一套视觉语言（白底二维码块 + 站点自己的排版），不直接嵌外部截图，
// 保持跟站点暖纸/炭灰双主题一致，深色模式下也清晰。
function QrCard({
  qrSrc,
  qrAlt,
  title,
  subtitle,
  href,
}: {
  qrSrc: string;
  qrAlt: string;
  title: ReactNode;
  subtitle: string;
  href?: string;
}) {
  const content = (
    <>
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 5,
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        {/* 用普通 img，避免图片优化重压导致二维码降质影响扫描 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt={qrAlt}
          width={72}
          height={72}
          style={{ display: "block", borderRadius: 4 }}
        />
      </div>
      <div className="flex flex-col gap-1" style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600 }}>{title}</p>
        <p className="text-xs" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
          {subtitle}
        </p>
      </div>
    </>
  );

  const sectionStyle: CSSProperties = {
    background: "var(--paper-raised)",
    border: "1px solid var(--rule)",
    flex: "1 1 260px",
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg px-4 py-3.5 flex flex-wrap items-center gap-4"
        style={sectionStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <section
      className="rounded-lg px-4 py-3.5 flex flex-wrap items-center gap-4"
      style={sectionStyle}
    >
      {content}
    </section>
  );
}

export default function Subscribe({
  podcastQr,
  podcastUrl,
}: {
  podcastQr?: string;
  podcastUrl?: string;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <QrCard
        qrSrc="/wechat-qr.jpg"
        qrAlt="「真的孙思远」微信公众号二维码"
        title={
          <>
            微信搜一搜{" "}
            <span style={{ color: "var(--accent-deep)" }}>「真的孙思远」</span>
          </>
        }
        subtitle="扫码关注公众号，新文章第一时间推送。"
      />

      {podcastQr && (
        <QrCard
          qrSrc={podcastQr}
          qrAlt="小宇宙播客单集二维码"
          title={
            <>
              长按扫码，<span style={{ color: "var(--accent-deep)" }}>小宇宙</span>收听本期
            </>
          }
          subtitle="播客配音演绎版，AI数字分身访谈完整音频。"
          href={podcastUrl}
        />
      )}
    </div>
  );
}
