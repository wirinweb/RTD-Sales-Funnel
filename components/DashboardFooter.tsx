import React from 'react';

const DashboardFooter: React.FC = () => {
  return (
    <footer className="mt-8 pt-4 border-t border-gray-200 text-gray-500 text-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <p><span className="font-semibold">ВК</span> – вебинарные комнаты</p>
        <p><span className="font-semibold">ДН</span> – дистанционное наблюдение</p>
        <p><span className="font-semibold">ОПО</span> – отечественное ПО</p>
        <p><span className="font-semibold">СТП</span> – сервисная тех-поддержка</p>
      </div>
    </footer>
  );
};

export default DashboardFooter;
