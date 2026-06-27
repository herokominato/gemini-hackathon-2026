import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Basic in-memory data store
interface UserStatus {
  id: string;
  personaName: string;
  personaColor: string;
  activity: 'Coffee' | 'Drink' | 'Walk';
  neighborhood: string;
  locationName: string;
  coffeeShopId?: string;
  duration: 30 | 60 | 120;
  createdAt: string;
  expiresAt: string;
  note?: string;
  clientId: string;
  lat: number;
  lng: number;
}

interface ChatMessage {
  id: string;
  senderClientId: string;
  senderPersona: string;
  text: string;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  statusId: string;
  statusOwnerClientId: string;
  statusOwnerPersona: string;
  pingerClientId: string;
  pingerPersona: string;
  locationName: string;
  expiresAt: string;
  messages: ChatMessage[];
}

let activeStatuses: UserStatus[] = [];
let chatRooms: ChatRoom[] = [];

// Pre-populate with realistic mock users so the radar map looks lively immediately!
function initMockData() {
  const now = new Date();
  
  // Set expiration times to 1-2 hours in the future
  const exp1 = new Date(now.getTime() + 75 * 60 * 1000).toISOString();
  const exp2 = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
  const exp3 = new Date(now.getTime() + 45 * 60 * 1000).toISOString();
  const exp4 = new Date(now.getTime() + 110 * 60 * 1000).toISOString();

  activeStatuses = [
    {
      id: 'mock-status-1',
      personaName: 'Hero (Flat White)',
      personaColor: '#D4A373',
      activity: 'Coffee',
      neighborhood: 'Shibuya',
      locationName: 'Kurasu Tokyo',
      coffeeShopId: 'kurasu-tokyo',
      duration: 120,
      createdAt: now.toISOString(),
      expiresAt: exp1,
      note: 'Sketching out some Tokyo street maps. Sitting on the outdoor stool. Grab a pour-over and come say hi!',
      clientId: 'mock-client-1',
      lat: 35.6644,
      lng: 139.7058
    },
    {
      id: 'mock-status-2',
      personaName: 'Faustin (Cortado)',
      personaColor: '#C68B59',
      activity: 'Drink',
      neighborhood: 'Shimokitazawa',
      locationName: 'Bear Pond Espresso',
      coffeeShopId: 'bear-pond-espresso',
      duration: 60,
      createdAt: now.toISOString(),
      expiresAt: exp2,
      note: 'Just grabbed an espresso shot. Flipping through record stores next. Anyone down for a walk around the alleys?',
      clientId: 'mock-client-2',
      lat: 35.6627,
      lng: 139.6675
    },
    {
      id: 'mock-status-3',
      personaName: 'Aish (Matcha Latte)',
      personaColor: '#768959',
      activity: 'Walk',
      neighborhood: 'Yoyogi Koen',
      locationName: 'Fuglen Tokyo',
      coffeeShopId: 'fuglen-tokyo',
      duration: 120,
      createdAt: now.toISOString(),
      expiresAt: exp3,
      note: 'Strolling through the park with an iced matcha. Wearing a beige linen shirt. Let’s grab a park bench and talk travel!',
      clientId: 'mock-client-3',
      lat: 35.6698,
      lng: 139.6929
    },
    {
      id: 'mock-status-4',
      personaName: 'Tanapol (Espresso Tonic)',
      personaColor: '#5B4B3E',
      activity: 'Coffee',
      neighborhood: 'Nakameguro',
      locationName: 'Sidewalk Stand',
      coffeeShopId: 'sidewalk-stand-nakameguro',
      duration: 120,
      createdAt: now.toISOString(),
      expiresAt: exp4,
      note: 'Chilling on the canal wall with a cold espresso tonic. Catching the sunset breeze. Join me!',
      clientId: 'mock-client-4',
      lat: 35.6465,
      lng: 139.6946
    }
  ];

  // Pre-populate one sample chat history that is active
  const chatExp = new Date(now.getTime() + 115 * 60 * 1000).toISOString();
  chatRooms = [
    {
      id: 'mock-chat-1',
      statusId: 'mock-status-1',
      statusOwnerClientId: 'mock-client-1',
      statusOwnerPersona: 'Hero (Flat White)',
      pingerClientId: 'demo-pinger-client',
      pingerPersona: 'Tanapol (Espresso Tonic)',
      locationName: 'Kurasu Tokyo',
      expiresAt: chatExp,
      messages: [
        {
          id: 'msg-1',
          senderClientId: 'mock-client-1',
          senderPersona: 'Hero (Flat White)',
          text: 'Hey! Glad you pinged. I am sitting on the wood bench right outside.',
          createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 'msg-2',
          senderClientId: 'demo-pinger-client',
          senderPersona: 'Tanapol (Espresso Tonic)',
          text: 'Awesome! Just walking over from Harajuku station now, be there in 5m.',
          createdAt: new Date(now.getTime() - 4 * 60 * 1000).toISOString()
        },
        {
          id: 'msg-3',
          senderClientId: 'mock-client-1',
          senderPersona: 'Hero (Flat White)',
          text: 'Perfect, see you soon! I have a black baseball cap on.',
          createdAt: new Date(now.getTime() - 3 * 60 * 1000).toISOString()
        }
      ]
    }
  ];
}

initMockData();

// Cleanup helper: auto-expires old statuses and chats
function cleanupExpired() {
  const now = new Date();
  activeStatuses = activeStatuses.filter(s => new Date(s.expiresAt) > now);
  chatRooms = chatRooms.filter(r => new Date(r.expiresAt) > now);
}

// Simulated auto-replies for mock users to create a highly satisfying and interactive demo experience
const mockReplies: Record<string, string[]> = {
  'mock-status-1': [
    'Hey there! Love that you pinged me. I am sitting on the bench by the tree.',
    'I just ordered another filter cup, it is super rich. What are you drinking?',
    'Awesome, let us catch up. I will be here for another hour!'
  ],
  'mock-status-2': [
    'Hey! Just stepped out of Bear Pond. Let’s head towards the vintage shops?',
    'Awesome. I am wearing a green cap and holding a record bag. Where should we meet?',
    'Sounds like a plan! Let’s meet at the Shimokitazawa station North Exit.'
  ],
  'mock-status-3': [
    'Hey! The weather at Yoyogi Koen is lovely. I am walking near the fountain.',
    'Awesome, let’s grab a bench and sit in the shade. See you soon!',
    'I am carrying a vintage film camera. Look out for me!'
  ],
  'mock-status-4': [
    'Hey, nice timing! I was just enjoying the view. I am leaning on the iron railing by the canal.',
    'I can grab another cup while you walk over. Meet you at the Sidewalk counter?',
    'Perfect, let’s enjoy the sunset. See you in a bit!'
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // Get active statuses on radar
  app.get('/api/radar', (req, res) => {
    cleanupExpired();
    res.json(activeStatuses);
  });

  // Broadcast a status
  app.post('/api/broadcast', (req, res) => {
    cleanupExpired();
    const { personaName, personaColor, activity, neighborhood, locationName, coffeeShopId, duration, note, clientId, lat, lng } = req.body;

    if (!personaName || !activity || !neighborhood || !locationName || !duration || !clientId) {
      return res.status(400).json({ error: 'Missing required broadcast parameters' });
    }

    // Remove any previous active status for this client so they only have one active broadcast
    activeStatuses = activeStatuses.filter(s => s.clientId !== clientId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000).toISOString();

    const newStatus: UserStatus = {
      id: 'status-' + Math.random().toString(36).substring(2, 11),
      personaName,
      personaColor,
      activity,
      neighborhood,
      locationName,
      coffeeShopId,
      duration,
      createdAt: now.toISOString(),
      expiresAt,
      note,
      clientId,
      lat: Number(lat || 35.6580),
      lng: Number(lng || 139.7016)
    };

    activeStatuses.push(newStatus);
    res.status(201).json(newStatus);
  });

  // Delete/Cancel broadcast
  app.post('/api/broadcast/delete', (req, res) => {
    const { clientId } = req.body;
    if (!clientId) {
      return res.status(400).json({ error: 'Missing clientId' });
    }
    const beforeCount = activeStatuses.length;
    activeStatuses = activeStatuses.filter(s => s.clientId !== clientId);
    res.json({ success: true, deleted: beforeCount - activeStatuses.length });
  });

  // Get chat rooms where the client is host or pinger
  app.get('/api/chats', (req, res) => {
    cleanupExpired();
    const clientId = req.query.clientId as string;
    if (!clientId) {
      return res.status(400).json({ error: 'Missing clientId' });
    }

    const userRooms = chatRooms.filter(
      r => r.statusOwnerClientId === clientId || r.pingerClientId === clientId
    );
    res.json(userRooms);
  });

  // Get details of a single chat room
  app.get('/api/chats/:id', (req, res) => {
    cleanupExpired();
    const roomId = req.params.id;
    const room = chatRooms.find(r => r.id === roomId);
    if (!room) {
      return res.status(404).json({ error: 'Chat room not found or expired' });
    }
    res.json(room);
  });

  // Initiate a ping (create chat room)
  app.post('/api/chats', (req, res) => {
    cleanupExpired();
    const { statusId, pingerClientId, pingerPersona } = req.body;

    if (!statusId || !pingerClientId || !pingerPersona) {
      return res.status(400).json({ error: 'Missing parameters to create chat' });
    }

    // Find the status to map who the owner is
    const status = activeStatuses.find(s => s.id === statusId);
    if (!status) {
      return res.status(404).json({ error: 'This broadcast has expired or is no longer active' });
    }

    if (status.clientId === pingerClientId) {
      return res.status(400).json({ error: 'You cannot ping your own broadcast' });
    }

    // Check if chat already exists between this pinger and this status
    const existingRoom = chatRooms.find(
      r => r.statusId === statusId && r.pingerClientId === pingerClientId
    );

    if (existingRoom) {
      return res.json(existingRoom);
    }

    // Chat room expires in 2 hours
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 120 * 60 * 1000).toISOString();

    const newRoom: ChatRoom = {
      id: 'room-' + Math.random().toString(36).substring(2, 11),
      statusId,
      statusOwnerClientId: status.clientId,
      statusOwnerPersona: status.personaName,
      pingerClientId,
      pingerPersona,
      locationName: status.locationName,
      expiresAt,
      messages: [
        {
          id: 'welcome-msg',
          senderClientId: 'system',
          senderPersona: 'Yorimichi',
          text: `👋 Chat initiated at ${status.locationName}. This thread expires in 2 hours.`,
          createdAt: now.toISOString()
        }
      ]
    };

    chatRooms.push(newRoom);
    res.status(201).json(newRoom);
  });

  // Send a message
  app.post('/api/chats/:id/message', (req, res) => {
    cleanupExpired();
    const roomId = req.params.id;
    const { senderClientId, senderPersona, text } = req.body;

    if (!senderClientId || !senderPersona || !text) {
      return res.status(400).json({ error: 'Missing message parameters' });
    }

    const roomIndex = chatRooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Chat room not found or expired' });
    }

    const now = new Date();
    const newMessage: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 11),
      senderClientId,
      senderPersona,
      text,
      createdAt: now.toISOString()
    };

    chatRooms[roomIndex].messages.push(newMessage);

    // If sending to a mock status, simulate a smart auto-reply after 1 second!
    const room = chatRooms[roomIndex];
    if (room.statusId.startsWith('mock-status-') && senderClientId !== room.statusOwnerClientId) {
      setTimeout(() => {
        const replies = mockReplies[room.statusId];
        if (replies) {
          // Select reply based on number of messages in chat or randomly
          const userMessages = room.messages.filter(m => m.senderClientId === senderClientId);
          const replyText = replies[(userMessages.length - 1) % replies.length] || replies[0];
          
          const autoReply: ChatMessage = {
            id: 'msg-' + Math.random().toString(36).substring(2, 11),
            senderClientId: room.statusOwnerClientId,
            senderPersona: room.statusOwnerPersona,
            text: replyText,
            createdAt: new Date().toISOString()
          };
          
          // Re-fetch room index because array might have mutated during timeout
          const innerIndex = chatRooms.findIndex(r => r.id === roomId);
          if (innerIndex !== -1) {
            chatRooms[innerIndex].messages.push(autoReply);
          }
        }
      }, 1000);
    }

    res.status(201).json(newMessage);
  });

  // Handle Vite in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Yorimichi Server] Listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Yorimichi Server] Start failed:', err);
});
