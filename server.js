require("dotenv").config(); // Ensure this line is at the top of your server.js

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const archiver = require("archiver");
const path = require("path");
const { createInvoice } = require("./routes/createInvoice.js");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.dbURL, {
    serverSelectionTimeoutMS: 60000, // Timeout after 60 seconds
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the server only after MongoDB is connected
    app.listen(7000, () => {
      console.log("Server started on port 7000");
    });
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err);
  });

// Routes
app.use("/students", studentRoutes);

// Route to generate and download the invoice
app.get("/generate-invoice", (req, res) => {
  const invoice = {
    shipping: {
      name: "John Doe",
      address: "1234 Main Street",
      city: "San Francisco",
      state: "CA",
      country: "US",
      postal_code: 94111
    },
    items: [
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      },
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      },
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      },
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      },
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      },
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      },
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      },
      {
        item: "TC 100",
        description: "Toner Cartridge",
        quantity: 2,
        amount: 6000
      },
      {
        item: "USB_EXT",
        description: "USB Cable Extender",
        quantity: 1,
        amount: 2000
      }
    ],
    subtotal: 8000,
    paid: 0,
    invoice_nr: 1234
  };

  const invoicePath = path.join(__dirname, "invoice.pdf");

  // Generate the invoice and wait until it's written
  createInvoice(invoice, invoicePath, () => {
    // Send the file after it's fully written
    res.sendFile(invoicePath, (err) => {
      if (err) {
        console.error("Error sending the invoice file:", err);
        res.status(500).send("Error generating invoice");
      } else {
        console.log("Invoice generated and sent successfully");
      }
    });
  });
});
app.get("/generate-invoices", (req, res) => {
  // Example list of invoices
  const invoices = [
    {
      shipping: {
        name: "John Doe",
        address: "1234 Main Street",
        city: "San Francisco",
        state: "CA",
        country: "US",
      },
      items: [
        { item: "TC 100", description: "Toner Cartridge", quantity: 2, amount: 6000 },
        { item: "USB_EXT", description: "USB Cable Extender", quantity: 1, amount: 2000 },
      ],
      subtotal: 8000,
      paid: 0,
      invoice_nr: 1234,
    },
    {
      shipping: {
        name: "Jane Smith",
        address: "5678 Elm Street",
        city: "Los Angeles",
        state: "CA",
        country: "US",
      },
      items: [
        { item: "USB_EXT", description: "USB Cable Extender", quantity: 1, amount: 2000 },
        { item: "Laptop", description: "Dell Inspiron", quantity: 1, amount: 50000 },
      ],
      subtotal: 52000,
      paid: 10000,
      invoice_nr: 5678,
    },
  ];

  // Set response headers for downloading the zip
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=invoices.zip");

  // Create a zip archive
  const archive = archiver("zip");
  archive.pipe(res);

  let completed = 0;

  invoices.forEach((invoice, index) => {
    const fileName = `invoice_${invoice.invoice_nr}.pdf`;
    const tempPath = path.join(__dirname, fileName);

    // Generate each invoice PDF
    createInvoice(invoice, tempPath, () => {
      // Append the file to the archive
      archive.file(tempPath, { name: fileName });
      completed++;

      // Finalize archive once all invoices are processed
      if (completed === invoices.length) {
        archive.finalize();
      }
    });
  });

  archive.on("error", (err) => {
    console.error("Error creating archive:", err);
    res.status(500).send("Error generating invoices");
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});
