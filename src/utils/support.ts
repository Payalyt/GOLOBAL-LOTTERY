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
        return '#livechat';
    }
  }

  const trimmed = val.trim();

  // If already a full http/https URL, use directly!
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
      case 'email': return 'support@globallottery.com';
      case 'whatsapp': return '+8801986259552';
      case 'telegram': return '@md_meshkat_payal';
      case 'imo': return 'IMO Support';
      case 'livechat': return '24/7 Agent';
    }
  }

  const trimmed = val.trim();
  if (type === 'email') {
    return trimmed.replace('mailto:', '');
  }
  if (type === 'telegram' && !trimmed.startsWith('http')) {
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it's a URL like https://wa.me/8801986259552 or https://t.me/handle, extract readable handle
    try {
      const url = new URL(trimmed);
      if (url.pathname.length > 1) {
        return url.pathname.replace(/^\//, '');
      }
      return url.hostname;
    } catch (e) {
      return trimmed;
    }
  }
  return trimmed;
}
