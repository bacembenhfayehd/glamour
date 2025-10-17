export const orderConfirmationTemplate = (order, userName) => {
  const deliveryTypeText = {
    'delivery': 'Livraison à domicile',
    'pickup': 'Retrait en magasin',
    'in_store': 'Consommation sur place'
  };

  const paymentMethodText = {
    'cash_on_delivery': 'Paiement à la livraison',
    'bank_transfer': 'Virement bancaire'
  };

  const itemsHtml = order.items.map(item => `
    <tr>
      <td class="item-name">${item.name}</td>
      <td class="item-quantity">${item.quantity}</td>
      <td class="item-price">${item.price.toFixed(3)} TND</td>
      <td class="item-subtotal">${item.subtotal.toFixed(3)} TND</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réception de commande</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f9fafb;
        }
        
        .container {
          max-width: 650px;
          margin: 0 auto;
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        
        /* Header */
        .header {
          background: linear-gradient(135deg, #047857 0%, #065f46 100%);
          color: white;
          padding: 32px;
          text-align: center;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .header p {
          margin: 12px 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        
        /* Content */
        .content {
          padding: 32px;
        }
        
        /* Greeting */
        .greeting {
          margin-bottom: 28px;
        }
        
        .greeting h2 {
          color: #047857;
          margin: 0 0 12px;
          font-size: 22px;
          font-weight: 600;
        }
        
        .greeting p {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }
        
        /* Order Info */
        .order-info {
          background-color: #f9fafb;
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 28px;
          border: 1px solid #e5e7eb;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .info-item strong {
          color: #047857;
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
        }
        
        .info-item span {
          font-size: 16px;
          color: #374151;
        }
        
        .order-number {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        
        /* Shipping Address */
        .shipping-address {
          background-color: #f0fdf4;
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 28px;
          border-left: 4px solid #047857;
        }
        
        .shipping-address h3 {
          margin: 0 0 16px;
          color: #047857;
          font-size: 18px;
          font-weight: 600;
        }
        
        .shipping-address p {
          margin: 0;
          line-height: 1.8;
          color: #374151;
        }
        
        .payment-method {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #a7f3d0;
        }
        
        .payment-method strong {
          color: #047857;
        }
        
        /* Items Table */
        .items-section {
          margin-bottom: 28px;
        }
        
        .items-section h3 {
          color: #047857;
          margin: 0 0 16px;
          font-size: 20px;
          font-weight: 600;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .items-table thead tr {
          background: linear-gradient(135deg, #047857, #065f46);
          color: white;
        }
        
        .items-table th {
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 15px;
        }
        
        .items-table th:nth-child(2),
        .items-table th:nth-child(3),
        .items-table th:nth-child(4) {
          text-align: center;
        }
        
        .items-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .item-name {
          color: #374151;
        }
        
        .item-quantity {
          text-align: center;
          color: #6b7280;
        }
        
        .item-price, .item-subtotal {
          text-align: right;
          color: #374151;
          font-weight: 500;
        }
        
        /* Total Section */
        .total-section {
          background: linear-gradient(135deg, #f9fafb, #f0fdf4);
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 32px;
          border: 1px solid #d1fae5;
        }
        
        .total-content {
          text-align: right;
        }
        
        .shipping-cost {
          margin-bottom: 12px;
          font-size: 16px;
          color: #6b7280;
        }
        
        .shipping-cost span {
          font-weight: 600;
          color: #374151;
        }
        
        .total-amount {
          font-size: 22px;
          font-weight: 700;
          color: #047857;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #d1fae5;
        }
        
        /* Notes */
        .notes {
          background-color: #f0fdf4;
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 28px;
          border-left: 4px solid #10b981;
        }
        
        .notes h4 {
          margin: 0 0 12px;
          color: #047857;
          font-size: 17px;
        }
        
        .notes p {
          margin: 0;
          font-style: italic;
          color: #6b7280;
        }
        
        /* Next Steps */
        .next-steps {
          background-color: #f0fdf4;
          border-radius: 10px;
          padding: 24px;
          border-left: 4px solid #10b981;
        }
        
        .next-steps h4 {
          margin: 0 0 16px;
          color: #047857;
          font-size: 17px;
        }
        
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }
        
        .next-steps li {
          margin-bottom: 8px;
        }
        
        /* Footer */
        .footer {
          background-color: #1f2937;
          color: white;
          padding: 28px;
          text-align: center;
        }
        
        .footer p {
          margin: 0 0 12px;
          font-size: 16px;
        }
        
        .footer .contact {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }
        
        @media (max-width: 650px) {
          .info-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .items-table {
            font-size: 14px;
          }
          
          .items-table th, 
          .items-table td {
            padding: 12px 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header -->
        <div class="header">
          <h1>Réception de commande</h1>
          <p>Merci pour votre confiance !</p>
        </div>

        <!-- Content -->
        <div class="content">
          
          <!-- Greeting -->
          <div class="greeting">
            <h2>Bonjour ${userName},</h2>
            <p>Nous avons reçu votre commande . Voici les détails :</p>
          </div>

          <!-- Order Info -->
          <div class="order-info">
            <div class="info-grid">
              <div class="info-item">
                <strong>Numéro de commande :</strong>
                <span class="order-number">${order.orderNumber}</span>
              </div>
              <div class="info-item">
                <strong>Date :</strong>
                <span>${new Date(order.orderDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="info-item">
                <strong>Type de service :</strong>
                <span>${deliveryTypeText[order.deliveryType]}</span>
              </div>
              <div class="info-item">
                <strong>Téléphone :</strong>
                <span>${order.phone}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Address (si delivery) -->
          ${order.deliveryType === 'delivery' && order.shippingAddress ? `
            <div class="shipping-address">
              <h3>📍 Adresse de livraison</h3>
              <p>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city} ${order.shippingAddress.postalCode}
              </p>
              ${order.paymentMethod ? `
                <div class="payment-method">
                  <strong>Mode de paiement :</strong> ${paymentMethodText[order.paymentMethod]}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Items Table -->
          <div class="items-section">
            <h3>📦 Articles commandés</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Qté</th>
                  <th>Prix unit.</th>
                  <th>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total Section -->
          <div class="total-section">
            <div class="total-content">
              ${order.shippingCost > 0 ? `
                <div class="shipping-cost">
                  <span>Frais de livraison : </span>
                  <span>${order.shippingCost.toFixed(3)} TND</span>
                </div>
              ` : ''}
              <div class="total-amount">
                <span>Total : ${order.totalAmount.toFixed(3)} TND</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          ${order.notes ? `
            <div class="notes">
              <h4>💬 Notes :</h4>
              <p>${order.notes}</p>
            </div>
          ` : ''}

          <!-- Next Steps -->
          <div class="next-steps">
            <h4>✅ Prochaines étapes :</h4>
            <ul>
              <li>Votre commande sera traitée dans les plus brefs délais</li>
              <li>N'hésitez pas à nous contacter pour toute question</li>
            </ul>
          </div>

        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Merci de votre confiance !</p>
          <p class="contact">Pour toute question, contactez-nous à : contact@hajicosmetiques.com</p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

export const orderConfirmationTextTemplate = (order, userName) => {
  const deliveryTypeText = {
    'delivery': 'Livraison à domicile',
    'pickup': 'Retrait en magasin', 
    'in_store': 'Consommation sur place'
  };

  const paymentMethodText = {
    'cash_on_delivery': 'Paiement à la livraison',
    'bank_transfer': 'Virement bancaire'
  };

  let itemsList = order.items.map(item => 
    `- ${item.name} (x${item.quantity}) : ${item.subtotal.toFixed(3)} TND`
  ).join('\n');

  let addressText = '';
  if (order.deliveryType === 'delivery' && order.shippingAddress) {
    addressText = `
Adresse de livraison :
${order.shippingAddress.street}
${order.shippingAddress.city} ${order.shippingAddress.postalCode}
${order.paymentMethod ? `Mode de paiement : ${paymentMethodText[order.paymentMethod]}` : ''}
`;
  }

  return `
Confirmation de commande

Bonjour ${userName},

Votre commande a été confirmée avec succès !

DÉTAILS DE LA COMMANDE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Numéro de commande : ${order.orderNumber}
Date : ${new Date(order.orderDate).toLocaleDateString('fr-FR')}
Type de service : ${deliveryTypeText[order.deliveryType]}
Téléphone : ${order.phone}
${addressText}
ARTICLES COMMANDÉS :
${itemsList}
${order.shippingCost > 0 ? `\nFrais de livraison : ${order.shippingCost.toFixed(3)} TND` : ''}

TOTAL : ${order.totalAmount.toFixed(3)} TND

${order.notes ? `Notes : ${order.notes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROCHAINES ÉTAPES :
• Votre commande sera traitée dans les plus brefs délais
• Vous recevrez un email de confirmation d'expédition
• N'hésitez pas à nous contacter pour toute question

Merci de votre confiance !

Support : contact@hajicosmetiques.com
  `;
};