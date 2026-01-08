'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BoardView from '@/components/BoardView';
import { useBoardStore } from '@/store/boardStore';
import { getBoard, getLabels, getUsers } from '@/lib/api';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const { setBoard, setLists, setLabels, setUsers, setLoading } = useBoardStore();

  useEffect(() => {
    if (boardId === 'new') {
      router.push('/');
      return;
    }
    fetchBoardData();
  }, [boardId]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const [boardResponse, labelsResponse, usersResponse] = await Promise.all([
        getBoard(boardId),
        getLabels(boardId),
        getUsers(),
      ]);

      setBoard(boardResponse.data);
      setLists(boardResponse.data.lists || []);
      setLabels(labelsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (boardId === 'new') {
    return null;
  }

  return <BoardView />;
}
