import React, { useState, useEffect, useRef, useMemo } from 'react';
import { type FunnelStage } from './types';
import Header from './components/Header';
import FunnelTable from './components/FunnelTable';
import DashboardFooter from './components/DashboardFooter';
import Toast from './components/Toast';
import AnalysisModal from './components/AnalysisModal';
import { analyzeFunnelData } from './services/geminiService';
import * as XLSX from 'xlsx';

const INITIAL_FUNNEL_DATA: FunnelStage[] = [
  {
    status: 'Законтрактовано',
    quantity: 7,
    regions: ['Астраханская область', 'Республика Марий Эл', 'Курганская область (СТП)', 'Свердловская область (СТП)', 'Московская область', 'ЯНАО (СТП)', 'Нижегородская область'],
    bgColorClass: 'bg-green-50',
  },
  {
    status: 'Бюджет заложен',
    quantity: 4,
    regions: ['Кировская область', 'Республика Алтай', 'Курганская область (ОПО)', 'Республика Бурятия'],
    bgColorClass: 'bg-white',
  },
  {
    status: 'В работе',
    quantity: 12,
    regions: ['Владимирская область', 'Омская область', 'Республика Мордовия', 'Забайкальский край', 'Оренбургская область', 'Свердловская область (ДН+ВК)', 'Калужская область', 'Республика Дагестан', 'ХМАО', 'Новгородская область', 'Республика Коми', 'Чувашская Республика'],
    bgColorClass: 'bg-gray-50',
  },
  {
    status: 'Уточнение потребности',
    quantity: 11,
    regions: ['Алтайский край', 'Пензенская область', 'Республика Крым', 'Иркутская область', 'Пермский край', 'Республика Саха (Якутия)', 'ЛНР', 'Рязанская область', 'Республика Башкортостан', 'Московская область (ДН)', 'Республика Карелия', 'ЯНАО (ДН)'],
    bgColorClass: 'bg-white',
  },
  {
    status: 'Потенциальные регионы с ЕЦП',
    quantity: 6,
    regions: ['Вологодская область', 'Республика Адыгея', 'Кабардино-Балкарская Республика', 'Удмуртская Республика', 'Красноярский край', 'Республика Хакасия'],
    bgColorClass: 'bg-gray-50',
  },
    {
    status: 'Регионов в работе',
    quantity: 40,
    regions: [],
    bgColorClass: 'bg-white',
  },
];

const transformData = (data: any[]): FunnelStage[] => {
    const stageMap: { [key: string]: { regions: string[], quantity: number } } = {};

    data.forEach(row => {
        const status = row['Статус сделки'] || row.status || row.Статус;
        const region = row['Субъект РФ'] || row.region || row.Регион;

        if (!status || !region || typeof region !== 'string' || region.trim() === '') return;

        // Remove leading number and trim, e.g., "3. Законтрактовано" -> "Законтрактовано"
        const cleanedStatus = status.toString().replace(/^\d+\.\s*/, '').trim();

        if (!stageMap[cleanedStatus]) {
            stageMap[cleanedStatus] = { regions: [], quantity: 0 };
        }
        stageMap[cleanedStatus].regions.push(region);
        stageMap[cleanedStatus].quantity++;
    });

    // Define a logical order for funnel stages
    const statusOrder: { [key: string]: number } = {
        'Законтрактовано': 1,
        'Акт подписан': 2,
        'Бюджет заложен': 3,
        'В работе': 4,
        'Уточнение потребности': 5,
        'Потенциальные регионы с ЕЦП': 6
    };

    // Convert map to array and sort
    const sortedStages = Object.keys(stageMap)
        .map(status => ({ status, ...stageMap[status] }))
        .sort((a, b) => {
            const orderA = statusOrder[a.status] || 99; // Stages not in the order list go to the bottom
            const orderB = statusOrder[b.status] || 99;
            return orderA - orderB;
        });

    let totalRegionsInWork = 0;
    const transformed = sortedStages.map((stage, index) => {
        totalRegionsInWork += stage.quantity;
        let bgColorClass = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        if (stage.status === 'Законтрактовано') {
            bgColorClass = 'bg-green-50';
        }
        return {
            status: stage.status,
            quantity: stage.quantity,
            regions: stage.regions,
            bgColorClass: bgColorClass
        };
    });

    transformed.push({
        status: 'Регионов в работе',
        quantity: totalRegionsInWork,
        regions: [],
        bgColorClass: transformed.length % 2 === 0 ? 'bg-gray-50' : 'bg-white'
    });

    return transformed;
};

const App: React.FC = () => {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>(INITIAL_FUNNEL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const recognitionRef = useRef<any>(null);

  // State for sorting regions
  const [regionSortOrder, setRegionSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  // State for Gemini Analysis Modal
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Ваш браузер не поддерживает распознавание речи.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setToast({ message: 'Ошибка распознавания речи.', type: 'error' });
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const processVoiceCommand = (command: string) => {
    const lowerCaseCommand = command.toLowerCase();
    console.log(`Command received: ${lowerCaseCommand}`);

    if (lowerCaseCommand.includes('обновить') || lowerCaseCommand.includes('обнови')) {
      handleRefresh();
      setToast({ message: 'Данные обновлены.', type: 'success' });
    } else if (lowerCaseCommand.includes('скачать') || lowerCaseCommand.includes('сохранить')) {
      handleDownloadCsv();
      setToast({ message: 'Загрузка CSV начата.', type: 'success' });
    } else if (lowerCaseCommand.includes('загрузить') || lowerCaseCommand.includes('загрузи')) {
      setToast({ message: "Нажмите кнопку 'XLSX/CSV' для выбора файла.", type: 'info' });
    } else {
      setToast({ message: `Команда не распознана: "${command}"`, type: 'error' });
    }
  };


  const handleDataUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setRegionSortOrder('none'); // Reset sort order on new data
    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    reader.onerror = () => {
        setError('Не удалось прочитать файл.');
        setIsLoading(false);
    };

    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            if (!data) throw new Error('Файл пуст или не может быть прочитан.');
            
            let workbook;
            if (fileExtension === 'csv') {
                workbook = XLSX.read(data, { type: 'string', raw: true });
            } else {
                workbook = XLSX.read(data, { type: 'binary' });
            }

            const targetSheetName = (fileExtension === 'xlsx' || fileExtension === 'xls') ? 'TDSheet' : workbook.SheetNames[0];
            const worksheet = workbook.Sheets[targetSheetName];

            if (!worksheet) {
                throw new Error(`Лист с названием "${targetSheetName}" не найден в файле.`);
            }
            const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Find header row and indices for required columns
            let headerRowIndex = -1;
            let statusIndex = -1;
            let regionIndex = -1;
            const statusAliases = ['статус сделки', 'статус', 'status'];
            const regionAliases = ['субъект рф', 'регион', 'region'];

            for(let i = 0; i < sheetData.length; i++) {
                const row = sheetData[i];
                if (!Array.isArray(row)) continue;

                const tempStatusIndex = row.findIndex(cell => typeof cell === 'string' && statusAliases.includes(cell.toLowerCase().trim()));
                const tempRegionIndex = row.findIndex(cell => typeof cell === 'string' && regionAliases.includes(cell.toLowerCase().trim()));
                
                if(tempStatusIndex !== -1 && tempRegionIndex !== -1) {
                    headerRowIndex = i;
                    statusIndex = tempStatusIndex;
                    regionIndex = tempRegionIndex;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                throw new Error('Не найдены обязательные колонки "Статус сделки" и "Субъект РФ".');
            }

            const jsonData = sheetData.slice(headerRowIndex + 1).map(row => ({
                'Статус сделки': row[statusIndex],
                'Субъект РФ': row[regionIndex]
            })).filter(item => item['Статус сделки'] && item['Субъект РФ']);

            setFunnelData(transformData(jsonData));
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Неверный формат файла.';
            setError(`Не удалось обработать файл. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        reader.readAsBinaryString(file);
    } else if (fileExtension === 'csv') {
        reader.readAsText(file, 'UTF-8');
    } else {
        setError('Неподдерживаемый формат файла. Пожалуйста, выберите XLSX или CSV.');
        setIsLoading(false);
    }

    event.target.value = ''; // Reset file input
  };
  
  const handleRefresh = () => {
    setFunnelData(INITIAL_FUNNEL_DATA);
    setError(null);
    setRegionSortOrder('none'); // Reset sort order
  };

  const handleDownloadCsv = () => {
    if (!funnelData || funnelData.length === 0) {
        setError("Нет данных для скачивания.");
        return;
    }

    const headers = ['"Статус"', '"Регион"'];
    const rows = [headers.join(',')];

    funnelData.forEach(stage => {
        if (stage.regions.length > 0) {
            stage.regions.forEach(region => {
                const status = `"${stage.status.replace(/"/g, '""')}"`;
                const regionName = `"${region.replace(/"/g, '""')}"`;
                rows.push([status, regionName].join(','));
            });
        }
    });

    if (rows.length <= 1) {
        setError("Нет регионов для экспорта в CSV.");
        return;
    }
    
    // Add BOM for UTF-8 to ensure Excel opens Cyrillic characters correctly
    const bom = '\uFEFF';
    const csvContent = bom + rows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "funnel_data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleAnalyze = async () => {
    if (funnelData.length === 0) {
      setToast({ message: "Нет данных для анализа.", type: 'info' });
      return;
    }
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeFunnelData(funnelData);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      setAnalysisError("Не удалось получить анализ. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSortRegions = () => {
    setRegionSortOrder(currentOrder => {
      if (currentOrder === 'none') return 'asc';
      if (currentOrder === 'asc') return 'desc';
      return 'none';
    });
  };

  const sortedFunnelData = useMemo(() => {
    if (regionSortOrder === 'none') {
        return funnelData;
    }
    return funnelData.map(stage => ({
        ...stage,
        regions: [...stage.regions].sort((a, b) => {
            if (regionSortOrder === 'asc') {
                return a.localeCompare(b, 'ru', { sensitivity: 'base' });
            } else { // 'desc'
                return b.localeCompare(a, 'ru', { sensitivity: 'base' });
            }
        })
    }));
  }, [funnelData, regionSortOrder]);

  return (
    <div className="text-gray-800 p-4 sm:p-6 lg:p-8">
      <Toast message={toast?.message} type={toast?.type} on_close={() => setToast(null)} />
      <AnalysisModal 
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        isLoading={isAnalyzing}
        analysisResult={analysisResult}
        error={analysisError}
      />
      <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <Header 
            onDataUpdate={handleDataUpdate} 
            onRefresh={handleRefresh} 
            onDownloadCsv={handleDownloadCsv} 
            onAnalyze={handleAnalyze}
            isLoading={isLoading || isAnalyzing} 
            isListening={isListening} 
            onToggleListening={handleToggleListening} 
        />
        {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Ошибка: </strong>
                <span className="block sm:inline">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </span>
            </div>
        )}
        <main className="mt-6 sm:mt-8">
          <FunnelTable 
            data={sortedFunnelData} 
            isLoading={isLoading} 
            onSortRegions={handleSortRegions}
            sortOrder={regionSortOrder}
          />
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default App;