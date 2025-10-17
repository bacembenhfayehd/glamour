import createTransporter from "./emailConfig.js";
import { orderConfirmationTemplate, orderConfirmationTextTemplate } from "./emailTemplates.js";


export const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Haji cosmétiques',
        address: process.env.FROM_EMAIL
      },
      to: user.email,
      subject: `Réception de commande #${order.orderNumber}`,
      html: orderConfirmationTemplate(order, user.name),
      text: orderConfirmationTextTemplate(order, user.name)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email de confirmation envoyé avec succès:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    // On ne bloque pas la création de commande si l'email échoue
    return {
      success: false,
      error: error.message
    };
  }
};