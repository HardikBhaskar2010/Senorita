# 💌 Adding Custom Messages to Valentine's Days

Cookie, here's how you can add your personal romantic messages for Senorita to see when she unlocks each day:

---

## Method 1: Add Messages in Supabase Dashboard (Easiest)

### Step 1: Open Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Table Editor**
3. Select **valentines_progress** table

### Step 2: Add/Edit Messages
For each day she unlocks, you can update the `custom_message` field:

**Example Messages:**

**Day 1 - Rose Day (Feb 7):**
```
You are as beautiful as the first rose of spring. Every petal reminds me of a reason I love you. 🌹
```

**Day 2 - Propose Day (Feb 8):**
```
From the moment I met you, I knew you were the one. Will you be mine forever? Yes, you already said yes, but I'll never stop asking. 💍
```

**Day 3 - Chocolate Day (Feb 9):**
```
Life with you is sweeter than any chocolate. You're my favorite flavor, my sweetest addiction. 🍫
```

**Day 4 - Teddy Day (Feb 10):**
```
Just like this teddy, I want to hold you close forever. You're my comfort, my warmth, my everything. 🧸
```

**Day 5 - Promise Day (Feb 11):**
```
I promise to love you on your good days and bad days. I promise to choose you every single day. I promise to make you smile when you're sad. I promise forever. 🤝
```

**Day 6 - Hug Day (Feb 12):**
```
In your arms is my favorite place in the world. Here's a virtual hug until I can hold you for real. 🤗
```

**Day 7 - Kiss Day (Feb 13):**
```
Every kiss with you feels like the first one. Your lips are my favorite place to get lost in. 💋
```

**Day 8 - Valentine's Day (Feb 14):**
```
Happy Valentine's Day, my love! You make every day feel like Valentine's Day. Thank you for being mine. I love you more than words can express. ❤️
```

---

## Method 2: Using SQL Queries

### Before She Unlocks (Pre-load messages):
```sql
-- Add message for Rose Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 1, 'Rose Day', 'You are as beautiful as the first rose of spring 🌹')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;

-- Add message for Propose Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 2, 'Propose Day', 'From the moment I met you, I knew you were the one 💍')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;

-- Add message for Chocolate Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 3, 'Chocolate Day', 'Life with you is sweeter than any chocolate 🍫')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;

-- Add message for Teddy Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 4, 'Teddy Day', 'Just like this teddy, I want to hold you close forever 🧸')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;

-- Add message for Promise Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 5, 'Promise Day', 'I promise to love you on your good days and bad days 🤝')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;

-- Add message for Hug Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 6, 'Hug Day', 'In your arms is my favorite place in the world 🤗')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;

-- Add message for Kiss Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 7, 'Kiss Day', 'Every kiss with you feels like the first one 💋')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;

-- Add message for Valentine's Day
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES ('Senorita', 8, 'Valentine''s Day', 'Happy Valentine''s Day! You make every day feel special ❤️')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;
```

### After She Unlocks (Update existing records):
```sql
-- Update message for a specific day
UPDATE valentines_progress
SET custom_message = 'Your new romantic message here'
WHERE user_name = 'Senorita' AND day_number = 1;
```

---

## Method 3: Bulk Insert All Messages at Once

Copy and paste this entire block into Supabase SQL Editor:

```sql
-- Insert all Valentine's messages at once
INSERT INTO valentines_progress (user_name, day_number, day_name, custom_message)
VALUES 
  ('Senorita', 1, 'Rose Day', 'You are as beautiful as the first rose of spring. Every petal reminds me of a reason I love you. 🌹'),
  ('Senorita', 2, 'Propose Day', 'From the moment I met you, I knew you were the one. Will you be mine forever? 💍'),
  ('Senorita', 3, 'Chocolate Day', 'Life with you is sweeter than any chocolate. You''re my favorite flavor, my sweetest addiction. 🍫'),
  ('Senorita', 4, 'Teddy Day', 'Just like this teddy, I want to hold you close forever. You''re my comfort, my warmth, my everything. 🧸'),
  ('Senorita', 5, 'Promise Day', 'I promise to love you on your good days and bad days. I promise to choose you every single day. I promise forever. 🤝'),
  ('Senorita', 6, 'Hug Day', 'In your arms is my favorite place in the world. Here''s a virtual hug until I can hold you for real. 🤗'),
  ('Senorita', 7, 'Kiss Day', 'Every kiss with you feels like the first one. Your lips are my favorite place to get lost in. 💋'),
  ('Senorita', 8, 'Valentine''s Day', 'Happy Valentine''s Day, my love! You make every day feel like Valentine''s Day. Thank you for being mine. I love you more than words can express. ❤️')
ON CONFLICT (user_name, day_number) 
DO UPDATE SET custom_message = EXCLUDED.custom_message;
```

**Note:** Use double single quotes `''` for apostrophes in SQL (e.g., `You''re` instead of `You're`)

---

## 💡 Tips for Writing Messages

### 1. Keep it Personal
- Reference specific memories together
- Use inside jokes or nicknames
- Mention things only you two would understand

### 2. Match the Day's Theme
- **Rose Day**: Beauty, admiration, beginnings
- **Propose Day**: Commitment, forever, choosing each other
- **Chocolate Day**: Sweetness, treats, indulgence
- **Teddy Day**: Comfort, cuddles, warmth
- **Promise Day**: Commitments, vows, future plans
- **Hug Day**: Support, comfort, closeness
- **Kiss Day**: Passion, intimacy, romance
- **Valentine's Day**: Grand celebration, gratitude, forever love

### 3. Length
- Keep messages concise (2-3 sentences)
- Make them impactful and emotional
- Can be longer for Valentine's Day finale

### 4. Emojis
- Use 1-2 emojis maximum
- Match the day's theme emoji
- Don't overdo it

### 5. Examples of Personal Touch
```
"Remember when we first met on August 12? You wore that beautiful smile that I fell in love with. 🌹"

"You said yes on May 14th, and that was the happiest day of my life. Every day with you feels like that day. 💍"

"Just like how you always share your chocolates with me, I want to share my whole life with you. 🍫"
```

---

## 🔄 When Messages Appear

### Automatic Display
- Messages appear **after** she unlocks the day
- Shows in a special card below the day's animation
- Signed "- Your Cookie 🍪" automatically
- Updates in real-time if you change them

### Timing Strategy
**Option 1: Pre-load All**
- Add all 8 messages before Feb 7
- She sees them as she unlocks each day

**Option 2: Daily Addition**
- Add message each morning before she wakes up
- Makes it more spontaneous and fresh

**Option 3: Mix & Match**
- Pre-load some, add others daily
- Keeps some surprise element

---

## ✅ Verification

After adding messages, verify they're saved:

```sql
-- Check all messages
SELECT day_number, day_name, custom_message, created_at
FROM valentines_progress
WHERE user_name = 'Senorita'
ORDER BY day_number;
```

Should return 8 rows with your messages.

---

## 🎁 Bonus: Surprise Message Template

If you want to add an extra surprise, you can update the message after she's already seen it:

```sql
-- Add a PS to an existing message
UPDATE valentines_progress
SET custom_message = custom_message || E'\n\nP.S. I have a real surprise waiting for you tonight! 💝'
WHERE user_name = 'Senorita' AND day_number = 8;
```

This appends a new line to the existing message!

---

**Remember:** These messages are for Senorita's eyes only. Make them special, make them yours! 💕

**Pro Tip:** Write messages from your heart. She'll treasure authentic words more than perfect ones. ❤️
