import { Report } from '../types';
import { Language, getTranslation } from './i18n';
import { getTypeLabel, getStatusLabel, getSeverityLabel } from './severityDetection';

export interface SchoolPdfInfo {
  schoolName: string;
  counselorName: string;
  academicYear?: string;
  emergencyPhone?: string;
}

/**
 * Generates an isolated, print-ready document and triggers the browser's native
 * print-to-PDF / direct printing dialog. This guarantees 100% vector fidelity,
 * full Arabic font shaping (Cairo), Tamazight (Tifinagh), and zero distortion.
 */
function triggerPrint(htmlContent: string, title: string) {
  // Try hidden iframe approach first (cleanest, no blank tabs)
  const existingFrame = document.getElementById('sitr-pdf-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'sitr-pdf-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback: open popup window
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Allow styles and fonts to render, then trigger print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  }, 400);
}

/**
 * Common Styles and Google Fonts for official PDF reports
 */
function getBaseStyles(isRtl: boolean) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      direction: ${isRtl ? 'rtl' : 'ltr'};
      text-align: ${isRtl ? 'right' : 'left'};
      background-color: #ffffff;
      color: #0f172a;
      line-height: 1.5;
      font-size: 13px;
    }

    .report-wrapper {
      max-width: 100%;
      margin: 0 auto;
      padding: 4px;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0d9488;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }

    .header-logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #0f766e, #0d9488);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }

    .logo-badge svg {
      width: 26px;
      height: 26px;
      stroke: #ffffff;
      fill: none;
      stroke-width: 2.2;
    }

    .header-titles h1 {
      margin: 0;
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
    }

    .header-titles p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .header-meta {
      text-align: ${isRtl ? 'left' : 'right'};
      font-size: 11px;
      color: #334155;
    }

    .doc-badge-confidential {
      display: inline-block;
      padding: 3px 8px;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 10px;
      font-weight: 700;
      border-radius: 6px;
      margin-bottom: 4px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f766e;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin: 14px 0 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .info-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      background-color: #f8fafc;
    }

    .info-box-label {
      font-size: 10px;
      color: #64748b;
      display: block;
      margin-bottom: 2px;
      font-weight: 600;
    }

    .info-box-value {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }

    .tag-high {
      background-color: #ffe4e6;
      color: #9f1239;
      border: 1px solid #f43f5e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .tag-medium {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #f59e0b;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .tag-low {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .tag-new {
      background-color: #e0f2fe;
      color: #0369a1;
      border: 1px solid #38bdf8;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .tag-in_progress {
      background-color: #fef3c7;
      color: #b45309;
      border: 1px solid #f59e0b;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .tag-resolved {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #22c55e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .narrative-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      background-color: #f8fafc;
      margin-bottom: 12px;
      white-space: pre-wrap;
      font-size: 12.5px;
      line-height: 1.6;
      color: #1e293b;
    }

    .counselor-card {
      border: 1px solid #99f6e4;
      border-radius: 8px;
      padding: 12px;
      background-color: #f0fdfa;
      margin-bottom: 14px;
      font-size: 12.5px;
      line-height: 1.6;
      color: #134e4a;
    }

    .signatures-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
    }

    .signature-box {
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      padding: 10px;
      min-height: 80px;
      background-color: #fafafa;
    }

    .signature-title {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
      display: block;
    }

    .footer-disclaimer {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #64748b;
    }

    /* Full Table Styling for Dossier */
    table.dossier-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 8px;
      margin-bottom: 14px;
    }

    table.dossier-table th {
      background-color: #0f766e;
      color: #ffffff;
      padding: 7px 6px;
      font-weight: 700;
      border: 1px solid #0d9488;
      text-align: ${isRtl ? 'right' : 'left'};
    }

    table.dossier-table td {
      padding: 6px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }

    table.dossier-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .stats-summary-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }

    .stat-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      background: #f8fafc;
    }

    .stat-card-num {
      font-size: 18px;
      font-weight: 900;
      display: block;
    }

    .stat-card-title {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
    }
  `;
}

/**
 * Export a Single Incident Report to Official PDF
 */
export function exportSingleReportPdf(
  report: Report,
  schoolInfo: SchoolPdfInfo,
  lang: Language = 'ar'
) {
  const isRtl = lang === 'ar' || lang === 'zgh';
  const victimDisplay = report.victim_name
    ? report.victim_name
    : isRtl
    ? 'هوية مجهولة ومحمية بالكامل (بلاغ سري)'
    : 'Protected Anonymous Student';

  const typeLabel = getTypeLabel(report.type, lang);
  const statusLabel = getStatusLabel(report.status, lang);
  const severityLabel = getSeverityLabel(report.severity, lang);

  const incidentDate = report.incident_date || new Date(report.created_at).toLocaleDateString();
  const incidentPeriod = report.incident_period || (isRtl ? 'الفترة الصباحية' : 'Morning Period');
  const nowFormatted = new Date().toLocaleString();

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8" />
        <title>${getTranslation(lang, 'officialReportTitle')} - #${report.id.slice(0, 8)}</title>
        <style>
          ${getBaseStyles(isRtl)}
        </style>
      </head>
      <body>
        <div class="report-wrapper">
          <!-- Institutional Header -->
          <div class="header-bar">
            <div class="header-logo-area">
              <div class="logo-badge">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div class="header-titles">
                <h1>${getTranslation(lang, 'officialReportTitle')}</h1>
                <p>${schoolInfo.schoolName} &bull; ${schoolInfo.academicYear || '2026'}</p>
              </div>
            </div>

            <div class="header-meta">
              <div class="doc-badge-confidential">
                ${getTranslation(lang, 'confidentialDocument')}
              </div>
              <div><strong>#REF-${report.id.slice(0, 8).toUpperCase()}</strong></div>
              <div>${getTranslation(lang, 'printedOn')} ${nowFormatted}</div>
            </div>
          </div>

          <!-- Section 1: Core Parameters Grid -->
          <div class="section-title">
            <span>&#9632;</span> ${isRtl ? 'بيانات ومعطيات البلاغ الأساسية' : 'Incident Core Parameters'}
          </div>

          <div class="info-grid">
            <div class="info-box">
              <span class="info-box-label">${getTranslation(lang, 'colVictim')}</span>
              <span class="info-box-value">${victimDisplay}</span>
            </div>
            <div class="info-box">
              <span class="info-box-label">${getTranslation(lang, 'colType')}</span>
              <span class="info-box-value">${typeLabel}</span>
            </div>
            <div class="info-box">
              <span class="info-box-label">${getTranslation(lang, 'colLocation')}</span>
              <span class="info-box-value">${report.location}</span>
            </div>
            <div class="info-box">
              <span class="info-box-label">${getTranslation(lang, 'incidentDateLabel')} / ${getTranslation(lang, 'incidentPeriodLabel')}</span>
              <span class="info-box-value">${incidentDate} (${incidentPeriod})</span>
            </div>
          </div>

          <div class="info-grid" style="grid-template-columns: 1fr 1fr 1fr;">
            <div class="info-box">
              <span class="info-box-label">${getTranslation(lang, 'colSeverity')}</span>
              <span class="tag-${report.severity}">${severityLabel}</span>
            </div>
            <div class="info-box">
              <span class="info-box-label">${getTranslation(lang, 'colStatus')}</span>
              <span class="tag-${report.status}">${statusLabel}</span>
            </div>
            <div class="info-box">
              <span class="info-box-label">${getTranslation(lang, 'registeredAt')}</span>
              <span class="info-box-value">${new Date(report.created_at).toLocaleString()}</span>
            </div>
          </div>

          <!-- Section 2: Narrative Statement -->
          <div class="section-title">
            <span>&#9632;</span> ${getTranslation(lang, 'descriptionLabel')}
          </div>
          <div class="narrative-card">
            ${report.description}
          </div>

          <!-- Section 3: Counselor & Management Action Plan -->
          <div class="section-title">
            <span>&#9632;</span> ${getTranslation(lang, 'counselorActionPlan')}
          </div>
          <div class="counselor-card">
            ${report.notes ? report.notes : (isRtl ? 'لا توجد ملاحظات مسجلة حتى الآن. جاري المتابعة الإرشادية للحالة.' : 'No notes recorded yet. Active follow-up in progress.')}
          </div>

          <!-- Section 4: Signatures & Legal Stamps -->
          <div class="signatures-row">
            <div class="signature-box">
              <span class="signature-title">${getTranslation(lang, 'counselorSignature')}</span>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                ${schoolInfo.counselorName}
              </div>
              <div style="margin-top: 36px; border-bottom: 1px dotted #94a3b8; width: 80%;"></div>
            </div>

            <div class="signature-box">
              <span class="signature-title">${getTranslation(lang, 'directorSignature')}</span>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                ${schoolInfo.schoolName}
              </div>
              <div style="margin-top: 36px; border-bottom: 1px dotted #94a3b8; width: 80%;"></div>
            </div>
          </div>

          <!-- Footer Legal Notice -->
          <div class="footer-disclaimer">
            <span>${getTranslation(lang, 'appName')} - ${getTranslation(lang, 'tagline')}</span>
            <span>${getTranslation(lang, 'allRightsReserved')}</span>
          </div>
        </div>
      </body>
    </html>
  `;

  triggerPrint(html, `SITR-Report-${report.id.slice(0, 8)}`);
}

/**
 * Export All / Filtered Incidents to Executive Summary Dossier PDF
 */
export function exportAllReportsPdf(
  reports: Report[],
  schoolInfo: SchoolPdfInfo,
  lang: Language = 'ar'
) {
  const isRtl = lang === 'ar' || lang === 'zgh';
  const nowFormatted = new Date().toLocaleString();

  // Metrics
  const total = reports.length;
  const high = reports.filter((r) => r.severity === 'high').length;
  const medium = reports.filter((r) => r.severity === 'medium').length;
  const inProgress = reports.filter((r) => r.status === 'in_progress').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;
  const newCases = reports.filter((r) => r.status === 'new').length;

  // Rows
  const tableRows = reports.map((r, index) => {
    const victim = r.victim_name || (isRtl ? 'مجهول' : 'Anonymous');
    const type = getTypeLabel(r.type, lang);
    const severity = getSeverityLabel(r.severity, lang);
    const status = getStatusLabel(r.status, lang);
    const date = r.incident_date || new Date(r.created_at).toLocaleDateString();
    const period = r.incident_period || '-';

    return `
      <tr>
        <td style="text-align: center; font-weight: bold; font-family: monospace;">#${r.id.slice(0, 6)}</td>
        <td>${date}</td>
        <td><strong>${victim}</strong></td>
        <td>${type}</td>
        <td>${r.location} (${period})</td>
        <td style="text-align: center;"><span class="tag-${r.severity}">${severity}</span></td>
        <td style="text-align: center;"><span class="tag-${r.status}">${status}</span></td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8" />
        <title>${getTranslation(lang, 'executiveSummaryPdfTitle')}</title>
        <style>
          ${getBaseStyles(isRtl)}
        </style>
      </head>
      <body>
        <div class="report-wrapper">
          <!-- Institutional Header -->
          <div class="header-bar">
            <div class="header-logo-area">
              <div class="logo-badge">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div class="header-titles">
                <h1>${getTranslation(lang, 'executiveSummaryPdfTitle')}</h1>
                <p>${schoolInfo.schoolName} &bull; ${schoolInfo.academicYear || '2026'} &bull; ${schoolInfo.counselorName}</p>
              </div>
            </div>

            <div class="header-meta">
              <div class="doc-badge-confidential">
                ${getTranslation(lang, 'confidentialDocument')}
              </div>
              <div>${getTranslation(lang, 'printedOn')} ${nowFormatted}</div>
              <div>${getTranslation(lang, 'metricTotal')}: <strong>${total}</strong></div>
            </div>
          </div>

          <!-- Executive Statistics Summary Grid -->
          <div class="stats-summary-grid">
            <div class="stat-card">
              <span class="stat-card-num" style="color: #0f766e;">${total}</span>
              <span class="stat-card-title">${getTranslation(lang, 'metricTotal')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-num" style="color: #0284c7;">${newCases}</span>
              <span class="stat-card-title">${getTranslation(lang, 'statusNew')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-num" style="color: #d97706;">${inProgress}</span>
              <span class="stat-card-title">${getTranslation(lang, 'statusInProgress')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-num" style="color: #16a34a;">${resolved}</span>
              <span class="stat-card-title">${getTranslation(lang, 'statusResolved')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-card-num" style="color: #e11d48;">${high}</span>
              <span class="stat-card-title">${getTranslation(lang, 'metricHigh')}</span>
            </div>
          </div>

          <!-- Incidents Register Table -->
          <div class="section-title">
            <span>&#9632;</span> ${getTranslation(lang, 'allReportsTitle')} (${total})
          </div>

          <table class="dossier-table">
            <thead>
              <tr>
                <th style="width: 11%;">ID</th>
                <th style="width: 14%;">${getTranslation(lang, 'colDate')}</th>
                <th style="width: 18%;">${getTranslation(lang, 'colVictim')}</th>
                <th style="width: 16%;">${getTranslation(lang, 'colType')}</th>
                <th style="width: 21%;">${getTranslation(lang, 'colLocation')}</th>
                <th style="width: 10%; text-align: center;">${getTranslation(lang, 'colSeverity')}</th>
                <th style="width: 10%; text-align: center;">${getTranslation(lang, 'colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || `<tr><td colspan="7" style="text-align: center; padding: 18px; color: #94a3b8;">${getTranslation(lang, 'emptyReportsTitle')}</td></tr>`}
            </tbody>
          </table>

          <!-- Endorsement & Signatures -->
          <div class="signatures-row">
            <div class="signature-box">
              <span class="signature-title">${getTranslation(lang, 'counselorSignature')}</span>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                ${schoolInfo.counselorName}
              </div>
              <div style="margin-top: 36px; border-bottom: 1px dotted #94a3b8; width: 80%;"></div>
            </div>

            <div class="signature-box">
              <span class="signature-title">${getTranslation(lang, 'directorSignature')}</span>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                ${schoolInfo.schoolName}
              </div>
              <div style="margin-top: 36px; border-bottom: 1px dotted #94a3b8; width: 80%;"></div>
            </div>
          </div>

          <!-- Footer Legal Notice -->
          <div class="footer-disclaimer">
            <span>${getTranslation(lang, 'appName')} &bull; ${getTranslation(lang, 'tagline')}</span>
            <span>${getTranslation(lang, 'allRightsReserved')}</span>
          </div>
        </div>
      </body>
    </html>
  `;

  triggerPrint(html, `SITR-Executive-Dossier-${new Date().toISOString().slice(0, 10)}`);
}
