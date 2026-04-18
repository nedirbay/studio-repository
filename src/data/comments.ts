import type { ProductReview } from '../types'

export const comments: ProductReview[] = [
  // Product 1 - ASUS ROG Strix G15
  {
    id: 1,
    productId: 1,
    userId: 101,
    userName: 'Aman D.',
    rating: 5,
    title: 'Mende bolan iň gowy oýun noutbugy!',
    content: 'Bu noutbuk meniň ähli garaşanymdan hem artyk boldy. RTX 4070 islendik oýny ultra sazlamalarda aňsatlyk bilen ulanýar. Sowadyş ulgamy haýran galdyrýar - hatda agyr oýunlarda-da sesiz işleýär. Batareýasynyň ömri oýun noutbugy üçin gowy. Maslahat berýärin!',
    createdAt: '2024-01-15',
    helpful: 45
  },
  {
    id: 2,
    productId: 1,
    userId: 102,
    userName: 'Sülgün M.',
    rating: 4,
    title: 'Ajaýyp öndürijilik, emma korpusynda azajyk kemçilik bar',
    content: 'Öndürijilik iň ýokary derejede. 165Hz displeý örän durnukly we reňkleri janly görkezýär. Ýeke-täk şikaýatym - klawiaturanyň töweregi azajyk çeýe ýaly. Galan zady bahasy üçin örän gowy.',
    createdAt: '2024-01-10',
    helpful: 23
  },
  {
    id: 3,
    productId: 1,
    userId: 103,
    userName: 'Mered R.',
    rating: 5,
    title: 'Bäsleşikli oýunlar üçin ajaýyp',
    content: 'Täzelenme tizliginiň ýokarylygy we jogap beriş wagtynyň pesligi ony FPS oýunlary üçin amatly edýär. RGB yşyklandyryşy sazlap bolýar we owadan görünýär. Satyn alanym üçin örän şat.',
    createdAt: '2024-01-05',
    helpful: 31
  },
  
  // Product 2 - HP Pavilion Desktop
  {
    id: 4,
    productId: 2,
    userId: 104,
    userName: 'Enejan T.',
    rating: 4,
    title: 'Ynamly iş kompýuteri',
    content: 'Iş we ýeňil oýunlar üçin örän gowy. i7 prosessory köp sanly işi bir wagtda aňsat ýerne ýetirýär. Sesiz işleýär. Has agyr işler üçin has güýçli grafikasy bolsady diýdirýär.',
    createdAt: '2024-01-12',
    helpful: 18
  },
  
  // Product 3 - Samsung Monitor
  {
    id: 5,
    productId: 3,
    userId: 105,
    userName: 'Dawut L.',
    rating: 5,
    title: 'Haýran galdyryjy 4K displeý',
    content: 'Bu monitoryň reňkleri örän täsin. 4K durulygy tekstleri dury we suratlary ajaýyp görkezýär. Monitoryň aýagy doly sazlap bolýar. Iş we güýmenje üçin örän oňat.',
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
    title: 'Ulanan iň gowy klawiaturam',
    content: 'Ýazuw tejribesi ajaýyp. Düwmeleri duýgur we amatly. Birnäçe enjama birikmek mümkinçiligi işimi has hem ýeňilleşdirdi. Bir gezekki zarýady birnäçe hepde ýetýär.',
    createdAt: '2024-01-11',
    helpful: 89
  },
  
  // Generic comments for other products
  {
    id: 7,
    productId: 5,
    userId: 107,
    userName: 'Kerim P.',
    rating: 4,
    title: 'Örän gowy biznes noutbugy',
    content: 'Ýeňil emma güýçli. Klawiaturasy uzak wagtlap ýazmak üçin amatly. Batareýasy uzak saklaýar. Azajyk gymmatrak emma hili üçin degýär.',
    createdAt: '2024-01-09',
    helpful: 34
  },
  {
    id: 8,
    productId: 6,
    userId: 108,
    userName: 'Läle W.',
    rating: 5,
    title: 'Öndürijiligiň uly ösüşi',
    content: '3070-den geçdim we tapawudy derrew duýulýar. Agurluk düşende-de sowuk we sesiz işleýär. Bahasy we öndürijiligi örän amatly.',
    createdAt: '2024-01-13',
    helpful: 67
  },
  {
    id: 9,
    productId: 7,
    userId: 109,
    userName: 'Rustam J.',
    rating: 4,
    title: 'Gowy mehaniki klawiatura',
    content: 'RGB gaty owadan we Cherry düwmeleri ajaýyp duýulýar. Programma üpjünçiligi azajyk çylşyrymlyrak, emma sazlaňdan soň kemsiz işleýär.',
    createdAt: '2024-01-08',
    helpful: 28
  },
  {
    id: 10,
    productId: 8,
    userId: 110,
    userName: 'Jemile H.',
    rating: 5,
    title: 'Bahasy üçin diýseň gowy router',
    content: 'Sazlamak gaty aňsat we meýdany oňat gurşaýar. WiFi 6 tizligi örän çalt. Birnäçe enjamly öýler üçin ajaýyp saýlaw.',
    createdAt: '2024-01-07',
    helpful: 45
  }
]
