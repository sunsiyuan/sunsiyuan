// 微信公众号「真的孙思远」订阅引导（紧凑版，放文章末尾）。用站点自己的设计系统，
// 暖纸/炭灰双主题自适应；二维码固定放白色圆角块，扫码需要白底，深色下也清晰。
export default function Subscribe() {
  return (
    <section
      className="rounded-lg px-4 py-3.5 flex flex-wrap items-center gap-4"
      style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--rule)",
      }}
    >
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
          src="/wechat-qr.jpg"
          alt="「真的孙思远」微信公众号二维码"
          width={72}
          height={72}
          style={{ display: "block", borderRadius: 4 }}
        />
      </div>
      <div className="flex flex-col gap-1" style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600 }}>
          微信搜一搜{" "}
          <span style={{ color: "var(--accent-deep)" }}>「真的孙思远」</span>
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}
        >
          扫码关注公众号，新文章第一时间推送。
        </p>
      </div>
    </section>
  );
}
