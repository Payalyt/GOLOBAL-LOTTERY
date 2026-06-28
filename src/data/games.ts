export const games = [
    { name: 'MEGA7', prize: '$50,000,000', price: 15, drawTime: 'Sunday', targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000) },
    { name: 'WILD5', prize: '$3,000,000', price: 10, drawTime: 'Saturday', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { name: 'EASY6', prize: '$4,000,000', price: 6, drawTime: 'Friday', targetDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000) },
    { name: 'FAST5', prize: '$6,000', price: 8, drawTime: 'Saturday', targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000) },
    { name: 'SURE 1', prize: '$10,000', price: 10, drawTime: 'Daily', targetDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
    { name: 'SURE 2', prize: '$25,000', price: 15, drawTime: 'Weekly', targetDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
    { name: 'SURE 3', prize: '$50,000', price: 30, drawTime: 'Monthly', targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    { name: 'PICK 1', prize: '$60,000', price: 3, drawTime: 'Daily', targetDate: new Date(Date.now() + 6 * 60 * 60 * 1000) },
    { name: 'PICK 2', prize: '$100,000', price: 4, drawTime: 'Daily', targetDate: new Date(Date.now() + 12 * 60 * 60 * 1000) },
];

export const gameColors: Record<string, string> = {
  'MEGA7': 'bg-red-600',
  'WILD5': 'bg-blue-600',
  'EASY6': 'bg-green-600',
  'FAST5': 'bg-blue-500',
  'SURE 1': 'bg-pink-500',
  'SURE 2': 'bg-purple-600',
  'SURE 3': 'bg-teal-500',
  'PICK 1': 'bg-purple-600',
  'PICK 2': 'bg-orange-500',
};
