"use client";
import { useEffect, useState } from "react";

export default function BookingPage() {
  const [form, setForm] = useState({
    time: "",
    duration: "30",
    room: "single",
    therapist: "",
    note: "",
  });

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(savedBookings);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    if (!form.time) {
      alert("请选择时间");
      return;
    }

    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    const newBooking = {
      id: Date.now(),
      time: form.time,
      duration: form.duration,
      room: form.room,
      therapist: form.therapist,
      note: form.note,
    };

    const updatedBookings = [...savedBookings, newBooking];

    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setBookings(updatedBookings);

    alert("预约已保存 ✅");

    setForm({
      time: "",
      duration: "30",
      room: "single",
      therapist: "",
      note: "",
    });
  }

  function handleDelete(id) {
    const updatedBookings = bookings.filter((item) => item.id !== id);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>预约系统</h1>

      <div style={{ marginBottom: 12 }}>
        <label>时间：</label>
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
        <label>房间：</label>
        <select name="room" value={form.room} onChange={handleChange}>
          <option value="single">单人房</option>
          <option value="couple">夫妻房</option>
        </select>
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

      <button onClick={handleSubmit}>保存预约</button>

      <hr style={{ margin: "30px 0" }} />

      <h2>已保存预约</h2>

      {bookings.length === 0 ? (
        <p>暂无预约</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>时间</th>
              <th>时长</th>
              <th>房间</th>
              <th>技师</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item) => (
              <tr key={item.id}>
                <td>{item.time}</td>
                <td>{item.duration}分钟</td>
                <td>{item.room === "single" ? "单人房" : "夫妻房"}</td>
                <td>{item.therapist || "-"}</td>
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
