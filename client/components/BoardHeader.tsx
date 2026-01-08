'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiStar, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { useBoardStore } from '@/store/boardStore';
import { updateBoard, deleteBoard } from '@/lib/api';

export default function BoardHeader() {
  const router = useRouter();
  const { board, setBoard } = useBoardStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);

  if (!board) return null;

  const backgroundColors = [
    '#0079bf',
    '#d29034',
    '#519839',
    '#b04632',
    '#89609e',
    '#cd5a91',
    '#4bbf6b',
    '#00aecc',
    '#838c91',
  ];

  const handleBackgroundChange = async (color: string) => {
    try {
      const response = await updateBoard(board.id, { background: color });
      setBoard(response.data);
      setShowBackgroundMenu(false);
    } catch (error) {
      console.error('Error updating background:', error);
    }
  };

  const handleDeleteBoard = async () => {
    if (confirm('Are you sure you want to delete this board?')) {
      try {
        await deleteBoard(board.id);
        router.push('/');
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  return (
    <div className="bg-black bg-opacity-20 text-white p-2 md:p-4 flex items-center justify-between flex-wrap gap-2 backdrop-blur-sm transition-all duration-300 animate-slideIn">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Back to boards"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-semibold truncate max-w-[200px] md:max-w-none">{board.title}</h1>
        <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors hidden md:block">
          <FiStar size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowBackgroundMenu(!showBackgroundMenu)}
            className="px-2 md:px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs md:text-sm font-medium transition-colors"
          >
            <span className="hidden md:inline">Change Background</span>
            <span className="md:hidden">Bg</span>
          </button>
          {showBackgroundMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowBackgroundMenu(false)}
              />
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-20 min-w-[200px]">
                <div className="text-gray-700 font-medium mb-3">Colors</div>
                <div className="grid grid-cols-3 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleBackgroundChange(color)}
                      className="w-12 h-12 rounded hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-90"
          >
            <FiMoreVertical size={20} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl z-20 min-w-[200px] animate-scaleIn">
                <button
                  onClick={handleDeleteBoard}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-t-lg transition-all duration-200 hover:scale-105"
                >
                  Delete Board
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
