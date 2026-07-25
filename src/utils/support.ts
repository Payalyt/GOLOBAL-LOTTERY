export function formatSupportLink(
  type: 'email' | 'whatsapp' | 'telegram' | 'imo' | 'livechat',
  val?: string
): string {
  if (!val || val.trim() === '') {
    switch (type) {
      case 'email':
        return 'mailto:support@globallottery.com';
      case 'whatsapp':
        return 'https://wa.me/8801986259552';
      case 'telegram':
        return 'https://t.me/md_meshkat_payal';
      case 'imo':
        return 'https://imo.im/8801986259552';
      case 'livechat':
        return 'https://tawk.to';
    }
  }

  const trimmed = val.trim();

  // If already a full http/https URL, return directly
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (type === 'email') {
    if (trimmed.startsWith('mailto:')) return trimmed;
    return `mailto:${trimmed}`;
  }

  if (type === 'whatsapp') {
    const cleanDigits = trimmed.replace(/[^0-9]/g, '');
    return cleanDigits ? `https://wa.me/${cleanDigits}` : 'https://wa.me/8801986259552';
  }

  if (type === 'telegram') {
    const cleanHandle = trimmed.replace(/^@/, '');
    return cleanHandle ? `https://t.me/${cleanHandle}` : 'https://t.me/md_meshkat_payal';
  }

  if (type === 'imo') {
    const cleanDigits = trimmed.replace(/[^0-9]/g, '');
    return cleanDigits ? `https://imo.im/${cleanDigits}` : 'https://imo.im/8801986259552';
  }

  if (type === 'livechat') {
    return trimmed;
  }

  return trimmed;
}

export function getDisplaySupportLabel(
  type: 'email' | 'whatsapp' | 'telegram' | 'imo' | 'livechat',
  val?: string
): string {
  if (!val || val.trim() === '') {
    switch (type) {
      case 'email': return 'Email Support';
      case 'whatsapp': return 'Open WhatsApp';
      case 'telegram': return 'Open Telegram';
      case 'imo': return 'Open IMO App';
      case 'livechat': return '24/7 Agent';
    }
  }

  const trimmed = val.trim();

  // If it's a raw URL like https://t.me/... or https://wa.me/... NEVER show the raw URL!
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    switch (type) {
      case 'email': return 'Email Support';
      case 'whatsapp': return 'Open WhatsApp';
      case 'telegram': return 'Open Telegram';
      case 'imo': return 'Open IMO App';
      case 'livechat': return '24/7 Agent';
    }
  }

  if (type === 'email') {
    const emailClean = trimmed.replace('mailto:', '');
    return emailClean.length > 25 ? `${emailClean.substring(0, 22)}...` : emailClean;
  }

  if (type === 'telegram') {
    return trimmed.startsWith('@') ? trimmed : `@${trimmed.replace(/[^a-zA-Z0-9_]/g, '')}`;
  }

  if (type === 'whatsapp') {
    return 'Open WhatsApp';
  }

  if (type === 'imo') {
    return 'Open IMO App';
  }

  return '24/7 Agent';
}

