const express = require("express");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const templateData = {
  quotation: {
    customerName: "Ajay Prajapathi",
    invoiceNumber: "INV-2026-001",
    date: "14 May 2026",
  },

  companyName: "ABC Pvt Ltd",

  customer: {
    name: "Ajay Prajapathi",
    address: "Hyderabad, India",
    email: "ajay@example.com",
  },

  items: [
    {
      name: "Website Development",
      qty: 1,
      price: 25000,
    },
    {
      name: "Hosting",
      qty: 1,
      price: 5000,
    },
  ],
};

templateData.subtotal = templateData.items.reduce(
  (acc, item) => acc + item.qty * item.price,
  0
);

templateData.tax = templateData.subtotal * 0.18;
templateData.total = templateData.subtotal + templateData.tax;


// -------------------------------------
// Browser Preview Route
// -------------------------------------

app.get("/invoice", (req, res) => {
  res.render("invoice", {templateData});
});


// -------------------------------------
// Generate PDF Route
// -------------------------------------

// app.get("/generate-pdf", async (req, res) => {
//   try {
//     const templatePath = path.join(__dirname, "views", "invoice.ejs");

//     const html = await ejs.renderFile(templatePath, templateData);

//     const browser = await puppeteer.launch({
//       headless: true,
//     });

//     const page = await browser.newPage();

//     await page.setContent(html, {
//       waitUntil: "networkidle0",
//     });

//     const pdfPath = path.join(__dirname, "output", "invoice.pdf");

//     await page.pdf({
//       path: pdfPath,
//       format: "A4",
//       printBackground: true,
//       margin: {
//         top: "20px",
//         right: "20px",
//         bottom: "20px",
//         left: "20px",
//       },
//     });

//     await browser.close();

//     res.download(pdfPath);

//   } catch (err) {
//     console.log(err);
//     res.status(500).send("PDF Generation Failed");
//   }
// });

app.get("/generate-pdf", async (req, res) => {
  try {

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    // IMPORTANT
    await page.goto("http://localhost:3000/invoice", {
      waitUntil: "networkidle0",
    });

    const pdfPath = path.join(__dirname, "output", "invoice.pdf");

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    res.download(pdfPath);

  } catch (err) {
    console.log(err);
    res.status(500).send("PDF Generation Failed");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});