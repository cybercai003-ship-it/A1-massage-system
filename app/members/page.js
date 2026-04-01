"use client";
import { useEffect, useState } from "react";

function generateMemberId() {
  const timestamp = Date.now().toString().slice(-6);
  return "M" + timestamp;
}

export default function MembersPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    note: "",
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("members") || "[]");
    setMembers(saved);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    if (!form.phone) {
      alert("请输入手机号");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("members") || "[]");

    const newMember = {
      id: generateMemberId(),
      name: form.name,
      phone: form.phone,
      note: form.note,
      createdAt: new Date().toLocaleString(),
    };

    const updated = [...saved, newMember];

    localStorage.setItem("members", JSON.stringify(updated));
    setMembers(updated);

    alert("会员已创建 ✅");

    setForm({
      name: "",
      phone: "",
      note: "",
    });
  }

  function handleDelete(id) {
    const updated = members.filter((item) => item.id !== id);
    localStorage.setItem("members", JSON.stringify(updated));
    setMembers(updated);
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>会员系统</h1>

      <div style={{ marginBottom: 12 }}>
        <label>姓名（可不填）：</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>手机号：</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>备注：</label>
        <input
          name="note"
          value={form.note}
          onChange={handleChange}
        />
      </div>

      <button onClick={handleSubmit}>创建会员</button>

      <hr style={{ margin: "30px 0" }} />

      <h2>会员列表</h2>

      {members.length === 0 ? (
        <p>暂无会员</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>会员编号</th>
              <th>姓名</th>
              <th>手机号</th>
              <th>备注</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name || "-"}</td>
                <td>{item.phone}</td>
                <td>{item.note || "-"}</td>
                <td>{item.createdAt}</td>
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
