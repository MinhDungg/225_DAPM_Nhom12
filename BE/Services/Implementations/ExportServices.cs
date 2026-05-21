using MiniExcelLibs; // Thêm thư viện này vào
using System.Text;
using System.Text.RegularExpressions;
using System.Net;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

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

    // ── REAL PDF (Sử dụng QuestPDF để xuất file PDF thật tải về máy) ─────────────────
    public byte[] ToPdf(List<Dictionary<string, string>> rows, List<string> headers, string title)
    {
        if (headers == null || headers.Count == 0) headers = new List<string> { "Dữ liệu" };
        if (rows == null) rows = new List<Dictionary<string, string>>();

        var primaryColor = Color.FromHex("#1A56DB");
        var zebraColor = Color.FromHex("#F9FAFB");
        var borderColor = Color.FromHex("#E5E7EB");
        var totalBgColor = Color.FromHex("#F3F4F6");

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                // Sử dụng khổ ngang A4 nếu có nhiều cột để dữ liệu không bị bó hẹp
                if (headers.Count > 6)
                {
                    page.Size(PageSizes.A4.Landscape());
                }
                else
                {
                    page.Size(PageSizes.A4);
                }

                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                
                // Mặc định font Arial hỗ trợ tốt tiếng Việt
                page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(9));

                // Header trang
                page.Header().Column(column =>
                {
                    column.Item().Text(title).Bold().FontSize(16).FontColor(primaryColor);
                    column.Item().PaddingBottom(10).BorderBottom(1).BorderColor(primaryColor);
                });

                // Nội dung bảng
                page.Content().PaddingVertical(10).Table(table =>
                {
                    // Định nghĩa số lượng cột động
                    table.ColumnsDefinition(columns =>
                    {
                        foreach (var header in headers)
                        {
                            // Tự động phân bổ độ rộng tương đối cho các cột
                            if (header == "STT")
                            {
                                columns.ConstantColumn(40);
                            }
                            else if (header == "Mã SV" || header == "Lớp")
                            {
                                columns.RelativeColumn(1.2f);
                            }
                            else if (header == "Họ Tên")
                            {
                                columns.RelativeColumn(2.5f);
                            }
                            else if (header == "Khoa")
                            {
                                columns.RelativeColumn(2.0f);
                            }
                            else if (header == "GPA" || header == "Điểm HT" || header == "Điểm RL" || header == "Xếp Loại HB")
                            {
                                columns.RelativeColumn(1.0f);
                            }
                            else if (header == "Mức Học Bổng" || header == "Kinh Phí")
                            {
                                columns.RelativeColumn(1.8f);
                            }
                            else
                            {
                                columns.RelativeColumn(1.5f);
                            }
                        }
                    });

                    // Tiêu đề bảng (Header row)
                    table.Header(header =>
                    {
                        foreach (var h in headers)
                        {
                            header.Cell()
                                  .Background(primaryColor)
                                  .BorderBottom(1)
                                  .BorderColor(primaryColor)
                                  .Padding(6)
                                  .Text(h)
                                  .Bold()
                                  .FontColor(Colors.White);
                        }
                    });

                    // Các dòng dữ liệu
                    for (int i = 0; i < rows.Count; i++)
                    {
                        var row = rows[i];
                        var isEven = i % 2 == 0;
                        var bg = isEven ? zebraColor : Colors.White;

                        // Kiểm tra nếu là dòng "Tổng cộng"
                        bool isTotalRow = false;
                        if (row.TryGetValue("STT", out var sttVal) && sttVal == "Tổng cộng")
                        {
                            isTotalRow = true;
                        }
                        else if (row.TryGetValue("Mã Phân Bổ", out var mpbVal) && mpbVal == "Tổng cộng")
                        {
                            isTotalRow = true;
                        }

                        var cellBg = isTotalRow ? totalBgColor : bg;

                        foreach (var h in headers)
                        {
                            row.TryGetValue(h, out var val);
                            val ??= "";

                            var cell = table.Cell()
                                            .Background(cellBg)
                                            .BorderBottom(0.5f)
                                            .BorderColor(borderColor)
                                            .Padding(6);

                            if (isTotalRow)
                            {
                                cell.Text(val).Bold();
                            }
                            else
                            {
                                cell.Text(val);
                            }
                        }
                    }
                });

                // Footer trang (Số trang)
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Trang ");
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        }).GeneratePdf();
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