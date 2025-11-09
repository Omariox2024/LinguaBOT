import React, { useState } from 'react';
import { Flashcard, Language, LanguageOption } from '../types';
import CloseIcon from './icons/CloseIcon';
import DownloadIcon from './icons/DownloadIcon';
import { LANGUAGE_OPTIONS } from '../constants';
import { NotoSansArabicRegular } from '../assets/NotoSansArabic-Regular-Base64';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
}

const FlashcardItem: React.FC<{ card: Flashcard }> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isRTL = card.language === 'ar';

  return (
    <div
      className="w-full h-48 rounded-xl p-4 flex flex-col justify-between cursor-pointer shadow-lg transition-transform transform hover:scale-105"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s' , transform: isFlipped ? 'rotateY(180deg)' : ''}}
      >
        {/* Front */}
        <div className="absolute w-full h-full bg-white rounded-xl p-4 flex flex-col justify-center items-center text-center" style={{ backfaceVisibility: 'hidden' }}>
          <p className={`text-2xl font-bold text-brand-dark ${isRTL ? 'rtl' : ''}`}>{card.word}</p>
          <p className={`text-sm text-gray-500 mt-2 italic ${isRTL ? 'rtl' : ''}`}>"{card.example}"</p>
        </div>
        
        {/* Back */}
        <div className="absolute w-full h-full bg-brand-primary text-white rounded-xl p-4 flex justify-center items-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <p className="text-2xl font-semibold">{card.translation}</p>
        </div>
      </div>
    </div>
  );
};

const FlashcardsModal: React.FC<FlashcardsModalProps> = ({ isOpen, onClose, flashcards }) => {
  const [selectedLang, setSelectedLang] = useState<Language | 'all'>('all');

  if (!isOpen) return null;

  const filteredFlashcards = selectedLang === 'all'
    ? flashcards
    : flashcards.filter(card => card.language === selectedLang);

  const handleExportPDF = () => {
    if (filteredFlashcards.length === 0 || !window.jspdf) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add the font file to the virtual file system
    doc.addFileToVFS('NotoSansArabic-Regular.ttf', NotoSansArabicRegular);
    // Add the font to jsPDF
    doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
    // Set the font for the entire document
    doc.setFont('NotoSansArabic');

    doc.setFontSize(18);
    doc.text('LinguaBot AI Flashcards', 14, 22);

    const tableColumn = ["Word", "Translation", "Example", "Language"];
    const tableRows = filteredFlashcards.map(card => [
      card.word,
      card.translation,
      card.example,
      LANGUAGE_OPTIONS.find(l => l.code === card.language)?.name || card.language,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        font: 'NotoSansArabic',
        fontStyle: 'normal',
      },
      didParseCell: (data: any) => {
        // Check if the cell text contains Arabic characters
        const isArabic = /[\u0600-\u06FF]/.test(data.cell.text[0]);
        if (isArabic) {
          data.cell.styles.halign = 'right';
        }
      },
    });

    doc.save('LinguaBot-Flashcards.pdf');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-brand-light rounded-2xl w-full max-w-xl h-[90vh] flex flex-col p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-brand-dark">Flashcards</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={filteredFlashcards.length === 0}
              title="Export to PDF"
              className="p-1 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>
            <button onClick={onClose} title="Close flashcards" className="p-1 text-gray-500 hover:text-gray-800">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex-shrink-0">
          <div className="flex space-x-2 border-b border-gray-200">
            <button onClick={() => setSelectedLang('all')} className={`px-4 py-2 text-sm font-medium ${selectedLang === 'all' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}>All</button>
            {LANGUAGE_OPTIONS.map(opt => (
              <button key={opt.code} onClick={() => setSelectedLang(opt.code)} className={`px-4 py-2 text-sm font-medium ${selectedLang === opt.code ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}>{opt.name}</button>
            ))}
          </div>
        </div>

        {filteredFlashcards.length > 0 ? (
          <div className="overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFlashcards.map(card => (
              <FlashcardItem key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
            <p className="text-lg font-semibold">No flashcards yet!</p>
            <p>New vocabulary from your conversations will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsModal;