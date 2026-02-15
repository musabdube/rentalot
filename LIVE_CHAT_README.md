# Live Chat Setup Instructions

## Overview
A complete live chat system has been implemented allowing tenants and landlords to chat with admin support in real-time.

## Features Implemented

### 1. Database Schema
- ✅ `LiveChat` model - Stores chat sessions
- ✅ `LiveChatMessage` model - Stores individual messages
- ✅ `LiveChatStatus` enum - OPEN/CLOSED states
- ✅ User relations added

### 2. API Endpoints
- ✅ `/api/live-chat` - User chat operations (GET, POST, PATCH)
- ✅ `/api/admin/live-chat` - Admin view all chats

### 3. User Interface
- ✅ **LiveChatWidget Component** - Floating chat icon at bottom-right corner
  - Auto-polls for new messages every 3 seconds
  - Unread message counter with notification badge
  - Minimizable chat window
  - Beautiful responsive design
  - Shows in mobile and desktop views

### 4. Admin Interface
- ✅ **Admin Live Chats Page** (`/admin/chats`)
  - View all chats (open/closed)
  - Real-time message updates
  - Unread message counts
  - Filter by status
  - Close chat conversations
  - Full chat history

### 5. Integration
- ✅ Added to main layout (appears on all pages for non-admin users)
- ✅ Added to Admin Sidebar navigation

---

## Setup Steps (IMPORTANT!)

Since there were file permission issues during initial setup, please follow these steps:

### Step 1: Stop Development Server
```bash
# Press Ctrl+C in your terminal to stop the dev server
```

### Step 2: Run Database Migration
```bash
npx prisma migrate dev --name add_live_chat
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Restart Development Server
```bash
npm run dev
```

---

## How It Works

### For Tenants/Landlords:
1. Click the floating chat icon (💬) at bottom-right corner
2. Type a message and send
3. Wait for admin to reply
4. Get notified with badge when admin responds
5. Chat history is preserved

### For Admins:
1. Navigate to **Admin → Live Chats** in sidebar
2. See all active and closed chats
3. Click on a chat to view conversation
4. Reply directly to users
5. Close chats when resolved
6. View unread message counts

### Auto-refresh:
- User chat: Polls every 3 seconds when chat is open
- Admin interface: Polls every 5 seconds for chat list, 3 seconds for selected chat
- Messages marked as read automatically when viewed

---

## Features

### User Chat Widget:
- ✅ Floating button with unread badge
- ✅ Hover tooltip "Chat with Support"
- ✅ Minimizable chat window
- ✅ Real-time message polling
- ✅ Message read receipts
- ✅ Time stamps on messages
- ✅ Clean, modern UI
- ✅ Mobile responsive
- ✅ Only visible to tenants/landlords (hidden from admins)

### Admin Dashboard:
- ✅ All chats overview with stats
- ✅ Filter by Open/Closed/All
- ✅ Unread message counters
- ✅ User information display
- ✅ Chat status indicators
- ✅ Close chat functionality
- ✅ Real-time updates
- ✅ Full message history
- ✅ Sender role indicators

### Database Features:
- ✅ Supports both logged-in users and guests
- ✅ Proper indexing for performance
- ✅ Message read tracking
- ✅ Chat status management
- ✅ Cascade deletions
- ✅ User role tracking in messages

---

## File Structure

```
app/
├── api/
│   ├── live-chat/
│   │   └── route.ts          # User chat operations
│   └── admin/
│       └── live-chat/
│           └── route.ts       # Admin chat operations
├── admin/
│   ├── chats/
│   │   └── page.tsx          # Admin chat interface
│   └── AdminSidebar.tsx       # Updated with Live Chats link
├── components/
│   └── LiveChatWidget.tsx     # Floating chat widget
└── layout.tsx                 # Updated to include widget

prisma/
└── schema.prisma              # Updated with LiveChat models
```

---

## API Documentation

### User Endpoints

#### GET `/api/live-chat`
Get or create user's chat session
- **Auth**: Required
- **Query Params**: 
  - `chatId` (optional) - Get specific chat with messages
- **Returns**: Chat object with messages

#### POST `/api/live-chat`
Send a message in chat
- **Auth**: Required
- **Body**: 
  ```json
  {
    "chatId": "string (optional)",
    "content": "string (required)"
  }
  ```
- **Returns**: Created message object

#### PATCH `/api/live-chat`
Update chat or mark messages as read
- **Auth**: Required
- **Body**:
  ```json
  {
    "chatId": "string (required)",
    "action": "close" | "markRead"
  }
  ```

### Admin Endpoints

#### GET `/api/admin/live-chat`
Get all chats (admin only)
- **Auth**: Admin required
- **Query Params**:
  - `status` (optional) - Filter by OPEN/CLOSED
- **Returns**: Array of chats with user info and message counts

---

## Database Schema

### LiveChat Table
```prisma
model LiveChat {
  id            String          @id @default(cuid())
  userId        String?
  user          User?
  guestName     String?
  guestEmail    String?
  status        LiveChatStatus  @default(OPEN)
  subject       String?
  messages      LiveChatMessage[]
  lastMessageAt DateTime        @default(now())
  closedAt      DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}
```

### LiveChatMessage Table
```prisma
model LiveChatMessage {
  id             String   @id @default(cuid())
  chatId         String
  chat           LiveChat
  senderId       String?
  senderName     String
  senderRole     UserRole
  content        String   @db.Text
  isAdminMessage Boolean  @default(false)
  read           Boolean  @default(false)
  readAt         DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Customization

### Polling Intervals
Edit these values in the components:

**LiveChatWidget.tsx** (line ~94):
```typescript
pollingInterval.current = setInterval(fetchChat, 3000); // 3 seconds
```

**Admin page** (line ~150):
```typescript
setInterval(() => fetchChatDetails(selectedChat.id), 3000); // 3 seconds
```

### Chat Colors
Change the emerald theme by replacing `emerald-600` with your color:
- Button colors
- Message bubbles
- Active states

### Position
To change the floating widget position, edit **LiveChatWidget.tsx**:
```typescript
// Current: bottom-6 right-6
// Change to: top-6 left-6 (top-left)
```

---

## Testing

### Test as User:
1. Log in as tenant or landlord
2. Click chat icon
3. Send a message
4. Keep chat open to see auto-updates

### Test as Admin:
1. Log in as admin
2. Go to /admin/chats
3. See the user's message
4. Reply to the user
5. User should see reply automatically

### Test Notifications:
1. User sends message
2. Close chat widget
3. Admin replies
4. Unread badge should appear on chat icon
5. Click to see new message

---

## Troubleshooting

### Widget not appearing:
- Check that user is logged in
- Widget only shows for TENANT and LANDLORD roles
- Check browser console for errors

### Messages not updating:
- Verify polling intervals are running
- Check API responses in Network tab
- Ensure database is running

### "Property 'liveChat' does not exist" error:
- Run `npx prisma generate`
- Restart dev server
- Clear `.next` cache: `rm -rf .next`

### File permission errors:
- Stop dev server before running Prisma commands
- Close any processes using the database
- Try running terminal as administrator (Windows)

---

## Future Enhancements (Optional)

Consider adding these features:

1. **WebSocket Support**
   - Replace polling with real-time WebSocket connections
   - Use Socket.io or Pusher for instant updates

2. **File Attachments**
   - Allow users to upload images/files
   - Integrate with Cloudinary

3. **Chat Assignment**
   - Assign chats to specific admin users
   - Track which admin is handling each chat

4. **Canned Responses**
   - Pre-written quick replies for admins
   - Common questions and answers

5. **Email Notifications**
   - Notify users via email when admin replies
   - Send chat transcripts

6. **Chat History Export**
   - Download chat transcripts as PDF/TXT
   - For record-keeping

7. **Typing Indicators**
   - Show when the other party is typing
   - Real-time presence status

8. **Audio Notifications**
   - Play sound when new message arrives
   - Browser notifications API

---

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify database migrations ran successfully
3. Ensure Prisma client is generated
4. Restart development server
5. Clear browser cache

The live chat system is now fully implemented and ready to use! 🎉
