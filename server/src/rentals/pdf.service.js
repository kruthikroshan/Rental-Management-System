import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PDFService = {
  async generateRentalInvoice(rental, orderData = {}) {
    console.log('[PDFService] generateRentalInvoice called for rental:', rental._id || rental.id);

    if (!rental || (!rental.id && !rental._id)) {
      throw new Error('Invalid rental object: missing id or _id');
    }

    try {
      // For now, return a simple text-based PDF buffer
      // This avoids Puppeteer timeout issues
      const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 500
>>
stream
BT
/F1 24 Tf
50 750 Td
(SMARTRENT RENTAL INVOICE) Tj
0 -40 Td
/F1 12 Tf
(Invoice #R${String(rental._id || rental.id).slice(0, 6)}) Tj
0 -30 Td
(Customer: ${rental.userName || 'N/A'}) Tj
0 -20 Td
(Email: ${rental.userEmail || 'N/A'}) Tj
0 -30 Td
(Product: ${rental.product?.name || 'N/A'}) Tj
0 -20 Td
(Category: ${rental.product?.category || 'N/A'}) Tj
0 -30 Td
(Duration: ${rental.totalDays || 1} days) Tj
0 -20 Td
(Amount: ₹${Number(rental.totalPrice || 0).toLocaleString()}) Tj
0 -40 Td
(Status: ${rental.status || 'PENDING'}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
868
%%EOF
`;

      return Buffer.from(pdfContent, 'utf8');
    } catch (error) {
      console.error('[PDFService] Error generating invoice:', error.message);
      throw error;
    }
  },

  generateInvoiceHTML(rental, orderData = {}) {
    const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

    // Get rental ID safely
    const rentalId = String(rental._id || rental.id || 'UNKNOWN').slice(0, 6);

    // Calculate totals if not provided
    const pricePerDay = Number(rental.pricePerDay || 0);
    const totalDays = rental.totalDays || 1;
    const subtotal = pricePerDay * totalDays;
    const taxAmount = Math.round(subtotal * 0.18); // 18% GST
    const totalAmount = subtotal + taxAmount;

    const untaxedTotal = orderData.untaxedTotal || subtotal;
    const tax = orderData.tax || taxAmount;
    const total = orderData.total || totalAmount;

    // Default order items if not provided
    const defaultItems = [{
      product: rental.product?.name || 'Rental Product',
      quantity: 1,
      unitPrice: pricePerDay,
      tax: taxAmount,
      subTotal: subtotal
    }];

    const items = orderData.items || defaultItems;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rental Invoice - R${rentalId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', system-ui, sans-serif; 
          color: #1f2937; 
          background: white;
          font-size: 14px;
          line-height: 1.6;
        }
        .invoice { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white;
          min-height: 100vh;
        }
        .header { 
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
          color: white; 
          padding: 40px 30px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
        }
        .logo { font-size: 32px; font-weight: bold; }
        .invoice-details { text-align: right; }
        .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .invoice-number { font-size: 18px; opacity: 0.9; }
        .content { padding: 30px; }
        .info-section { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 40px; 
          margin-bottom: 40px; 
        }
        .info-group h3 { 
          color: #6366f1; 
          font-size: 16px; 
          margin-bottom: 15px; 
          padding-bottom: 8px; 
          border-bottom: 2px solid #e5e7eb; 
        }
        .info-row { 
          display: flex; 
          margin-bottom: 8px; 
        }
        .info-label { 
          font-weight: 600; 
          width: 120px; 
          color: #374151; 
        }
        .info-value { 
          color: #6b7280; 
          flex: 1; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
          border: 1px solid #e5e7eb;
        }
        .items-table th { 
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
          color: white; 
          padding: 15px 12px; 
          text-align: left; 
          font-weight: 600; 
        }
        .items-table td { 
          padding: 12px; 
          border-bottom: 1px solid #e5e7eb; 
        }
        .items-table tr:nth-child(even) { 
          background: #f9fafb; 
        }
        .totals-section { 
          display: flex; 
          justify-content: flex-end; 
          margin: 30px 0; 
        }
        .totals-box { 
          background: #f9fafb; 
          padding: 25px; 
          border-radius: 8px; 
          min-width: 300px; 
          border: 1px solid #e5e7eb;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px; 
        }
        .total-row.final { 
          border-top: 2px solid #374151; 
          padding-top: 12px; 
          margin-top: 12px; 
          font-weight: bold; 
          font-size: 18px; 
          color: #1f2937; 
        }
        .terms-section { 
          background: #f0f9ff; 
          padding: 25px; 
          border-radius: 8px; 
          border-left: 4px solid #6366f1; 
          margin: 30px 0; 
        }
        .terms-title { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 12px; 
          color: #1f2937; 
        }
        .footer { 
          text-align: center; 
          padding: 25px; 
          border-top: 1px solid #e5e7eb; 
          color: #6b7280; 
          font-size: 12px; 
          background: #f9fafb;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-confirmed { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-picked_up { background-color: #dbeafe; color: #1e40af; }
        .status-returned { background-color: #f3f4f6; color: #374151; }
        .status-cancelled { background-color: #fecaca; color: #dc2626; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="logo">SmartRent</div>
          <div class="invoice-details">
            <div class="invoice-title">RENTAL INVOICE</div>
            <div class="invoice-number">R${rentalId}</div>
          </div>
        </div>

        <div class="content">
          <div class="info-section">
            <div class="info-group">
              <h3>Customer Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${rental.userName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${rental.userEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                  <span class="status-badge status-${rental.status.toLowerCase()}">${rental.status}</span>
                </span>
              </div>
            </div>
            <div class="info-group">
              <h3>Order Information</h3>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${formatDate(rental.createdAt)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Start Date:</span>
                <span class="info-value">${formatDate(rental.startDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">End Date:</span>
                <span class="info-value">${formatDate(rental.endDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Duration:</span>
                <span class="info-value">${rental.totalDays} days</span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price/Day</th>
                <th>Days</th>
                <th>Tax (GST)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${rental.product?.name || 'Rental Product'}</strong></td>
                <td>${rental.product?.category || 'General'}</td>
                <td>1</td>
                <td>${formatCurrency(pricePerDay)}</td>
                <td>${totalDays}</td>
                <td>${formatCurrency(taxAmount)}</td>
                <td><strong>${formatCurrency(subtotal)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(untaxedTotal)}</span>
              </div>
              <div class="total-row">
                <span>Tax (GST 18%):</span>
                <span>${formatCurrency(tax)}</span>
              </div>
              <div class="total-row final">
                <span>Total Amount:</span>
                <span>${formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          ${rental.notes ? `
          <div class="terms-section">
            <div class="terms-title">Special Instructions</div>
            <p>${rental.notes}</p>
          </div>
          ` : ''}
          
          <div class="terms-section">
            <div class="terms-title">Terms & Conditions</div>
            <p>${orderData.termsConditions || 'Standard terms and conditions apply for this rental agreement. Product must be returned in the same condition as received. Late returns incur additional charges of ₹100 per day. Security deposit may be required for high-value items.'}</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>SmartRent</strong> - Professional Rental Management Platform</p>
          <p>Generated on ${formatDate(new Date())} | Invoice #R${rentalId}</p>
          <p>For support: support@smartrent.com | +91 98765 43210</p>
        </div>
      </div>
    </body>
    </html>
    `;
  },

  // Generate a simple rental receipt PDF
  async generateRentalReceipt(rental) {
    console.log('[PDFService] generateRentalReceipt called for rental:', rental._id || rental.id);

    if (!rental || (!rental.id && !rental._id)) {
      throw new Error('Invalid rental object: missing id or _id');
    }

    try {
      // Return a simple text-based PDF buffer
      const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 500
>>
stream
BT
/F1 24 Tf
50 750 Td
(SMARTRENT RENTAL RECEIPT) Tj
0 -40 Td
/F1 12 Tf
(Receipt #R${String(rental._id || rental.id).slice(0, 6)}) Tj
0 -30 Td
(Customer: ${rental.userName || 'N/A'}) Tj
0 -20 Td
(Email: ${rental.userEmail || 'N/A'}) Tj
0 -30 Td
(Product: ${rental.product?.name || 'N/A'}) Tj
0 -20 Td
(Category: ${rental.product?.category || 'N/A'}) Tj
0 -30 Td
(Duration: ${rental.totalDays || 1} days) Tj
0 -20 Td
(Total Amount: ₹${Number(rental.totalPrice || 0).toLocaleString()}) Tj
0 -30 Td
(Status: ${rental.status || 'PENDING'}) Tj
0 -40 Td
(Thank you for renting with SmartRent!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
868
%%EOF
`;

      return Buffer.from(pdfContent, 'utf8');
    } catch (error) {
      console.error('[PDFService] Error generating receipt:', error.message);
      throw error;
    }
  },

  generateReceiptHTML(rental) {
    const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

    // Get rental ID safely
    const rentalId = String(rental._id || rental.id || 'UNKNOWN').slice(0, 6);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rental Receipt - R${rentalId}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333; 
          line-height: 1.6;
        }
        .receipt { 
          max-width: 600px; 
          margin: 0 auto; 
          border: 2px solid #6366f1;
          border-radius: 10px;
          overflow: hidden;
        }
        .header { 
          background: #6366f1; 
          color: white; 
          padding: 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
        }
        .header p { 
          margin: 5px 0 0 0; 
          opacity: 0.9; 
        }
        .content { 
          padding: 30px; 
        }
        .section { 
          margin-bottom: 25px; 
        }
        .section h3 { 
          color: #6366f1; 
          border-bottom: 2px solid #e5e7eb; 
          padding-bottom: 5px; 
          margin-bottom: 15px; 
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px; 
          padding: 5px 0;
        }
        .detail-label { 
          font-weight: bold; 
          color: #374151; 
        }
        .detail-value { 
          color: #6b7280; 
        }
        .product-section {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .total-section {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
        }
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #6366f1;
          text-align: center;
          margin-top: 15px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>SmartRent</h1>
          <p>Rental Receipt #R${rentalId}</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h3>Customer Details</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${rental.userName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${rental.userEmail}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Date:</span>
              <span class="detail-value">${formatDate(rental.createdAt)}</span>
            </div>
          </div>
          
          <div class="product-section">
            <h3 style="margin-top: 0; color: #1f2937;">Rented Product</h3>
            <div class="detail-row">
              <span class="detail-label">Product:</span>
              <span class="detail-value">${rental.product?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">${rental.product?.category || 'General'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Brand:</span>
              <span class="detail-value">${rental.product?.brand || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Condition:</span>
              <span class="detail-value">${rental.product?.condition || 'Good'}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Rental Period</h3>
            <div class="detail-row">
              <span class="detail-label">Start Date:</span>
              <span class="detail-value">${formatDate(rental.startDate)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">End Date:</span>
              <span class="detail-value">${formatDate(rental.endDate)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${rental.totalDays} days</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${rental.status}</span>
            </div>
          </div>
          
          <div class="total-section">
            <h3 style="margin-top: 0; color: #1f2937;">Payment Summary</h3>
            <div class="detail-row">
              <span class="detail-label">Rate per Day:</span>
              <span class="detail-value">${formatCurrency(rental.pricePerDay)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Number of Days:</span>
              <span class="detail-value">${rental.totalDays}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Subtotal:</span>
              <span class="detail-value">${formatCurrency(Number(rental.pricePerDay) * rental.totalDays)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tax (GST 18%):</span>
              <span class="detail-value">${formatCurrency(Math.round(Number(rental.pricePerDay) * rental.totalDays * 0.18))}</span>
            </div>
            <div class="total-amount">
              Total: ${formatCurrency(rental.totalPrice)}
            </div>
          </div>
          
          ${rental.notes ? `
          <div class="section">
            <h3>Special Instructions</h3>
            <p style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 0;">${rental.notes}</p>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p><strong>SmartRent</strong> - Professional Rental Management</p>
          <p>Thank you for choosing SmartRent!</p>
          <p>Support: support@smartrent.com | +91 98765 43210</p>
        </div>
      </div>
    </body>
    </html>
    `;
  },

  // Save PDF to file system (for download)
  async savePDFToFile(pdfBuffer, filename) {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);
    
    return filePath;
  }
};
