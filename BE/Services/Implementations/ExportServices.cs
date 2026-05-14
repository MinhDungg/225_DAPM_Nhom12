using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BE.Services.Implementations;

public class ExportService
{
    public ExportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    // Kiểu dữ liệu đầu vào: List các dòng, mỗi dòng là Dictionary<tên cột, giá trị>
    
    public byte[] ToExcel(List<Dictionary<string, string>> rows, List<string> headers, string sheetName = "Sheet1")
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add(sheetName);

        for (int i = 0; i < headers.Count; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1a56db");
            cell.Style.Font.FontColor = XLColor.White;
        }

        for (int r = 0; r < rows.Count; r++)
        {
            for (int c = 0; c < headers.Count; c++)
            {
                rows[r].TryGetValue(headers[c], out var val);
                ws.Cell(r + 2, c + 1).Value = val ?? "";
            }
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public byte[] ToPdf(List<Dictionary<string, string>> rows, List<string> headers, string title)
    {
        return Document.Create(c => c.Page(page =>
        {
            page.Size(PageSizes.A4.Landscape());
            page.Margin(1.5f, Unit.Centimetre);
            page.DefaultTextStyle(t => t.FontSize(9).FontFamily("Times New Roman"));

            page.Header().PaddingBottom(8)
                .Text(title).Bold().FontSize(14).FontColor(Colors.Blue.Darken2);

            page.Content().Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    foreach (var _ in headers) cols.RelativeColumn();
                });

                table.Header(h =>
                {
                    foreach (var hdr in headers)
                        h.Cell().Background(Colors.Blue.Darken2).Padding(5)
                         .Text(hdr).FontColor(Colors.White).Bold();
                });

                bool even = false;
                foreach (var row in rows)
                {
                    var bg = even ? Colors.Grey.Lighten4 : Colors.White;
                    foreach (var key in headers)
                    {
                        row.TryGetValue(key, out var val);
                        table.Cell().Background(bg).Padding(4)
                             .BorderBottom(0.5f, Unit.Point).BorderColor(Colors.Grey.Lighten2)
                             .Text(val ?? "");
                    }
                    even = !even;
                }
            });

            page.Footer().AlignCenter()
                .Text(x => { x.Span("Trang "); x.CurrentPageNumber(); x.Span(" / "); x.TotalPages(); });
        })).GeneratePdf();
    }
}
