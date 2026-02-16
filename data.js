export const startTopics = [
    { id: 'psychology', text: 'Psychology', icon: '🧠' },
    { id: 'engineering', text: 'Engineering', icon: '⚙️' },
    { id: 'art', text: 'Art', icon: '🖼️' },
    { id: 'biology', text: 'Biology', icon: '🧬' },
    { id: 'history', text: 'History', icon: '🏺' },
    { id: 'math', text: 'Math', icon: '📐' },
    { id: 'finance', text: 'Personal finance', icon: '💰' },
    { id: 'statistics', text: 'Statistics', icon: '📈' },
    { id: 'architecture', text: 'Architecture', icon: '🏛️' }
];

// Organized by topic ID
export const interestsData = {
    'psychology': [
        { id: 'personality', text: 'Personality types' },
        { id: 'childhood', text: 'Childhood impact' },
        { id: 'biases', text: 'Cognitive biases' },
        { id: 'emotions', text: 'Emotional intelligence' },
        { id: 'habits', text: 'Habits & behavior' }
    ],
    'engineering': [
        { id: 'civil', text: 'Civil Engineering' },
        { id: 'mechanical', text: 'Mechanical Systems' },
        { id: 'software', text: 'Software Design' },
        { id: 'robotics', text: 'Robotics' },
        { id: 'materials', text: 'Materials Science' }
    ],
    'art': [
        { id: 'renaissance', text: 'Renaissance' },
        { id: 'modern', text: 'Modern Art' },
        { id: 'color', text: 'Color Theory' },
        { id: 'digital', text: 'Digital Design' },
        { id: 'sculpture', text: 'Sculpture' }
    ],
    'biology': [
        { id: 'genetics', text: 'Genetics' },
        { id: 'marine', text: 'Marine Biology' },
        { id: 'ecology', text: 'Ecology' },
        { id: 'neuro', text: 'Neuroscience' },
        { id: 'evolution', text: 'Evolution' }
    ],
    'history': [
        { id: 'ancient', text: 'Ancient Civs' },
        { id: 'medieval', text: 'Medieval Times' },
        { id: 'wars', text: 'World Wars' },
        { id: 'culture', text: 'Cultural History' },
        { id: 'leaders', text: 'Famous Leaders' }
    ],
    'default': [
        { id: 'general', text: 'General Facts' },
        { id: 'science', text: 'Science' },
        { id: 'tech', text: 'Technology' },
        { id: 'news', text: 'Latest News' },
        { id: 'history', text: 'History' }
    ]
};

export const contentCards = [
    {
        id: 1,
        category: "Psychology",
        tag: "Did You Know?",
        title: "The Halo Effect",
        text: "We tend to attribute positive qualities to people who are physically attractive. If someone looks good, we automatically assume they are smart, kind, and funny.",
        color: "#6c5ce7",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
        source: "Psychology Today"
    },
    {
        id: 2,
        category: "Biology",
        tag: "Brain Fact",
        title: "Neuroplasticity",
        text: "Your brain isn't fixed. Every time you learn something new, the structure of your brain changes. You can literally rewire your brain to be happier.",
        color: "#00b894",
        image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80",
        source: "Scientific American"
    },
    {
        id: 6,
        category: "Art",
        tag: "Color Theory",
        title: "Vantablack",
        text: "Vantablack is a substance made of carbon nanotubes that absorbs 99.965% of visible light. It makes 3D objects look like flat, black holes.",
        color: "#fdcb6e",
        image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80",
        source: "Art Concept"
    }
];
