"use client";
import { useEffect, useMemo, useState } from "react";

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

function formatDisplayName(name) {
  const normalized = normalizeName(name);
  if (!normalized) return "";
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseTherapists(text) {
  return (text || "")
    .split(/[,，/&+、]+/)
    .map((item) => normalizeName(item))
    .filter(Boolean);
}

function formatBookingTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function isSameOrAfterToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return target.getTime() >= today.getTime();
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sunday, 1 Monday
  const diff = day === 0 ? -6 : 1 - day; // make Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekLabels() {
  return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
}

export default function BookingPage() {
  const [form, setForm] = useState({
    time: "",
    duration: "30",
    partySize: "1",
    therapists: "",
    source: "phone",
    isMember: false,
    note: "",
  });

  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    // 自动清掉今天之前的预约
    const cleanedBookings = savedBookings.filter((item) =>
      isSameOrAfterToday(item.time)
    );

    if (cleanedBookings.length !== savedBookings.length) {
      localStorage.setItem("bookings", JSON.stringify(cleanedBookings));
    }

    setBookings(cleanedBookings);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function resetForm() {
    setForm({
      time: "",
      duration: "30",
      partySize: "1",
      therapists: "",
      source: "phone",
      isMember: false,
      note: "",
    });
    setEditingId(null);
  }

  function handleSubmit() {
    if (!form.time) {
      alert("请选择时间");
      return;
    }

    if (!form.therapists.trim()) {
      alert("请输入技师姓名");
      return;
    }

    const therapistList = parseTherapists(form.therapists);

    if (therapistList.length === 0) {
      alert("请输入有效的技师姓名");
      return;
    }

    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    const startTime = new Date(form.time).getTime();
    const duration = parseInt(form.duration, 10);
    const endTime = startTime + duration * 60 * 1000;

    for (let item of savedBookings) {
      if (editingId && item.id === editingId) continue;
      if (item.status === "cancelled") continue;

      const existingTherapists = parseTherapists(item.therapists);

      const hasSameTherapist = therapistList.some((currentName) =>
        existingTherapists.includes(currentName)
      );

      if (!hasSameTherapist) continue;

      const existingStart = new Date(item.time).getTime();
      const existingEnd =
        existingStart + parseInt(item.duration, 10) * 60 * 1000;

      const isOverlap = startTime < existingEnd && endTime > existingStart;

      if (isOverlap) {
        alert("❌ 该技师在这个时间段已经有预约，不能重复");
        return;
      }
    }

    const existingBooking = savedBookings.find((item) => item.id === editingId);

    const bookingData = {
      id: editingId || Date.now(),
      time: form.time,
      duration: form.duration,
      partySize: form.partySize,
      therapists: form.therapists,
      source: form.source,
      isMember: form.isMember,
      note: form.note,
      status: editingId
        ? existingBooking?.status || "booked"
        : "booked",
      createdAt: editingId
        ? existingBooking?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    let updatedBookings = [];

    if (editingId) {
      updatedBookings = savedBookings.map((item) =>
        item.id === editingId ? bookingData : item
      );
      alert("预约已更新 ✅");
    } else {
      updatedBookings = [...savedBookings, bookingData];
      alert("预约已保存 ✅");
    }

    // 再次清理今天之前的数据
    const finalBookings = updatedBookings.filter((item) =>
      isSameOrAfterToday(item.time)
    );

    localStorage.setItem("bookings", JSON.stringify(finalBookings));
    setBookings(finalBookings);
    resetForm();
  }

  function handleDelete(id) {
    const updatedBookings = bookings.filter((item) => item.id !== id);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setBookings(updatedBookings);

    if (editingId === id) {
      resetForm();
    }
  }

  function handleEdit(id) {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return;

    setForm({
      time: booking.time || "",
      duration: booking.duration || "30",
      partySize: booking.partySize || "1",
      therapists: booking.therapists || "",
      source: booking.source || "phone",
      isMember: Boolean(booking.isMember),
      note: booking.note || "",
    });

    setEditingId(id);
  }

  function handleStatusChange(id, newStatus) {
    const updatedBookings = bookings.map((item) =>
      item.id === id
        ? {
            ...item,
            status: newStatus,
          }
        : item
    );
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
  }

  const visibleBookings = useMemo(() => {
    return bookings
      .filter((item) => isSameOrAfterToday(item.time))
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [bookings]);

  const weeklyStats = useMemo(() => {
    const labels = getWeekLabels();
    const counts = [0, 0, 0, 0, 0, 0, 0];

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    visibleBookings.forEach((item) => {
      if (item.status === "cancelled") return;

      const date = new Date(item.time);
      if (Number.isNaN(date.getTime())) return;

      if (date >= weekStart && date < weekEnd) {
        const day = date.getDay(); // 0 Sunday
        const index = day === 0 ? 6 : day - 1; // Monday=0
        counts[index] += 1;
      }
    });

    return labels.map((label, index) => ({
      label,
      count: counts[index],
    }));
  }, [visibleBookings]);

  const monthlyStats = useMemo(() => {
    const counts = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    visibleBookings.forEach((item) => {
      if (item.status === "cancelled") return;

      const date = new Date(item.time);
      if (Number.isNaN(date.getTime())) return;

      if (date.getFullYear() === currentYear) {
        counts[date.getMonth()] += 1;
      }
    });

    return counts.map((count, index) => ({
      label: `${index + 1}月`,
      count,
    }));
  }, [visibleBookings]);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>预约系统</h1>

      <div style={{ marginBottom: 12 }}>
        <label>预约时间：</label>
        <input
          type="datetime-local"
          name="time"
          value={form.time}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>时长：</label>
        <select
          name="duration"
          value={form.duration}
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
        <label>客人人数：</label>
        <select
          name="partySize"
          value={form.partySize}
          onChange={handleChange}
        >
          <option value="1">1人</option>
          <option value="2">2人</option>
          <option value="3">3人</option>
          <option value="4">4人</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>技师：</label>
        <input
          type="text"
          name="therapists"
          value={form.therapists}
          onChange={handleChange}
          placeholder="例如：Amy 或 Amy, Lily"
          style={{ width: 300 }}
        />
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          多位技师请用逗号分开，例如：Amy, Lily
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>预约方式：</label>
        <select
          name="source"
          value={form.source}
          onChange={handleChange}
        >
          <option value="website">网络</option>
          <option value="phone">电话</option>
          <option value="walkin">Walk-in</option>
        </select>
      </div>

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

      <div style={{ marginBottom: 12 }}>
        <label>备注：</label>
        <input
          type="text"
          name="note"
          value={form.note}
          onChange={handleChange}
          style={{ width: 300 }}
        />
      </div>

      <button onClick={handleSubmit} style={{ marginRight: 10 }}>
        {editingId ? "更新预约" : "保存预约"}
      </button>

      {editingId && <button onClick={resetForm}>取消编辑</button>}

      <hr style={{ margin: "30px 0" }} />

      <h2>已保存预约（仅显示今日及以后）</h2>

      {visibleBookings.length === 0 ? (
        <p>暂无预约</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>时间</th>
              <th>时长</th>
              <th>人数</th>
              <th>技师</th>
              <th>预约方式</th>
              <th>会员</th>
              <th>状态</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {visibleBookings.map((item) => (
              <tr key={item.id}>
                <td>{formatBookingTime(item.time)}</td>
                <td>{item.duration}分钟</td>
                <td>{item.partySize}人</td>
                <td>
                  {parseTherapists(item.therapists)
                    .map((name) => formatDisplayName(name))
                    .join(", ")}
                </td>
                <td>
                  {item.source === "website"
                    ? "网络"
                    : item.source === "phone"
                    ? "电话"
                    : "Walk-in"}
                </td>
                <td>{item.isMember ? "是" : "否"}</td>
                <td>
                  {item.status === "booked"
                    ? "已预约"
                    : item.status === "completed"
                    ? "已完成"
                    : "已取消"}
                </td>
                <td>{item.note || "-"}</td>
                <td>
                  <button
                    onClick={() => handleEdit(item.id)}
                    style={{ marginRight: 6 }}
                  >
                    编辑
                  </button>

                  <button
                    onClick={() => handleStatusChange(item.id, "booked")}
                    style={{ marginRight: 6 }}
                  >
                    已预约
                  </button>

                  <button
                    onClick={() => handleStatusChange(item.id, "completed")}
                    style={{ marginRight: 6 }}
                  >
                    已完成
                  </button>

                  <button
                    onClick={() => handleStatusChange(item.id, "cancelled")}
                    style={{ marginRight: 6 }}
                  >
                    取消
                  </button>

                  <button onClick={() => handleDelete(item.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr style={{ margin: "30px 0" }} />

      <h2>本周预约统计（周一到周日）</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {weeklyStats.map((item) => (
              <th key={item.label}>{item.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {weeklyStats.map((item) => (
              <td key={item.label}>{item.count}</td>
            ))}
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: "30px 0" }} />

      <h2>本年每月预约统计</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {monthlyStats.map((item) => (
              <th key={item.label}>{item.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {monthlyStats.map((item) => (
              <td key={item.label}>{item.count}</td>
            ))}
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <a href="/">返回首页</a>
      </div>
    </div>
  );
}
