export interface ArchiveProject {
  id: number;
  title: string;
  slug: string;
  category: string;
  year: string;
  date: string;
  venue: string;
  image: string;
  gallery: string[];
  alt: string;
  description: string;
  story: string[];
  programme?: { day: string; title: string; items: string[] }[];
  places: string[];
  keywords?: string[];
}

const eventImage = (name: string) => '/images/events/' + name + '.webp';

// Editorial copy is based on the official See My World event pages.
// Image provenance is documented in ASSET_SOURCES.md.
export const projects: ArchiveProject[] = [
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

export const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
