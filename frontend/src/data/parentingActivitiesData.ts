export type ActivityCategory =
  | "quiz"
  | "challenge"
  | "myth_fact"
  | "bonding";

export type AgeGroup = "all" | "2-4" | "5-7" | "8-12" | "13+";

export interface ParentingQuizQuestion {
  id: string;
  category: string;
  ageGroup: AgeGroup;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ScenarioOption {
  text: string;
  feedback: string;
  parentingTip: string;
}

export interface ParentingScenario {
  id: string;
  title: string;
  topic: string;
  ageGroup: AgeGroup;
  situation: string;
  childPerspective: string;
  options: ScenarioOption[];
}

export interface ParentingChallenge {
  id: string;
  title: string;
  badge: string;
  category: string;
  estimatedTime: string;
  ageGroup: AgeGroup;
  summary: string;
  instructions: string[];
  whyItWorks: string;
}

export interface ParentingMythFact {
  id: string;
  statement: string;
  isFact: boolean;
  category: string;
  ageGroup: AgeGroup;
  explanation: string;
  keyTakeaway: string;
}

export interface ParentingBondingActivity {
  id: string;
  title: string;
  type: "storytelling" | "drawing" | "conversation" | "creative" | "family";
  badge: string;
  ageGroup: AgeGroup;
  estimatedDuration: string;
  materialsNeeded: string[];
  overview: string;
  stepByStep: string[];
  developmentalBenefit: string;
}

// ─────────────────────────────────────────────────────────────
// 1. QUIZ QUESTIONS (18 questions)
// ─────────────────────────────────────────────────────────────
export const PARENTING_QUIZ_QUESTIONS: ParentingQuizQuestion[] = [
  {
    id: "pq-1",
    category: "Emotions & Tantrums",
    ageGroup: "2-4",
    question: "When a toddler is in the midst of an intense emotional meltdown, what is the most neurologically supportive response?",
    options: [
      "Explain logically why they should not be crying so they understand reason",
      "Send them to isolation immediately until they can behave calmly",
      "Stay physically close, keep your voice calm, and validate their emotion before attempting logic",
      "Distract them with a sweet treat or phone screen so the episode stops quickly"
    ],
    correctIndex: 2,
    explanation: "During a tantrum, the child's amygdala (the emotional alarm center) is overwhelmed, and their prefrontal cortex is temporarily offline. Co-regulation—providing a steady, calm physical presence and validating words—helps their nervous system return to a receptive state before logic can work."
  },
  {
    id: "pq-2",
    category: "Confidence & Praise",
    ageGroup: "5-7",
    question: "According to developmental psychologist Carol Dweck, which type of praise best fosters long-term resilience and a growth mindset?",
    options: [
      "Praising fixed ability, such as: 'You are a natural-born genius at this!'",
      "Praising the process, effort, and strategy: 'I noticed how carefully you tried different puzzle pieces!'",
      "Comparing them favorably to others: 'You finished way faster than all your classmates!'",
      "Giving unconditional praise regardless of effort to keep their self-esteem always high"
    ],
    correctIndex: 1,
    explanation: "Praising effort, perseverance, and problem-solving strategies encourages children to embrace challenges. When children are praised only for being 'smart', they often avoid difficult tasks for fear of losing that title."
  },
  {
    id: "pq-3",
    category: "Screen Time & Transitions",
    ageGroup: "5-7",
    question: "What is an effective strategy to transition a child away from tablets or gaming without tears and resistance?",
    options: [
      "Suddenly turn off the Wi-Fi without warning to enforce discipline",
      "Give a gentle 5-minute and 2-minute heads-up, then invite them into an engaging hands-on activity",
      "Promise them double the screen time tomorrow if they turn it off right now",
      "Threaten to confiscate all devices for a month every time they ask for more time"
    ],
    correctIndex: 1,
    explanation: "Digital media triggers sustained dopamine release. Abrupt shutoffs cause an acute drop in stimulation. Advance warnings allow the child's brain to anticipate the shift, and bridging to a tactile activity softens the transition."
  },
  {
    id: "pq-4",
    category: "Bedtime & Sleep",
    ageGroup: "2-4",
    question: "Why do young children frequently invent stalling requests ('one more water', 'tuck my blanket again') at bedtime?",
    options: [
      "They are intentionally practicing manipulation to test parental authority",
      "Bedtime represents separation from their attachment figures, sparking instinctive separation anxiety",
      "They have excessive daytime energy and need an intense physical workout right before bed",
      "Their room temperature is almost always incorrectly calibrated"
    ],
    correctIndex: 1,
    explanation: "Bedtime is the longest separation of a young child's day. Stalling is usually an unconscious bid to remain in secure connection with parents. Predictable, affectionate bedtime rituals fill their emotional bucket before sleep."
  },
  {
    id: "pq-5",
    category: "Communication & Empathy",
    ageGroup: "8-12",
    question: "When an 8-year-old comes home and says: 'Nobody likes me at school!', what is the most constructive first response?",
    options: [
      "Immediately dismiss it: 'That's not true, you have so many friends!'",
      "Call the school principal right away before listening to the story",
      "Reflect their feeling: 'That sounds really lonely and hurtful. Want to tell me what happened today?'",
      "Tell them they are being too dramatic and need to grow tougher skin"
    ],
    correctIndex: 2,
    explanation: "Dismissing feelings ('You're fine!') shuts down communication, even when well-intentioned. Empathic reflection makes the child feel genuinely seen, which gives them the safety to share what actually happened."
  },
  {
    id: "pq-6",
    category: "Digital Safety",
    ageGroup: "13+",
    question: "What is the most protective factor in keeping teenagers safe in digital environments?",
    options: [
      "Secretly installing spyware to read every private message without their knowledge",
      "An open, non-punitive relationship where they know they won't get their phone banned if they report an uncomfortable encounter",
      "Completely banning internet access until they turn 18",
      "Allowing unrestricted and unmonitored access to build trust"
    ],
    correctIndex: 1,
    explanation: "Research shows that teenagers who fear having their devices confiscated will hide online bullying, inappropriate contact, or mistakes. An open-door dialogue is the single strongest safeguard for teen digital safety."
  },
  {
    id: "pq-7",
    category: "Sibling Harmony",
    ageGroup: "5-7",
    question: "When two siblings are quarreling over a single beloved toy, what role should a parent play?",
    options: [
      "Always side with the younger child because they are smaller",
      "Act as an emotion coach and sports referee: describe the problem objectively and guide them to find a fair solution together",
      "Take the toy away and put both children in time-out for the rest of the afternoon",
      "Tell them to fight it out so they learn real-world survival skills"
    ],
    correctIndex: 1,
    explanation: "Mediating rather than judging ('I see two kids who both love this blue crayon. How can we make sure you both get a turn?') teaches lifelong conflict resolution skills instead of breeding resentment."
  },
  {
    id: "pq-8",
    category: "Learning & Curiosity",
    ageGroup: "5-7",
    question: "How does co-reading personalized storybooks support a child's early literacy and self-concept?",
    options: [
      "It only entertains them but has no measurable cognitive impact compared to textbooks",
      "Hearing and seeing their own name activates the medial prefrontal cortex, boosting narrative empathy and reading stamina",
      "It makes children arrogant by placing them in the center of every tale",
      "It replaces the need for formal phonics instruction entirely"
    ],
    correctIndex: 1,
    explanation: "Personalized narratives uniquely bridge cognitive engagement and emotional memory. Children identify intimately with the protagonist, accelerating vocabulary retention, empathy, and positive self-efficacy."
  },
  {
    id: "pq-9",
    category: "Homework & Motivation",
    ageGroup: "8-12",
    question: "When a child drags their feet on homework every evening, what usually lies beneath the procrastination?",
    options: [
      "Inherent laziness that must be cured with strict penalties",
      "A hidden difficulty, anxiety about failing, or cognitive fatigue from a long school day",
      "A desire to intentionally provoke parents into an argument",
      "Lack of competitive desire to be top of the class"
    ],
    correctIndex: 1,
    explanation: "Children rarely procrastinate out of malice. Procrastination is almost always an emotional regulation issue—fear of not understanding the material, perfectionism, or sensory depletion after 7 hours of structured school."
  },
  {
    id: "pq-10",
    category: "Healthy Boundaries",
    ageGroup: "2-4",
    question: "Why is a 'firm yet kind' boundary more effective than an angry lecture for a toddler who throws food?",
    options: [
      "Toddlers don't speak English anyway, so words are irrelevant",
      "Toddlers learn from immediate, predictable physical containment without fear; high emotional drama can accidentally reinforce the behavior",
      "Angry lectures build respect for the parent's supreme power",
      "Food throwing should always be ignored completely until age 6"
    ],
    correctIndex: 1,
    explanation: "Big emotional reactions (yelling, dramatic gasps) become exciting spectacles for toddlers. Calmly removing the plate while saying: 'Food belongs on the table, not the floor. All done for now' teaches cause and effect without anxiety."
  },
  {
    id: "pq-11",
    category: "Family Bonding",
    ageGroup: "all",
    question: "What is 'Special Time' (often recommended as 10-15 minutes of undivided one-on-one attention daily)?",
    options: [
      "Taking your child to an expensive amusement park on weekends",
      "Unplugged time where the child leads the play and the parent provides 100% warm, non-directive presence",
      "Time spent drilling spelling words and math flashcards together",
      "Letting the child watch whatever movie they want while the parent works beside them"
    ],
    correctIndex: 1,
    explanation: "Even 10-15 minutes of fully focused, delight-filled attention where the child directs the activity fills their attachment needs, dramatically reducing negative attention-seeking behaviors throughout the day."
  },
  {
    id: "pq-12",
    category: "Emotions & Tantrums",
    ageGroup: "8-12",
    question: "What does the term 'Name it to Tame it', coined by Dr. Dan Siegel, refer to?",
    options: [
      "Giving naughty children nicknames so they understand their faults",
      "Helping a child verbally label their emotions, which dampens right-brain emotional reactivity with left-brain integration",
      "Taming wild pets with children to teach empathy",
      "Memorizing the botanical names of flowers to relax"
    ],
    correctIndex: 1,
    explanation: "When children put words to their emotions ('I feel really nervous and left out right now'), neural activity shifts from the reactive amygdala into the reflective prefrontal cortex, reducing somatic distress."
  },
  {
    id: "pq-13",
    category: "Resilience & Failure",
    ageGroup: "8-12",
    question: "When your child loses a sports match or spelling bee and weeps bitter tears, what is the best parental role?",
    options: [
      "Complain to the judges so your child gets a participation trophy",
      "Be a warm harbor: let them grieve the loss without minimizing it, then celebrate their brave effort",
      "Tell them losing means they didn't practice hard enough and double their practice schedule",
      "Quickly buy them a brand-new toy to make them forget the loss immediately"
    ],
    correctIndex: 1,
    explanation: "Resilience is not the absence of heartbreak; it is the experience of surviving heartbreak with a supportive parent. Allowing them to feel disappointed without rushing to fix it builds inner grit."
  },
  {
    id: "pq-14",
    category: "Confidence & Praise",
    ageGroup: "13+",
    question: "When speaking with adolescents, why are reflective questions more effective than direct advice?",
    options: [
      "Teenagers have fully developed adult brains and know more than parents",
      "Their primary developmental task is individuation and autonomy; questions invite ownership rather than triggering defensive rebellion",
      "Parents are not supposed to share their values with teenagers",
      "Teenagers don't listen to anything anyway"
    ],
    correctIndex: 1,
    explanation: "Adolescent brains are hardwired to develop self-reliance. Asking: 'What do you think is your best move here?' honors their emerging autonomy and strengthens their executive decision-making."
  },
  {
    id: "pq-15",
    category: "Parental Well-Being",
    ageGroup: "all",
    question: "When a parent feels overwhelmed and on the verge of shouting, what is the best first action?",
    options: [
      "Keep shouting so the children know how serious things are",
      "Take a conscious parental pause: step back, take three grounding belly breaths, and regulate yourself before responding",
      "Pretend you feel pure joy and never show vulnerability",
      "Leave the house immediately without telling anyone"
    ],
    correctIndex: 1,
    explanation: "You cannot regulate a child from a dysregulated state. Taking a 10-second 'parent pause' models authentic emotional self-control and stops the escalation of family conflict."
  },
  {
    id: "pq-16",
    category: "Picky Eating",
    ageGroup: "2-4",
    question: "According to Ellyn Satter's Division of Responsibility in feeding, what is the parent's role versus the child's role?",
    options: [
      "The parent decides what, when, and where food is offered; the child decides whether and how much to eat",
      "The parent forces the child to clean their plate at every meal",
      "The child cooks whatever they want and eats whenever they feel like it",
      "The parent counts exact calories and weighs each portion daily"
    ],
    correctIndex: 0,
    explanation: "The Division of Responsibility relieves mealtime battles. When parents provide wholesome choices without pressure, children maintain their innate appetite awareness and are far more willing to try new foods over time."
  },
  {
    id: "pq-17",
    category: "Independence & Chores",
    ageGroup: "5-7",
    question: "What is the primary psychological benefit of having young children participate in household chores?",
    options: [
      "It saves parents thousands of hours of cleaning every week",
      "It fosters a sense of mattering, belonging, and competence as a valuable family contributor",
      "It ensures the child will never be messy as an adult",
      "It replaces the need for school homework"
    ],
    correctIndex: 1,
    explanation: "Children desire genuine significance. Meaningful contributions—like setting spoons or watering plants—signal: 'You are capable and your family relies on you,' elevating authentic self-worth."
  },
  {
    id: "pq-18",
    category: "Digital Safety",
    ageGroup: "8-12",
    question: "What is a healthy family boundary around portable digital devices in children's bedrooms at night?",
    options: [
      "Let kids fall asleep watching videos as long as the volume is down",
      "Establish a communal charging station outside bedrooms 45 minutes before lights-out",
      "Only confiscate devices if grades drop below an A",
      "Lock all family electronics inside a safe every night"
    ],
    correctIndex: 1,
    explanation: "Blue light suppresses melatonin, and notifications disrupt REM cycles. Charging phones in a common family area protects restorative sleep and eliminates late-night unsupervised internet temptations."
  }
];

// ─────────────────────────────────────────────────────────────
// 2. REAL-LIFE PARENTING SCENARIOS (10 scenarios)
// ─────────────────────────────────────────────────────────────
export const PARENTING_SCENARIOS: ParentingScenario[] = [
  {
    id: "sc-1",
    title: "The Supermarket Sweet Tantrum",
    topic: "Tantrums & Public Meltdowns",
    ageGroup: "2-4",
    situation: "You are at the grocery checkout after a long workday. Your 3-year-old spots colorful chocolate bars and demands one. When you gently say 'Not today, love,' they throw themselves onto the linoleum floor, crying and thrashing while fellow shoppers stare.",
    childPerspective: "I'm exhausted, hungry, and captivated by bright wrappers. My little brain cannot yet handle the agony of 'no' after sitting quietly in the cart for 30 minutes.",
    options: [
      {
        text: "Kneel down to their eye level, speak in a gentle whisper, validate their feeling ('You really wanted that yummy chocolate, didn't you? It's hard to hear no'), and offer a comforting hug without buying the chocolate.",
        feedback: "Empathetic and holding boundaries! You kept your composure, honored their intense desire, yet upheld the boundary without shame.",
        parentingTip: "When you whisper, a crying child instinctively quiets down to hear you. Acknowledging their wish doesn't mean giving in to it."
      },
      {
        text: "Pick up the chocolate bar and buy it just to end the scene quickly, promising yourself to be strict next time.",
        feedback: "Completely understandable when you're exhausted! Every parent has felt that supermarket pressure.",
        parentingTip: "Children are keen scientists. If tears reliably unlock treats, tantrums become their most reliable shopping tool. Try holding the boundary next time with extra affection."
      },
      {
        text: "Pick them up securely, walk outside or to a quieter aisle, let the big cry release safely in your arms, and say: 'I'll keep you safe until your body feels calm.'",
        feedback: "A masterclass in gentle de-escalation! Removing the sensory overload of fluorescent lights and stares helps both of you breathe.",
        parentingTip: "Leaving the immediate trigger allows their nervous system to down-regulate much faster than arguing over groceries."
      }
    ]
  },
  {
    id: "sc-2",
    title: "The Tablet Tug-of-War",
    topic: "Screen Time & Transitions",
    ageGroup: "5-7",
    situation: "Screen time is up. You ask your 6-year-old to turn off the cartoon. They clutch the tablet like a treasure chest, scream 'Just one more episode!', and push your hand away.",
    childPerspective: "The colorful cartoon is flooding my brain with dopamine. Turning it off feels like stepping into a cold, boring gray world.",
    options: [
      {
        text: "Yank the tablet away and announce: 'Because you acted like that, no screens for a whole week!'",
        feedback: "We've all reacted in frustration when boundaries are defied.",
        parentingTip: "Severe sudden consequences often provoke fear or revenge rather than internal responsibility. Next time, try joining their world for 60 seconds before powering down."
      },
      {
        text: "Sit next to them, look at the screen for 30 seconds and ask: 'Who is your favorite character here? Show me before we pause.' Then let them press the pause button themselves.",
        feedback: "Brilliant bridging technique! Entering their world for 30 seconds validates their interest and transfers power to their hands to press pause.",
        parentingTip: "Letting the child press the actual button provides closure and preserves their sense of autonomy during tough transitions."
      },
      {
        text: "Say: 'I hear how much you love this show! We have to pause it now, but would you like to hop like a bunny or fly like a jet to wash hands for dinner?'",
        feedback: "Playful parenting at its finest! Shifting from dopamine withdrawal into whimsical movement bypasses power struggles.",
        parentingTip: "Play is the universal language of childhood. Humor and imagination dissolve defiance far faster than stern commands."
      }
    ]
  },
  {
    id: "sc-3",
    title: "'I Hate Math!' Homework Meltdown",
    topic: "Homework & Frustration",
    ageGroup: "8-12",
    situation: "Your 9-year-old slams their math textbook onto the desk, tears welling in their eyes: 'I'm stupid! Everyone else gets long division and I will never ever understand this!'",
    childPerspective: "I feel vulnerable, behind, and scared that my parents will be disappointed if I'm not good at school.",
    options: [
      {
        text: "Say: 'You are NOT stupid. Stop crying, sit up straight, and let's finish page 44 right now so you don't get in trouble tomorrow.'",
        feedback: "Driven by a parent's desire to see their child succeed, but tough pressure can increase brain anxiety.",
        parentingTip: "Anxious brains cannot compute math. When the amygdala fires, working memory shuts down. Emotional calming must happen first."
      },
      {
        text: "Close the book gently, offer a glass of water, and say: 'Your brain is working so hard right now. Math frustration is completely normal. Let's take a 5-minute brain stretch, and then we'll tackle just ONE problem together.'",
        feedback: "Compassionate, growth-mindset coaching! Breaking a giant mountain into a small pebble restores self-confidence.",
        parentingTip: "Normalizing struggle as proof of learning ('Your neural pathways are stretching!') reframes mistakes as progress."
      },
      {
        text: "Do the math problems for them so they can get to bed without further stress.",
        feedback: "A loving instinct to rescue a child from distress.",
        parentingTip: "Doing the work for them accidentally signals: 'I agree, you cannot handle this.' Instead, do the first problem side-by-side, then let them try the second."
      }
    ]
  },
  {
    id: "sc-4",
    title: "The Endless Bedtime Delay",
    topic: "Bedtime & Sleep Rituals",
    ageGroup: "2-4",
    situation: "You have brushed teeth, read two bedtime stories, tucked them in, and turned off the lamp. Within two minutes: 'Mama, my sock feels weird!' Followed by: 'I need water!' and 'Check under the bed for spiders!'",
    childPerspective: "The dark room is quiet and lonely. When you walk out of the room, I feel the gap between us and I want to hear your voice again.",
    options: [
      {
        text: "Get visibly exasperated, scold them for being tricky, and slam the door shut.",
        feedback: "Every parent reaches their limit at 9:00 PM after a grueling 14-hour day.",
        parentingTip: "Slammed doors can heighten nighttime cortisol, making sleep physically harder. A predictable 'one extra kiss' ritual helps bridge the gap."
      },
      {
        text: "Create a tangible connection anchor: tuck a 'pocket heart' or a tiny warm kiss into their palm, tell them: 'Whenever you feel lonely, press your palm to your heart. I am always connected to you.'",
        feedback: "Magical and deeply grounding! Transference objects and heartfelt rituals provide soothing connection without keeping you stuck in the bedroom.",
        parentingTip: "Children crave connection over hydration. Filling their connection cup with a tangible ritual eases bedtime transitions."
      },
      {
        text: "Use the 'Pass System': Give them two decorated index cards ('Bedtime Passes') that they can trade in for one sip of water or one extra hug. Once used, the passes sleep until morning.",
        feedback: "A proven, gentle boundaries method! It grants children agency within clear, peaceful limits.",
        parentingTip: "Bedtime passes give children a sense of control, which drastically reduces anxious bedtime bargaining."
      }
    ]
  },
  {
    id: "sc-5",
    title: "Sibling War Over the Golden Crayon",
    topic: "Sibling Rivalry & Sharing",
    ageGroup: "5-7",
    situation: "Your 7-year-old and 5-year-old are screaming at the kitchen table. Both are pulling opposite ends of a single metallic gold drawing pen, both screaming 'I had it first!'",
    childPerspective: "If my sibling gets it, I lose! Everything feels like a test of who is favored more in this house.",
    options: [
      {
        text: "Snatch the pen away and yell: 'Since you two can never share, nobody gets it! Both of you go to your rooms!'",
        feedback: "A natural instinct when noise reaches boiling point, but misses the teaching opportunity.",
        parentingTip: "Punishing both doesn't teach how to resolve disputes; it often leaves siblings blaming each other even more."
      },
      {
        text: "Step in, gently place your hand on the pen so it stops moving, and say: 'Two artists, one special gold pen. This is a tough problem! Who has an idea of how both can make golden art today?'",
        feedback: "Empowering problem-solving! By placing the challenge back in their hands, you coach negotiation rather than acting as a courtroom judge.",
        parentingTip: "Describing the problem neutrally without blaming allows children to tap into their innate creativity for solutions."
      },
      {
        text: "Tell the older child: 'You're older, just let your little sibling have it and be the mature one.'",
        feedback: "Well-intentioned to protect the younger child, but risky for sibling dynamics.",
        parentingTip: "Always expecting older siblings to yield fosters deep, quiet resentment. Fairness means honoring both children's valid desires."
      }
    ]
  },
  {
    id: "sc-6",
    title: "'Nobody Played With Me Today'",
    topic: "Peer Dynamics & Social Confidence",
    ageGroup: "8-12",
    situation: "During dinner, your 10-year-old looks down at their rice and quietly says: 'At recess, Aarav and Vikram played soccer and didn't let me join their team. I just sat on the bench alone.'",
    childPerspective: "I feel rejected and embarrassed. I wonder if there is something wrong with me that makes kids exclude me.",
    options: [
      {
        text: "Dismiss it lightly: 'Oh don't worry about those silly boys! You don't need them anyway. You have your books!'",
        feedback: "Protective and loving, but can feel like their real heartbreak is being brushed under the carpet.",
        parentingTip: "Kids often hear 'don't worry' as 'your pain isn't important.' Start with deep empathy before reframing."
      },
      {
        text: "Reach out, squeeze their hand, and say: 'Oof, that feels so heavy to sit on the bench alone. I've had days like that too. What was the hardest part about it?' Listen fully before brainstorming next steps.",
        feedback: "Unconditional emotional attunement! Sharing that loneliness is a universal human experience takes away their shame.",
        parentingTip: "When children feel deeply understood, their own resilience awakens to brainstorm social solutions."
      },
      {
        text: "Text the other parents immediately to demand an explanation of why their sons were mean.",
        feedback: "A fierce mother/father bear protective instinct!",
        parentingTip: "Over-intervening in 10-year-old playground dynamics can embarrass your child. First coach them on how to invite themselves in or find new playmates."
      }
    ]
  },
  {
    id: "sc-7",
    title: "The Vegetable Standoff",
    topic: "Picky Eating & Mealtime Battles",
    ageGroup: "2-4",
    situation: "You prepared a lovely vegetable stew. Your 4-year-old takes one look, pushes the bowl away with two fingers, and proclaims: 'Yuck! Green trees are poisonous! I only want plain butter bread!'",
    childPerspective: "New textures and bitter green notes look suspicious to my hyper-sensitive tastebuds. I want predictable safe foods.",
    options: [
      {
        text: "Force them to sit until they eat 3 bites of broccoli, otherwise no dessert and no bedtime stories.",
        feedback: "Traditional old-school approach, but research shows pressure creates food aversion.",
        parentingTip: "Pressuring kids to eat vegetables makes them associate greens with anxiety and power struggles."
      },
      {
        text: "Say calmly: 'You don't have to eat the broccoli, but it can hang out on your plate. Would you like to dip one little branch in hummus to see what it crunches like?' If they decline, leave it without comment.",
        feedback: "The gold standard of gentle food exposure! No pressure, zero drama, playful curiosity.",
        parentingTip: "It takes 15–20 neutral exposures to a new food before a child's sensory palate accepts it. Keep offering without insisting."
      },
      {
        text: "Immediately jump up and cook them their favorite special meal of chicken nuggets or chips.",
        feedback: "Kind and caring, but turns you into a short-order chef.",
        parentingTip: "Serve meals with at least one 'safe' food they reliably like (e.g. rice or bread), but maintain one family meal."
      }
    ]
  },
  {
    id: "sc-8",
    title: "Stage Fright Before the School Play",
    topic: "Anxiety & Brave Steps",
    ageGroup: "8-12",
    situation: "Tomorrow morning is the annual school drama play. Your 8-year-old has 4 lines. At 8:30 PM, their tummy aches, they feel hot, and they whisper: 'I can't go to school tomorrow. I'm going to forget my words and everyone will laugh.'",
    childPerspective: "The fear of social humiliation feels like a physical threat to my survival right now.",
    options: [
      {
        text: "Tell them: 'There is nothing to be afraid of! You practiced 50 times! Don't be a scaredy-cat, you'll be fine!'",
        feedback: "Tough love with good intentions, but saying 'don't be afraid' doesn't calm an activated nervous system.",
        parentingTip: "Anxiety is involuntary. Acknowledging the fear ('Being on stage is truly brave') helps them feel supported."
      },
      {
        text: "Sit together, do 'butterfly breathing' (slow breath in, slow flutter out), and say: 'Courage doesn't mean you aren't scared. Courage means being scared and doing it anyway. Let's make a silly pact: even if you freeze, I will be in row 3 giving you our secret superhero wink.'",
        feedback: "Heartwarming, physiologically sound grounding! Secret signals and normalizing fear empower true bravery.",
        parentingTip: "Having a physical anchor (looking at mom's superhero wink) grounds the nervous system under stage spotlight."
      },
      {
        text: "Write a sick note to the teacher right away so they don't have to experience any discomfort.",
        feedback: "Comforting in the moment, but unintentionally confirms that fear is dangerous.",
        parentingTip: "Complete avoidance teaches the brain: 'I was saved because I ran away.' Small, supported steps through fear build lasting confidence."
      }
    ]
  },
  {
    id: "sc-9",
    title: "'You Are The Meanest Parent In The World!'",
    topic: "Teens & Big Verbal Outbursts",
    ageGroup: "13+",
    situation: "You set a boundary that homework must be finished before going to the mall with friends. Your 14-year-old slams their bedroom door, shouts: 'I hate you! You ruin my entire life, you're the worst parent on earth!'",
    childPerspective: "I am bursting with peer FOMO. My identity revolves around fitting in with my friends, and your boundary makes me feel powerless.",
    options: [
      {
        text: "Kick the door open and scream back: 'How dare you speak to me that way after everything I sacrifice for you! You are grounded for a month!'",
        feedback: "A completely visceral reaction when feeling attacked and unappreciated.",
        parentingTip: "Meeting teen dysregulation with adult dysregulation fuels the fire. Two flaming torches don't extinguish a fire; water does."
      },
      {
        text: "Take a deep breath outside their door. Say steadily through the door: 'I love you too much to argue while we are both upset. I am in the living room whenever you want to talk calmly,' and let them cool off.",
        feedback: "The epitome of emotional maturity! You held the boundary, refused to take teenage venting personally, and left the door open for repair.",
        parentingTip: "Adolescent brains test boundaries to see if you can hold steady when they cannot hold themselves steady."
      },
      {
        text: "Feel guilty, apologize, and let them go to the mall anyway without doing the homework.",
        feedback: "Done out of a longing for harmony and fear of teen rejection.",
        parentingTip: "Teens actually feel less safe when parents cave under emotional outbursts. Calm firmness provides an anchor in their storm."
      }
    ]
  },
  {
    id: "sc-10",
    title: "The Broken Ceramic Heirloon",
    topic: "Honesty, Mistakes & Repair",
    ageGroup: "5-7",
    situation: "You hear a crash in the hallway. You rush over and find grandma's ceramic tea saucer shattered. Your 6-year-old is standing nearby holding a toy soccer ball, eyes wide, stammering: 'The dog ran by and pushed it!' (The dog was fast asleep in the bedroom).",
    childPerspective: "I made a huge mistake and I am terrified that you will be furious and stop loving me.",
    options: [
      {
        text: "Say sharply: 'Don't you dare lie to me! I know the dog didn't do it! Lying is a sin and now you get double punishment!'",
        feedback: "A reaction fueled by shock and grief over the broken keepsake.",
        parentingTip: "Harsh punishments for lying teach children to become better, stealthier liars. Safety fosters truthful confession."
      },
      {
        text: "Breathe, kneel down so you're safe, and say: 'The saucer is broken, but you are more important than any saucer. It can be really scary to tell the truth when an accident happens. Can you tell me what really happened with the soccer ball?'",
        feedback: "World-class parenting! Separating the child's worth from the accident creates the safety necessary for honesty and restitution.",
        parentingTip: "Once the truth is spoken, involve them in the repair (helping sweep with a brush, or gluing pieces) to teach accountability."
      },
      {
        text: "Clean up the mess in silence with a frosty cold shoulder so they stew in guilt for the rest of the day.",
        feedback: "Passive silence often feels like emotional abandonment to a young child.",
        parentingTip: "Direct, warm repair keeps the parent-child attachment secure through mistakes."
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────
// 3. POSITIVE PARENTING CHALLENGES (8 challenges)
// ─────────────────────────────────────────────────────────────
export const PARENTING_CHALLENGES: ParentingChallenge[] = [
  {
    id: "pc-1",
    title: "15-Minute Unplugged 'Golden Time'",
    badge: "🌟 Deep Connection",
    category: "Attachment & Presence",
    estimatedTime: "15 mins",
    ageGroup: "all",
    summary: "Dedicate 15 uninterrupted minutes where your phone is in another room and your child directs the play.",
    instructions: [
      "Put your mobile phone on Do Not Disturb and place it in another room.",
      "Tell your child: 'For the next 15 minutes, you are the boss of what we do together! Drawing, building blocks, or making funny voices—I am all yours.'",
      "Follow their lead completely without directing, correcting, or checking the clock."
    ],
    whyItWorks: "Undivided, non-judgmental presence fills your child's emotional cup so deeply that tantrums and negative bids for attention naturally decrease."
  },
  {
    id: "pc-2",
    title: "The 'Praise the Effort' Mission",
    badge: "🌱 Growth Mindset",
    category: "Confidence Building",
    estimatedTime: "All Day",
    ageGroup: "5-7",
    summary: "Catch your child practicing, persevering, or being kind, and praise the specific process rather than the outcome.",
    instructions: [
      "Instead of saying 'Good boy/girl!' or 'You're so smart!', replace it with 3 process observations.",
      "Example 1: 'I saw you try three different puzzle pieces until you found the one that fit! That was great patience.'",
      "Example 2: 'Look how much care you put into blending those orange and yellow colors.'",
      "Notice how your child reacts to specific recognition of their hard work."
    ],
    whyItWorks: "Process praise develops resilience and intrinsic motivation. It teaches children that skills are grown through dedication, not innate luck."
  },
  {
    id: "pc-3",
    title: "Bedtime 'Rose, Thorn & Bud' Ritual",
    badge: "🌙 Emotional Listening",
    category: "Bedtime & Mindfulness",
    estimatedTime: "10 mins",
    ageGroup: "5-7",
    summary: "Replace generic 'How was your day?' with the magical 3-part reflection before lights out.",
    instructions: [
      "When lights are dimmed, share your own Rose (the best highlight), Thorn (something that was hard), and Bud (something you look forward to tomorrow).",
      "Invite your child to share their Rose, Thorn, and Bud.",
      "Listen with empathy to the Thorn without jumping in to solve or dismiss it."
    ],
    whyItWorks: "Sharing your own minor 'thorn' models vulnerability. It gives children permission to release difficult emotions before entering restorative sleep."
  },
  {
    id: "pc-4",
    title: "The 'Parent Pause' Reset Challenge",
    badge: "🧘 Co-Regulation",
    category: "Parental Self-Care",
    estimatedTime: "Throughout the Day",
    ageGroup: "all",
    summary: "Take three slow belly breaths before responding whenever you feel irritation rising in your chest.",
    instructions: [
      "Notice the physical cue of anger: tightening shoulders, shallow breathing, clenched jaw.",
      "Before speaking, press your feet firmly onto the floor, drop your shoulders, and inhale for 4 seconds, exhale for 6 seconds.",
      "Remind yourself internally: 'My child is not giving me a hard time; my child is HAVING a hard time.'"
    ],
    whyItWorks: "Lengthening your exhale stimulates the vagus nerve, preventing the fight-or-flight trigger so you can respond with wisdom rather than reactivity."
  },
  {
    id: "pc-5",
    title: "Emotion Detective: Name It to Tame It",
    badge: "🔍 Emotional Literacy",
    category: "Emotions & Empathy",
    estimatedTime: "5 mins",
    ageGroup: "2-4",
    summary: "Help your child label big feelings using color, weather, or animal metaphors.",
    instructions: [
      "When your child shows signs of frustration, ask: 'Is your inside feeling like a stormy thunderstorm, a fizzy soda can, or a grumpy bear?'",
      "Mirror their answer: 'I hear you. The fizzy soda feeling can be so uncomfortable inside your chest.'",
      "Offer a sensory reset: stomping feet, drinking cold water, or squeezing a pillow."
    ],
    whyItWorks: "Young children lack abstract vocabulary. Metaphors bridge the gap between bodily sensations and emotional understanding."
  },
  {
    id: "pc-6",
    title: "Co-Author a 3-Minute Bedtime Tale",
    badge: "📖 Creative Storytelling",
    category: "Imagination & Bonding",
    estimatedTime: "8 mins",
    ageGroup: "all",
    summary: "Invent a quick, silly personalized story together where your child picks the hero and the superpower.",
    instructions: [
      "Ask your child: 'If you were an animal hero tonight, what would you be and where would our spaceship fly?'",
      "Take turns: you say one sentence, they say the next sentence.",
      "End the story with the hero getting warm, cozy, and drifting off into sweet, magical dreams."
    ],
    whyItWorks: "Storytelling activates the brain's imagination centers and releases oxytocin, transitioning the mind seamlessly from alertness to rest."
  },
  {
    id: "pc-7",
    title: "Secret Family Kindness Mission",
    badge: "💌 Empathy & Generosity",
    category: "Family Values",
    estimatedTime: "20 mins",
    ageGroup: "8-12",
    summary: "Team up with your child to do a secret act of kindness for a neighbor, grandparent, or friend.",
    instructions: [
      "Brainstorm a stealth kindness mission: baking cookies, picking flowers, or drawing an uplifting surprise bookmark.",
      "Deliver it together anonymously or with a heartfelt little note.",
      "Talk on the walk home about how it felt inside your chest to make someone's day brighter."
    ],
    whyItWorks: "Prosocial activities trigger dopamine and serotonin, cultivating authentic empathy and community spirit."
  },
  {
    id: "pc-8",
    title: "The Gratitude Jar Whisper",
    badge: "🍯 Gratitude & Joy",
    category: "Family Rituals",
    estimatedTime: "5 mins",
    ageGroup: "all",
    summary: "Write down or whisper one specific thing each family member is thankful for at dinner.",
    instructions: [
      "Keep a clean glass jar and small colorful paper strips at the dinner table.",
      "Have everyone write or draw one tiny delight from today (e.g. 'the warm sunshine', 'grandma's dosa', 'finishing the chapter').",
      "Fold the paper and drop it into the jar with a satisfying clink."
    ],
    whyItWorks: "Regular gratitude practices physically rewire the brain to scan for safety, joy, and positive memories rather than threats."
  }
];

// ─────────────────────────────────────────────────────────────
// 4. PARENTING MYTH OR FACT (12 items)
// ─────────────────────────────────────────────────────────────
export const PARENTING_MYTHS_FACTS: ParentingMythFact[] = [
  {
    id: "mf-1",
    statement: "Ignoring a young child's emotional tantrum teaches them to be tough and self-reliant.",
    isFact: false,
    category: "Emotional Development",
    ageGroup: "2-4",
    explanation: "Research in infant and toddler neuroscience demonstrates that children cannot learn self-regulation in isolation. When left alone during extreme distress, their nervous system eventually shuts down in despair (learned helplessness), not true calm. Co-regulation builds genuine neural pathways for self-soothing.",
    keyTakeaway: "Co-regulation must precede self-regulation."
  },
  {
    id: "mf-2",
    statement: "Reading aloud to children continues to provide significant cognitive and emotional benefits even after they can read independently.",
    isFact: true,
    category: "Literacy & Connection",
    ageGroup: "8-12",
    explanation: "A child's listening comprehension level typically exceeds their reading level until approximately age 13 or 14. Reading aloud allows children to enjoy complex, rich literary themes, advanced vocabulary, and deeply comforting attachment time without decoding fatigue.",
    keyTakeaway: "Keep reading bedtime chapters together well into primary and middle school."
  },
  {
    id: "mf-3",
    statement: "Telling your child 'You are so smart!' whenever they do well is the best way to boost long-term self-esteem.",
    isFact: false,
    category: "Growth Mindset",
    ageGroup: "5-7",
    explanation: "Extensive studies by Stanford professor Carol Dweck revealed that children praised for their intelligence become risk-averse and easily demoralized when they face inevitable difficulty. Praising the strategy, perseverance, and effort develops a resilient growth mindset.",
    keyTakeaway: "Praise the hard work, curiosity, and strategy rather than innate smartness."
  },
  {
    id: "mf-4",
    statement: "A human child's brain does not finish developing the prefrontal cortex (responsible for impulse control) until their mid-twenties.",
    isFact: true,
    category: "Neuroscience",
    ageGroup: "all",
    explanation: "The executive control center of the human brain—governing emotional inhibition, future planning, and risk calculation—is the last region to mature, typically around age 25. Understanding this developmental reality helps parents maintain realistic expectations for childhood impulse control.",
    keyTakeaway: "Children are not miniature adults; their impulse brakes are literally still under construction."
  },
  {
    id: "mf-5",
    statement: "Strict physical punishment and instilling fear of authority creates morally sound, honest children.",
    isFact: false,
    category: "Discipline & Trust",
    ageGroup: "all",
    explanation: "Decades of pediatric studies show that fear-based punishment does not teach internal empathy or moral reasoning; it primarily teaches children how to avoid getting caught and increases anxiety, aggression, and secrecy in later years.",
    keyTakeaway: "Connection and logical consequences create internal moral compasses far better than fear."
  },
  {
    id: "mf-6",
    statement: "Physical touch—such as a warm bear hug or gentle back rub—rapidly reduces cortisol and releases oxytocin in upset children.",
    isFact: true,
    category: "Somatic Calming",
    ageGroup: "all",
    explanation: "Skin-to-skin and loving touch stimulate pressure receptors that trigger the parasympathetic nervous system, slowing heart rates and flooding the bloodstream with oxytocin (the bonding neurochemical).",
    keyTakeaway: "When words fail during big storms, quiet loving touch often speaks directly to the nervous system."
  },
  {
    id: "mf-7",
    statement: "Children who resist sleep or request multiple drinks of water are purposely manipulating their parents.",
    isFact: false,
    category: "Sleep Psychology",
    ageGroup: "2-4",
    explanation: "Bedtime triggers primal separation anxiety in young children. What appears to be manipulation is typically an instinctive effort to maintain connection with primary caregivers during the vulnerable transition into darkness.",
    keyTakeaway: "Fill their emotional bucket with warmth before asking them to navigate darkness."
  },
  {
    id: "mf-8",
    statement: "Allowing children to experience safe, age-appropriate micro-failures builds stronger psychological resilience than sheltering them from all discomfort.",
    isFact: true,
    category: "Resilience",
    ageGroup: "8-12",
    explanation: "When children experience a low-stakes failure (e.g. forgetting a homework folder or losing a board game) and discover they can survive it with a supportive parent, their brain learns that failure is not fatal, unlocking genuine courage.",
    keyTakeaway: "Protect your child from real danger, but permit healthy, constructive discomfort."
  },
  {
    id: "mf-9",
    statement: "Parents should never apologize to their children because it weakens parental authority and respect.",
    isFact: false,
    category: "Parental Modeling",
    ageGroup: "all",
    explanation: "When a parent says: 'I'm sorry I raised my voice earlier. I was overwhelmed, but it wasn't your fault', it models humility, accountability, and the gold standard of emotional repair. It actually deepens child respect.",
    keyTakeaway: "Rupture and repair is the heartbeat of secure, lifelong relationships."
  },
  {
    id: "mf-10",
    statement: "Interactive storytelling and drawing together builds neural connectivity between the creative right brain and analytical left brain.",
    isFact: true,
    category: "Creative Development",
    ageGroup: "5-7",
    explanation: "Co-creating art and narratives engages both sequential language centers (left hemisphere) and visual-emotional imagination (right hemisphere), stimulating robust corpus callosum neural integration.",
    keyTakeaway: "Creative play is not frivolous fluff; it is high-level cognitive brain building."
  },
  {
    id: "mf-11",
    statement: "Teenagers pull away from parents because they no longer care about their family's values.",
    isFact: false,
    category: "Adolescent Psychology",
    ageGroup: "13+",
    explanation: "Adolescent individuation is a biological mandate designed to foster self-sufficiency. Deep down, teenagers still desperately need their parents as a secure anchor, even as they push boundaries to discover their distinct identities.",
    keyTakeaway: "Teenagers push parents away to test if the anchor holds firm under pressure."
  },
  {
    id: "mf-12",
    statement: "Children learn how to regulate their emotions by watching how their parents handle everyday frustrations, not by listening to lectures.",
    isFact: true,
    category: "Mirror Neurons",
    ageGroup: "all",
    explanation: "The human brain contains mirror neuron networks that continuously absorb the physiological and emotional state of caregivers. A parent who stays composed during traffic jams teaches more about calm than 100 lectures on patience.",
    keyTakeaway: "Your calm presence is the classroom your children learn from every day."
  }
];

// ─────────────────────────────────────────────────────────────
// 5. PARENT–CHILD BONDING ACTIVITIES (14 activities)
// ─────────────────────────────────────────────────────────────
export const PARENT_CHILD_BONDING_ACTIVITIES: ParentingBondingActivity[] = [
  {
    id: "ba-1",
    title: "The Pass-Along Storybook Chain",
    type: "storytelling",
    badge: "📖 Collaborative Story",
    ageGroup: "5-7",
    estimatedDuration: "15 mins",
    materialsNeeded: ["Blank paper", "Colored markers or crayons"],
    overview: "Co-create a mini illustrated storybook where parent and child take turns inventing one wild sentence and one drawing each.",
    stepByStep: [
      "Fold two sheets of paper in half to make an 8-page little booklet.",
      "Parent writes sentence #1: 'Deep inside the whispering forest, a little blue rabbit found a key that chimed like a bell.'",
      "Child draws the rabbit and writes or dictates sentence #2.",
      "Alternate pages until you reach the triumphant ending and write 'By [Child] and [Parent]' on the cover!"
    ],
    developmentalBenefit: "Boosts narrative structure understanding, collaborative creativity, and strengthens parent-child conversational reciprocity."
  },
  {
    id: "ba-2",
    title: "The Living Room Starry Fort",
    type: "creative",
    badge: "⛺ Cozy Architecture",
    ageGroup: "all",
    estimatedDuration: "25 mins",
    materialsNeeded: ["2 chairs", "Bed sheets or blankets", "Flashlight or fairy lights", "Favorite storybook"],
    overview: "Construct an enchanting reading cave in your living room where all modern screens are strictly forbidden.",
    stepByStep: [
      "Drape lightweight blankets across chair backs and secure edges with soft books or clothespins.",
      "Crawl inside together and place a soft pillow nest on the rug.",
      "Turn off room lights, flick on the flashlight toward the roof for a magical glow, and read your child's favorite story."
    ],
    developmentalBenefit: "Creates a multisensory sensory-safe container that lowers evening stress hormones and cements happy childhood memories."
  },
  {
    id: "ba-3",
    title: "The 'If I Were...' Dinner Interview",
    type: "conversation",
    badge: "🎙️ Spark Questions",
    ageGroup: "5-7",
    estimatedDuration: "12 mins",
    materialsNeeded: ["A spoon (as a microphone)", "Playful curiosity"],
    overview: "Transform mundane dinner chatter into a hilarious talk-show interview using imaginative prompt questions.",
    stepByStep: [
      "Hold up a spoon and introduce your child as the 'World's Most Famous Explorer'.",
      "Ask question 1: 'If you could invent a new ice cream flavor that tastes like an adventure, what ingredients would you pick?'",
      "Ask question 2: 'If you could turn our family car into any animal, which animal would drive us to school?'",
      "Hand the spoon to your child and let them interview you with their own whimsical questions!"
    ],
    developmentalBenefit: "Expands divergent thinking, verbal expression, and gives quiet children an entertaining platform to be heard."
  },
  {
    id: "ba-4",
    title: "Two-Artist Blindfold Drawing Game",
    type: "drawing",
    badge: "🎨 Laugh & Sketch",
    ageGroup: "8-12",
    estimatedDuration: "15 mins",
    materialsNeeded: ["Paper", "2 pens", "A soft scarf or sleep mask"],
    overview: "One person is blindfolded while the other gives hilarious verbal coordinates to draw a mystery animal or castle.",
    stepByStep: [
      "Tie a soft scarf gently over the blindfolded artist's eyes.",
      "The guide gives instructions without touching: 'Draw a circle in the center... now add two triangular ears... now three whiskers on the left.'",
      "Remove the mask to reveal the abstract, laugh-inducing masterpiece!",
      "Switch roles so your child gets to be the director."
    ],
    developmentalBenefit: "Teaches spatial vocabulary, active listening, and shows that making funny imperfect mistakes is joyful."
  },
  {
    id: "ba-5",
    title: "The Secret Handshake & Affirmation Code",
    type: "family",
    badge: "🤝 Special Ritual",
    ageGroup: "all",
    estimatedDuration: "10 mins",
    materialsNeeded: ["Just hands and happy hearts!"],
    overview: "Create a unique 4-step family handshake that concludes with a shared secret whisper of encouragement.",
    stepByStep: [
      "Invent 4 distinct gestures together (e.g. palm tap, pinky promise twist, gentle elbow bump, finger snap).",
      "Add a special secret phrase at the end: 'We are brave, we are kind, we have each other!'",
      "Use this handshake whenever saying goodbye at the school gates or welcoming them home."
    ],
    developmentalBenefit: "Physical connection anchors security and reduces separation anxiety during daily school departures."
  },
  {
    id: "ba-6",
    title: "Nature Scavenger Hunt & Leaf Characters",
    type: "creative",
    badge: "🍂 Outdoor Adventure",
    ageGroup: "2-4",
    estimatedDuration: "30 mins",
    materialsNeeded: ["A small basket", "Fallen leaves, twigs, stones", "Paper and glue"],
    overview: "Step outside to gather fallen nature treasures, then glue them onto paper to bring whimsical woodland creatures to life.",
    stepByStep: [
      "Take a mindful stroll in your yard, garden, or neighborhood park.",
      "Hunt for: 3 smooth pebbles, 5 colorful fallen leaves, and 2 curved twigs.",
      "Bring them inside, glue leaves down as wings or ears, and use twigs as little dancing legs."
    ],
    developmentalBenefit: "Promotes fine motor dexterity, sensory outdoor grounding, and environmental mindfulness."
  },
  {
    id: "ba-7",
    title: "Reverse Roles: The 20-Minute Teacher",
    type: "conversation",
    badge: "🎓 Child In Charge",
    ageGroup: "8-12",
    estimatedDuration: "20 mins",
    materialsNeeded: ["Whatever subject your child loves (drawing, legos, gaming, cricket, origami)"],
    overview: "Flip family dynamics! Your child is the professor teaching you an intricate skill while you act as an attentive student.",
    stepByStep: [
      "Ask your child to prepare a 15-minute masterclass on a topic they adore (e.g. how to build a Lego fortress or how to spin a cricket ball).",
      "Sit politely, take notes on a pad, raise your hand, and ask earnest questions.",
      "Thank Professor [Child's Name] with a hearty applause at the conclusion!"
    ],
    developmentalBenefit: "Inverting power dynamics builds supreme confidence, self-worth, and communication mastery."
  },
  {
    id: "ba-8",
    title: "The Gratitude Whisper Jar",
    type: "family",
    badge: "🍯 Memory Vault",
    ageGroup: "all",
    estimatedDuration: "10 mins",
    materialsNeeded: ["Recycled glass jar or cardboard box", "Colorful sticky notes", "Felt pens"],
    overview: "Create an ongoing family memory bank of heartwarming moments to read aloud whenever someone has a cloudy day.",
    stepByStep: [
      "Decorate the jar with stickers, ribbon, or paint.",
      "Whenever something sweet happens (a funny joke, eating warm samosas, finding a lost pencil), scribble it on a note and drop it in.",
      "Once a month at dinner, dump the jar onto the table and take turns reading all the joyful memories."
    ],
    developmentalBenefit: "Rewires the brain's negativity bias, fostering optimistic outlooks and gratitude."
  },
  {
    id: "ba-9",
    title: "The Mystery Texture Blindfold Tasting",
    type: "family",
    badge: "🍓 Sensory Feast",
    ageGroup: "5-7",
    estimatedDuration: "15 mins",
    materialsNeeded: ["Blindfold / clean cloth", "Tiny safe bites of 4 foods (e.g. apple slice, carrot, raisin, cheese)"],
    overview: "A safe, giggly kitchen science game to expand picky palates without any mealtime pressure.",
    stepByStep: [
      "Place 4 small bowls with gentle familiar foods on the table.",
      "Blindfold the taster and let them sniff first, then feel the texture with clean fingers, then take a tiny nibble.",
      "The child guesses what food it is and rates its 'crunch factor' from 1 to 10!"
    ],
    developmentalBenefit: "Disarms food anxiety by turning tasting into a neutral sensory science experiment rather than a dinner demand."
  },
  {
    id: "ba-10",
    title: "Superhero Empathy Dilemmas",
    type: "conversation",
    badge: "🦸 Moral Imagination",
    ageGroup: "8-12",
    estimatedDuration: "15 mins",
    materialsNeeded: ["Imagination & a cozy sofa"],
    overview: "Explore intriguing moral dilemmas using superhero situations to deepen your child's empathy and fairness instincts.",
    stepByStep: [
      "Pose dilemma 1: 'Imagine you have invisibility. You see a classmate secretly dropping another student's lunchbox. What does a real hero do?'",
      "Pose dilemma 2: 'A superhero has the power to either cure all animal illnesses or make everyone in the world speak all languages. Which would you choose and why?'",
      "Explore their answers without declaring right or wrong."
    ],
    developmentalBenefit: "Sharpens moral reasoning, perspective-taking, and deep ethical dialogue in a safe fictional framework."
  },
  {
    id: "ba-11",
    title: "Shadow Puppetry & Bedtime Tales",
    type: "storytelling",
    badge: "🌙 Shadow Magic",
    ageGroup: "2-4",
    estimatedDuration: "10 mins",
    materialsNeeded: ["Flashlight or phone light", "A blank bedroom wall"],
    overview: "Cast flying birds, snapping crocodiles, and leaping deer across bedroom walls using only hands and flashlight beams.",
    stepByStep: [
      "Dim all room lights and beam a flashlight at an empty wall.",
      "Show them how linking thumbs creates a flying bird.",
      "Let their hands explore making a barking dog or swimming fish.",
      "Tell a soothing story where the shadow bird flies home to its cozy nest to sleep."
    ],
    developmentalBenefit: "Overcomes fear of the dark by transforming nighttime shadows into playful, friendly bedtime companions."
  },
  {
    id: "ba-12",
    title: "The Time Capsule Envelope",
    type: "creative",
    badge: "⏳ Time Machine",
    ageGroup: "8-12",
    estimatedDuration: "25 mins",
    materialsNeeded: ["Envelopes", "Pencils", "A tape measure or piece of string", "Family photos / drawings"],
    overview: "Capture this exact moment in your child's life to be sealed and opened on their next birthday or milestone.",
    stepByStep: [
      "Cut a piece of string matching their exact current height.",
      "Write down: current favorite song, best friend's name, current dream career, and biggest wish for the future.",
      "Include a loving secret note written by the parent celebrating their character.",
      "Seal with tape, label 'DO NOT OPEN UNTIL [DATE]', and tuck safely in the bookshelf."
    ],
    developmentalBenefit: "Builds healthy autobiographical memory and temporal self-continuity (understanding growth over time)."
  },
  {
    id: "ba-13",
    title: "Kitchen Alchemy: Magic Baking Soda Volcano",
    type: "creative",
    badge: "🌋 Science Wonder",
    ageGroup: "5-7",
    estimatedDuration: "20 mins",
    materialsNeeded: ["A cup", "Baking soda", "Vinegar", "A drop of red or blue food coloring", "A shallow tray"],
    overview: "Turn kitchen ingredients into a bubbling science explosion while practicing hypothesis testing together.",
    stepByStep: [
      "Place a small cup in the center of a shallow rimmed tray.",
      "Add 2 tablespoons of baking soda and 2 drops of food coloring into the cup.",
      "Ask your child: 'What do you hypothesize will happen when the magical vinegar hits the powder?'",
      "Let the child slowly pour in 3 tablespoons of vinegar and marvel as colorful foam erupts!"
    ],
    developmentalBenefit: "Fosters early scientific inquiry, cause-and-effect prediction, and shared joy in discovery."
  },
  {
    id: "ba-14",
    title: "Bedtime Cloud & Star Guided Meditation",
    type: "storytelling",
    badge: "☁️ Calming Sleep",
    ageGroup: "all",
    estimatedDuration: "8 mins",
    materialsNeeded: ["Soft pillows and a gentle voice"],
    overview: "A peaceful progressive body-relaxation tale designed to dissolve evening muscle tension.",
    stepByStep: [
      "Have your child lie comfortably on their back with hands on their belly.",
      "Narrate slowly: 'Imagine a warm, fluffy golden cloud touching your toes... your toes feel heavy and warm...'",
      "Slowly guide the cloud up through legs, tummy, shoulders, and eyelids.",
      "Whisper: 'The cloud holds you softly. You are safe. Tomorrow is a brand new adventure.'"
    ],
    developmentalBenefit: "Activates somatic down-regulation and parasympathetic dominance, fostering deep, uninterrupted sleep."
  }
];
