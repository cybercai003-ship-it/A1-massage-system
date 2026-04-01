"use client";
import { useEffect, useMemo, useState } from "react";

export default function SalesPage() {
  const [form, setForm] = useState({
    type: "service", // service / giftcard / membership
    service: "60",
    price: "",
    therapist: "",
    paymentMethod: "POS",
    note: "",
  });

  const [sales, setSales] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sales") || "[]");
    setSales(saved);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit() {
    if (!form.price) {
      alert("请输入金额");
      return;
    }

    if (form.type === "service" && !form.therapist.trim()) {
      alert("请输入技师");
      return;
    }

    const newSale = {
      id: Date.now(),
      type: form.type,
      service: form.service,
      price: parseFloat(form.price),
      therapist: form.therapist,
      paymentMethod: form.paymentMethod,
      note: form.note,
      time: new Date().toLocaleString(),
    };

    const updated = [...sales, newSale];
    localStorage.setItem("sales", JSON.stringify(updated));
    setSales(updated);

    alert("保存成功");

    setForm({
      type: "service",
      service: "60",
      price: "",
      therapist: "",
      paymentMethod: "POS",
      note: "",
    });
  }

  function handleDelete(id) {
    const updated = sales.filter((i) => i.id !== id);
    localStorage.setItem("sales", JSON.stringify(updated));
    setSales(updated);
  }

  // 💰 分类统计
  const stats = useMemo(() => {
    let pos = 0;
    let cash = 0;
    let giftcard = 0;
    let membership = 0;

    sales.forEach((s) => {
      if (s.paymentMethod === "POS") pos += s.price;
      if (s.paymentMethod === "Cash") cash += s.price;

      if (s.type === "giftcard") giftcard += s.price;
      if (s.type === "membership") membership += s.price;
    });

    return {
      pos,
      cash,
      giftcard,
      membership,
      total: pos + cash,
    };
  }, [sales]);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>销售录入</h1>

      {/* 类型 */}
      <div>
        <label>销售类型：</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="service">按摩服务</option>
          <option value="giftcard">礼品卡销售</option>
          <option value="membership">会员费</option>
        </select>
      </div>

      {/* 项目 */}
      {form.type === "service" && (
        <div>
          <label>项目：</label>
          <select name="service" value={form.service} onChange={handleChange}>
            <option value="30">30分钟</option>
            <option value="60">60分钟</option>
            <option value="90">90分钟</option>
          </select>
        </div>
      )}

      {/* 金额 */}
      <div>
        <label>金额：</label>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
        />
      </div>

      {/* 技师 */}
      {form.type === "service" && (
        <div>
          <label>技师：</label>
          <input
            name="therapist"
            value={form.therapist}
            onChange={handleChange}
          />
        </div>
      )}

      {/* 支付方式 */}
      <div>
        <label>支付方式：</label>
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
        >
          <option value="POS">POS</option>
          <option value="Cash">现金</option>
        </select>
      </div>

      {/* 备注 */}
      <div>
        <label>备注：</label>
        <input name="note" value={form.note} onChange={handleChange} />
      </div>

      <button onClick={handleSubmit}>保存销售</button>

      <hr />

      {/* 📊 收入统计 */}
      <h2>收入统计</h2>
      <p>POS收入：${stats.pos.toFixed(2)}</p>
      <p>现金收入：${stats.cash.toFixed(2)}</p>
      <p>礼品卡销售：${stats.giftcard.toFixed(2)}</p>
      <p>会员费：${stats.membership.toFixed(2)}</p>
      <h3>总收入：${stats.total.toFixed(2)}</h3>

      <hr />

      {/* 列表 */}
      <h2>销售列表</h2>

      {sales.length === 0 ? (
        <p>暂无记录</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>时间</th>
              <th>类型</th>
              <th>项目</th>
              <th>金额</th>
              <th>技师</th>
              <th>支付</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td>{s.time}</td>
                <td>
                  {s.type === "service"
                    ? "按摩"
                    : s.type === "giftcard"
                    ? "礼品卡"
                    : "会员"}
                </td>
                <td>{s.service}</td>
                <td>${s.price}</td>
                <td>{s.therapist || "-"}</td>
                <td>{s.paymentMethod}</td>
                <td>
                  <button onClick={() => handleDelete(s.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20 }}>
        <a href="/">返回首页</a>
      </div>
    </div>
  );
}
