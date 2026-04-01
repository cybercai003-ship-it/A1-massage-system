"use client";
import { useState } from "react";

export default function BookingPage() {
  const [form, setForm] = useState({
    time: "",
    duration: "60",
    room: "single",
    therapist: "",
    note: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    alert("预约已保存");
    console.log(form);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>预约系统</h1>

      <div>
        时间：
        <input type="datetime-local" name="time" onChange={handleChange} />
      </div>

      <div>
        时长：
        <select name="duration" onChange={handleChange}>
          <option value="30">30分钟</option>
          <option value="45">45分钟</option>
          <option value="60">60分钟</option>
          <option value="90">90分钟</option>
          <option value="120">120分钟</option>
        </select>
      </div>

      <div>
        房间：
        <select name="room" onChange={handleChange}>
          <option value="single">单人房</option>
          <option value="couple">夫妻房</option>
        </select>
      </div>

      <div>
        技师：
        <input name="therapist" onChange={handleChange} />
      </div>

      <div>
        备注：
        <input name="note" onChange={handleChange} />
      </div>

      <br />

      <button onClick={handleSubmit}>保存预约</button>
    </div>
  );
}
