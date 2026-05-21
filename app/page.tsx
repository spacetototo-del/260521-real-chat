'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_nickname');
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    if (!nickname) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nickname]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveNickname = () => {
    const name = nicknameInput.trim();
    if (!name) return;
    localStorage.setItem('chat_nickname', name);
    setNickname(name);
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || loading || !nickname) return;

    setLoading(true);
    setInput('');
    await supabase.from('messages').insert({ nickname, content });
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!nickname) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 w-full max-w-sm mx-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 text-center mb-2">
            팀 채팅
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
            사용할 닉네임을 입력하세요
          </p>
          <input
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 mb-4"
            placeholder="닉네임"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
            autoFocus
          />
          <button
            className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            onClick={saveNickname}
            disabled={!nicknameInput.trim()}
          >
            입장하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          팀 채팅
        </h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {nickname}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-zinc-400 text-sm mt-8">
            아직 메시지가 없습니다. 첫 메시지를 보내보세요!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.nickname === nickname;
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}
            >
              {!isMine && (
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">
                  {msg.nickname}
                </span>
              )}
              <div
                className={`rounded-2xl px-4 py-2 max-w-xs shadow-sm ${
                  isMine
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
              </div>
              <span className="text-xs text-zinc-400 mx-1">
                {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <footer className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 px-4 py-3">
        <div className="flex gap-2 items-end max-w-2xl mx-auto">
          <textarea
            className="flex-1 resize-none rounded-2xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
            placeholder="메시지를 입력하세요..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            전송
          </button>
        </div>
      </footer>
    </div>
  );
}
