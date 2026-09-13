'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false });

    if (error) {
      setErrorMsg('โหลดประวัติการขายไม่สำเร็จ: ' + error.message);
    } else {
      setSales(data || []);
      setErrorMsg('');
    }
    setLoading(false);
  }

  // รวมยอดขายทั้งหมดจาก total_price ทุกแถว
  const grandTotal = sales.reduce(
    (sum, s) => sum + (parseFloat(s.total_price) || 0),
    0
  );

  // แปลงวันเวลาให้อ่านง่าย (locale ไทย)
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  return (
    <div>
      <h1>ประวัติการขาย</h1>

      {errorMsg && <p className="error-text">{errorMsg}</p>}

      {/* สรุปยอดขายรวมทั้งหมด */}
      <div className="card">
        <strong>ยอดขายรวมทั้งหมด: {grandTotal.toFixed(2)} บาท</strong>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>วันเวลาที่ขาย</th>
              <th>ชื่อสินค้า</th>
              <th>จำนวน</th>
              <th>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan={4}>ยังไม่มีรายการขาย</td>
              </tr>
            )}
            {sales.map((s) => (
              <tr key={s.id}>
                <td>{formatDateTime(s.sold_at)}</td>
                <td>{s.product_name}</td>
                <td>{s.quantity}</td>
                <td>{parseFloat(s.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
