import { engagingProjects } from './engaging-projects';

export interface ArchiveProject {
  id: number;
  title: string;
  slug: string;
  category: string;
  year: string;
  date: string;
  venue: string;
  image: string;
  imageFocusY?: number;
  gallery: string[];
  alt: string;
  description: string;
  story: string[];
  programme?: { day: string; title: string; items: string[] }[];
  places: string[];
  keywords?: string[];
  media?: ArchiveMedia[];
  invitation?: string;
  visitLabel?: string;
  photoCaptions?: string[];
}

export interface ArchiveMedia {
  kind: 'video' | 'audio';
  title: string;
  src: string;
  poster?: string;
  seconds: number;
  description: string;
  note?: string;
  portrait?: boolean;
}
export const curatedAsset = (name: string) => '/media/curated/' + name;
export const experienceType = (project: ArchiveProject) =>
  project.media?.some((item) => item.kind === 'audio') ? 'listen' :
  project.media?.some((item) => item.kind === 'video') ? 'watch' : 'look';

const eventImage = (name: string) => '/images/events/' + name + '.webp';

// Editorial copy is based on the official See My World event pages.
// Image provenance is documented in ASSET_SOURCES.md.
const eventProjects: ArchiveProject[] = [
  {
    id: 1, title: 'Connected Fragments: Private Viewing',
    slug: 'connected-fragments-exhibition', category: 'Exhibition', year: '2024',
    date: '15 July – 28 September 2024', venue: 'Manchester Central Library',
    image: eventImage('connected-fragments-private-viewing-cover'),
    gallery: [1, 2, 3].map((n) => eventImage('connected-fragments-private-viewing-' + n)),
    alt: 'Guests at the Connected Fragments private viewing',
    description: 'An exhibition connecting artists and creative pioneers across Manchester, Nigeria and the wider African diaspora.',
    story: [
      'Connected Fragments brought an exhibition of Nigerian perspectives to Manchester Central Library in summer 2024. It explored how local experiences in Nigeria and the UK can speak to one another across distance.',
      'Artists Chigozie Obi, Daniel Oyegade and Dou each approached daily life through their own visual language. Together, their work examined heritage, identity and the connections that persist between communities on different sides of the Atlantic.',
      'The private viewing gathered artists and audiences around the work. These photographs preserve some of the people and encounters that gave the exhibition its opening energy.',
    ],
    places: ['Manchester', 'Manchester Central Library'],
    keywords: ['art', 'Nigeria', 'diaspora', 'private viewing'],
  },
  {
    id: 2, title: 'Connected Fragments: Closing Party',
    slug: 'connected-fragments-closing-party', category: 'Exhibition', year: '2024',
    date: '2024', venue: 'Manchester Central Library',
    image: eventImage('connected-fragments-closing-party-cover'),
    gallery: [1, 2, 3].map((n) => eventImage('connected-fragments-closing-party-' + n)),
    alt: 'People at the Connected Fragments closing party',
    description: 'A celebration marking the close of an exhibition about local life across the African diaspora.',
    story: [
      'Connected Fragments ran at Manchester Central Library from July to September 2024. Its closing celebration brought people back to the exhibition space and to the conversations it had opened.',
      'The exhibition connected the histories and cultures of Nigeria and the UK through work by Chigozie Obi, Daniel Oyegade and Dou. Their differing views of everyday life revealed shared questions about place, memory and belonging.',
      'The closing party became one more part of that story: a moment for the artists, collaborators and public to gather around the work before it left the library.',
    ],
    places: ['Manchester', 'Manchester Central Library'],
    keywords: ['art', 'Nigeria', 'diaspora', 'closing party'],
  },
  {
    id: 3, title: 'Manchester, Lagos & Me: Lagos Premiere',
    slug: 'lagos-premiere-2024', category: 'Film', year: '2024',
    date: '21 March 2024', venue: 'British Council, Lagos',
    image: eventImage('lagos-premiere-cover'),
    gallery: [1, 2, 3].map((n) => eventImage('lagos-premiere-' + n)),
    alt: 'Audience at the Lagos premiere of Manchester, Lagos & Me',
    description: 'The film linking artists and creative life in Manchester and Lagos reaches an audience in Lagos.',
    story: [
      'Manchester, Lagos & Me emerged from a See My World international exchange and artist residency. The short film follows the relationship between two changing cities through the eyes and sounds of artists who know them.',
      'The work was made by Papa Quaye, Ayokunle Odunsi, Joshua Inyang and Deborah Johnson. Music, moving image, poetry and performance meet in a portrait of their creative processes and the places that shape them.',
      'The film premiered at the British Council in Lagos on 21 March 2024. It was the first part of a three-city run that also reached Manchester and Abuja, inviting audiences in each place into the same cross-city conversation.',
    ],
    places: ['Lagos'], keywords: ['screening', 'film', 'British Council', 'artist residency'],
  },
  {
    id: 4, title: 'Manchester, Lagos & Me: Manchester Premiere',
    slug: 'manchester-premiere-of-see-my-world-manchester-lagos-me',
    category: 'Film', year: '2024', date: '26 March 2024', venue: 'Contact, Manchester',
    image: eventImage('manchester-premiere-cover'),
    gallery: [1, 2, 3].map((n) => eventImage('manchester-premiere-' + n)),
    alt: 'Guests at the Manchester premiere of Manchester, Lagos & Me',
    description: 'A screening at Contact brought the film and its artists back to Manchester.',
    story: [
      'Manchester, Lagos & Me documents an international exchange between artists in Manchester and Lagos. Its makers, Papa Quaye, Ayokunle Odunsi, Joshua Inyang and Deborah Johnson, used film and sound to reflect on the cities and the art they make within them.',
      'After the Lagos premiere, the film arrived at Contact in Manchester on 26 March 2024. The screening brought its ideas about identity, movement and creative collaboration back to one of the places where the project began.',
      'Papa Quaye and Joshua Inyang joined the Manchester event to share the story behind the film. The photographs capture the audience and the collective experience of watching it together.',
    ],
    places: ['Manchester', 'Contact'],
    keywords: ['screening', 'film', 'Papa Quaye', 'Joshua Inyang'],
  },
  {
    id: 5, title: 'Manchester, Lagos & Me: Abuja Premiere',
    slug: 'abuja-premier-of-see-my-world-manchester-lagos-me',
    category: 'Film', year: '2024', date: '28 March 2024', venue: 'Cavic Hub, Abuja',
    image: eventImage('abuja-premiere-cover'),
    gallery: [1, 2, 3].map((n) => eventImage('abuja-premiere-' + n)),
    alt: 'Guests at the Abuja premiere of Manchester, Lagos & Me',
    description: 'The three-city film premiere continued in Nigeria’s capital.',
    story: [
      'Manchester, Lagos & Me is a film made through a See My World artist exchange. Papa Quaye, Ayokunle Odunsi, Joshua Inyang and Deborah Johnson brought their different practices together to explore life and creativity across Manchester and Lagos.',
      'The premiere journey continued at Cavic Hub in Abuja on 28 March 2024, following screenings in Lagos and Manchester. Each city offered a new audience for a film concerned with connection across place.',
      'The Abuja event extended the project’s central conversation about how artists interpret and reshape the cities around them. The images here document that shared viewing experience.',
    ],
    places: ['Abuja'], keywords: ['screening', 'film', 'Nigeria'],
  },
  {
    id: 6, title: 'Lagos Trip',
    slug: 'lagos-trip', category: 'Residency', year: '2023', date: '2023',
    venue: 'Lagos, Nigeria', image: eventImage('lagos-trip-cover'),
    gallery: [1, 2, 3].map((n) => eventImage('lagos-trip-' + n)),
    alt: 'Artists and collaborators during the See My World Lagos trip',
    description: 'A journey to Lagos helped shape an exchange between artists in Nigeria and Manchester.',
    story: [
      'In 2023, See My World began an international exchange that brought together artists from Lagos and Manchester. The residency was designed to make space for their different views of two evolving cities.',
      'Papa Quaye and Joshua Inyang travelled to Lagos as the interdisciplinary work took shape. Film, photography, music, spoken word and performance all became ways to investigate what the artists saw and experienced.',
      'The trip sits at the beginning of the project that would become Manchester, Lagos & Me. These images offer a view of the city and the encounter behind the later film and exhibitions.',
    ],
    places: ['Lagos', 'Manchester'],
    keywords: ['artist exchange', 'Papa Quaye', 'Joshua Inyang'],
  },
  {
    id: 7, title: 'Festival Programme 2021',
    slug: 'festival-programme-2021', category: 'Festival', year: '2021',
    date: '17–24 October 2021', venue: 'Manchester and online',
    image: eventImage('festival-2021-cover'),
    gallery: [1, 2, 3].map((n) => eventImage('festival-2021-' + n)),
    alt: 'A See My World festival event in 2021',
    description: 'Eight days of workshops, film, conversation, movement and music across physical and online spaces.',
    story: [
      'See My World returned in 2021 with a programme that could be experienced both in Manchester and online. The festival connected artists, educators and audiences through performances, screenings, workshops and public discussion.',
      'The week moved between archival work, creative practice and questions facing Pan-African communities. Youth panels, film sessions, dance, photography, wellbeing workshops and live music each offered a different way into the conversation.',
      'The programme closed with a day centred on the archive itself, carrying the work beyond the festival dates and into future See My World projects.',
    ],
    programme: [
      { day: '17 October', title: 'Opening and film', items: ['Networking and archive building', 'Keisha Thompson’s I Am Phem, with discussion', 'Film screenings and conversations with We Are Parable'] },
      { day: '18 to 20 October', title: 'Workshops and movement', items: ['Understanding Trauma workshop', 'Power Revealed exhibition by Mary Gabriel', 'Movement and dance with Haus X', 'Hip Hop Archive symposium with Unity Radio'] },
      { day: '21 October', title: 'Official launch', items: ['Archive introduction and keynote by Professor Hakim Adi', 'Conversation with Sideman'] },
      { day: '22 October', title: 'Youth day', items: ['Brand development and creative workshops', 'Rage with Words by Courtney Hayles', 'Pan-African youth panel', 'Channel You live music session'] },
      { day: '23 October', title: 'Community and performance', items: ['Wellbeing, history and film photography sessions', 'Pan-African women’s panel', 'Live music featuring WSTRN, Juls and Dreya Mac'] },
      { day: '24 October', title: 'Day of resolutions', items: ['See My World Archive', 'I Am Phem and We Are Parable screenings', 'Radio drama and interviews'] },
    ],
    places: ['Manchester', 'Online'], keywords: ['music', 'workshops', 'performance'],
  },
  {
    id: 8, title: 'Festival Programme 2020',
    slug: 'festival-programme-2020', category: 'Festival', year: '2020',
    date: '15–18 October 2020', venue: 'Online · Manchester',
    image: eventImage('festival-2020-cover'),
    gallery: [eventImage('festival-2020-1')],
    alt: 'See My World festival imagery from 2020',
    description: 'The first online festival opened conversations on Pan-African visibility, Black history and young people’s futures.',
    story: [
      'See My World began in October 2020 as an online festival marking 75 years since the Fifth Pan-African Congress in Manchester. Its first programme connected the city’s history with questions of identity, opportunity and cultural expression today.',
      'Across talks, films, performances and workshops, artists and speakers considered Black Lives Matter, Pan-African visibility, education and career possibilities for young people. The online format allowed audiences well beyond Manchester to take part.',
      'The festival established a foundation for the year-round programme that followed. Its mix of art, public discussion and community learning remains visible throughout the archive.',
    ],
    programme: [
      { day: '15 October', title: 'Launch', items: ['Online conference for sixth form and college students', 'Talks with Professor Hakim Adi and other historians and educators', 'Festival launch with films, conversations and performances featuring Akala'] },
      { day: '16 October', title: 'Day of solutions', items: ['Afua Hirsch and Khadija Diskin in conversation', 'Rage with Words, a short film by Courtney Hayles', 'Pan-African youth panel on identity and change'] },
      { day: '17 October', title: 'Day of resolutions', items: ['Nutrition, meditation and yoga workshop', 'Digital and careers guidance sessions', 'Conversation with David Olusoga', 'Community panel and live music from Manchester artists'] },
    ],
    places: ['Manchester', 'Online'],
    keywords: ['Pan-African Congress', 'Black history', 'online'],
  },
];

const photo = (name: string) => curatedAsset(name + '.webp');
const film = (name: string, title: string, seconds: number, description: string): ArchiveMedia => ({
  kind: 'video', title, seconds, description,
  src: curatedAsset(name + '.mp4'), poster: photo(name + '-poster'),
  portrait: name === 'connected-fragments',
});

const curatedProjects: ArchiveProject[] = [
  {
    id: 9, title: 'Manchester, Lagos & Me', slug: 'manchester-lagos-me',
    category: 'Film + photography', year: '2023', date: '2023 residency · trailer exported 2024',
    venue: 'Manchester ↔ Lagos', image: photo('lagos-street'),
    gallery: ['lagos-football', 'lagos-hands', 'lagos-together', 'lagos-portrait', 'lagos-filmmaking'].map(photo),
    alt: 'A black-and-white street scene from the Lagos documentary collection',
    description: 'Two cities. A shared creative journey. Start with the 30-second trailer, then meet the people and places behind the film.',
    story: [
      'Manchester, Lagos & Me grew from a See My World exchange between artists in Manchester and Lagos. Film, photography, music and performance became ways to look at the places they call home.',
      'The film was made by Papa Quaye, Ayokunle Odunsi, Joshua Inyang and Deborah Johnson. This finished trailer offers a short way into the project; the black-and-white photographs open up the life around it.',
      'These images come from the 2023 documentary collection. They bring street life, play, portraits and creative encounters into the same frame. The film went on to screen in Lagos, Manchester and Abuja in 2024.',
    ],
    media: [film('documentary-trailer', 'Manchester, Lagos & Me — the trailer', 30, 'A finished trailer introducing the film and its exchange between Manchester and Lagos.')],
    invitation: 'Which detail makes you want to know more about this place?', visitLabel: '30 sec film + 6 photographs',
    photoCaptions: ['Street life, Lagos documentary collection.', 'A game in the street, Lagos documentary collection.', 'A detail of two people holding hands.', 'A group portrait from the documentary collection.', 'A portrait from the Unilag collection.', 'A camera operator at work.'],
    places: ['Manchester', 'Lagos', 'Nigeria'], keywords: ['documentary', 'trailer', 'portraits', 'diaspora', 'exchange'],
  },
  {
    id: 10, title: 'A seat at the table', slug: 'portico-supper-club', category: 'Food + community',
    year: '2025', date: '19 March 2025', venue: 'The Portico Library, Manchester',
    image: photo('portico-together'), gallery: ['portico-14', 'portico-43', 'portico-45-2', 'portico-48', 'portico-60'].map(photo),
    alt: 'Guests gathered around supper club tables in the Portico Library',
    description: 'Shared meals, warm conversations and the work behind them. Step inside the See My World supper club at the Portico.',
    story: [
      'On 19 March 2025, the See My World supper club brought people together at the Portico Library in Manchester. The photographs place the tables, the guests and the preparation at the centre of the story.',
      'Look beyond the group photograph: a conversation over dinner, a plate being prepared, people working in the kitchen. Together they show how a gathering is made, as well as how it feels.',
    ],
    invitation: 'What meal brings your people together?', visitLabel: '6 photographs · take your time',
    photoCaptions: ['The supper club gathering at the Portico Library.', 'Dinner and conversation at the table.', 'Guests sharing a table.', 'Preparing plates behind the scenes.', 'Food preparation for the evening.', 'A portrait in the kitchen.'],
    places: ['Manchester', 'Portico Library'], keywords: ['food', 'supper', 'community', 'kitchen', 'gathering'],
  },
  {
    id: 11, title: 'TEMNE: making together', slug: 'temne-making-together', category: 'Art + participation',
    year: '2024', date: '2024 programme', venue: 'Manchester', image: photo('workshop-poster'),
    gallery: ['temne-17', 'temne-20', 'temne-6', 'temne-24', 'temne-9'].map(photo),
    alt: 'People gathered around a table during a TEMNE art workshop',
    description: 'Hands at work. Ideas in the room. Two one-minute films move from a creative workshop to the people and conversations around TEMNE.',
    story: [
      'The TEMNE programme brought art, discussion and shared creative activity into the See My World archive in 2024.',
      'Start at the workshop table: the finished workshop film follows people looking, making and learning together. The event film and photographs widen the view to the conversations, audiences and artwork around the programme.',
      'These are different ways of taking part in culture: making something, asking a question, or simply being in the room.',
    ],
    media: [
      film('workshop', 'At the workshop table', 60, 'Hands-on art making, group activity and workshop participants in a finished highlights film.'),
      film('temne', 'People, art and conversation', 59, 'The finished TEMNE event highlights, with artwork, discussion and people gathered together.'),
    ],
    invitation: 'What would you make if you joined this table?', visitLabel: '2 one-minute films + 6 images',
    photoCaptions: ['A still from the TEMNE workshop film.', 'A speaker at the TEMNE programme.', 'A moment of laughter in the room.', 'Participants listening together.', 'A participant in conversation.', 'Discussion alongside the artwork.'],
    places: ['Manchester'], keywords: ['TEMNE', 'workshop', 'making', 'learning', 'art', 'conversation'],
  },
  {
    id: 12, title: 'Movement across distance', slug: 'movement-across-distance', category: 'Movement',
    year: '2020', date: '2020 online festival recordings', venue: 'Online', image: photo('movement-poster'),
    gallery: [photo('collaborative-movement-poster')], alt: 'A movement demonstration from the 2020 online festival',
    description: 'A body in motion. A group connected through screens. Two 30-second windows into the first online festival.',
    story: [
      'See My World began as an online festival in 2020. These short excerpts preserve movement sessions from that programme: an individual demonstration and a collaborative montage shared through screens.',
      'The excerpts come from longer recordings. The individual session begins 47 minutes into the Day 3 recording; the collaborative sequence begins 14 minutes into Day 4. Each selection lasts 30 seconds.',
      'The screen format is part of the history. It shows people finding ways to create and take part across distance.',
    ],
    media: [
      film('movement', 'A moment of movement', 30, 'An individual movement demonstration, excerpted from the Day 3 festival recording.'),
      film('collaborative-movement', 'Moving together, apart', 30, 'A collaborative movement montage, excerpted from the Day 4 recording.'),
    ],
    invitation: 'What can movement express that words leave out?', visitLabel: '2 × 30 sec excerpts',
    photoCaptions: ['A still from the individual movement demonstration.', 'A still from the collaborative online movement montage.'],
    places: ['Online', 'Manchester'], keywords: ['dance', 'movement', 'online', 'festival', 'participation'],
  },
  {
    id: 13, title: 'Inside a soundtrack sketch', slug: 'soundtrack-sketch', category: 'Sound',
    year: '2023', date: '2023 documentary collection · audio export 2024', venue: 'Manchester ↔ Lagos',
    image: photo('lagos-conversation'), gallery: [photo('lagos-hands'), photo('lagos-portrait')],
    alt: 'Two people seated in conversation in the documentary collection',
    description: 'Put on headphones and spend a minute inside a guide soundtrack from the documentary working files.',
    story: [
      'An archive can hold the process as well as the finished work. This one-minute listening selection comes from “stwerburghs (guide)”, kept with the Manchester, Lagos & Me music working files.',
      'The source is a guide soundtrack: a work-in-progress musical sketch, rather than a final release or a recording of street ambience. The excerpt uses the first minute of the original and fades out at the end.',
      'The accompanying photographs come from the documentary collection. Try listening first, then look at the images again: what changes when a photograph has a soundtrack?',
    ],
    media: [{kind: 'audio', title: 'stwerburghs — guide soundtrack excerpt', src: curatedAsset('soundtrack-sketch.mp3'), seconds: 60,
      description: 'A one-minute excerpt of a guide soundtrack from the documentary music working files.', note: 'Work-in-progress guide soundtrack · headphones recommended'}],
    invitation: 'Which image changes most when you hear the music?', visitLabel: '60 sec listening selection',
    photoCaptions: ['Conversation, documentary collection.', 'A detail of two people holding hands.', 'A portrait from the Unilag collection.'],
    places: ['Manchester', 'Lagos'], keywords: ['sound', 'music', 'soundtrack', 'listening', 'process'],
  },
];

for (const project of eventProjects) {
  if (project.slug === 'festival-programme-2021') {
    project.media = [film('festival-2021', 'One minute at the festival', 61, 'The finished 2021 wrap-up film, moving between performances, people and festival activity.')];
    project.image = photo('festival-2021-poster');
    project.visitLabel = '61 sec highlights + festival programme';
    project.invitation = 'Which part of the festival would you have joined?';
  }
  if (project.slug === 'connected-fragments-exhibition') {
    project.media = [film('connected-fragments', 'Inside Connected Fragments', 68, 'A finished vertical exhibition reel with visitors, artworks and conversation.')];
    project.image = photo('connected-fragments-poster');
    project.visitLabel = '68 sec exhibition reel + photographs';
  }
  if (project.slug === 'lagos-trip') {
    project.image = photo('lagos-together');
    project.gallery = ['lagos-street', 'lagos-football', 'lagos-filmmaking', 'lagos-portrait'].map(photo);
    project.alt = 'A group portrait from the Lagos documentary collection';
    project.visitLabel = '5 photographs from the documentary collection';
  }
}

// Keep the original event records above as source history. Discovery is a tighter
// selection of distinct artist work, performances and visually strong collections.
const selected = [
  ...engagingProjects,
  ...curatedProjects.filter((project) => project.slug !== 'soundtrack-sketch'),
  ...eventProjects.filter((project) => project.slug === 'connected-fragments-exhibition'),
];
const editorialOrder = ['sampha-we-out-here', 'homage-manchester-moves', 'closer-to-my-dreams', 'yaya-bey-we-out-here',
  'manchester-lagos-me', 'corinne-bailey-rae-we-out-here', 'we-out-here-2024', 'isaiah-hull-at-soup', 'sainte-we-out-here',
  'haus-x-dance-workshop', 'temne-making-together', 'liberation-speakeasy', 'portico-supper-club',
  'connected-fragments-exhibition', 'movement-across-distance'];
export const projects: ArchiveProject[] = editorialOrder.map((slug) => selected.find((project) => project.slug === slug)!);
export const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
export const archiveRedirects: Record<string, string> = {
  'festival-programme-2021': 'we-out-here-2024',
  'festival-programme-2020': 'movement-across-distance',
  'connected-fragments-closing-party': 'connected-fragments-exhibition',
  'lagos-premiere-2024': 'manchester-lagos-me',
  'manchester-premiere-of-see-my-world-manchester-lagos-me': 'manchester-lagos-me',
  'abuja-premier-of-see-my-world-manchester-lagos-me': 'manchester-lagos-me',
  'lagos-trip': 'manchester-lagos-me',
  'soundtrack-sketch': 'manchester-lagos-me',
};
export const archiveTrails = [
  { id: 'first-look', title: 'Start with a spark', time: 'About 4 minutes', description: 'Sampha, dance in the city and a journey to Lagos.', slugs: ['sampha-we-out-here', 'homage-manchester-moves', 'manchester-lagos-me'] },
  { id: 'artist-voices', title: 'Backstage. Centre stage.', time: 'About 6 minutes', description: 'Get closer to Yaya Bey, Corinne Bailey Rae and Sainté.', slugs: ['yaya-bey-we-out-here', 'corinne-bailey-rae-we-out-here', 'sainte-we-out-here'] },
  { id: 'making', title: 'The body tells a story', time: 'Stay for a film', description: 'Dreams, choreography and the joy of making together.', slugs: ['closer-to-my-dreams', 'haus-x-dance-workshop', 'temne-making-together'] },
];
