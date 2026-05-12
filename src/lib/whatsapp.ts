export const WHATSAPP_NUMBER = '9072123001';

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getProductInquiryMessage(productName: string, productPrice: number, productId: string): string {
  return `Hello Livo Homes! I am interested in inquiring about the following product:
  
Product: ${productName}
Price: ₹${productPrice.toLocaleString()}
ID: ${productId}

Please provide more details.`;
}

export const DEFAULT_INQUIRY_MESSAGE = "Hello Livo Homes! I'm interested in your architectural collection. Could you please provide more information?";
