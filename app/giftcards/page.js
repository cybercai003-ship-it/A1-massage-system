"use client";
import { useEffect, useMemo, useState } from "react";

function generateGiftCardNo() {
  const timestamp = Date.now().toString().slice(-6);
  return "GC" + timestamp;
}

export default function GiftCardsPage() {
  const [form, setForm] = useState({
    planType: "BUY6GET1",
    customerName: "",
    phone: "",
    salePrice: "",
    note: "",
  });

  const [useForm, setUseForm] = useState({
    cardNo: "",
    therapist: "",
    note: "",
  });

  const [giftCards, setGiftCards] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("giftcards") || "[]");
    setGiftCards(saved);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleUseChange(e) {
    setUseForm({ ...useForm, [e.target.name]: e.target.value });
  }

  function handleCreateCard() {
    if (!form.phone.trim()) {
      alert("请输入手机号");
      return;
    }

    if (!form.salePrice) {
      alert("请输入礼品卡销售金额");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("giftcards") || "[]");

    const totalSessions = form.planType === "BUY6GET1" ? 7 : 11;

    const newCard = {
      id: Date.now(),
      cardNo: generateGiftCardNo(),
      planType: form.planType,
      customerName: form.customerName,
      phone: form.phone,
      salePrice: parseFloat(form.salePrice),
      totalSessions,
      usedSessions: 0,
      remainingSessions: totalSessions,
      status: "active",
      note: form.note,
      createdAt: new Date().toLocaleString(),
      usageHistory: [],
    };

    const updated = [...saved, newCard];
    localStorage.setItem("giftcards", JSON.stringify(updated));
    setGiftCards(updated);

    alert("礼品卡已创建 ✅");

    setForm({
      planType: "BUY6GET1",
      customerName: "",
      phone: "",
      salePrice: "",
      note: "",
    });
  }

  function handleUseCard() {
    if (!useForm.cardNo.trim()) {
      alert("请输入礼品卡号");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("giftcards") || "[]");
    const index = saved.findIndex(
      (item) => item.cardNo.toLowerCase() === useForm.cardNo.trim().toLowerCase()
    );

    if (index === -1) {
      alert("未找到该礼品卡");
      return;
    }

    const card = saved[index];

    if (card.status === "void") {
      alert("该礼品卡已作废，不能使用");
      return;
    }

    if (card.remainingSessions <= 0) {
      alert("该礼品卡次数不足，不能使用");
      return;
    }

    const updatedCard = {
      ...card,
      usedSessions: card.usedSessions + 1,
      remainingSessions: card.remainingSessions - 1,
      status: card.remainingSessions - 1 <= 0 ? "used_up" : "active",
      usageHistory: [
        ...(card.usageHistory || []),
        {
          time: new Date().toLocaleString(),
          therapist: useForm.therapist,
          note: useForm.note,
        },
      ],
    };

    saved[index] = updatedCard;
    localStorage.setItem("giftcards", JSON.stringify(saved));
    setGiftCards(saved);

    alert("礼品卡核销成功 ✅");

    setUseForm({
      cardNo: "",
      therapist: "",
      note: "",
    });
  }

  function handleDelete(id) {
    const updated = giftCards.filter((item) => item.id !== id);
    localStorage.setItem("giftcards", JSON.stringify(updated));
    setGiftCards(updated);
  }

  function handleVoid(id) {
    const updated = giftCards.map((item) =>
      item.id === id ? { ...item, status: "void" } : item
    );
    localStorage.setItem("giftcards", JSON.stringify(updated));
    setGiftCards(updated);
  }

  const totalSalesAmount = useMemo(() => {
    return giftCards.reduce((sum, item) => sum + Number(item.salePrice || 0), 0);
  }, [giftCards]);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>礼品卡系统</h1>

      <h2>创建礼品卡</h2>

      <div style={{ marginBottom: 12 }}>
        <label>类型：</label>
        <select name="planType" value={form.planType} onChange={handleChange}>
          <option value="BUY6GET1">买6送1</option>
          <option value="BUY10GET1">买10送1</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>客户姓名（可不填）：</label>
        <input name="customerName" value={form.customerName} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>手机号：</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>销售金额：</label>
        <input name="salePrice" type="number" value={form.salePrice} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>备注：</label>
        <input name="note" value={form.note} onChange={handleChange} />
      </div>

      <button onClick={handleCreateCard}>创建礼品卡</button>

      <hr style={{ margin: "30px 0" }} />

      <h2>礼品卡核销</h2>

      <div style={{ marginBottom: 12 }}>
        <label>礼品卡号：</label>
        <input name="cardNo" value={useForm.cardNo} onChange={handleUseChange} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>技师：</label>
        <input name="therapist" value={useForm.therapist} onChange={handleUseChange} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>备注：</label>
        <input name="note" value={useForm.note} onChange={handleUseChange} />
      </div>

      <button onClick={handleUseCard}>核销1次</button>

      <hr style={{ margin: "30px 0" }} />

      <h2>礼品卡列表</h2>
      <h3>礼品卡销售总额：${totalSalesAmount.toFixed(2)}</h3>

      {giftCards.length === 0 ? (
        <p>暂无礼品卡</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>卡号</th>
              <th>类型</th>
              <th>姓名</th>
              <th>手机号</th>
              <th>金额</th>
              <th>总次数</th>
              <th>已用</th>
              <th>剩余</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {giftCards.map((item) => (
              <tr key={item.id}>
                <td>{item.cardNo}</td>
                <td>{item.planType === "BUY6GET1" ? "买6送1" : "买10送1"}</td>
                <td>{item.customerName || "-"}</td>
                <td>{item.phone}</td>
                <td>${Number(item.salePrice).toFixed(2)}</td>
                <td>{item.totalSessions}</td>
                <td>{item.usedSessions}</td>
                <td>{item.remainingSessions}</td>
                <td>{item.status}</td>
                <td>{item.createdAt}</td>
                <td>
                  <button onClick={() => handleVoid(item.id)} style={{ marginRight: 8 }}>
                    作废
                  </button>
                  <button onClick={() => handleDelete(item.id)}>删除</button>
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
