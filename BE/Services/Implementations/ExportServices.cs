using System.Text;
using System.Text.RegularExpressions;
using System.Net;
using iText.Html2pdf;
using iText.Html2pdf.Resolver.Font;
using iText.Kernel.Pdf;
using ClosedXML.Excel; // Thêm thư viện ClosedXML nâng cao

namespace BE.Services.Implementations;

public class ExportService
{
    // ── EXCEL: ClosedXML hỗ trợ định dạng nâng cao (Merge & Auto-fit) ──
    // Cập nhật thêm tham số "string title = """
    public Stream ToExcel(List<Dictionary<string, string>> rows, List<string> headers, string sheetName = "Sheet1", string title = "")
    {
        var safeSheet = Regex.Replace(sheetName, @"[\\/?*\[\]:]", "-");
        if (safeSheet.Length > 31) safeSheet = safeSheet[..31];

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(safeSheet);

        int startRow = 1; // Đánh dấu dòng bắt đầu vẽ bảng

        // 1. TẠO TIÊU ĐỀ CHÍNH CHO FILE EXCEL (MERGE TOÀN BỘ CỘT TẠI DÒNG 1)
        if (!string.IsNullOrEmpty(title))
        {
            var titleCell = worksheet.Cell(1, 1);
            titleCell.Value = title;
            titleCell.Style.Font.Bold = true;
            titleCell.Style.Font.FontSize = 15;
            titleCell.Style.Font.FontColor = XLColor.FromHtml("#1A56DB");
            titleCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            
            // Gộp ô (Merge) theo đúng số lượng cột của bảng (Headers)
            var titleRange = worksheet.Range(1, 1, 1, headers.Count);
            titleRange.Merge();
            
            startRow = 2; // Nếu có tiêu đề, đẩy bảng dữ liệu bắt đầu từ dòng 2
        }

        // 2. TẠO THANH TIÊU ĐỀ CỘT (HEADERS)
        for (int i = 0; i < headers.Count; i++)
        {
            var cell = worksheet.Cell(startRow, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1A56DB");
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }

        // 3. ĐỔ DỮ LIỆU CÁC DÒNG
        for (int r = 0; r < rows.Count; r++)
        {
            var rowDict = rows[r];
            // Cộng thêm startRow để đẩy bảng xuống tương ứng
            int currentRowNum = r + startRow + 1; 

            bool isTotalRow = rowDict.Values.Any(v => v != null && v.Contains("TỔNG CỘNG:"));

            if (isTotalRow)
            {
                int moneyColIndex = headers.IndexOf("Mức Học Bổng") + 1;
                
                if (moneyColIndex > 1)
                {
                    var mergeRange = worksheet.Range(currentRowNum, 1, currentRowNum, moneyColIndex - 1);
                    mergeRange.Merge();
                    mergeRange.Value = "TỔNG CỘNG:";
                    mergeRange.Style.Font.Bold = true;
                    mergeRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right; 
                    
                    var moneyCell = worksheet.Cell(currentRowNum, moneyColIndex);
                    rowDict.TryGetValue("Mức Học Bổng", out var moneyVal);
                    moneyCell.Value = moneyVal ?? "";
                    moneyCell.Style.Font.Bold = true;
                    moneyCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                }

                var totalRow = worksheet.Row(currentRowNum);
                totalRow.Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F4F6");
                for (int c = 1; c <= headers.Count; c++)
                {
                    worksheet.Cell(currentRowNum, c).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                }
            }
            else
            {
                for (int c = 0; c < headers.Count; c++)
                {
                    var cell = worksheet.Cell(currentRowNum, c + 1);
                    rowDict.TryGetValue(headers[c], out var val);
                    cell.Value = val ?? "";
                    cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    
                    // Căn giữa các cột mã số và phân loại
                    if (headers[c] == "STT" || headers[c] == "Mã SV" || headers[c] == "Lớp" || headers[c] == "Xếp Loại HB")
                    {
                        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    }
                }
            }
        }

        worksheet.Columns().AdjustToContents();

        var ms = new MemoryStream();
        workbook.SaveAs(ms);
        ms.Position = 0;
        return ms;
    }

    // ── PDF: Khởi tạo dữ liệu byte array từ HTML cấu trúc iText7 ──
    public byte[] ToPdf(List<Dictionary<string, string>> rows, List<string> headers, string title)
    {
        if (headers == null || headers.Count == 0) headers = new List<string> { "Dữ liệu" };
        if (rows == null) rows = new List<Dictionary<string, string>>();

        var html = BuildHtmlTable(rows, headers, title);

        try
        {
            using var ms = new MemoryStream();
            var properties = new ConverterProperties();
            var fontProvider = new DefaultFontProvider(true, true, true);
            properties.SetFontProvider(fontProvider);
            
            using var pdfWriter = new PdfWriter(ms);
            pdfWriter.SetCloseStream(false); // Ngăn iText tự ngắt kết nối stream giữa chừng
            
            using var pdfDoc = new PdfDocument(pdfWriter);
            HtmlConverter.ConvertToPdf(html, pdfDoc, properties);
            
            ms.Position = 0;
            return ms.ToArray();
        }
        catch (Exception ex)
        {
            string detail = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            throw new Exception($"Lỗi kết xuất công cụ iText7: {detail}");
        }
    }

    // ── XÂY DỰNG HTML TABLE ĐỂ CONVERT SANG PDF (Tự động gộp dòng cuối) ──
    private string BuildHtmlTable(List<Dictionary<string, string>> rows, List<string> headers, string title)
    {
        var sb = new StringBuilder();
        sb.Append($@"<!DOCTYPE html>
        <html lang=""vi""><head><meta charset=""UTF-8"">
        <style>
          body {{ font-family: 'Times New Roman', Arial, sans-serif; font-size: 11px; margin: 15px; }}
          h2 {{ color: #1a56db; text-align: center; margin-bottom: 15px; font-size: 16px; font-weight: bold; }}
          table {{ border-collapse: collapse; width: 100%; margin-top: 10px; }}
          th {{ background-color: #1a56db; color: #ffffff; padding: 6px 8px; font-weight: bold; border: 1px solid #000000; text-align: center; }}
          td {{ padding: 5px 8px; border: 1px solid #000000; }}
          .total-row td {{ font-weight: bold; background-color: #f3f4f6 !important; }}
          .text-right {{ text-align: right; }}
          .text-center {{ text-align: center; }}
        </style></head><body>
        <h2>{WebUtility.HtmlEncode(title)}</h2>
        <table><thead><tr>");

        foreach (var h in headers)
            sb.Append($"<th>{WebUtility.HtmlEncode(h)}</th>");
        sb.Append("</tr></thead><tbody>");

        foreach (var row in rows)
        {
            bool isTongCong = row.Values.Any(v => v != null && v.Contains("TỔNG CỘNG:"));

            if (isTongCong)
            {
                // Tính toán số lượng cột cần gộp trước cột "Mức Học Bổng"
                int moneyColIndex = headers.IndexOf("Mức Học Bổng");
                
                sb.Append("<tr class=\"total-row\">");
                // Sử dụng thuộc tính colspan để gộp toàn bộ các ô phía trước ô tiền
                sb.Append($"<td colspan=\"{moneyColIndex}\" class=\"text-right\">TỔNG CỘNG:</td>");
                
                // In giá trị của ô số tiền tổng nằm ở cột kế bên
                row.TryGetValue("Mức Học Bổng", out var totalMoney);
                sb.Append($"<td class=\"text-right\">{WebUtility.HtmlEncode(totalMoney ?? "")}</td>");
                sb.Append("</tr>");
            }
            else
            {
                sb.Append("<tr>");
                foreach (var h in headers)
                {
                    row.TryGetValue(h, out var val);
                    string cssClass = "";
                    if (h == "Mức Học Bổng") cssClass = " class=\"text-right\"";
                    else if (h == "STT" || h == "Mã SV" || h == "Lớp" || h == "Xếp Loại HB") cssClass = " class=\"text-center\"";
                    
                    sb.Append($"<td{cssClass}>{WebUtility.HtmlEncode(val ?? "")}</td>");
                }
                sb.Append("</tr>");
            }
        }

        sb.Append("</tbody></table></body></html>");
        return sb.ToString();
    }
}