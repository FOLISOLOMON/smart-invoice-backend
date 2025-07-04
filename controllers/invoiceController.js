// const pool = require('../db');
// const sendEmail = require('../utils/sendEmail');

// const createInvoice = async (req, res) => {
//   try {
//     const { userId } = req;
//     const {
//       invoice_number,
//       client_name,
//       client_email,
//       date,
//       due_date,
//       subtotal,
//       tax,
//       total_amount,
//       notes,
//       items
//     } = req.body;

//     // Start transaction
//     const connection = await pool.getConnection();
//     await connection.beginTransaction();

//     try {
//       // Insert invoice
//       const [invoiceResult] = await connection.query(
//         `INSERT INTO invoices 
//         (user_id, invoice_number, client_name, client_email, date, due_date, subtotal, tax, total_amount, notes)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [userId, invoice_number, client_name, client_email, date, due_date, subtotal, tax, total_amount, notes]
//       );

//       const invoiceId = invoiceResult.insertId;

//       // Insert items
//       for (const item of items) {
//         await connection.query(
//           `INSERT INTO invoice_items 
//           (invoice_id, description, quantity, unit_price, total)
//           VALUES (?, ?, ?, ?, ?)`,
//           [invoiceId, item.description, item.quantity, item.unit_price, item.total]
//         );
//       }

//       await connection.commit();
//       connection.release();

//       res.status(201).json({ invoiceId });
//     } catch (err) {
//       await connection.rollback();
//       connection.release();
//       throw err;
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error creating invoice' });
//   }
// };

// const getAllInvoices = async (req, res) => {
//   try {
//     const { userId } = req;

//     const {invoices} = await pool.query(
//       'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
//       [userId]
//     );

//     res.json(invoices);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error fetching invoices' });
//   }
// };

// const getInvoice = async (req, res) => {
//   try {
//     const { userId } = req;
//     const { id } = req.params;

//     // Get invoice
//     const [invoices] = await pool.query(
//       'SELECT * FROM invoices WHERE id = ? AND user_id = ?',
//       [id, userId]
//     );

//     if (invoices.length === 0) {
//       return res.status(404).json({ message: 'Invoice not found' });
//     }

//     const invoice = invoices[0];

//     // Get items
//     const [items] = await pool.query(
//       'SELECT * FROM invoice_items WHERE invoice_id = ?',
//       [id]
//     );

//     res.json({ ...invoice, items });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error fetching invoice' });
//   }
// };

// const sendInvoice = async (req, res) => {
//   try {
//     const { userId } = req;
//     const { id } = req.params;

//     // Get invoice with items
//     const [invoices] = await pool.query(
//       'SELECT * FROM invoices WHERE id = ? AND user_id = ?',
//       [id, userId]
//     );

//     if (invoices.length === 0) {
//       return res.status(404).json({ message: 'Invoice not found' });
//     }

//     const invoice = invoices[0];

//     const [items] = await pool.query(
//       'SELECT * FROM invoice_items WHERE invoice_id = ?',
//       [id]
//     );

//     // Get user business name
//     const [users] = await pool.query(
//       'SELECT business_name FROM users WHERE id = ?',
//       [userId]
//     );

//     const businessName = users[0].business_name;

//     // Prepare email
//     const emailSubject = `Invoice #${invoice.invoice_number} from ${businessName}`;
    
//     let emailBody = `
//       <h1>Invoice #${invoice.invoice_number}</h1>
//       <p>From: ${businessName}</p>
//       <p>To: ${invoice.client_name}</p>
//       <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
//       <p>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
//       <hr>
//       <h2>Items:</h2>
//       <table border="1" cellpadding="5" cellspacing="0">
//         <thead>
//           <tr>
//             <th>Description</th>
//             <th>Quantity</th>
//             <th>Unit Price</th>
//             <th>Total</th>
//           </tr>
//         </thead>
//         <tbody>
//     `;

//  items.forEach(item => {
//   emailBody += `
//     <tr>
//       <td>${item.description}</td>
//       <td>${item.quantity}</td>
//       <td>$${Number(item.unit_price || 0).toFixed(2)}</td>
//       <td>$${Number(item.total || 0).toFixed(2)}</td>
//     </tr>
//   `;
// });

//     emailBody += `
//         </tbody>
//       </table>
//       <hr>
//       <p>Subtotal: $${Number(invoice.subtotal || 0).toFixed(2)}</p>
//       <p>Tax: $${Number(invoice.tax || 0).toFixed(2)}</p>
//       <h3>Total Amount: $${Number(invoice.tax || 0).toFixed(2)}</h3>
//       ${invoice.notes ? `<p>Notes: ${invoice.notes}</p>` : ''}
//     `;

//     // Send email
//     await sendEmail({
//       to: invoice.client_email,
//       subject: emailSubject,
//       html: emailBody
//     });

//     res.json({ message: 'Invoice sent successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error sending invoice' });
//   }
// };

// module.exports = { createInvoice, getAllInvoices, getInvoice, sendInvoice };




const pool = require('../db');

// Create a new invoice with items
const createInvoice = async (req, res) => {
  const userId = req.userId;
  const {
    invoice_number,
    client_name,
    client_email,
    date,
    due_date,
    subtotal,
    tax,
    total_amount,
    notes,
    items
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert invoice
    const { rows: invoiceRows } = await client.query(
      `INSERT INTO invoices 
        (user_id, invoice_number, client_name, client_email, date, due_date, subtotal, tax, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [userId, invoice_number, client_name, client_email, date, due_date, subtotal, tax, total_amount, notes]
    );

    const invoiceId = invoiceRows[0].id;

    // Insert invoice items
    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items 
          (invoice_id, description, quantity, unit_price, total)
         VALUES ($1, $2, $3, $4, $5)`,
        [invoiceId, item.description, item.quantity, item.unit_price, item.total]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ invoiceId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating invoice:', err);
    res.status(500).json({ message: 'Error creating invoice' });
  } finally {
    client.release();
  }
};

// Get all invoices for the logged-in user
const getAllInvoices = async (req, res) => {
  const userId = req.userId;

  try {
    const { rows: invoices } = await pool.query(
      'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

// Get a single invoice with its items
const getInvoice = async (req, res) => {
  const userId = req.userId;
  const invoiceId = req.params.id;

  try {
    const { rows: invoices } = await pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [invoiceId, userId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    const { rows: items } = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [invoiceId]
    );

    res.json({ invoice, items });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};

// Send invoice (e.g., prepare email data)
const sendInvoice = async (req, res) => {
  const userId = req.userId;
  const invoiceId = req.params.id;

  try {
    // Fetch invoice
    const { rows: invoices } = await pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [invoiceId, userId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    // Fetch invoice items
    const { rows: items } = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [invoiceId]
    );

    // Fetch business name
    const { rows: users } = await pool.query(
      'SELECT business_name FROM users WHERE id = $1',
      [userId]
    );

    const businessName = users.length > 0 ? users[0].business_name : 'Your Business';

    res.json({
      invoice,
      items,
      businessName
    });
  } catch (err) {
    console.error('Error sending invoice:', err);
    res.status(500).json({ message: 'Error preparing invoice to send' });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoice,
  sendInvoice
};
