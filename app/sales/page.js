"use client";
import { useEffect, useMemo, useState } from "react";

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

function formatDisplayName(name) {
  const normalized = normalizeName(name);
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function SalesPage() {
  const [form, setForm] = useState({
    service: "60",
    hotStone: false,
    essentialOil: false,
    price: "",
    therapist: "",
    paymentMethod: "POS",
    giftCardNo: "",
    isMember: false,
    memberPhone: "",
    note: "",
  });

  const [sales, setSales] = useState([]);

  useEffect(() => {
    const savedSales = JSON.parse(localStorage.getItem("sales") || "[]");
    setSales(savedSales);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit() {
    if (!form.therapist.trim()) {
      alert("请输入技师姓名");
      return;
    }

    if (form.paymentMethod !== "Gift Card" && !form.price) {
      alert("请输入金额");
      return;
    }

    if (form.isMember && !form.memberPhone.trim()) {
      alert("会员单请输入会员手机号");
      return;
    }

    const savedSales = JSON.parse(localStorage.getItem("sales") || "[]");
    let savedMembers = JSON.parse(localStorage.getItem("members") || "[]");
    let savedGiftCards = JSON.parse(localStorage.getItem("giftcards") || "[]");

    let memberId = "";
    let memberName = "";
    let memberPhone = "";

    if (form.isMember) {
      const memberIndex = savedMembers.findIndex(
        (item) => (item.phone || "").trim() === form.memberPhone.trim()
      );

      if (memberIndex === -1) {
        alert("未找到该会员手机号，请先去会员系统创建会员");
        return;
      }

      const member = savedMembers[memberIndex];

      memberId = member.id;
      memberName = member.name || "";
      memberPhone = member.phone || "";

      savedMembers[memberIndex] = {
        ...member,
        visitCount: Number(member.visitCount || 0) + 1,
      };

      localStorage.setItem("members", JSON.stringify(savedMembers));
    }

    let finalPrice =
      form.paymentMethod === "Gift Card" ? 0 : parseFloat(form.price);
    let giftCardNo = "";

    if (form.paymentMethod === "Gift Card") {
      if (!form.giftCardNo.trim()) {
        alert("礼品卡支付时请输入礼品卡号");
        return;
      }

      const giftCardIndex = savedGiftCards.findIndex(
        (item) =>
          (item.cardNo || "").trim().toLowerCase() ===
          form.giftCardNo.trim().toLowerCase()
      );

      if (giftCardIndex === -1) {
        alert("未找到该礼品卡");
        return;
      }

      const card = savedGiftCards[giftCardIndex];

      if (card.status === "void") {
        alert("该礼品卡已作废，不能使用");
        return;
      }

      if (card.status === "used_up" || Number(card.remainingSessions || 0) <= 0) {
        alert("该礼品卡次数不足，不能使用");
        return;
      }

      const updatedCard = {
        ...card,
        usedSessions: Number(card.usedSessions || 0) + 1,
        remainingSessions: Number(card.remainingSessions || 0) - 1,
        status:
          Number(card.remainingSessions || 0) - 1 <= 0 ? "used_up" : "active",
        usageHistory: [
          ...(card.usageHistory || []),
          {
            time: new Date().toLocaleString(),
            therapist: form.therapist,
            note: form.note || "销售页面自动核销",
            source: "sales",
          },
        ],
      };

      savedGiftCards[giftCardIndex] = updatedCard;
      localStorage.setItem("giftcards", JSON.stringify(savedGiftCards));

      giftCardNo = updatedCard.cardNo;
      finalPrice = 0;
    }

    const newSale = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      service: form.service,
      hotStone: form.hotStone,
      essentialOil: form.essentialOil,
      price: finalPrice,
      therapist: normalizeName(form.therapist),
      paymentMethod: form.paymentMethod,
      giftCardNo,
      isMember: form.isMember,
      memberId,
      memberName,
      memberPhone,
      note: form.note,
      timeText: new Date().toLocaleString(),
    };

    const updatedSales = [...savedSales, newSale];

    localStorage.setItem("sales", JSON.stringify(updatedSales));
    setSales(updatedSales);

    alert("销售已保存 ✅");

    setForm({
      service: "60",
      hotStone: false,
      essentialOil: false,
      price: "",
      therapist: "",
      paymentMethod: "POS",
      giftCardNo: "",
      isMember: false,
      memberPhone: "",
      note: "",
    });
  }

  function handleDelete(id) {
    const updatedSales = sales.filter((item) => item.id !== id);
    localStorage.setItem("sales", JSON.stringify(updatedSales));
    setSales(updatedSales);
  }

  const totalAmount = useMemo(() => {
    return sales.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [sales]);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>销售录入</h1>

      <div style={{ marginBottom: 12 }}>
        <label>项目时长：</label>
        <select name="service" value={form.service} onChange={handleChange}>
          <option value="30">30分钟</option>
          <option value="45">45分钟</option>
          <option value="60">60分钟</option>
          <option value="90">90分钟</option>
          <option value="120">120分钟</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          <input
            type="checkbox"
            name="hotStone"
            checked={form.hotStone}
            onChange={handleChange}
          />
          热石
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          <input
            type="checkbox"
            name="essentialOil"
            checked={form.essentialOil}
            onChange={handleChange}
          />
          精油
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>金额：</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          disabled={form.paymentMethod === "Gift Card"}
        />
        {form.paymentMethod === "Gift Card" && (
          <span style={{ marginLeft: 10 }}>礼品卡支付自动为 0</span>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>技师：</label>
        <input
          type="text"
          name="therapist"
          value={form.therapist}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>支付方式：</label>
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
        >
          <option value="POS">POS</option>
          <option value="Cash">现金</option>
          <option value="Gift Card">礼品卡</option>
        </select>
      </div>

      {form.paymentMethod === "Gift Card" && (
        <div style={{ marginBottom: 12 }}>
          <label>礼品卡号：</label>
          <input
            type="text"
            name="giftCardNo"
            value={form.giftCardNo}
            onChange={handleChange}
          />
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label>
          <input
            type="checkbox"
            name="isMember"
            checked={form.isMember}
            onChange={handleChange}
          />
          是否会员
        </label>
      </div>

      {form.isMember && (
        <div style={{ marginBottom: 12 }}>
          <label>会员手机号：</label>
          <input
            type="text"
            name="memberPhone"
            value={form.memberPhone}
            onChange={handleChange}
          />
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label>备注：</label>
        <input
          type="text"
          name="note"
          value={form.note}
          onChange={handleChange}
        />
      </div>

      <button onClick={handleSubmit}>保存销售</button>

      <hr style={{ margin: "30px 0" }} />

      <h2>销售列表</h2>
      <h3>总收入：${totalAmount.toFixed(2)}</h3>

      {sales.length === 0 ? (
        <p>暂无销售记录</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>时间</th>
              <th>项目</th>
              <th>热石</th>
              <th>精油</th>
              <th>金额</th>
              <th>技师</th>
              <th>支付方式</th>
              <th>礼品卡号</th>
              <th>会员</th>
              <th>会员手机号</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((item) => (
              <tr key={item.id}>
                <td>{item.timeText}</td>
                <td>{item.service}分钟</td>
                <td>{item.hotStone ? "是" : "否"}</td>
                <td>{item.essentialOil ? "是" : "否"}</td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>{formatDisplayName(item.therapist) || "-"}</td>
                <td>{item.paymentMethod || "-"}</td>
                <td>{item.giftCardNo || "-"}</td>
                <td>{item.isMember ? "是" : "否"}</td>
                <td>{item.memberPhone || "-"}</td>
                <td>{item.note || "-"}</td>
                <td>
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
