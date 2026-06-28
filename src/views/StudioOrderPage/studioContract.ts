import type { StudioOrder } from '../../types'

/** Escape user-supplied text so it is safe to inject into the contract HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('tk-TM')
}

/** Human-readable contract number derived from the order id. */
export function contractNumber(order: StudioOrder): string {
  return `ŞZ-${String(order.id).padStart(5, '0')}`
}

/**
 * Build a self-contained HTML contract (şertnama) for an approved order. Pure
 * (no DOM/window access) so it can be unit-tested; the page hands the result
 * to `openContractPrint` for the actual print-to-PDF.
 */
export function buildContractHtml(order: StudioOrder): string {
  const today = new Date().toLocaleDateString('tk-TM')

  const dayRows = order.days
    .map((d, i) => {
      const lines: string[] = []
      if (d.equipments.length) {
        lines.push(
          'Enjamlar: ' +
            d.equipments.map((e) => `${esc(e.equipment_name)} ×${e.count}`).join(', '),
        )
      }
      if (d.services.length) {
        lines.push(
          'Hyzmatlar: ' +
            d.services.map((s) => `${esc(s.service_name)} ×${s.count}`).join(', '),
        )
      }
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${formatDate(d.date)}${d.time ? ` ${esc(d.time)}` : ''}</td>
          <td>${esc(d.address)}</td>
          <td>${lines.join('<br/>') || '—'}</td>
          <td class="num">${Number(d.daily_price).toLocaleString()} TMT</td>
        </tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="tk">
<head>
<meta charset="utf-8" />
<title>Şertnama ${esc(contractNumber(order))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Georgia, serif; color: #111; margin: 0; padding: 40px; font-size: 14px; line-height: 1.5; }
  h1 { text-align: center; font-size: 20px; margin: 0 0 4px; text-transform: uppercase; }
  .sub { text-align: center; color: #555; margin-bottom: 24px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { border: 1px solid #999; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #f1f1f1; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  .totals { width: 320px; margin-left: auto; }
  .totals td { border: none; padding: 4px 0; }
  .totals .grand { font-weight: bold; font-size: 16px; border-top: 1px solid #333; }
  .sign { display: flex; justify-content: space-between; margin-top: 56px; }
  .sign div { width: 45%; }
  .sign .line { border-top: 1px solid #333; margin-top: 40px; padding-top: 4px; text-align: center; color: #555; }
  p { margin: 8px 0; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>"Doganlar" foto studiosynyň hyzmatlary boýunça şertnama</h1>
  <div class="sub">№ ${esc(contractNumber(order))} &nbsp;·&nbsp; ${esc(today)} ý.</div>

  <div class="meta">
    <div>
      <strong>Buýrujy:</strong> ${esc(order.customer_name)}<br/>
      <strong>Telefon:</strong> ${esc(order.customer_phone)}
    </div>
    <div style="text-align:right">
      <strong>Sargyt belgisi:</strong> #${esc(order.id)}<br/>
      <strong>Döredilen:</strong> ${formatDate(order.created_at)}
    </div>
  </div>

  <p>
    Şu şertnama bilen "Doganlar" foto studiosy buýrujynyň surata/wideo düşüriş
    hyzmatlaryny aşakdaky şertlerde ýerine ýetirmegi öz üstüne alýar:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width:32px">№</th>
        <th>Sene / wagt</th>
        <th>Salgy</th>
        <th>Hyzmatlar</th>
        <th class="num">Bahasy</th>
      </tr>
    </thead>
    <tbody>
      ${dayRows || '<tr><td colspan="5">Maglumat ýok</td></tr>'}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Jemi baha:</td><td class="num">${Number(order.total_amount).toLocaleString()} TMT</td></tr>
    <tr><td>Tölenen:</td><td class="num">${Number(order.paid_amount).toLocaleString()} TMT</td></tr>
    <tr class="grand"><td>Galan:</td><td class="num">${Number(order.remaining_amount).toLocaleString()} TMT</td></tr>
  </table>

  <div class="sign">
    <div><div class="line">Ýerine ýetiriji (goly)</div></div>
    <div><div class="line">Buýrujy (goly)</div></div>
  </div>
</body>
</html>`
}

/**
 * Open the contract in a new window and trigger the browser print dialog, from
 * which the user can save it as a PDF. Returns false when the window was
 * blocked (e.g. by a popup blocker) so the caller can warn the user.
 */
export function openContractPrint(order: StudioOrder): boolean {
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.open()
  win.document.write(buildContractHtml(order))
  win.document.close()
  win.focus()
  let printed = false
  const print = () => {
    if (printed) return
    printed = true
    try {
      win.print()
    } catch {
      /* window may have been closed already */
    }
  }
  // Print once the document has laid out; the timeout is a fallback for
  // browsers that don't fire onload after document.write.
  win.onload = print
  setTimeout(print, 400)
  return true
}

/**
 * Download the contract as a PDF file directly to the user's device.
 */
export async function downloadContractPdf(order: StudioOrder) {
  const html = buildContractHtml(order)
  
  try {
    // Dynamically load html2pdf.js from CDN if not already loaded
    if (!(window as any).html2pdf) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
    
    const html2pdf = (window as any).html2pdf
    const opt = {
      margin:       15,
      filename:     `sertnama_${contractNumber(order)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, logging: false, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    await html2pdf().set(opt).from(html).save()
  } finally {
    // No cleanup required
  }
}


