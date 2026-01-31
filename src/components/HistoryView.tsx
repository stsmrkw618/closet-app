'use client';

import { useState } from 'react';
import { Calendar, List, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { ClothingItem, WearRecord } from '@/types';
import { useCloset } from '@/hooks/useCloset';

interface HistoryViewProps {
  clothes: ClothingItem[];
  wearHistory: WearRecord[];
  loading: boolean;
}

type ViewMode = 'list' | 'calendar';

export default function HistoryView({ clothes, wearHistory, loading }: HistoryViewProps) {
  const { removeWearRecord, getCategoryInfo } = useCloset();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const getYear = () => currentDate.getFullYear();
  const getMonth = () => currentDate.getMonth();
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getWearRecordsForDate = (dateString: string) => {
    return wearHistory.filter(h => h.date === dateString);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(getYear(), getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(getYear(), getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  const generateCalendarDays = () => {
    const year = getYear();
    const month = getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days: (number | null)[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      getMonth() === today.getMonth() &&
      getYear() === today.getFullYear()
    );
  };

  // 日付ごとにグループ化したリスト
  const groupedHistory = wearHistory.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, WearRecord[]>);

  const sortedDates = Object.keys(groupedHistory).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // ポップアップ用のデータ
  const selectedRecords = selectedDate ? getWearRecordsForDate(selectedDate) : [];

  if (wearHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
        <p className="text-zinc-500 text-sm">着用履歴がありません</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">着用履歴</h2>
        
        <div className="flex bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
            <button
              onClick={prevMonth}
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {getYear()}年 {monthNames[getMonth()]}
              </span>
              <button
                onClick={goToToday}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 border border-emerald-500/30 rounded"
              >
                今日
              </button>
            </div>
            
            <button
              onClick={nextMonth}
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-zinc-800">
            {dayNames.map((day, i) => (
              <div
                key={day}
                className={`py-1 text-center text-[10px] font-medium ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {generateCalendarDays().map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-16 sm:h-20 border-b border-r border-zinc-800/50" />;
              }

              const dateString = formatDateString(getYear(), getMonth(), day);
              const records = getWearRecordsForDate(dateString);
              const dayOfWeek = (getFirstDayOfMonth(getYear(), getMonth()) + day - 1) % 7;
              const hasRecords = records.length > 0;

              return (
                <div
                  key={day}
                  onClick={() => hasRecords && setSelectedDate(dateString)}
                  className={`h-16 sm:h-20 border-b border-r border-zinc-800/50 p-1 ${
                    isToday(day) ? 'bg-emerald-500/10' : ''
                  } ${hasRecords ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`}
                >
                  <div
                    className={`text-[10px] sm:text-xs mb-1 ${
                      isToday(day)
                        ? 'text-emerald-400 font-bold'
                        : dayOfWeek === 0
                        ? 'text-red-400'
                        : dayOfWeek === 6
                        ? 'text-blue-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    {day}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {records.slice(0, 4).map((record) => {
                      const item = clothes.find(c => c.id === record.clothing_id);
                      if (!item) return null;
                      const category = getCategoryInfo(item.category);
                      
                      return (
                        <div
                          key={record.id}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-zinc-800 overflow-hidden flex-shrink-0"
                          title={item.name}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              {category.icon}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {records.length > 4 && (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                        +{records.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">今月の着用回数</span>
              <span className="font-bold text-emerald-400">
                {wearHistory.filter(h => {
                  const date = new Date(h.date);
                  return date.getMonth() === getMonth() && date.getFullYear() === getYear();
                }).length}回
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* リスト表示 - 日付ごとにグループ化 */
        <div className="space-y-3">
          {sortedDates.map((date) => {
            const records = groupedHistory[date];
            
            return (
              <div
                key={date}
                className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-800/50">
                  <span className="text-sm font-medium">{date}</span>
                  <span className="text-xs text-zinc-500 ml-2">({records.length}着)</span>
                </div>
                <div className="p-2 flex flex-wrap gap-2">
                  {records.map((record) => {
                    const item = clothes.find((c) => c.id === record.clothing_id);
                    if (!item) return null;
                    const category = getCategoryInfo(item.category);

                    return (
                      <div
                        key={record.id}
                        className="relative group"
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-zinc-800 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {category.icon}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeWearRecord(record.id)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-500 hover:text-red-400 hover:border-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-[10px] text-zinc-400 text-center mt-1 truncate w-14 sm:w-16">
                          {item.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 日付詳細ポップアップ */}
      {selectedDate && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDate(null)}
        >
          <div 
            className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="font-bold">{selectedDate}</h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {selectedRecords.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">この日の記録はありません</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {selectedRecords.map((record) => {
                    const item = clothes.find(c => c.id === record.clothing_id);
                    if (!item) return null;
                    const category = getCategoryInfo(item.category);

                    return (
                      <div key={record.id} className="relative group">
                        <div className="aspect-square rounded-lg bg-zinc-800 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              {category.icon}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeWearRecord(record.id)}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-500 hover:text-red-400 hover:border-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-zinc-400 text-center mt-1 truncate">
                          {item.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}