'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ListManager } from '@/components/ListManager';
import { useStudentData } from '@/context/StudentDataContext';
import { QuestionList } from '@/types';

export default function ListasPage() {
  const router = useRouter();
  const {
    folders,
    lists,
    createFolder,
    renameFolder,
    deleteFolder,
    createListWithFilters,
    editList,
    deleteList
  } = useStudentData();

  const handleContinueList = (list: QuestionList) => {
    router.push(`/questoes?listId=${encodeURIComponent(list.id)}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <ListManager
        folders={folders}
        lists={lists}
        onCreateFolder={createFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={deleteFolder}
        onCreateListWithFilters={createListWithFilters}
        onEditList={editList}
        onDeleteList={deleteList}
        onContinueList={handleContinueList}
      />
    </div>
  );
}

