'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProductsPage() {
  // รายการสินค้าทั้งหมด
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // ฟอร์มเพิ่มสินค้าใหม่
  const [form, setForm] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: '',
  });

  // แถวที่กำลังแก้ไขอยู่ (เก็บ id ของสินค้า) และค่าที่แก้ไขชั่วคราว
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // โหลดข้อมูลสินค้าตอนเปิดหน้า
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('โหลดข้อมูลสินค้าไม่สำเร็จ: ' + error.message);
    } else {
      setProducts(data || []);
      setErrorMsg('');
    }
    setLoading(false);
  }

  // เพิ่มสินค้าใหม่
  async function handleAddProduct(e) {
    e.preventDefault();

    if (!form.sku || !form.name || !form.price || !form.stock || !form.unit) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        sku: form.sku,
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        unit: form.unit,
      },
    ]);

    if (error) {
      setErrorMsg('เพิ่มสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }

    setForm({ sku: '', name: '', price: '', stock: '', unit: '' });
    setErrorMsg('');
    fetchProducts();
  }

  // ลบสินค้า
  async function handleDelete(id) {
    const confirmed = window.confirm('ต้องการลบสินค้านี้ใช่หรือไม่?');
    if (!confirmed) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setErrorMsg('ลบสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }
    fetchProducts();
  }

  // เริ่มแก้ไขแถว (inline edit)
  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  // บันทึกการแก้ไข
  async function handleSaveEdit(id) {
    const { error } = await supabase
      .from('products')
      .update({
        sku: editForm.sku,
        name: editForm.name,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock, 10),
        unit: editForm.unit,
      })
      .eq('id', id);

    if (error) {
      setErrorMsg('แก้ไขสินค้าไม่สำเร็จ: ' + error.message);
      return;
    }

    setEditingId(null);
    setEditForm({});
    fetchProducts();
  }

  return (
    <div>
      <h1>รายการสินค้า</h1>

      {errorMsg && <p className="error-text">{errorMsg}</p>}

      {/* ฟอร์มเพิ่มสินค้าใหม่ */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>เพิ่มสินค้าใหม่</h2>
        <form onSubmit={handleAddProduct}>
          <div className="form-row">
            <input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <input
              placeholder="ชื่อสินค้า"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="ราคา"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="คงเหลือ"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <input
              placeholder="หน่วย"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
            <button type="submit">เพิ่มสินค้า</button>
          </div>
        </form>
      </div>

      {/* ตารางแสดงรายการสินค้า */}
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>ชื่อสินค้า</th>
              <th>ราคา</th>
              <th>คงเหลือ</th>
              <th>หน่วย</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6}>ยังไม่มีสินค้า</td>
              </tr>
            )}
            {products.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <tr key={p.id}>
                  {isEditing ? (
                    <>
                      <td>
                        <input
                          value={editForm.sku}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sku: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({ ...editForm, price: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) =>
                            setEditForm({ ...editForm, stock: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.unit}
                          onChange={(e) =>
                            setEditForm({ ...editForm, unit: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <button onClick={() => handleSaveEdit(p.id)}>บันทึก</button>{' '}
                        <button onClick={cancelEdit}>ยกเลิก</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{p.price}</td>
                      <td>{p.stock}</td>
                      <td>{p.unit}</td>
                      <td>
                        <button onClick={() => startEdit(p)}>แก้ไข</button>{' '}
                        <button onClick={() => handleDelete(p.id)}>ลบ</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
