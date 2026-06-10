export const ATTENDANCE_QUESTION = 'Você irá comparecer?';

export const BUTTON_CONFIRM_LABEL = 'Confirmar';
export const BUTTON_CANCEL_LABEL = 'Cancelar';

export const POLL_CONFIRM_OPTION = 'Confirmar presença';
export const POLL_CANCEL_OPTION = 'Cancelar agendamento';

export const REPLY_CONFIRM = 'confirmar';
export const REPLY_CANCEL = 'cancelar';

export function buildTextConfirmationMessage(content) {
  return `${content}

${ATTENDANCE_QUESTION}

Responda esta mensagem com uma das opções abaixo:

✅ *confirmar* — confirmar presença
❌ *cancelar* — cancelar agendamento`;
}

export function buildConfirmButtonId(appointmentId) {
  return `apt_confirm_${appointmentId}`;
}

export function buildCancelButtonId(appointmentId) {
  return `apt_cancel_${appointmentId}`;
}

export function parseAppointmentButtonId(buttonId) {
  const id = String(buttonId || '').trim();
  const confirmMatch = id.match(/^apt_confirm_(.+)$/);
  if (confirmMatch) return { action: 'confirm', appointmentId: confirmMatch[1] };
  const cancelMatch = id.match(/^apt_cancel_(.+)$/);
  if (cancelMatch) return { action: 'cancel', appointmentId: cancelMatch[1] };
  return null;
}

function parseNativeFlowParams(paramsJson) {
  if (!paramsJson) return null;
  try {
    const parsed = typeof paramsJson === 'string' ? JSON.parse(paramsJson) : paramsJson;
    return parsed?.id || parsed?.button_id || null;
  } catch {
    return null;
  }
}

export function extractButtonResponse(body) {
  const cloudReply =
    body?.data?.message?.interactive?.button_reply ||
    body?.message?.interactive?.button_reply ||
    body?.data?.interactive?.button_reply;
  if (cloudReply?.id) return String(cloudReply.id);
  if (cloudReply?.title) return String(cloudReply.title);

  const nativeFlowParams =
    body?.data?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
    body?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  const nativeFlowId = parseNativeFlowParams(nativeFlowParams);
  if (nativeFlowId) return String(nativeFlowId);

  const candidates = [
    body?.data?.message?.buttonsResponseMessage?.selectedButtonId,
    body?.data?.message?.templateButtonReplyMessage?.selectedId,
    body?.data?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.name,
    body?.message?.buttonsResponseMessage?.selectedButtonId,
    body?.message?.templateButtonReplyMessage?.selectedId,
    body?.data?.buttonsResponseMessage?.selectedButtonId,
  ];

  for (const value of candidates) {
    if (value) return String(value);
  }

  const displayTexts = [
    body?.data?.message?.buttonsResponseMessage?.selectedDisplayText,
    body?.data?.message?.templateButtonReplyMessage?.selectedDisplayText,
  ].filter(Boolean);

  for (const text of displayTexts) {
    const normalized = String(text).toLowerCase();
    if (normalized.includes('confirmar')) return 'display_confirm';
    if (normalized.includes('cancelar')) return 'display_cancel';
  }

  return null;
}

export function extractSenderJid(body) {
  const key = body?.data?.key || body?.key || {};
  const alt = key?.remoteJidAlt || body?.data?.remoteJidAlt;
  if (alt && String(alt).includes('@s.whatsapp.net')) return String(alt);

  const jid =
    key?.remoteJid ||
    body?.data?.remoteJid ||
    body?.sender;
  return jid ? String(jid) : '';
}

export function extractSenderPhone(body) {
  const jid = extractSenderJid(body);
  if (!jid) return '';
  if (jid.includes('@lid')) return '';
  return jid.split('@')[0].replace(/\D/g, '');
}

export function isLidSender(body) {
  return extractSenderJid(body).includes('@lid');
}

export function phonesMatch(a, b) {
  const da = String(a || '').replace(/\D/g, '');
  const db = String(b || '').replace(/\D/g, '');
  if (!da || !db) return false;
  if (da === db) return true;
  if (da.endsWith(db) || db.endsWith(da)) return true;

  const suffixA = da.slice(-8);
  const suffixB = db.slice(-8);
  if (suffixA.length >= 8 && suffixA === suffixB) return true;

  return false;
}

export function parsePollOrTextAction(text) {
  const normalized = String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (!normalized) return null;

  if (
    normalized === 'confirmar' ||
    normalized === 'confirmo' ||
    normalized === 'confirmado' ||
    normalized === 'confirmada' ||
    normalized.startsWith('confirmar ') ||
    normalized.includes(' vou confirmar') ||
    ['sim', 'ok', '1', 'pode confirmar', 'vou sim', 'compareco', 'comparecerei'].includes(normalized) ||
    (normalized.includes('confirm') && !normalized.includes('cancel'))
  ) {
    return 'confirm';
  }

  if (
    normalized === 'cancelar' ||
    normalized === 'cancelado' ||
    normalized === 'cancelada' ||
    normalized.startsWith('cancelar ') ||
    ['nao', 'nao vou', '2', 'cancelo', 'nao posso', 'nao poderei'].includes(normalized) ||
    normalized.includes('cancel')
  ) {
    return 'cancel';
  }

  return null;
}

export function extractPollResponse(body) {
  const vote = body?.data?.message?.pollUpdateMessage?.vote;
  const selected = vote?.selectedOptions;
  if (Array.isArray(selected) && selected.length > 0) {
    const first = selected[0];
    if (typeof first === 'string') return first;
  }

  const pollUpdates = body?.data?.pollUpdates || body?.pollUpdates;
  if (Array.isArray(pollUpdates)) {
    for (const option of pollUpdates) {
      if (option?.voters?.length && option?.name) return option.name;
    }
  }

  return null;
}

export function extractListResponse(body) {
  const reply = body?.data?.message?.listResponseMessage?.singleSelectReply;
  if (reply?.selectedRowId) return String(reply.selectedRowId);
  if (reply?.title) return String(reply.title);
  return null;
}

export function extractTextResponse(body) {
  const msg = body?.data?.message || body?.message;
  const listTitle = msg?.listResponseMessage?.singleSelectReply?.title;
  const listRowId = msg?.listResponseMessage?.singleSelectReply?.selectedRowId;

  return (
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    msg?.buttonsResponseMessage?.selectedDisplayText ||
    msg?.buttonsResponseMessage?.selectedButtonId ||
    listRowId ||
    listTitle ||
    null
  );
}
