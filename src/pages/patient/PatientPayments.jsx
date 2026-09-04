import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Modal, Button, Badge, SegmentedControl } from '../../components/ui.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import './PatientPayments.css';

export default function PatientPayments() {
  const { user } = useAuth();
  const payments = useCollection('PAYMENTS');
  const [payingId, setPayingId] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [tab, setTab] = useState('due');

  const mine = payments.filter((p) => p.patientId === user.patientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const due = mine.filter((p) => p.status === 'Due');
  const paid = mine.filter((p) => p.status === 'Paid');
  const totalDue = due.reduce((s, p) => s + p.amount, 0);

  const payingItem = mine.find((p) => p.id === payingId);
  const receiptItem = mine.find((p) => p.id === receiptId);

  function confirmPayment() {
    db.update('PAYMENTS', payingId, { status: 'Paid', method: 'UPI', date: '2026-09-04' });
    setPayingId(null);
  }

  return (
    <div className="pp">
      <div className="pp-summary">
        <div className="pp-summary__label">Total Outstanding</div>
        <div className="pp-summary__value">{formatCurrency(totalDue)}</div>
        {due.length > 0 && <div className="pp-summary__sub">{due.length} bill{due.length > 1 ? 's' : ''} pending</div>}
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[{ value: 'due', label: `Due (${due.length})` }, { value: 'history', label: 'History' }]}
      />

      <div className="pp-list">
        {tab === 'due' && (
          due.length === 0
            ? <div className="pp-empty">You're all caught up — no pending bills. 🎉</div>
            : due.map((p) => (
              <div className="pp-card" key={p.id}>
                <div className="pp-card__body">
                  <div className="pp-card__title">{p.description}</div>
                  <div className="pp-card__meta">{p.category} &middot; Due {formatDate(p.date)}</div>
                </div>
                <div className="pp-card__right">
                  <div className="pp-card__amount">{formatCurrency(p.amount)}</div>
                  <button className="pp-pay-btn" onClick={() => setPayingId(p.id)}>Pay Now</button>
                </div>
              </div>
            ))
        )}
        {tab === 'history' && (
          paid.length === 0
            ? <div className="pp-empty">No payment history yet.</div>
            : paid.map((p) => (
              <div className="pp-card pp-card--history" key={p.id} onClick={() => setReceiptId(p.id)}>
                <div className="pp-card__body">
                  <div className="pp-card__title">{p.description}</div>
                  <div className="pp-card__meta">{p.category} &middot; {formatDate(p.date)} &middot; {p.method}</div>
                </div>
                <div className="pp-card__right">
                  <div className="pp-card__amount">{formatCurrency(p.amount)}</div>
                  <Badge tone="success">Paid</Badge>
                </div>
              </div>
            ))
        )}
      </div>

      <Modal open={!!payingItem} onClose={() => setPayingId(null)} title="Confirm Payment" width={380}>
        {payingItem && (
          <div className="pp-pay-modal">
            <div className="pp-pay-modal__amount">{formatCurrency(payingItem.amount)}</div>
            <div className="pp-pay-modal__desc">{payingItem.description}</div>
            <div className="pp-method-list">
              <div className="pp-method is-selected">📱 UPI — GPay, PhonePe, Paytm</div>
              <div className="pp-method">💳 Credit / Debit Card</div>
              <div className="pp-method">🏦 Net Banking</div>
            </div>
            <Button onClick={confirmPayment} className="pp-pay-modal__btn">Pay {formatCurrency(payingItem.amount)}</Button>
          </div>
        )}
      </Modal>

      <Modal open={!!receiptItem} onClose={() => setReceiptId(null)} title="Receipt" width={380}>
        {receiptItem && (
          <div className="pp-receipt">
            <div className="pp-receipt__check">✅</div>
            <div className="pp-receipt__amount">{formatCurrency(receiptItem.amount)}</div>
            <div className="pp-receipt__desc">{receiptItem.description}</div>
            <div className="ap-detail-grid" style={{ marginTop: 18, textAlign: 'left' }}>
              <div className="ap-detail-item"><div className="k">Category</div><div className="v">{receiptItem.category}</div></div>
              <div className="ap-detail-item"><div className="k">Paid Via</div><div className="v">{receiptItem.method}</div></div>
              <div className="ap-detail-item"><div className="k">Date</div><div className="v">{formatDate(receiptItem.date)}</div></div>
              <div className="ap-detail-item"><div className="k">Receipt No.</div><div className="v">{receiptItem.id.toUpperCase()}</div></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
