using ClosedXML.Excel;

namespace BE.Services.Implementations;

public class ExportService
{
    // ── EXCEL ──────────────────────────────────────────────────────
    public byte[] ToExcel(List<Dictionary<string, string>> rows, List<string> headers, string sheetName = "Sheet1")
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add(sheetName);

        for (int i = 0; i < headers.Count; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.SetValue(headers[i]);
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1a56db");
            cell.Style.Font.FontColor = XLColor.White;
        }

        for (int r = 0; r < rows.Count; r++)
        {
            for (int c = 0; c < headers.Count; c++)
            {
                rows[r].TryGetValue(headers[c], out var val);
                ws.Cell(r + 2, c + 1).SetValue(val ?? "");
            }
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    // ── HTML (thay thế PDF — browser tự in/lưu PDF) ─────────────────
    public byte[] ToHtml(List<Dictionary<string, string>> rows, List<string> headers, string title)
    {
        if (headers == null || headers.Count == 0) headers = new List<string> { "Dữ liệu" };
        if (rows == null) rows = new List<Dictionary<string, string>>();

        var sb = new System.Text.StringBuilder();
        sb.Append($@"<!DOCTYPE html>
    <html lang=""vi""><head><meta charset=""UTF-8"">
<title>{System.Net.WebUtility.HtmlEncode(title)}</title>
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
<h2>{System.Net.WebUtility.HtmlEncode(title)}</h2>
<table><thead><tr>");

        foreach (var h in headers)
            sb.Append($"<th>{System.Net.WebUtility.HtmlEncode(h)}</th>");
        sb.Append("</tr></thead><tbody>");

        foreach (var row in rows)
        {
            sb.Append("<tr>");
            foreach (var h in headers)
            {
                row.TryGetValue(h, out var val);
                sb.Append($"<td>{System.Net.WebUtility.HtmlEncode(val ?? "")}</td>");
            }
            sb.Append("</tr>");
        }

        sb.Append("</tbody></table></body></html>");
        return System.Text.Encoding.UTF8.GetBytes(sb.ToString());
    }
}
