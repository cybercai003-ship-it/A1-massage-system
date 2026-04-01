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
    if (!form.price) {
      alert("请输入金额");
      return;
    }

    if (!form.therapist.trim()) {
      alert("请输入技师姓名");
      return;
    }

    const savedSales = JSON.parse(localStorage.getItem("sales") || "[]");

    const newSale = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      service: form.service,
      hotStone: form.hotStone,
      essentialOil: form.essentialOil,
      price: parseFloat(form.price),
      therapist: normalizeName(form.therapist),
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
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
        >
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
        />
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
