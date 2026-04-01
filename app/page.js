export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>A1 Massage System</h1>

      <div style={{ marginTop: 20 }}>
        <a href="/booking">
          <button>预约系统</button>
        </a>
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="/sales">
          <button>销售系统</button>
        </a>
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="/members">
          <button>会员系统</button>
        </a>
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="/giftcards">
          <button>礼品卡系统</button>
        </a>
      </div>
    </div>
  );
}
