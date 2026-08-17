'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generateConnectToken } from '../api/service';
import { groupKeys } from '../api/queries';
import type { ConnectStatus } from '../api/types';

export function useConnectFlow(
  botId: string,
  botUsername: string,
  mode: 'connect' | 'transfer' = 'connect'
) {
  const queryClient = useQueryClient();

  const [token, setToken] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);

  // transfer = pindahkan grup yang sudah terdaftar ke bot lain (BE: /transfer command)
  const command =
    mode === 'transfer' ? `/transfer@${botUsername} ${token}` : `/connect@${botUsername} ${token}`;
  const inviteLink = `https://t.me/${botUsername}?startgroup=connect_${token}`;
  const timeString = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  // Timer countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  // Clear expired token
  useEffect(() => {
    if (secondsLeft <= 0 && token) {
      setToken('');
      setConnectStatus('expired');
    }
  }, [secondsLeft, token]);

  // Polling connection status every 3s
  useEffect(() => {
    if (!token || !botId || !secondsLeft) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/tenant/bots/${botId}/groups/connect-status/${token}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json.success || !json.data) return;

        const status = json.data.status as ConnectStatus;
        setConnectStatus(status);

        if (status === 'success') {
          toast.success('Grup berhasil dihubungkan!');
          void queryClient.invalidateQueries({ queryKey: groupKeys.all });
          setToken('');
          setSecondsLeft(0);
        } else if (status === 'expired') {
          setToken('');
        }
      } catch {
        // network error, retry on next interval
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, botId, secondsLeft, queryClient]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    const res = await generateConnectToken(botId);
    setLoading(false);
    if (res.success && res.data) {
      setToken(res.data.token);
      setSecondsLeft(res.data.expires_in);
      setConnectStatus('pending');
    } else {
      toast.error(res.message || 'Gagal generate kode');
    }
  }, [botId]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [inviteLink]);

  const reset = useCallback(() => {
    setToken('');
    setSecondsLeft(0);
    setCopied(false);
    setCopiedLink(false);
    setConnectStatus(null);
    setLoading(false);
  }, []);

  return {
    token,
    secondsLeft,
    loading,
    copied,
    copiedLink,
    connectStatus,
    command,
    inviteLink,
    timeString,
    handleGenerate,
    handleCopy,
    handleCopyLink,
    reset
  };
}
