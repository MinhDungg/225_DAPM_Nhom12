using MiniExcelLibs; // Thêm thư viện này vào
using System.Text;
using System.Text.RegularExpressions;
using System.Net;

namespace BE.Services.Implementations;

public class ExportService
{
    // ── EXCEL (Sử dụng Stream nguyên thủy để chống sập RAM) ─────────────
    public Stream ToExcel(List<Dictionary<string, string>> rows, List<string> headers, string sheetName = "Sheet1")
    {
        // Sanitize sheet name
        var safeSheet = Regex.Replace(sheetName, @"[\\/?*\[\]:]", "-");
        if (safeSheet.Length > 31) safeSheet = safeSheet[..31];

        var objectRows = new List<Dictionary<string, object>>();
        foreach (var r in rows)
        {
            var dict = new Dictionary<string, object>();
            foreach (var h in headers)
            {
                r.TryGetValue(h, out var val);
                dict[h] = val ?? "";
            }
            objectRows.Add(dict);
        }

        var ms = new MemoryStream();
        // Ghi trực tiếp vào Stream
        MiniExcel.SaveAs(ms, objectRows, sheetName: safeSheet);
        
        // BẮT BUỘC: Tua ngược Stream về vị trí số 0 để ASP.NET có thể đọc và gửi đi
        ms.Position = 0; 
        
        return ms; // Trả thẳng Stream về, không dùng using, không dùng ToArray()
    }

    // ── HTML (thay thế PDF — browser tự in/lưu PDF) ─────────────────
    public byte[] ToHtml(List<Dictionary<string, string>> rows, List<string> headers, string title)
    {
        if (headers == null || headers.Count == 0) headers = new List<string> { "Dữ liệu" };
        if (rows == null) rows = new List<Dictionary<string, string>>();

        var sb = new StringBuilder();
        sb.Append($@"<!DOCTYPE html>
    <html lang=""vi""><head><meta charset=""UTF-8"">
<title>{WebUtility.HtmlEncode(title)}</title>
<style>
  body {{ font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }}
  h2 {{ color: #1a56db; margin-bottom: 12px; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th {{ background: #1a56db; color: #fff; padding: 8px 10px; text-align: left; }}
  td {{ padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }}
  tr:nth-child(even) td {{ background: #f9fafb; }}
  @media print {{ button {{ display: none; }} }}
</style></head><body>
<button onclick=""window.print()"" style=""margin-bottom:12px;padding:7px 18px;background:#1a56db;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;"">🖨️ In / Lưu PDF</button>
<h2>{WebUtility.HtmlEncode(title)}</h2>
<table><thead><tr>");

        foreach (var h in headers)
            sb.Append($"<th>{WebUtility.HtmlEncode(h)}</th>");
        sb.Append("</tr></thead><tbody>");

        foreach (var row in rows)
        {
            sb.Append("<tr>");
            foreach (var h in headers)
            {
                row.TryGetValue(h, out var val);
                sb.Append($"<td>{WebUtility.HtmlEncode(val ?? "")}</td>");
            }
            sb.Append("</tr>");
        }

        sb.Append("</tbody></table></body></html>");
        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}