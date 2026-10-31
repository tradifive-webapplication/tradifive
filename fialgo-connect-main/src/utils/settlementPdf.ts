import { Settlement } from "@/types/settlement";

export function generateSettlementInvoiceHtml(settlement: Settlement, userProfile?: any): string {
  const isPaid = settlement.status === "paid" || settlement.status === "approved";
  const statusColor = isPaid ? "#10b981" : settlement.status === "overdue" ? "#ef4444" : "#f59e0b";
  const statusText = isPaid ? "PAID & VERIFIED" : settlement.status === "overdue" ? "PAYMENT OVERDUE" : "PAYMENT PENDING";

  const customerName = userProfile?.display_name || userProfile?.full_name || settlement.user_name || "Valued Trader";
  const customerEmail = userProfile?.email || settlement.user_email || "trader@tradifive.in";
  const maskedAccount = settlement.mt5_account_number
    ? `••••${settlement.mt5_account_number.slice(-4)}`
    : "••••9980";

  const curr = settlement.currency === "USC" ? "USC " : "₹";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Settlement Invoice - ${settlement.settlement_number}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: #0f172a;
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      letter-spacing: -0.5px;
    }
    .brand-text h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-text p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #64748b;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-title .meta {
      font-size: 11.5px;
      color: #64748b;
      margin-top: 4px;
      font-family: monospace;
    }
    .status-stamp {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      margin-top: 8px;
      color: ${statusColor};
      background: ${statusColor}15;
      border: 1px solid ${statusColor}40;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 18px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
    }
    .info-col h3 {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .info-col p {
      margin: 2px 0;
      font-size: 13px;
    }
    .info-col .name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 11px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12.5px;
    }
    .text-right { text-align: right; }
    .highlight-row {
      background: #f8fafc;
      font-weight: 700;
    }
    .summary-box {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
    .summary-table {
      width: 320px;
      border-collapse: collapse;
    }
    .summary-table td {
      padding: 8px 12px;
      font-size: 13px;
    }
    .summary-table .total-row {
      border-top: 2px solid #0f172a;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .notice {
      margin-top: 30px;
      padding: 14px 18px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      font-size: 11.5px;
      color: #065f46;
      line-height: 1.6;
    }
    .footer {
      margin-top: 40px;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .seal {
      width: 90px;
      height: 90px;
      border: 2px dashed ${statusColor};
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: ${statusColor};
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      transform: rotate(-10deg);
      line-height: 1.2;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo-badge">TF</div>
      <div class="brand-text">
        <h1>TRADIFIVE TECHNOLOGIES</h1>
        <p>Algorithmic Trading & Performance Settlements Desk</p>
        <p style="font-size: 10px; color: #94a3b8;">GST SAC: 997159 • Financial Platform Services</p>
      </div>
    </div>
    <div class="invoice-title">
      <h2>Settlement Receipt</h2>
      <div class="meta">Invoice #: ${settlement.settlement_number.replace('SETTLE-', 'INV-')}</div>
      <div class="meta">Date: ${new Date(settlement.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
      <div class="status-stamp">${statusText}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-col">
      <h3>Billed To (Client Account)</h3>
      <p class="name">${customerName}</p>
      <p>${customerEmail}</p>
      <p>Terminal Binding: <b>MT5 ${maskedAccount}</b></p>
      <p>Broker Server: ${settlement.broker_server || 'Exness-Real'}</p>
    </div>
    <div class="info-col">
      <h3>Settlement Schedule</h3>
      <p>Cycle: <b>${settlement.week_label}</b></p>
      <p>Period: ${new Date(settlement.period_start).toLocaleDateString()} – ${new Date(settlement.period_end).toLocaleDateString()}</p>
      <p>Payment Due: <b>${new Date(settlement.payment_deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</b></p>
      <p>Payment Ref: ${settlement.payment_reference || 'Pending Online Remittance'}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Calculation Component</th>
        <th>Audit Detail / Rule</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Gross Realised Profit</b></td>
        <td>Sum of closed winning trades in settlement cycle</td>
        <td class="text-right">+${curr}${settlement.gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td><b>Gross Realised Loss</b></td>
        <td>Sum of closed losing trades in settlement cycle</td>
        <td class="text-right" style="color: #ef4444;">-${curr}${settlement.gross_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td><b>Broker Commission & Swap</b></td>
        <td>Trading costs and overnight rollover fees</td>
        <td class="text-right" style="color: #64748b;">-${curr}${(settlement.commissions + settlement.swaps).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="highlight-row">
        <td><b>Net Realised Trading Profit</b></td>
        <td>Gross Profit − Gross Loss − Commissions − Swaps</td>
        <td class="text-right"><b>+${curr}${settlement.net_realised_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
      </tr>
      <tr>
        <td><b>Previous Loss Offset (Carry-Forward)</b></td>
        <td>High-water mark protection: previous unpaid loss balance</td>
        <td class="text-right" style="color: #64748b;">-${curr}${settlement.previous_loss_carried.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="highlight-row" style="background: #ecfdf5;">
        <td><b>Eligible Profit for Sharing</b></td>
        <td>Max(0, Net Realised Profit − Previous Loss Offset)</td>
        <td class="text-right" style="color: #059669;"><b>${curr}${settlement.eligible_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
      </tr>
      <tr>
        <td><b>Customer Profit Share (50%)</b></td>
        <td>Retained 100% in your MT5 trading terminal</td>
        <td class="text-right" style="color: #059669; font-weight: 700;">+${curr}${settlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="highlight-row" style="background: #eff6ff;">
        <td><b>Tradifive Platform Share (50%)</b></td>
        <td>Payable weekly fee under FiAlgo V1 Operating Agreement</td>
        <td class="text-right" style="color: #2563eb; font-weight: 800;">${curr}${settlement.tradifive_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div class="summary-box">
    <table class="summary-table">
      <tr>
        <td>Eligible Net Profit:</td>
        <td class="text-right font-bold">${curr}${settlement.eligible_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>Customer Retained (50%):</td>
        <td class="text-right font-bold" style="color: #059669;">${curr}${settlement.customer_share.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="total-row">
        <td>Total Payable:</td>
        <td class="text-right" style="color: #2563eb;">${curr}${settlement.amount_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  <div class="notice">
    <b>Payment & Regulatory Terms:</b>
    Tradifive does not have access to debit or withdraw from client MT5 broker accounts. Clients remit the agreed 50% platform share separately via Razorpay, UPI, or corporate Crypto transfer. Settlements are governed by the FiAlgo V1 Operating Agreement. Floating profits and unclosed positions are strictly excluded from all fee calculations.
  </div>

  <div class="footer">
    <div>
      <p>TradiFive Finance & Clearing Desk • support@tradifive.in • Mumbai, India</p>
      <p>Computer generated invoice — No physical signature required.</p>
    </div>
    <div class="seal">
      <span>TRADIFIVE</span>
      <span>${isPaid ? 'VERIFIED' : 'CALCULATED'}</span>
      <span>2026</span>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto open print dialog if opened in standalone window
      if (window.opener) {
        window.print();
      }
    };
  </script>
</body>
</html>
`;
}

export function downloadSettlementInvoicePdf(settlement: Settlement, userProfile?: any) {
  const html = generateSettlementInvoiceHtml(settlement, userProfile);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
