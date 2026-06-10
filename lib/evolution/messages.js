import { evolutionFetch, isEvolutionBusinessApi } from './client';

export function formatPhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function buildPhoneCandidates(phone) {
  const raw = String(phone || '').replace(/\D/g, '');
  const candidates = new Set();
  if (!raw) return [];

  candidates.add(formatPhoneNumber(raw));

  if (raw.length === 11 && raw[2] === '9') {
    candidates.add(`55${raw.slice(0, 2)}${raw.slice(3)}`);
  }

  if (raw.startsWith('55') && raw.length === 13 && raw[4] === '9') {
    candidates.add(`${raw.slice(0, 4)}${raw.slice(5)}`);
  }

  candidates.add(raw);
  return [...candidates].filter(Boolean);
}

function normalizeLidJid(jid) {
  const raw = String(jid || '');
  if (!raw.includes('@lid')) return raw;
  const local = raw.split('@')[0].split(':')[0];
  return `${local}@lid`;
}

function profilePicFingerprint(url) {
  if (!url) return '';
  const clean = String(url).split('?')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1] || clean;
}

export async function resolveLidToPhone(instanceName, lidJid) {
  const normalizedLid = normalizeLidJid(lidJid);
  if (!normalizedLid.includes('@lid')) return null;

  try {
    const chats = await evolutionFetch(`/chat/findChats/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({ where: {}, limit: 100 }),
    });

    if (!Array.isArray(chats)) return null;

    const lidChat = chats.find((c) => normalizeLidJid(c.remoteJid) === normalizedLid);
    if (!lidChat) return null;

    const lidPic = profilePicFingerprint(lidChat.profilePicUrl);
    const lidPush = String(lidChat.pushName || '').trim().toLowerCase();

    const phoneChats = chats.filter(
      (c) => c.remoteJid?.endsWith('@s.whatsapp.net') && !c.remoteJid.startsWith('0@')
    );

    if (lidPic) {
      const byPic = phoneChats.find(
        (c) => profilePicFingerprint(c.profilePicUrl) === lidPic && lidPic.length > 8
      );
      if (byPic?.remoteJid) {
        return byPic.remoteJid.split('@')[0].replace(/\D/g, '');
      }
    }

    if (lidPush && lidPush !== '.' && lidPush !== 'whatsapp') {
      const byName = phoneChats.find(
        (c) => String(c.pushName || '').trim().toLowerCase() === lidPush
      );
      if (byName?.remoteJid) {
        return byName.remoteJid.split('@')[0].replace(/\D/g, '');
      }
    }

    const lidMsgs = await evolutionFetch(`/chat/findMessages/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        where: { key: { remoteJid: normalizedLid } },
        limit: 1,
      }),
    }).catch(() => null);
    const lidTs = lidMsgs?.messages?.records?.[0]?.messageTimestamp;

    if (lidTs) {
      let bestPhone = null;
      let bestDiff = Infinity;

      for (const chat of phoneChats) {
        const phone = chat.remoteJid.split('@')[0].replace(/\D/g, '');
        if (!phone) continue;

        const msgs = await evolutionFetch(`/chat/findMessages/${instanceName}`, {
          method: 'POST',
          body: JSON.stringify({
            where: { key: { remoteJid: chat.remoteJid } },
            limit: 1,
          }),
        }).catch(() => null);

        const lastTs = msgs?.messages?.records?.[0]?.messageTimestamp;
        if (!lastTs) continue;

        const diff = Math.abs(lastTs - lidTs);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestPhone = phone;
        }
      }

      if (bestPhone && bestDiff < 3600) return bestPhone;
    }

    if (lidChat.updatedAt) {
      const lidUpdated = new Date(lidChat.updatedAt).getTime();
      const recent = phoneChats
        .filter((c) => c.updatedAt)
        .sort((a, b) => Math.abs(new Date(a.updatedAt).getTime() - lidUpdated) - Math.abs(new Date(b.updatedAt).getTime() - lidUpdated));
      if (recent[0]?.remoteJid) {
        const diffMin = Math.abs(new Date(recent[0].updatedAt).getTime() - lidUpdated) / 60000;
        if (diffMin < 30) {
          return recent[0].remoteJid.split('@')[0].replace(/\D/g, '');
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function resolvePhoneNumber(instanceName, phone) {
  const candidates = buildPhoneCandidates(phone);
  if (!candidates.length) throw new Error('Telefone inválido');

  try {
    const result = await evolutionFetch(`/chat/whatsappNumbers/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({ numbers: candidates }),
    });

    if (Array.isArray(result)) {
      const found = result.find((entry) => entry.exists);
      if (found?.jid) return found.jid.split('@')[0];
      if (found?.number) return String(found.number).replace(/\D/g, '');
    }
  } catch {
    // usa fallback abaixo
  }

  return candidates[0];
}

async function withResolvedNumber(instanceName, phone, sendFn) {
  const number = await resolvePhoneNumber(instanceName, phone);
  if (!number) throw new Error('Telefone inválido');
  return sendFn(number);
}

export async function sendTextMessage(instanceName, phone, text) {
  return withResolvedNumber(instanceName, phone, (number) =>
    evolutionFetch(`/message/sendText/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({ number, text }),
    })
  );
}

export async function sendButtonsMessage(instanceName, phone, { description, footer, buttons }) {
  if (!buttons?.length) throw new Error('Pelo menos um botão é obrigatório');

  const mappedButtons = buttons.map((btn) => ({
    type: 'reply',
    displayText: btn.displayText,
    id: btn.id,
  }));

  return withResolvedNumber(instanceName, phone, (number) =>
    evolutionFetch(`/message/sendButtons/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        number,
        title: '',
        description,
        footer: footer || '',
        buttons: mappedButtons,
      }),
    })
  );
}

export async function sendListMessage(instanceName, phone, { title, description, buttonText, footerText, sections }) {
  if (!sections?.length) throw new Error('Pelo menos uma seção é obrigatória');

  return withResolvedNumber(instanceName, phone, (number) =>
    evolutionFetch(`/message/sendList/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        number,
        title,
        description,
        buttonText: buttonText || 'Responder',
        footerText: footerText || '',
        sections,
      }),
    })
  );
}
