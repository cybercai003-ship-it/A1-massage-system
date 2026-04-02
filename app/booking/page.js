"use client";
import { useEffect, useMemo, useState } from "react";

function normalizeCode(text) {
  return (text || "").trim().toUpperCase();
}

function collectEmployeeCodes(item) {
  return [
    normalizeCode(item.employee1),
    normalizeCode(item.employee2),
    normalizeCode(item.employee3),
    normalizeCode(item.employee4),
  ].filter(Boolean);
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
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function BookingPage() {
  const [form, setForm] = useState({
    time: "",
    duration: "30",
    partySize: "1",
    employee1: "",
    employee2: "",
    employee3: "",
    employee4: "",
    source: "phone",
    isMember: false,
    customerName: "",
    customerPhone: "",
    note: "",
  });

  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

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
      [name]:
        type === "checkbox"
          ? checked
          : name.startsWith("employee")
          ? normalizeCode(value)
          : value,
    });
  }

  function resetForm() {
    setForm({
      time: "",
      duration: "30",
      partySize: "1",
      employee1: "",
      employee2: "",
      employee3: "",
      employee4: "",
      source: "phone",
      isMember: false,
      customerName: "",
      customerPhone: "",
      note: "",
    });
    setEditingId(null);
  }

  function handleSubmit() {
    if (!form.time) {
      alert("请选择时间");
      return;
    }

    const currentEmployeeCodes = collectEmployeeCodes(form);

    if (currentEmployeeCodes.length === 0) {
      alert("请至少输入1个员工编号");
      return;
    }

    const uniqueCodes = new Set(currentEmployeeCodes);
    if (uniqueCodes.size !== currentEmployeeCodes.length) {
      alert("员工编号不能重复");
      return;
    }

    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    const startTime = new Date(form.time).getTime();
    const duration = parseInt(form.duration, 10);
    const endTime = startTime + duration * 60 * 1000;

    for (let item of savedBookings) {
      if (editingId && item.id === editingId) continue;
      if (item.status === "cancelled") continue;

      const existingEmployeeCodes = collectEmployeeCodes(item);

      const hasSameEmployee = currentEmployeeCodes.some((currentCode) =>
        existingEmployeeCodes.includes(currentCode)
      );

      if (!hasSameEmployee) continue;

      const existingStart = new Date(item.time).getTime();
      const existingEnd =
        existingStart + parseInt(item.duration, 10) * 60 * 1000;

      const isOverlap = startTime < existingEnd && endTime > existingStart;

      if (isOverlap) {
        alert("❌ 该员工编号在这个时间段已经有预约，不能重复");
        return;
      }
    }

    const existingBooking = savedBookings.find((item) => item.id === editingId);

    const bookingData = {
      id: editingId || Date.now(),
      time: form.time,
      duration: form.duration,
      partySize: form.partySize,
      employee1: normalizeCode(form.employee1),
      employee2: normalizeCode(form.employee2),
      employee3: normalizeCode(form.employee3),
      employee4: normalizeCode(form.employee4),
      source: form.source,
      isMember: form.isMember,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
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
      employee1: booking.employee1 || "",
      employee2: booking.employee2 || "",
      employee3: booking.employee3 || "",
      employee4: booking.employee4 || "",
      source: booking.source || "phone",
      isMember: Boolean(booking.isMember),
      customerName: booking.customerName || "",
      customerPhone: booking.customerPhone || "",
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

  const employeeStats = useMemo(() => {
    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const statsMap = {};

    visibleBookings.forEach((item) => {
      if (item.status === "cancelled") return;

      const bookingDate = new Date(item.time);
      if (Number.isNaN(bookingDate.getTime())) return;

      const codes = collectEmployeeCodes(item);

      codes.forEach((code) => {
        if (!statsMap[code]) {
          statsMap[code] = {
            employeeCode: code,
            dayCount: 0,
            weekCount: 0,
            monthCount: 0,
          };
        }

        if (isSameDay(bookingDate, today)) {
          statsMap[code].dayCount += 1;
        }

        if (bookingDate >= weekStart && bookingDate < weekEnd) {
          statsMap[code].weekCount += 1;
        }

        if (
          bookingDate.getFullYear() === currentYear &&
          bookingDate.getMonth() === currentMonth
        ) {
          statsMap[code].monthCount += 1;
        }
      });
    });

    return Object.values(statsMap).sort((a, b) =>
      a.employeeCode.localeCompare(b.employeeCode)
    );
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
        <label>员工编号1：</label>
        <input
          type="text"
          name="employee1"
          value={form.employee1}
          onChange={handleChange}
          placeholder="例如 A01"
          style={{ width: 200 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>员工编号2：</label>
        <input
          type="text"
          name="employee2"
          value={form.employee2}
          onChange={handleChange}
          placeholder="例如 A03"
          style={{ width: 200 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>员工编号3：</label>
        <input
          type="text"
          name="employee3"
          value={form.employee3}
          onChange={handleChange}
          placeholder="例如 A05"
          style={{ width: 200 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>员工编号4：</label>
        <input
          type="text"
          name="employee4"
          value={form.employee4}
          onChange={handleChange}
          placeholder="例如 A08"
          style={{ width: 200 }}
        />
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
        <label>客户姓名（可不填）：</label>
        <input
          type="text"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          style={{ width: 300 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>客户电话（可不填）：</label>
        <input
          type="text"
          name="customerPhone"
          value={form.customerPhone}
          onChange={handleChange}
          style={{ width: 300 }}
        />
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
              <th>员工编号</th>
              <th>预约方式</th>
              <th>会员</th>
              <th>客户姓名</th>
              <th>客户电话</th>
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
                <td>{collectEmployeeCodes(item).join(", ")}</td>
                <td>
                  {item.source === "website"
                    ? "网络"
                    : item.source === "phone"
                    ? "电话"
                    : "Walk-in"}
                </td>
                <td>{item.isMember ? "是" : "否"}</td>
                <td>{item.customerName || "-"}</td>
                <td>{item.customerPhone || "-"}</td>
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

      <h2>员工预约统计（今日 / 本周 / 本月）</h2>

      {employeeStats.length === 0 ? (
        <p>暂无统计数据</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>员工编号</th>
              <th>今日预约数</th>
              <th>本周预约数</th>
              <th>本月预约数</th>
            </tr>
          </thead>
          <tbody>
            {employeeStats.map((item) => (
              <tr key={item.employeeCode}>
                <td>{item.employeeCode}</td>
                <td>{item.dayCount}</td>
                <td>{item.weekCount}</td>
                <td>{item.monthCount}</td>
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
