import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOrderEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn('Resend API Key missing. Skipping email dispatch.');
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Livo Homes <orders@livohomes.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Email Dispatch Error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Email Dispatch Fatal Error:', error);
    return null;
  }
}

export const getOrderEmailTemplate = (order: any, status: string) => {
  const statusMsg = {
    pending: 'Your procurement has been logged in our system.',
    confirmed: 'Your architectural request has been verified and confirmed.',
    shipped: 'Your order is currently in transit to your site.',
    delivered: 'Your procurement has been successfully delivered.',
    cancelled: 'Your procurement request has been withdrawn.',
  }[status.toLowerCase()] || 'Your order status has been updated.';

  return `
    <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h1 style="font-weight: 900; letter-spacing: -1px; border-bottom: 2px solid #111; padding-bottom: 20px;">LIVO HOMES</h1>
      <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #666; letter-spacing: 2px;">Procurement Manifest: #LIVO-${order.id.slice(-6).toUpperCase()}</p>
      
      <h2 style="margin-top: 40px;">Status Update: <span style="color: #BA9D61;">${status.toUpperCase()}</span></h2>
      <p style="font-size: 16px; line-height: 1.6; color: #444;">${statusMsg}</p>
      
      <div style="background: #f9f9f9; padding: 30px; margin-top: 40px;">
        <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase;">Inventory Details</h3>
        <p><strong>Total Valuation:</strong> ₹${order.total_amount.toLocaleString()}</p>
        <p><strong>Shipping Mode:</strong> Standard Logistics</p>
      </div>

      <p style="margin-top: 40px; font-size: 12px; color: #999;">If you have any questions, please contact our principal desk.</p>
      <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 10px; color: #bbb; text-transform: uppercase;">
        © 2026 Livo Homes | Your Home, Your Style.
      </footer>
    </div>
  `;
};
