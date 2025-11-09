
import { Conversation } from '../types';
import { LANGUAGE_OPTIONS } from '../constants';
import { NotoSansArabicRegular } from '../assets/NotoSansArabic-Regular-Base64';

// A utility function to add text and handle page breaks
const addTextWithPageBreaks = (doc: any, text: string, options: any, currentY: { y: number }, lineHeight = 7, marginBottom = 20) => {
  const pageHeight = doc.internal.pageSize.height;
  const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - options.x * 2);
  
  if (currentY.y + lines.length * lineHeight > pageHeight - marginBottom) {
    doc.addPage();
    currentY.y = marginBottom;
  }
  
  doc.text(lines, options.x, currentY.y, { align: options.align });
  currentY.y += lines.length * lineHeight;
};


export const exportConversationToPDF = (conversation: Conversation) => {
  if (!conversation.messages.length || !window.jspdf) {
    console.error("No messages to export or jsPDF not loaded.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.addFileToVFS('NotoSansArabic-Regular.ttf', NotoSansArabicRegular);
  doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
  doc.setFont('NotoSansArabic');

  const langName = LANGUAGE_OPTIONS.find(l => l.code === conversation.language)?.name || 'Unknown';
  const conversationDate = new Date(conversation.startTime).toLocaleString();

  doc.setFontSize(18);
  doc.text('LinguaBot AI Conversation', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Language: ${langName}`, 14, 30);
  doc.text(`Date: ${conversationDate}`, 14, 36);

  const currentY = { y: 50 };
  const margin = 14;
  const isRTL = conversation.language === 'ar';
  
  conversation.messages.forEach(msg => {
    const isUser = msg.sender === 'user';
    const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const senderPrefix = isUser ? 'You' : 'LinguaBot';
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    const senderText = `${senderPrefix} (${timestamp})`;
    addTextWithPageBreaks(doc, senderText, { x: margin }, currentY, 5);
    currentY.y += 2;

    doc.setFontSize(11);
    doc.setTextColor(0);
    const textOptions: { x: number, align?: 'right' } = { x: margin };
    if (isRTL) {
        textOptions.x = doc.internal.pageSize.width - margin;
        textOptions.align = 'right';
    }
    addTextWithPageBreaks(doc, msg.text, textOptions, currentY);

    if (msg.correction) {
      currentY.y += 3;
      doc.setFontSize(9);
      doc.setTextColor(220, 53, 69); // Red
      addTextWithPageBreaks(doc, 'Correction:', { x: margin }, currentY, 5);
      
      doc.setFontSize(10);
      doc.setFont('NotoSansArabic', 'italic');
      doc.setTextColor(100);
      const correctionTextOptions = { x: margin + 2, ... (isRTL ? {align: 'right' as const, x: doc.internal.pageSize.width - margin - 2} : {}) };
      addTextWithPageBreaks(doc, `"${msg.correction.correctedText}"`, correctionTextOptions, currentY);
      
      doc.setFont('NotoSansArabic', 'normal');
      doc.setTextColor(100);
      // Explanation is assumed to be LTR
      addTextWithPageBreaks(doc, msg.correction.explanation, { x: margin + 2 }, currentY);
    }
    
    currentY.y += 10; // Space between messages
  });

  const fileName = `LinguaBot-Conversation-${new Date(conversation.startTime).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
