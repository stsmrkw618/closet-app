'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ClothingItem, ViewType, CategoryId, SortType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCloset } from '@/hooks/useCloset';
import LoginScreen from '@/components/LoginScreen';
import Header from '@/components/Header';
import ClosetView from '@/components/ClosetView';
import HistoryView from '@/components/HistoryView';
import AddForm from '@/components/AddForm';
import DetailView from '@/components/DetailView';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { clothes, wearHistory, loading: dataLoading, addItem, deleteItem, error } = useCloset();
  
  const [view, setView] = useState<ViewType>('closet');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('lastWorn');
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleSelectItem = (item: ClothingItem) => {
    setSelectedItem(item);
    setView('detail');
  };

  const handleAddItem = async (
    item: {
      name: string;
      category: CategoryId;
      color: string;
      notes: string;
    },
    imageFile: File | null
  ) => {
    const result = await addItem(item, imageFile);
    if (result) {
      setView('closet');
    }
  };

  const handleDeleteItem = async () => {
    if (selectedItem) {
      const success = await deleteItem(selectedItem.id);
      if (success) {
        setSelectedItem(null);
        setView('closet');
      }
    }
  };

  const handleUpdateItem = (updatedItem: ClothingItem) => {
    setSelectedItem(updatedItem);
  };

  const handleNavigate = (newView: ViewType) => {
    setView(newView);
    if (newView !== 'detail') {
      setSelectedItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      <Header
        totalItems={clothes.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showFilters={view === 'closet'}
      />

      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <main className="px-4 py-4">
        {view === 'closet' && (
          <ClosetView
            clothes={clothes}
            searchQuery={searchQuery}
            filterCategory={filterCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onSelectItem={handleSelectItem}
            onAddClick={() => setView('add')}
            loading={dataLoading}
          />
        )}

        {view === 'history' && (
          <HistoryView 
            clothes={clothes} 
            wearHistory={wearHistory} 
            loading={dataLoading}
          />
        )}

        {view === 'add' && (
          <AddForm onAdd={handleAddItem} onClose={() => setView('closet')} />
        )}

        {view === 'detail' && selectedItem && (
          <DetailView
            item={selectedItem}
            onBack={() => {
              setSelectedItem(null);
              setView('closet');
            }}
            onDelete={handleDeleteItem}
            onUpdate={handleUpdateItem}
          />
        )}
      </main>

      <BottomNav currentView={view} onNavigate={handleNavigate} />
    </div>
  );
}