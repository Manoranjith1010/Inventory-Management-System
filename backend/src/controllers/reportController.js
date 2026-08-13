const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const asyncHandler = require("../utils/asyncHandler");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const toCSV = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")).join("\n");
  return `${headers.join(",")}\n${body}`;
};

const sendExcel = async (res, fileName, sheetName, rows) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (!rows.length) {
    worksheet.addRow(["No data"]);
  } else {
    const headers = Object.keys(rows[0]).map((key) => ({ header: key, key }));
    worksheet.columns = headers;
    rows.forEach((row) => worksheet.addRow(row));
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
};

const sendPdf = (res, fileName, title, rows) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}.pdf`);

  const doc = new PDFDocument({ margin: 36, size: "A4" });
  doc.pipe(res);

  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown(1);

  if (!rows.length) {
    doc.fontSize(12).text("No data available");
    doc.end();
    return;
  }

  const headers = Object.keys(rows[0]);
  doc.fontSize(10).text(headers.join(" | "));
  doc.moveDown(0.5);

  rows.forEach((row) => {
    const line = headers.map((header) => String(row[header] ?? "")).join(" | ");
    doc.text(line);
  });

  doc.end();
};

const getSalesReport = asyncHandler(async (req, res) => {
  const sales = await Sale.find().populate("items.product", "name sku").sort({ createdAt: -1 });
  const rows = sales.map((sale) => ({
    invoiceNumber: sale.invoiceNumber,
    customerName: sale.customerName,
    totalAmount: sale.totalAmount,
    paymentStatus: sale.paymentStatus,
    createdAt: sale.createdAt.toISOString(),
  }));

  if (req.query.format === "excel") {
    await sendExcel(res, "sales-report", "Sales", rows);
    return;
  }

  if (req.query.format === "pdf") {
    sendPdf(res, "sales-report", "Sales Report", rows);
    return;
  }

  if (req.query.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sales-report.csv");
    return res.status(200).send(toCSV(rows));
  }

  return res.status(200).json(rows);
});

const getPurchaseReport = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find().populate("supplier", "companyName").sort({ createdAt: -1 });
  const rows = purchases.map((purchase) => ({
    invoiceNumber: purchase.invoiceNumber,
    supplier: purchase.supplier?.companyName || "N/A",
    totalAmount: purchase.totalAmount,
    status: purchase.status,
    createdAt: purchase.createdAt.toISOString(),
  }));

  if (req.query.format === "excel") {
    await sendExcel(res, "purchase-report", "Purchases", rows);
    return;
  }

  if (req.query.format === "pdf") {
    sendPdf(res, "purchase-report", "Purchase Report", rows);
    return;
  }

  if (req.query.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=purchase-report.csv");
    return res.status(200).send(toCSV(rows));
  }

  return res.status(200).json(rows);
});

const getInventoryReport = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  const rows = products.map((product) => ({
    name: product.name,
    sku: product.sku,
    category: product.category,
    quantity: product.quantity,
    purchasePrice: product.purchasePrice,
    sellingPrice: product.sellingPrice,
    stockValue: product.quantity * product.purchasePrice,
    isLowStock: product.quantity <= product.lowStockThreshold,
  }));

  if (req.query.format === "excel") {
    await sendExcel(res, "inventory-report", "Inventory", rows);
    return;
  }

  if (req.query.format === "pdf") {
    sendPdf(res, "inventory-report", "Inventory Report", rows);
    return;
  }

  if (req.query.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inventory-report.csv");
    return res.status(200).send(toCSV(rows));
  }

  return res.status(200).json(rows);
});

const getProfitReport = asyncHandler(async (req, res) => {
  const sales = await Sale.find();
  const purchases = await Purchase.find();

  const totalSales = sales.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalPurchases = purchases.reduce((sum, item) => sum + item.totalAmount, 0);

  const result = {
    totalSales,
    totalPurchases,
    grossProfit: totalSales - totalPurchases,
  };

  return res.status(200).json(result);
});

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitReport,
};
