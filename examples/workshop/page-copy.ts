/** Website-owned copy. Overrides are plain text; untouched passages retain their inline markup. */
export const sceneCopy = {
  article: {
    kicker: 'Field notes / 04',
    title: 'Make room for the useful things, and the people who use them.',
    lead: 'A coherent system gives every small decision a place in the larger idea.',
    body: 'Start with the words people need to read. A useful interface makes the next step clear, while a longer story needs space to unfold. Both deserve the same care.',
    heading: 'A rhythm that travels',
    paragraph:
      'Short labels and long passages ask different things of a typeface. Test the paragraph, the quiet caption and the awkwardly long heading together before settling on a scale.',
    subheading: 'Leave room for the unexpected',
    listOne: 'Read a paragraph at a comfortable measure.',
    listTwo: 'Let a long label wrap without hiding its meaning.',
    listThree: 'Make the next action easy to find with a keyboard.',
    quote: 'The details should make the whole easier to understand.',
    note: 'Written for the workshop · 6 minute read',
    link: 'Read the editorial note',
    code: 'const rhythm = { body: 20, leading: 1.6, measure: "64ch", paragraph: "1.25em" };'
  },
  form: {
    kicker: 'Your workspace',
    title: 'Make yourself at home',
    introduction: 'A few details help your collaborators recognise you across projects and teams.',
    name: 'Name shown to collaborators',
    nameHelp: 'Use the name you would like people to see in shared spaces.',
    email: 'Email for important account updates',
    emailHelp: 'Only essential messages about your account. Nothing is sent from this specimen.',
    updates: 'Send me occasional product notes and stories from the community',
    save: 'Save preferences',
    secondary: 'Your information stays in this browser session.',
    asideTitle: 'Good neighbours, thoughtful defaults',
    aside:
      'Clear labels and useful supporting copy are part of the interface. Check them at the same time as the headline.',
    link: 'How we use your information'
  },
  data: {
    kicker: 'Operations / Overview',
    title: 'Small teams, meaningful progress',
    introduction:
      'A shared view of work in motion. Dense information still needs a clear hierarchy.',
    revenueLabel: 'Monthly revenue',
    revenue: '$27,000',
    revenueNote: 'Across four independent teams',
    projectsLabel: 'Active projects',
    projects: '12',
    projectsNote: 'Three awaiting your review',
    filter: 'Filter projects by name, team or status',
    heading: 'Team activity and monthly commitments',
    caption: 'Illustrative budgets · updated just now',
    projectColumn: 'Project',
    teamColumn: 'Responsible team',
    statusColumn: 'Current status',
    budgetColumn: 'Monthly budget',
    projectOne: 'Atlas — a new home for independent creative teams',
    projectTwo: 'Bramble',
    projectThree: 'Cedar research programme',
    projectFour: 'Dune',
    note: 'Scroll the table horizontally at narrow widths. The rest of the page reflows.'
  },
  landing: {
    brand: 'Common ground',
    nav: 'Our approach',
    kicker: 'A place to begin',
    title: 'Build something worth coming back to, together.',
    lead: 'Thoughtful tools for teams who care about the details and the people behind them.',
    action: 'Join the list',
    link: 'Explore the idea',
    heading: 'A little structure. A lot of possibility.',
    body: 'Start with a shared language, keep the useful constraints, and leave space for your own way of working.',
    featureOne: 'Clear by default',
    featureOneBody: 'Less searching, more doing. Labels and actions make the next step visible.',
    featureTwo: 'Room to grow',
    featureTwoBody: 'Start small and keep your options. A system should travel with your ideas.',
    note: 'Independent tools for a more considered web.'
  }
} as const

export type PageScene = keyof typeof sceneCopy
export type CopyEdits = Partial<Record<PageScene, Record<string, string>>>
export const pageNames: Record<PageScene, string> = {
  article: 'Article',
  form: 'Form',
  data: 'Data',
  landing: 'Landing'
}

export function readCopy<P extends PageScene>(
  edits: CopyEdits,
  page: P,
  key: keyof (typeof sceneCopy)[P]
): string {
  return edits[page]?.[String(key)] ?? String(sceneCopy[page][key])
}
