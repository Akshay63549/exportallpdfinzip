require("dotenv").config(); // Ensure this line is at the top of your server.js

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const archiver = require("archiver");
const path = require("path");
const { createInvoice } = require("./routes/createInvoice.js");
const studentRoutes = require("./routes/studentRoutes");
const fs = require("fs")
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

    // Define the temp directory
    const tempDir = path.join(__dirname, "temp");

    // Ensure the temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  
    // Dynamically define the PDF file name within the temp directory
    const tempFile = path.join(tempDir, `invoice_${Date.now()}.pdf`);
  
    // Generate the invoice
    createInvoice(invoice, tempFile, () => {
      // Send the generated invoice file
      res.sendFile(tempFile, (err) => {
        if (err) {
          console.error("Error sending the invoice file:", err);
          res.status(500).send("Error generating invoice");
        } else {
          console.log("Invoice sent successfully");
  
          // Delete the temporary directory and all its contents
          fs.rmdir(tempDir, { recursive: true }, (err) => {
            if (err) {
              console.error("Error deleting temp directory:", err);
            } else {
              console.log("Temporary directory deleted successfully");
            }
          });
        }
      });
    });
  });
// Route for bulk export
app.get("/generate-invoices", (req, res) => {
  const tempDir = path.join(__dirname, "temp");
  
  // Ensure the temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const invoices = [
    // Example list of invoices
    {
      shipping: { name: "John Doe", address: "1234 Main Street", city: "San Francisco", state: "CA", country: "US" },
      items: [{ item: "TC 100", description: "Toner Cartridge", quantity: 2, amount: 6000 }],
      subtotal: 8000,
      paid: 0,
      invoice_nr: 1234,
    },
    {
      shipping: { name: "Jane Smith", address: "5678 Elm Street", city: "Los Angeles", state: "CA", country: "US" },
      items: [{ item: "Laptop", description: "Dell Inspiron", quantity: 1, amount: 50000 }],
      subtotal: 50000,
      paid: 0,
      invoice_nr: 5678,
    },
  ];

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=invoices.zip");

  const archive = archiver("zip");
  archive.pipe(res);

  let completed = 0;

  invoices.forEach((invoice, index) => {
    const fileName = `invoice_${invoice.invoice_nr}.pdf`;
    const filePath = path.join(tempDir, fileName);

    // Generate the invoice
    createInvoice(invoice, filePath, () => {
      archive.file(filePath, { name: fileName });
      completed++;

      if (completed === invoices.length) {
        archive.finalize().then(() => {
          // After finalizing, delete the temp folder
          fs.rm(tempDir, { recursive: true, force: true }, (err) => {
            if (err) {
              console.error("Error deleting temp folder:", err);
            } else {
              console.log("Temp folder deleted successfully");
            }
          });
        });
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
