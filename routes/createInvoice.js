const fs = require("fs");
const PDFDocument = require("pdfkit");
function createInvoice(invoice, path, callback) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  // Add watermark to the first page
  addWatermark(doc, "logo.png");

  // Add listener to ensure watermark is added to every new page
  doc.on("pageAdded", () => {
    addWatermark(doc, "logo.png");
  });

  // Generate content
  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  // Finalize and save the PDF
  doc.end();
  const writeStream = fs.createWriteStream(path);
  doc.pipe(writeStream);

  writeStream.on("finish", () => {
    callback(); // Callback after writing file
  });
}


function generateHeader(doc) {
  doc
    .image("logo.png", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("ACME Inc.", 110, 57)
    .fontSize(10)
    .text("ACME Inc.", 200, 50, { align: "right" })
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("New York, NY, 10025", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.subtotal - invoice.paid),
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      invoice.shipping.city +
        ", " +
        invoice.shipping.state +
        ", " +
        invoice.shipping.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  const tableTop = 330; // Initial table Y position
  let y = tableTop;

  // Add table headers
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    y,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, y + 20);
  doc.font("Helvetica");
  y += 30;

  // Loop through items and handle pagination
  for (let i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];

    // Check if we need to add a new page
    if (y + 30 > 750) {
      doc.addPage();
      y = 50; // Reset Y position for new page

      // Re-draw table headers on the new page
      doc.font("Helvetica-Bold");
      generateTableRow(
        doc,
        y,
        "Item",
        "Description",
        "Unit Cost",
        "Quantity",
        "Line Total"
      );
      generateHr(doc, y + 20);
      doc.font("Helvetica");
      y += 30;
    }

    // Add the row
    generateTableRow(
      doc,
      y,
      item.item,
      item.description,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );
    generateHr(doc, y + 20);
    y += 30;
  }

  // Add subtotal, paid to date, and balance due
  if (y + 60 > 750) {
    doc.addPage();
    y = 50;

    // Re-draw table headers on the new page
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      y,
      "Item",
      "Description",
      "Unit Cost",
      "Quantity",
      "Line Total"
    );
    generateHr(doc, y + 20);
    doc.font("Helvetica");
    y += 30;
  }

  const subtotalPosition = y + 20;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Paid To Date",
    "",
    formatCurrency(invoice.paid)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Balance Due",
    "",
    formatCurrency(invoice.subtotal - invoice.paid)
  );
  doc.font("Helvetica");
}
function addWatermark(doc, logoPath) {
  const pageWidth = doc.page.width; // Total width of the page
  const pageHeight = doc.page.height; // Total height of the page
  const watermarkWidth = 300; // Desired width of the watermark
  const watermarkHeight = 300; // Desired height of the watermark

  // Calculate centered position
  const centerX = (pageWidth - watermarkWidth) / 2;
  const centerY = (pageHeight - watermarkHeight) / 2;

  // Set opacity and add the image
  doc
    .opacity(0.1) // Set opacity for faint watermark
    .image(logoPath, centerX, centerY, {
      width: watermarkWidth, // Scale watermark
      height: watermarkHeight, // Maintain proportions
    })
    .opacity(1); // Reset opacity for other content
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createInvoice
};
