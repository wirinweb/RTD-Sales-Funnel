import React, { useEffect, useRef } from 'react';
import MarkdownIt from 'markdown-it';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    analysisResult: string | null;
    error: string | null;
}

const md = new MarkdownIt();

const Loader: React.FC = () => (
    <div className="flex items-center justify-center flex-col gap-4 text-center">
        <svg className="animate-spin h-10 w-10 text-[#1C7AF6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-semibold text-gray-700">Gemini анализирует данные... <br/> Это может занять несколько секунд.</p>
    </div>
);

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, analysisResult, error }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);
    
    useEffect(() => {
        if(isOpen){
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-[#0A2D6E]">Анализ воронки продаж от Gemini</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main className="p-6 overflow-y-auto">
                    {isLoading ? (
                       <Loader />
                    ) : error ? (
                        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg">Произошла ошибка</h3>
                            <p>{error}</p>
                        </div>
                    ) : (
                        analysisResult && (
                           <div 
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: md.render(analysisResult) }}
                            />
                        )
                    )}
                </main>
                 <footer className="p-4 bg-gray-50 border-t border-gray-200 text-right rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-[#1C7AF6] text-white font-semibold rounded-lg shadow-sm hover:bg-[#155cb0] transition-colors"
                    >
                        Закрыть
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AnalysisModal;
