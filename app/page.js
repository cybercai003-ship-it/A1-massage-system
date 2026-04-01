export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>A1 Massage System</h1>
      <p>系统已上线 ✅</p>

      <div style={{ marginTop: 20 }}>
        <a href="/booking">
          <button>进入预约系统</button>
        </a>
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="/sales">
          <button>进入销售系统</button>
        </a>
      </div>
    </div>
  );
}
