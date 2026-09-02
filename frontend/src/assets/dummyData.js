export const dummyUserData = {
    "_id": "user_main_101",
    "email": "alex.carter@example.com",
    "full_name": "Alex Carter",
    "username": "alex_carter",
    "bio": "Minimalist Designer 🖤 | Building clean products | Coffee + Code ☕",
    "profile_picture": "https://i.pravatar.cc/150?img=32",
    "cover_photo": "https://picsum.photos/1200/400?random=20",
    "location": "London, UK",
    "followers": ["user_102", "user_103"],
    "following": ["user_102", "user_103"],
    "connections": ["user_102", "user_103"],
    "posts": [],
    "is_verified": true,
    "createdAt": "2026-08-10T10:00:00.000Z",
    "updatedAt": "2026-08-25T10:00:00.000Z",
}

const dummyUser2Data = {
   ...dummyUserData,
    _id: "user_102",
    username: "sophia_miles",
    full_name: "Sophia Miles",
    bio: "Minimalist Designer 🖤 | Building clean products | Coffee + Code ☕",

    profile_picture: "https://i.pravatar.cc/150?img=47",
}

const dummyUser3Data = {
   ...dummyUserData,
    _id: "user_103",
    username: "david_clark",
    full_name: "David Clark",
    bio: "Minimalist Designer 🖤 | Building clean products | Coffee + Code ☕",

    profile_picture: "https://i.pravatar.cc/150?img=15",
}

export const dummyStoriesData = [
    {
        "_id": "story_01",
        "user": dummyUserData,
        "content": "Building something new in black & white theme. Stay tuned 🚀",
        "media_url": "",
        "media_type": "text",
        "background_color": "#000000",
        "createdAt": "2026-08-25T08:00:00.000Z",
        "updatedAt": "2026-08-25T08:00:00.000Z",
    },
    {
        "_id": "story_02",
        "user": dummyUserData,
        "content": "",
        "media_url": "https://picsum.photos/400/700?random=21",
        "media_type": "image",
        "background_color": "#111111",
        "createdAt": "2026-08-25T09:00:00.000Z",
        "updatedAt": "2026-08-25T09:00:00.000Z",
    },
    {
        "_id": "story_03",
        "user": dummyUserData,
        "content": "Late night coding hits different 🌙",
        "media_url": "",
        "media_type": "text",
        "background_color": "#222222",
        "createdAt": "2026-08-25T07:00:00.000Z",
        "updatedAt": "2026-08-25T07:00:00.000Z",
    },
    {
    "_id": "story_04",
    "user": dummyUserData,
    "content": "Coffee, music, and a little peace ☕🎧",
    "media_url": "",
    "media_type": "text",
    "background_color": "#6A1B9A",
    "createdAt": "2026-08-25T08:30:00.000Z",
    "updatedAt": "2026-08-25T08:30:00.000Z",
},

{
    "_id": "story_05",
    "user": dummyUserData,
    "content": "Small steps every day, big dreams ahead ✨",
    "media_url": "",
    "media_type": "text",
    "background_color": "#00796B",
    "createdAt": "2026-08-25T10:00:00.000Z",
    "updatedAt": "2026-08-25T10:00:00.000Z",
},

{
    "_id": "story_06",
    "user": dummyUserData,
    "content": "Weekend mood: good vibes only 😎🌸",
    "media_url": "",
    "media_type": "text",
    "background_color": "#E91E63",
    "createdAt": "2026-08-25T12:30:00.000Z",
    "updatedAt": "2026-08-25T12:30:00.000Z",
},

{
    "_id": "story_07",
    "user": dummyUserData,
    "content": "Sometimes you just need to enjoy the moment 🌿",
    "media_url": "",
    "media_type": "text",
    "background_color": "#F57C00",
    "createdAt": "2026-08-25T15:00:00.000Z",
    "updatedAt": "2026-08-25T15:00:00.000Z",
},

{
    "_id": "story_08",
    "user": dummyUserData,
    "content": "Building something I'm proud of 💻❤️",
    "media_url": "",
    "media_type": "text",
    "background_color": "#3949AB",
    "createdAt": "2026-08-25T18:00:00.000Z",
    "updatedAt": "2026-08-25T18:00:00.000Z",
},
]

export const dummyPostsData = [
    {
        "_id": "post_01",
        "user": dummyUserData,
        "content": "Less is more. Designed my new feed in pure black & white 🖤🤍 What do you think? #minimal #ui",
        "image_urls": ["https://picsum.photos/600/400?random=31"],
        "cover_photo": ["https://picsum.photos/600/400?random=31"],

        "post_type": "text_with_image",
        "likes_count": ["user_102"],
        "createdAt": "2026-08-24T10:00:00.000Z",
        "updatedAt": "2026-08-24T10:00:00.000Z",
    },
    {
        "_id": "post_02",
        "user": dummyUserData,
        "content": "Consistency is the key. Keep building every day 🚀",
        "image_urls": [],
        "post_type": "text",
        "likes_count": ["user_102", "user_103"],
        "createdAt": "2026-08-23T10:00:00.000Z",
        "updatedAt": "2026-08-23T10:00:00.000Z",
    },
    {
        "_id": "post_03",
        "user": dummyUserData,
        "content": "My minimal workspace setup 2026",
        "image_urls": ["https://picsum.photos/600/400?random=32"],
        "post_type": "image",
        "likes_count": [],
        "createdAt": "2026-08-22T10:00:00.000Z",
        "updatedAt": "2026-08-22T10:00:00.000Z",
    }
]

export const dummyRecentMessagesData = [
    {
        "_id": "recent_01",
        "from_user_id": dummyUser2Data,
        "to_user_id": dummyUserData,
        "text": "Hey, your new design looks amazing!",
        "message_type": "text",
        "media_url": "",
        "seen": true,
        "createdAt": "2026-08-25T08:00:00.000Z",
        "updatedAt": "2026-08-25T08:00:00.000Z",
    },
    {
        "_id": "recent_02",
        "from_user_id": dummyUser3Data,
        "to_user_id": dummyUserData,
        "text": "Let's catch up tomorrow",
        "message_type": "text",
        "media_url": "",
        "createdAt": "2026-08-24T10:00:00.000Z",
        "updatedAt": "2026-08-24T10:00:00.000Z",
        "seen": false
    }
]

export const dummyMessagesData = [
    {
        "_id": "msg_01",
        "from_user_id": "user_102",
        "to_user_id": "user_main_101",
        "text": "Your UI is so clean 🔥",
        "message_type": "text",
        "media_url": "",
        "createdAt": "2026-08-24T10:00:00.000Z",
        "updatedAt": "2026-08-24T10:00:00.000Z",
        "seen": true
    },
    {
        "_id": "msg_02",
        "from_user_id": "user_main_101",
        "to_user_id": "user_102",
        "text": "Thanks! Black & white theme only",
        "message_type": "text",
        "media_url": "",
        "seen": true,
        "createdAt": "2026-08-24T10:05:00.000Z",
        "updatedAt": "2026-08-24T10:05:00.000Z",
    },
]

export const dummyConnectionsData = [dummyUserData, dummyUser2Data, dummyUser3Data]
export const dummyFollowersData = [dummyUser2Data, dummyUser3Data]
export const dummyFollowingData = [dummyUser2Data, dummyUser3Data]
export const dummyPendingConnectionsData = [dummyUser2Data]

// Extra for easy access like users[0], users[1]
export const users = [dummyUserData, dummyUser2Data, dummyUser3Data];