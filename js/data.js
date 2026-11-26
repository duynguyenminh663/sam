// All copy and links come from Minh's Canva portfolio.
export const LINKS = {
  email: 'mailto:truongnhuduyminh@gmail.com',
  linkedin: 'https://www.linkedin.com/in/%F0%9D%90%8C%F0%9D%90%A2%F0%9D%90%A7%F0%9D%90%A1-%F0%9D%90%8D%F0%9D%90%A1%F0%9D%90%AE-%F0%9D%90%83%F0%9D%90%AE%F0%9D%90%B2-%F0%9D%90%93%F0%9D%90%AB%F0%9D%90%AE%F0%9D%90%A8%F0%9D%90%A7%F0%9D%90%A0-077919392/',
  facebook: 'https://www.facebook.com/profile.php?id=61573028309121',
  thanhnien: 'https://thanhnien.vn/du-hoc-my-van-noi-dai-hanh-trinh-nhan-ai-o-que-nha-185260923093723873.htm',
};

const NA_LINKS = [
  { label: 'Fanpage', href: LINKS.facebook },
  { label: 'Instagram', href: 'https://www.instagram.com/nangam_project/' },
];

export const EXPERIENCE = [
  {
    id: 'nang-am',
    org: 'Nắng Ấm Project',
    role: 'Founder / Executive Director',
    logo: 'logo_nangam',
    feature: true,
    lead: 'A youth-driven initiative supporting vulnerable children in Vietnam, including children from low-income backgrounds, children with Down syndrome, orphans, and others facing disadvantaged circumstances.',
    bullets: [
      'Lead educational and community programs with charity classes and social protection centers, integrating creative, student-centered learning approaches to improve teaching quality and foster more inclusive learning environments.',
      'Design and organize annual summer programs that give children opportunities to learn, explore, connect, and grow in a safe, supportive, and joyful environment.',
      'Coordinate a team of 160+ members, overseeing organizational development, communication strategies, and community campaigns.',
      'Generated 83,000+ social media views across Facebook and Instagram through strategic communication campaigns and creative storytelling.',
      'Organized 2+ creative fundraising programs and campaigns, mobilizing community support and resources to sustain educational and social-impact initiatives.',
      'Developed 5 well-researched classes earning 6K+ total likes on Facebook, supporting programs at Rạch Ông Charity Class, SOS Children’s Village Ho Chi Minh City, and Thị Nghè Center for Disabled and Orphaned Children.',
      '2026 (Season 2): organized Nắng Ấm’s 3x3 charity basketball tournament, securing support from 22 organizations and businesses, attracting 500+ athletes, and raising 21 million VND (~$800).',
      '2025 (Season 1): Khơi Hè Hạnh Phúc fundraising campaign through the Hạ Nơi Em product collection, selling 55 products and raising over 4.6 million VND (~$178).',
      'Building Nắng Ấm around a long-term mission: inclusive environments where every child feels seen, valued, and empowered to reach their potential.',
    ],
    media: [
      ['na_class_1', 'Charity class recap post'], ['na_class_2', 'Charity class recap post'], ['na_class_3', 'Classroom activities with children'],
      ['na_class_4', 'Winter program recap'], ['na_class_5', 'Recap of a Nắng Ấm session'], ['na_bball_poster', '3x3 charity basketball tournament poster'],
      ['na_bball_1', 'Basketball tournament recap'], ['na_bball_2', 'Tournament award ceremony'], ['na_check', 'Minh holding the fundraising check'],
      ['na_hne_1', 'Hạ Nơi Em product collection'], ['na_hne_2', 'Hạ Nơi Em products'], ['na_hne_3', 'Khơi Hè Hạnh Phúc campaign'], ['na_hne_4', 'Hạ Nơi Em launch post'],
    ],
    links: NA_LINKS,
  },
  {
    id: 'hht',
    org: 'Hoa Học Trò Magazine',
    role: 'Journalism Contributor · Entertainment (USUK)',
    logo: 'logo_hht',
    lead: 'Writer for the Entertainment Section (USUK) of Hoa Học Trò, one of Vietnam’s most prominent youth publications. Authored over 100 published articles on international entertainment, pop culture trends, music, film, and youth media.',
    bullets: [
      'Crafted engaging, culturally relevant content while maintaining journalistic accuracy and a distinctive narrative voice.',
      'Through consistent deadlines and editorial collaboration, developed strong research, storytelling, and critical analysis skills, and a deep understanding of how media shapes youth perspectives.',
    ],
    media: [
      ['hht_metgala', 'Article: Met Gala 2025'], ['hht_taylor', 'Article: Taylor Swift documentary'], ['hht_sabrina', 'Article: Sabrina Carpenter album'], ['rec_hht', 'Recommendation letter from Hoa Học Trò'],
    ],
    links: [
      { label: 'Magazine website', href: 'https://hoahoctro.tienphong.vn' },
      { label: 'Recommendation letter', href: 'https://docs.google.com/document/d/1L59iSKVDXzTMubCZekCfl7thyLsUemR7QDK5PFpRuaU/edit' },
      { label: 'Met Gala 2025', href: 'https://hoahoctro.tienphong.vn/met-gala-2025-nhung-cau-chuyen-song-dong-phan-anh-lich-su-di-san-va-su-sang-tao-post1739971.tpo' },
      { label: 'More articles', href: 'https://www.canva.com/design/DAG565WFmJU/IGD1uq8jcR71sPNSY04T5w/view' },
    ],
  },
  {
    id: 'green-minute',
    org: 'Green Minute · UNICEF Vietnam',
    role: 'Content Contributor · Filmmaker',
    logo: 'logo_unicef',
    video: 'wLH81XadK7o',
    lead: 'Contributed to UNICEF Vietnam’s Green Minute initiative, a youth-driven media campaign promoting environmental awareness and sustainable thinking among young people.',
    bullets: [
      'Filmed and produced visual content for “Viet Nam through the Eyes of Children 2045,” exploring youth perspectives on the future of the planet and sustainable development.',
    ],
    media: [['cert_green_minute', 'UNICEF certificate for the Green Minute film']],
    links: [{ label: 'Watch on YouTube', href: 'https://www.youtube.com/watch?v=wLH81XadK7o' }],
  },
  {
    id: 'voice-of-green',
    org: 'Voice of Green',
    role: 'Contributing Writer',
    sub: 'UNICEF Vietnam · The Young Pioneer and Children Newspaper',
    logo: 'logo_tiengxanh',
    lead: 'One of the publication’s early contributors, creating articles and creative content on sustainable living, environmental awareness, and green lifestyles.',
    bullets: [
      'Contributed to the Society & Environment section, promoting sustainable thinking and environmental responsibility among young people.',
      'A publication supported by UNICEF Vietnam and The Young Pioneer and Children Newspaper.',
    ],
    media: [['vog_article', 'Article: “Sống xanh” không “sống mệt”'], ['vog_quote', 'Excerpt written by Minh'], ['logo_tnnd', 'Thiếu niên & Nhi đồng newspaper']],
    links: [
      { label: 'Newspaper website', href: 'https://tiengxanh.thieunien.vn' },
      { label: 'Read the article', href: 'https://tiengxanh.thieunien.vn/song-xanh-khong-song-met/' },
    ],
  },
  {
    id: 'clean-air',
    org: 'Clean Air – Colorful Lives',
    role: 'Contributor · UNICEF Vietnam',
    logo: 'logo_unicef',
    lead: 'Contributed to Clean Air – Colorful Lives, a youth-driven media campaign promoting environmental awareness and sustainable thinking.',
    bullets: ['Developed innovative ideas and creative solutions to encourage environmental protection and sustainable practices.'],
    media: [['cert_clean_air', 'Certificate of participation, Clean Air – Colorful Lives']],
    links: [],
  },
  {
    id: 'golden-hawk',
    org: 'The Golden Hawk Newspaper',
    role: 'Founder · Editor-in-Chief',
    logo: 'logo_goldenhawk',
    lead: 'Founded and served as Editor-in-Chief of The Golden Hawk Newspaper at Bethlehem Catholic High School.',
    bullets: [
      'Developed the club’s strategic vision, editorial structure, leadership framework, and long-term development plan, reviewed and approved by the school.',
      'The first international student to independently establish and launch a student club at Bethlehem Catholic.',
      'Recognized by the school’s Marketing Executive and administration for the club’s professionalism, organization, and strategic vision.',
    ],
    media: [['gh_posters', 'Newspaper Club recruitment posters']],
    links: [{ label: 'Website', href: 'https://pelican-bycs74.my.canva.site/thegoldenhawknewspaper' }],
  },
  {
    id: 'bookgolf',
    org: 'Bookgolf.vn',
    role: 'Marketing Planner',
    logo: 'logo_bookgolf',
    lead: 'Developed long-term marketing plans to support BookGolf’s brand growth and business objectives.',
    bullets: [
      'Defined campaign strategies and guided the development of marketing initiatives across channels.',
      'Advised and collaborated with the Sales team on product development, aligning offerings with customer needs and market opportunities.',
    ],
    media: [['rec_bookgolf', 'Recommendation letter from Bookgolf']],
    links: [{ label: 'Recommendation letter', href: 'https://docs.google.com/document/d/170dImLIEAt9c9srVzyUp5vmMeNowkfKzRTicRgKlMqo/edit' }],
  },
  {
    id: 'aevidum',
    org: 'Aevidum Club',
    role: 'Leadership Team',
    logo: 'logo_aevidum',
    lead: 'Part of the leadership team of Aevidum, a student club for mental health awareness.',
    bullets: [
      'Organized 3 mental health awareness workshops to promote student well-being and emotional support.',
      'Led 4 fundraising events to support student initiatives and strengthen the school community.',
      'Fostered a supportive, inclusive environment and encouraged open conversations about mental health.',
    ],
    media: [['aev_stressless', 'Stress Less event poster'], ['aev_photo', 'Workshop activity'], ['aev_holiday', 'Holiday event poster']],
    links: [],
  },
];

export const AWARDS = [
  { img: 'aw_silver', rank: 'Silver Medal · National', title: 'Scholastic Art & Writing Awards', work: '“The Unseen Barricade” · Photography', photo: 'photo_unseen_barricade' },
  { img: 'aw_goldkey', rank: 'Gold Key · East Pennsylvania', title: 'Scholastic Art & Writing Awards', work: '“The Unseen Barricade” · Photography', photo: 'photo_unseen_barricade' },
  { img: 'aw_honorable', rank: 'Honorable Mention · East Pennsylvania', title: 'Scholastic Art & Writing Awards', work: '“Fragile Giant” · Photography', photo: 'photo_fragile_giant' },
  { img: 'aw_pioneer', rank: '2nd Place', title: 'The Pioneer Magazine International Youth Competition', work: 'Warm Sunshine Solution & The Dream of Education · Individual Essay', link: { label: 'Magazine website', href: 'https://thepioneermagazine.org/' } },
  { img: 'aw_waw', rank: '3rd Place', title: 'WAW Global Sustainability Competition', work: 'Exceptional talent in Visual Art / Photography · Individual' },
  { img: 'aw_manartist', rank: '3rd Place', title: 'Hospitality ManArtist Challenge – Green Horizon 2025', work: 'Organized by the University of Economics and Finance' },
  { img: 'aw_songmay', rank: '1st Place', title: 'Song May National Piano Competition', work: 'November Round' },
  { img: 'aw_royal_speaking', rank: 'Finalist', title: 'Royal Speaking Contest 2024 – Royal TED Talks', work: 'Final round participation' },
  { img: 'aw_intl_art', rank: 'Outstanding Achievement', title: 'International Art Competition', work: 'School year 2024–2025' },
  { img: 'aw_rebt', rank: 'Participant · 2024–2025', title: 'REBT (Emotional Regulation Intelligence) Group Research Program', work: 'Organized by the Royal School Psychology Department' },
  { img: 'aw_best_video', rank: 'The Best Video', title: 'Advertisement Project', work: 'Excellent efforts in completing the Advertisement Project' },
  { img: 'aw_attendance', rank: 'Attendance Award', title: 'Bethlehem Catholic High School', work: 'Perfect attendance and punctuality for the scholastic year' },
];

export const DEGREES = [
  { img: 'deg_piano', title: 'Piano – Recital Grade 5', issuer: 'University of West London · London College of Music Examinations', detail: 'UWL Level 2 Certificate in Graded Examination in Music Performance, with Merit', logo: 'logo_uwl' },
  { img: 'deg_vog', title: 'Voice of Green Online Training Programme', issuer: 'UNICEF Vietnam · The Young Pioneer and Children Newspaper', detail: 'Interviewing and idea development skills', link: { label: 'Newspaper website', href: 'https://tiengxanh.thieunien.vn' } },
  { img: 'logo_bchs', title: 'High School Diploma', issuer: 'Bethlehem Catholic High School', detail: 'Expected 06/2027 · coming soon', pending: true },
];

export const BOOKS = [
  {
    id: 'pear', title: 'The Giant Pear', img: 'book_pear', spine: '#2a6f3b',
    text: [
      'What I remember most about The Giant Pear is the strange simplicity of its imagination.',
      'A giant pear becomes a home, a boat, and a way to travel into the unknown. As a child, I found that wonderfully amusing. As I grew older, I began to understand why that image stayed with me.',
      'Perhaps imagination is not about escaping reality. It is about refusing to believe that reality has only one possible shape.',
      'I have always been drawn to people who can look at an ordinary situation and ask a slightly unusual question. That instinct has gradually become part of me. I tend to wonder what could be changed, rearranged, or reimagined instead of simply accepting things as they are.',
      'The book quietly taught me that creativity begins with curiosity and sometimes, the most important creative act is simply believing that there could be another way.',
    ],
  },
  {
    id: 'mouse', title: 'The Mouse Mansion', img: 'book_mouse', spine: '#7a3b26',
    text: [
      'I have always been fascinated by The Mouse Mansion.',
      'What first caught my attention was its creativity. The detailed illustrations turn an ordinary house into a tiny world of its own, while each mouse has a distinct appearance and personality that makes the story feel alive.',
      'When I was younger, I was simply amazed by how much imagination could fit into such a small world. Now, I think I appreciate it differently.',
      'The book showed me that creativity is not only about making something look beautiful but also about giving familiar things a new perspective and creating characters that feel unique and memorable.',
    ],
  },
  {
    id: 'snow', title: 'The Snow Queen', img: 'book_snow', spine: '#9fc3dc',
    text: [
      'I have always found The Snow Queen strangely beautiful.',
      'Its world is cold, distant, and sometimes frightening, yet Gerda continues forward without losing the warmth that makes her who she is. When I was younger, I saw her journey as a simple story of courage. Now, I think of it differently.',
      'There are experiences that can make us more careful, more guarded, and perhaps even a little colder. It is easy to believe that becoming stronger means becoming less vulnerable. But Gerda suggests something quieter.',
      'Maybe strength is not learning how to feel less. Maybe it is learning how to feel deeply without allowing difficult experiences to take away our capacity for kindness.',
      'I do not want to become someone untouched by the world. I want to remain someone who can feel the cold and still choose to carry warmth.',
    ],
  },
];
