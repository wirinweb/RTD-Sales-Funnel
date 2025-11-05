import React from 'react';
import { type FunnelStage } from '../types';

interface FunnelTableProps {
  data: FunnelStage[];
  isLoading: boolean;
  onSortRegions: () => void;
  sortOrder: 'none' | 'asc' | 'desc';
}

const Loader: React.FC = () => (
    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
      <div className="flex items-center gap-2 text-xl font-semibold text-[#0A2D6E]">
        <svg className="animate-spin h-6 w-6 text-[#1C7AF6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Обновление данных...</span>
      </div>
    </div>
);

const SortIcon: React.FC<{ order: 'none' | 'asc' | 'desc' }> = ({ order }) => {
    const iconClasses = "w-4 h-4 ml-2 text-white opacity-70";
    if (order === 'asc') {
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={iconClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>;
    }
    if (order === 'desc') {
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={iconClasses}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
    }
    // 'none'
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconClasses}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
    );
};


const FunnelTable: React.FC<FunnelTableProps> = ({ data, isLoading, onSortRegions, sortOrder }) => {
  return (
    <div className="relative">
      {isLoading && <Loader />}
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${isLoading ? 'opacity-50' : ''} transition-opacity duration-300`}>
        {/* Table Header */}
        <div className="flex items-center bg-[#1C7AF6] text-white font-bold p-4">
          <div className="w-1/4 sm:w-1/5">Статус</div>
          <div className="w-1/6 sm:w-[10%] text-center">Количество</div>
          <button onClick={onSortRegions} className="flex-1 flex items-center hover:opacity-80 transition-opacity text-left">
            <span>Регионы</span>
            <SortIcon order={sortOrder} />
          </button>
        </div>

        {/* Table Body */}
        <div>
          {data.map((stage, index) => (
            <div key={index} className={`flex items-start p-4 border-t border-gray-200 ${stage.bgColorClass}`}>
              <div className="w-1/4 sm:w-1/5 font-semibold text-gray-700 pt-1">
                {stage.status}
              </div>
              <div className="w-1/6 sm:w-[10%] flex justify-center pt-1">
                <span className="flex items-center justify-center w-10 h-10 bg-[#FF4D6D] text-white font-bold text-lg rounded-full">
                  {stage.quantity}
                </span>
              </div>
              <div className="flex-1">
                {stage.regions.length > 0 ? (
                  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1 text-gray-600">
                    {stage.regions.map((region, regionIndex) => (
                      <li key={regionIndex} className="flex items-start">
                        <span className="text-[#1C7AF6] mr-2 mt-1">•</span>
                        <span>{region}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <div className="h-10"></div> // Placeholder for empty regions to maintain row height
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunnelTable;