'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBoards } from '@/lib/api';
import type { Board } from '@/types';

export default function Home() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await getBoards();
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardClick = (boardId: string) => {
    router.push(`/board/${boardId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <div className="text-xl text-gray-600 animate-pulse-slow">Loading boards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800 animate-slideIn">My Boards</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {boards.map((board: Board, index: number) => (
            <div
              key={board.id}
              onClick={() => handleBoardClick(board.id)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover-lift group animate-scaleIn"
              style={{ 
                backgroundColor: board.background || '#0079bf',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <h2 className="text-xl font-semibold text-white mb-2 group-hover:scale-105 transition-transform duration-200">{board.title}</h2>
              {board.description && (
                <p className="text-white text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-200">{board.description}</p>
              )}
            </div>
          ))}
          <div
            onClick={() => router.push('/board/new')}
            className="bg-gray-200 rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-300 transition-all duration-300 flex items-center justify-center min-h-[120px] hover-lift animate-scaleIn group"
            style={{ animationDelay: `${boards.length * 0.1}s` }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2 group-hover:scale-125 group-hover:rotate-90 transition-all duration-300">+</div>
              <div className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">Create new board</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
