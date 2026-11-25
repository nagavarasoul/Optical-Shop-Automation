/* ==========================================================================
   VS Lens Mart mockups: DUMMY eye camps + helpers
   Used by eye-camps.html and camp-detail.html. On the live site this comes
   from the database `eye_camps` and `camp_photos` tables (visible rows only).
   Everything here is DUMMY (docs/dummy-data.md C19).
   ========================================================================== */
window.VSLM_CAMPS = (() => {
  const CAMPS = [
    { slug: 'free-eye-camp-patelguda', title: 'Free Eye Camp, Patelguda', date: '2026-11-15', start: '09:00', end: '13:00',
      place: 'Near the Patelguda branch, Falcon One Shopping Plaza', with: 'Residents of Rainbow Meadows',
      text: 'Free vision checks for all ages near our Patelguda branch. No appointment needed.' },
    { slug: 'school-eye-check-indresham', title: 'School Eye Check, Indresham', date: '2026-12-06', start: '10:00', end: '14:00',
      place: 'Government school, Citizens Colony, Indresham', with: 'School staff',
      text: 'Vision checks for students, with advice for parents on the next steps.' },
    { slug: 'community-eye-camp-indresham', title: 'Community Eye Camp, Indresham', date: '2026-08-10', start: '09:00', end: '13:00',
      place: 'Community hall, Citizens Colony, Indresham', with: 'Local residents', people: 120, photos: 8,
      text: 'A morning of free vision checks for neighbours of our first branch.' },
    { slug: 'school-vision-day', title: 'School Vision Day', date: '2026-03-14', start: '10:00', end: '13:00',
      place: 'High school, Patancheru', with: 'School staff', people: 85, photos: 6,
      text: 'Students had their eyes checked, and parents got simple advice on what to do next.' },
    { slug: 'senior-citizens-eye-camp', title: 'Senior Citizens Eye Camp', date: '2025-11-22', start: '09:30', end: '12:30',
      place: 'Senior citizens association hall, Patelguda', with: 'Senior citizens association', people: 64, photos: 5,
      text: 'Reading and distance checks for older members of the community.' },
    { slug: 'village-outreach-camp', title: 'Village Outreach Camp', date: '2025-06-08', start: '09:00', end: '15:00',
      place: 'Panchayat office, near Sangareddy', with: 'Village panchayat', people: 140, photos: 10,
      text: 'We took our eye checks to families who find it hard to reach the shop.' },
    { slug: 'residents-association-camp', title: "Residents' Association Camp", date: '2025-01-19', start: '10:00', end: '13:00',
      place: 'Clubhouse, near Ellenki College, Patelguda', with: "Residents' association", people: 52, photos: 4,
      text: 'A Sunday morning camp for families living near our Patelguda branch.' },
  ];
  const OFFERED = ['Vision check', 'Advice on glasses'];
  const BRING = 'Your current glasses, if you have them.';
  const SITE = 'https://vslensmart.example';   // DUMMY domain (D4)

  const pad = n => String(n).padStart(2, '0');
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  // Upcoming vs past comes from the date alone, so camps move to Past by themselves
  const isUpcoming = c => parse(c.date) >= today();
  const upcoming = () => CAMPS.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date));
  const past = () => CAMPS.filter(c => !isUpcoming(c)).sort((a, b) => b.date.localeCompare(a.date));
  const bySlug = s => CAMPS.find(c => c.slug === s);

  // "Sun, 15 Nov 2026"
  const longDate = c => {
    const d = parse(c.date), f = o => d.toLocaleDateString('en-IN', o);
    return `${f({ weekday: 'short' })}, ${d.getDate()} ${f({ month: 'short' })} ${d.getFullYear()}`;
  };
  const time12 = t => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? ':' + pad(m) : ''} ${h < 12 ? 'AM' : 'PM'}`; };
  const timeRange = c => `${time12(c.start)}–${time12(c.end)}`;
  const url = c => `/eye-camps/${c.slug}`;

  const directions = c => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.place)}`;
  const shareText = c => `${c.title}: ${longDate(c)}, ${timeRange(c)} at ${c.place}. ${SITE}${url(c)}`;
  const shareLink = c => `https://wa.me/?text=${encodeURIComponent(shareText(c))}`;
  function icsLink(c) {
    const stamp = (d, t) => d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//VS Lens Mart//Eye camps//EN', 'BEGIN:VEVENT',
      `UID:${c.slug}@vslensmart.example`, `DTSTART:${stamp(c.date, c.start)}`, `DTEND:${stamp(c.date, c.end)}`,
      `SUMMARY:${c.title}`, `LOCATION:${c.place}`, `DESCRIPTION:${c.text} Bring: ${BRING}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  }

  return { CAMPS, OFFERED, BRING, parse, isUpcoming, upcoming, past, bySlug, longDate, timeRange, url, directions, shareLink, icsLink };
})();
