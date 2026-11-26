// The text for each occasion page (public/birthday-card.html and so on).
// Edit the words here, then run:  npm run seo
// Keep claims true to the product: preview is free, ₹35 per card, up to 5 photos, own song (MP3/M4A, 10 MB),
// the link stays active for at least 12 months, pay by UPI / cards / netbanking / wallets via Razorpay.

export const PRICE = '35';

export const PAGES = [
  {
    key: 'birthday', slug: 'birthday-card', label: 'Birthday card', short: 'Birthday',
    title: 'Animated Birthday Card Online, Send on WhatsApp | WishCraft',
    description: 'Make an animated birthday card with a party-hat teddy, a gift box that opens, a cake to blow out, your photos and music. Preview free, ₹35 to send.',
    h1: 'Animated birthday cards that feel like a little party',
    lead: 'A plain “happy birthday” text is gone in seconds. A WishCraft birthday card is something your friend opens, plays with and remembers: a gift box that wiggles until they tap it, your message written out like a letter, your photos as polaroids, and a cake whose candles they blow out before the whole screen bursts into confetti.',
    includes: [
      'A gift box that opens with a burst of confetti',
      'Your message typed out on a handwritten letter, with soft typing sounds',
      'Up to 5 photos as polaroids with your own captions',
      'A cake with candles to blow out, and the “Happy Birthday” tune',
      'A party-hat teddy (boy or girl) that runs around the cake',
      'Background music, or upload your own favourite song',
    ],
    messages: [
      'Another trip around the sun, and you still make everything brighter. I hope today brings loud laughter, too much cake and every person you love.',
      'On your birthday I just want you to know how lucky I am to have you. You make ordinary days feel like celebrations.',
      'Okay birthday star, it is officially your day. Eat the cake, make the wish, ignore the age. Love you lots!',
    ],
    faqs: [
      { q: 'Can I send the birthday card to someone in another city or country?', a: 'Yes. You get a link, and it opens on any phone or computer in a web browser. There is nothing to install, and the person you send it to does not pay anything.' },
      { q: 'Can I add photos of the birthday person?', a: 'Yes, up to 5 photos, each with a short caption. They appear as polaroids that develop as the person scrolls.' },
      { q: 'How much does a birthday card cost?', a: 'Previewing is free. Sending the card costs ₹35 once, paid by UPI, card, netbanking or wallet.' },
    ],
    bear: { prop: 'balloon', mood: 'party', hat: true, gender: 'f' },
  },
  {
    key: 'proposal', slug: 'proposal-card', label: 'Proposal card', short: 'Proposal',
    title: 'Online Marriage Proposal Card with Teddies | WishCraft',
    description: 'Propose with an animated card: a teddy runs in with a rose and asks the big question. The No button runs away. Add photos and music. Preview free, ₹35.',
    h1: 'Propose with a teddy who runs in holding a rose',
    lead: 'Some questions deserve more than a text message. In a WishCraft proposal card, a nervous teddy runs in from the side holding a rose, your letter is written out line by line, your photos appear one by one, and then comes the big question. The “No” button keeps running away, and if they somehow find it, the teddy sits down and cries. When they say yes, the rose changes hands and both teddies run around happily before a hug.',
    includes: [
      'A boy or girl teddy that runs in with a rose, you choose who is who',
      'A sealed envelope that opens to a handwritten-style letter',
      'Your photos as polaroids, then your own question, for example “Will you marry me?”',
      'A “No” button that runs away from fingers and mouse pointers',
      'A heartbreak scene if they keep trying: sad teddy, broken heart, drooping rose',
      'A celebration with the rose, fireworks, hearts and a hug',
    ],
    messages: [
      'From the very first day, something about you felt like home. You have seen my best and my worst, and you stayed. I cannot imagine a single future without you in it.',
      'Every plan I make, you are already in it. Every good thing that happens, you are the first person I want to tell. So, here it is…',
      'I wanted to ask this in a way you would never forget, so I made you this. Will you spend the rest of your life with me?',
    ],
    faqs: [
      { q: 'What happens if she (or he) presses No?', a: 'The No button runs away every time, so it can never really be pressed. Each attempt makes the proposing teddy sadder, until it sits down crying with a broken heart. Pressing Yes is the only way to finish.' },
      { q: 'Can a girl propose to a boy, or two people of the same gender?', a: 'Yes. You choose whether you are a boy or girl teddy, and whether they are. The one proposing runs in with the rose.' },
      { q: 'Is the proposal private?', a: 'Only people who have the link can open it, and the link is hard to guess. Search engines are told not to list it.' },
    ],
    bear: { prop: 'rose', mood: 'shy', gender: 'm' },
  },
  {
    key: 'valentine', slug: 'valentine-card', label: 'Valentine card', short: 'Valentine',
    title: 'Animated Valentine’s Day Card Online | WishCraft',
    description: 'Ask “Will you be my Valentine?” with an animated card: a teddy with a rose, a sealed love letter and a No button that runs away. Preview free, ₹35.',
    h1: 'A Valentine’s card that blushes, runs and asks nicely',
    lead: 'Skip the forwarded image. This Valentine card arrives as a sealed envelope. Inside is a love letter written just for them, a shy teddy holding a rose, and one small question that the No button refuses to answer. Add your photos together, pick a romantic music-box tune or upload your own song, and send it on WhatsApp.',
    includes: [
      'A sealed envelope with a heart seal that opens to a love letter',
      'A shy teddy that runs in holding a rose',
      'Your photos as polaroids, with captions like “first date”',
      'The question “Will you be my Valentine?”, or write your own',
      'A “No” button that runs away, and a sad teddy if they chase it',
      'Hearts, fireworks and a hug when they say yes',
    ],
    messages: [
      'I have been thinking about how to say this for a while. Every day with you feels a little softer and a little brighter.',
      'Roses are red, my cheeks are too, every single time I get a message from you. So here goes nothing…',
      'You are my favourite hello and my hardest goodbye. Be my Valentine?',
    ],
    faqs: [
      { q: 'Can I write my own Valentine question?', a: 'Yes. “Will you be my Valentine?” is filled in for you, and you can change it to anything up to 100 characters.' },
      { q: 'Does the other person need to install an app?', a: 'No. They just tap your link and the card opens in their browser, on any phone.' },
      { q: 'Can I use our own song?', a: 'Yes, upload an MP3 or M4A up to 10 MB. Or pick the built-in music box tune.' },
    ],
    bear: { prop: 'rose', mood: 'shy', gender: 'f' },
  },
  {
    key: 'anniversary', slug: 'anniversary-card', label: 'Anniversary card', short: 'Anniversary',
    title: 'Animated Anniversary Card for Your Partner | WishCraft',
    description: 'Celebrate your anniversary with an animated card: two teddies dancing, a love letter, your photos through the years and music. Preview free, ₹35.',
    h1: 'An anniversary card with two teddies and all your memories',
    lead: 'A year together is worth more than a quick emoji. This anniversary card opens like a letter, writes your message out slowly, shows your favourite photos through the years as polaroids, and ends with two teddies dancing among the hearts. It is a small, warm way to say you would choose them all over again.',
    includes: [
      'A love letter in a gold-edged stationery style',
      'Your photos “through the years” with captions',
      'Two teddies, one for each of you, dancing together',
      'Your own song or a soft built-in tune',
      'Hearts drifting across a night sky',
      'A private link for them to open whenever they like',
    ],
    messages: [
      'Another year of us, and I would choose you all over again. Thank you for the laughs, the patience and all the little moments.',
      'They say time flies when you are having fun. With you it has been one long adventure. Happy anniversary to my favourite person.',
      'Years from now I want to look back at this day and smile, because I spent it with you.',
    ],
    faqs: [
      { q: 'Can I add photos from different years?', a: 'Yes, up to 5 photos with captions such as “2019” or “our first trip”.' },
      { q: 'Does it work if we are in different cities?', a: 'Yes. Send the link on WhatsApp and they open it wherever they are.' },
      { q: 'Can I edit the card after paying?', a: 'A paid card is final, so use the free preview to check the names and spelling first.' },
    ],
    bear: { prop: 'heart', mood: 'love', gender: 'm' },
  },
  {
    key: 'congrats', slug: 'congratulations-card', label: 'Congratulations card', short: 'Congrats',
    title: 'Animated Congratulations Card Online | WishCraft',
    description: 'Cheer someone on with an animated congratulations card: a gift to open, your message, fireworks and a teddy with a golden trophy. Preview free, ₹35.',
    h1: 'Congratulations cards with fireworks and a golden trophy',
    lead: 'New job, graduation, a promotion, a big result? Tell them you are proud of them in a way they will actually remember. This card opens like a gift, writes your message out like a letter, and finishes with fireworks, confetti and a teddy running victory laps with a golden trophy.',
    includes: [
      'A gift box that opens with confetti',
      'Your congratulations written out like a handwritten letter',
      'Photos of the big moment, with captions',
      'Fireworks and spotlights sweeping the screen',
      'A teddy with a trophy running victory laps',
      'Music of your choice, or your own song',
    ],
    messages: [
      'You did it! All those late nights and hard work finally paid off. I am so proud of you, and honestly not surprised at all.',
      'Big news deserves a big celebration. You worked so hard for this, and it shows. Cannot wait to see what you do next.',
      'Congratulations! The world just got a little better because you did this.',
    ],
    faqs: [
      { q: 'Is this good for graduations, jobs and exam results?', a: 'Yes. The words are yours, so it works for any good news.' },
      { q: 'Can a group send one card?', a: 'One person creates and pays for the card, then shares the link with the person, or with the group if they want everyone to watch.' },
      { q: 'How fast can I send it?', a: 'A few minutes: choose the occasion, add names, a message and optional photos, preview, pay, and send the link.' },
    ],
    bear: { prop: 'trophy', mood: 'joy', hat: true, gender: 'm' },
  },
  {
    key: 'thanks', slug: 'thank-you-card', label: 'Thank-you card', short: 'Thank you',
    title: 'Animated Thank-You Card for Friends & Family | WishCraft',
    description: 'Say thank you properly with an animated card: a teddy offering flowers, a heartfelt letter, your photos and soft music. Preview free, ₹35.',
    h1: 'A thank-you card that says it properly',
    lead: 'Some people make life easier just by being around. When “thanks” in a chat does not feel like enough, send this: a thank-you card with a bouquet-bearing teddy that bows, a letter written out with all you want to say, and the photos that remind you both why it matters.',
    includes: [
      'A gift box that opens to your thank-you note',
      'A handwritten-style letter in soft green stationery',
      'Photos of moments you are grateful for',
      'A teddy that bows and offers flowers',
      'Warm sunbeams and a gentle music tune',
      'A link you can send on WhatsApp in seconds',
    ],
    messages: [
      'I do not say it enough, so I am saying it properly this time. Thank you for always showing up, for listening and for caring.',
      'Some people make life easier just by being around. You are one of them. Thank you for everything.',
      'Thank you for believing in me before I did. It changed more than you know.',
    ],
    faqs: [
      { q: 'Who is a thank-you card good for?', a: 'Teachers, mentors, parents, friends, doctors, team mates, anyone who helped you.' },
      { q: 'Can I send it to more than one person?', a: 'The link can be forwarded, so yes. Each card is one link.' },
      { q: 'What do I need to make it?', a: 'Just the names, your message, and any photos you want to add. Everything else is filled in for you.' },
    ],
    bear: { prop: 'flower', mood: 'happy', gender: 'f' },
  },
  {
    key: 'sorry', slug: 'sorry-card', label: 'Sorry card', short: 'Sorry',
    title: 'Say Sorry with an Animated Apology Card | WishCraft',
    description: 'Make an apology they will actually open: a sad teddy with flowers, your heartfelt letter and a “Forgive me?” button. Preview free, ₹35 to send.',
    h1: 'A sorry card for when words in a chat are not enough',
    lead: 'Saying sorry is hard, and a one-line text can feel cold. This apology card walks in slowly with a sad teddy holding flowers, then shows your letter, written out one line at a time, with the question “Forgive me?” at the end. If they take their time, the teddy sits and waits. When they say yes, there is a hug.',
    includes: [
      'A sad teddy that walks in with flowers',
      'A sealed envelope and a gentle, handwritten-style letter',
      'Photos that remind them of better days',
      'The question “Forgive me?”, or write your own',
      'Soft rain and a calm tune',
      'A hug and a quiet celebration when they say yes',
    ],
    messages: [
      'I messed up, and I know it. You did not deserve that, and I am truly sorry. I would really love the chance to make it right.',
      'I have been thinking about what happened, and I owe you an apology. You matter way more to me than being right.',
      'I am sorry. Not just for what I did, but for how it made you feel. Can we start again?',
    ],
    faqs: [
      { q: 'Will this make them forgive me?', a: 'Only you can do that with sincere words. The card gives your words a thoughtful, caring shape.' },
      { q: 'Can I change the question?', a: '“Forgive me?” is filled in, and you can change it to up to 100 characters.' },
      { q: 'Is the card private?', a: 'Yes. Only people with the link can open it, and search engines are asked not to list it.' },
    ],
    bear: { prop: 'flower', mood: 'sad', gender: 'm' },
  },
];

export const LEGAL = [
  { slug: 'contact', label: 'Contact Us' },
  { slug: 'terms', label: 'Terms & Conditions' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'refund', label: 'Refund & Cancellation' },
  { slug: 'shipping', label: 'Shipping & Delivery' },
];
