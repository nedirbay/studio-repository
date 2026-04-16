import type { Comment } from '../types'

export const comments: Comment[] = [
  // Product 1 - ASUS ROG Strix G15
  {
    id: 1,
    productId: 1,
    userId: 101,
    userName: 'John D.',
    rating: 5,
    title: 'Best gaming laptop I\'ve ever owned!',
    content: 'This laptop exceeds all my expectations. The RTX 4070 handles every game I throw at it on ultra settings. The cooling system is impressive - stays quiet even during intense gaming sessions. Battery life is decent for a gaming laptop. Highly recommend!',
    createdAt: '2024-01-15',
    helpful: 45
  },
  {
    id: 2,
    productId: 1,
    userId: 102,
    userName: 'Sarah M.',
    rating: 4,
    title: 'Great performance, minor build quality issues',
    content: 'Performance is top-notch. The 165Hz display is smooth and colors are vibrant. Only complaint is some flex in the keyboard area. Otherwise, excellent value for the price.',
    createdAt: '2024-01-10',
    helpful: 23
  },
  {
    id: 3,
    productId: 1,
    userId: 103,
    userName: 'Mike R.',
    rating: 5,
    title: 'Perfect for competitive gaming',
    content: 'The high refresh rate and low response time make this perfect for competitive FPS games. RGB lighting is customizable and looks great. Very satisfied with my purchase.',
    createdAt: '2024-01-05',
    helpful: 31
  },
  
  // Product 2 - HP Pavilion Desktop
  {
    id: 4,
    productId: 2,
    userId: 104,
    userName: 'Emily T.',
    rating: 4,
    title: 'Solid work desktop',
    content: 'Great for productivity tasks and light gaming. The i7 processor handles multitasking with ease. Quiet operation. Wish it had a more powerful GPU for heavier workloads.',
    createdAt: '2024-01-12',
    helpful: 18
  },
  
  // Product 3 - Samsung Monitor
  {
    id: 5,
    productId: 3,
    userId: 105,
    userName: 'David L.',
    rating: 5,
    title: 'Stunning 4K display',
    content: 'The colors on this monitor are incredible. 4K resolution makes text crisp and photos look amazing. The stand is fully adjustable. Great for both work and entertainment.',
    createdAt: '2024-01-14',
    helpful: 56
  },
  
  // Product 4 - Logitech Keyboard
  {
    id: 6,
    productId: 4,
    userId: 106,
    userName: 'Anna K.',
    rating: 5,
    title: 'Best keyboard I\'ve ever used',
    content: 'The typing experience is fantastic. Keys are responsive and comfortable. The ability to connect to multiple devices is a game-changer. Battery lasts weeks on a single charge.',
    createdAt: '2024-01-11',
    helpful: 89
  },
  
  // Generic comments for other products
  {
    id: 7,
    productId: 5,
    userId: 107,
    userName: 'Chris P.',
    rating: 4,
    title: 'Excellent business laptop',
    content: 'Lightweight yet powerful. The keyboard is perfect for long typing sessions. Great battery life. A bit pricey but worth it for the quality.',
    createdAt: '2024-01-09',
    helpful: 34
  },
  {
    id: 8,
    productId: 6,
    userId: 108,
    userName: 'Lisa W.',
    rating: 5,
    title: 'Massive performance upgrade',
    content: 'Upgraded from a 3070 and the difference is noticeable. Runs cool and quiet even under load. Great value for the performance.',
    createdAt: '2024-01-13',
    helpful: 67
  },
  {
    id: 9,
    productId: 7,
    userId: 109,
    userName: 'Robert J.',
    rating: 4,
    title: 'Great mechanical keyboard',
    content: 'The RGB is beautiful and the Cherry switches feel amazing. Software is a bit clunky but once configured, it works perfectly.',
    createdAt: '2024-01-08',
    helpful: 28
  },
  {
    id: 10,
    productId: 8,
    userId: 110,
    userName: 'Jennifer H.',
    rating: 5,
    title: 'Excellent router for the price',
    content: 'Setup was a breeze and the coverage is excellent. WiFi 6 speeds are blazing fast. Great for homes with multiple devices.',
    createdAt: '2024-01-07',
    helpful: 45
  }
]
