"use client";
import { useEffect, useState } from "react";

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
    const saved = JSON.parse(localStorage.getItem("sales") || "[]");
    setSales(saved);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSubmit() {
    if (!form.therapist) {
      alert("请输入技师");
      return;
    }

    if (form.paymentMethod !== "Gift Card" && !form.price) {
      alert("请输入金额");
      return;
    }

    if (form.paymentMethod === "Gift Card" && !form.giftCardNo) {
      alert("请输入礼品卡号");
      return;
    }

    const newSale = {
      ...form,
      id: Date.now(),
      time: new Date().toLocaleString(),
      price: form.paymentMethod === "Gift Card" ? 0 : Number(form.price),
    };

    const updated = [...sales, newSale];
    localStorage.setItem("sales", JSON.stringify(updated));
    setSales(updated);

    alert("已保存");

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
    const updated = sales.filter((s) => s.id !== id);
    localStorage.setItem("sales", JSON.stringify(updated));
    setSales(updated);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>销售录入</h1>

      <div>
        <label>项目：</label>
        <select name="service" value={form.service} onChange={handleChange}>
          <option value="30">30分钟</option>
          <option value="60">60分钟</option>
          <option value="90">90分钟</option>
        </select>
      </div>

      <div>
        <label>
          <input type="checkbox" name="hotStone" checked={form.hotStone} onChange={handleChange}/>
          热石
        </label>
      </div>

      <div>
        <label>
          <input type="checkbox" name="essentialOil" checked={form.essentialOil} onChange={handleChange}/>
          精油
        </label>
      </div>

      <div>
        <label>金额：</label>
        <input name="price" value={form.price} onChange={handleChange} />
      </div>

      <div>
        <label>技师：</label>
        <input name="therapist" value={form.therapist} onChange={handleChange} />
      </div>

      <div>
        <label>支付方式：</label>
        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
          <option value="POS">POS</option>
          <option value="Cash">现金</option>
          <option value="Gift Card">礼品卡</option>
        </select>
      </div>

      {form.paymentMethod === "Gift Card" && (
        <div>
          <label>礼品卡号：</label>
          <input name="giftCardNo" value={form.giftCardNo} onChange={handleChange}/>
        </div>
      )}

      <div>
        <label>
          <input type="checkbox" name="isMember" checked={form.isMember} onChange={handleChange}/>
          会员
        </label>
      </div>

      {form.isMember && (
        <div>
          <label>手机号：</label>
          <input name="memberPhone" value={form.memberPhone} onChange={handleChange}/>
        </div>
      )}

      <div>
        <label>备注：</label>
        <input name="note" value={form.note} onChange={handleChange}/>
      </div>

      <button onClick={handleSubmit}>保存</button>

      <hr />

      <h2>销售列表</h2>

      {sales.map((s) => (
        <div key={s.id}>
          {s.time} - {s.therapist} - ${s.price} - {s.paymentMethod}
          <button onClick={() => handleDelete(s.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
