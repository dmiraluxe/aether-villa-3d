export interface Chapter {
  id: string
  progress: number // 0–1 start of chapter
  endProgress: number
  title: string
  subtitle?: string
  description: string
  label: string
}

export const chapters: Chapter[] = [
  {
    id: 'exterior',
    progress: 0.0,
    endProgress: 0.12,
    title: 'Exterior',
    subtitle: 'First look',
    description: 'Rocky Homes ka signature design. Clean lines, warm materials, aur natural light jo har surface pe padti hai.',
    label: '01 — Exterior'
  },
  {
    id: 'approach',
    progress: 0.12,
    endProgress: 0.25,
    title: 'Approach',
    subtitle: 'The path home',
    description: 'Rasta narrow hota hai. Shadows deep hoti hain. Entrance aapko andar bulaata hai.',
    label: '02 — Approach'
  },
  {
    id: 'entrance',
    progress: 0.25,
    endProgress: 0.38,
    title: 'Entrance',
    subtitle: 'Welcome inside',
    description: 'Andar aao. Space open hota hai. High windows se light andar aati hai.',
    label: '03 — Entrance'
  },
  {
    id: 'living',
    progress: 0.38,
    endProgress: 0.55,
    title: 'Living',
    subtitle: 'Heart of the home',
    description: 'Open plan living. Marble flooring, walnut finishes, aur brass details jo light catch karte hain.',
    label: '04 — Living'
  },
  {
    id: 'kitchen',
    progress: 0.55,
    endProgress: 0.70,
    title: 'Kitchen',
    subtitle: 'Designed for life',
    description: 'Har detail millimetre tak perfect. Surfaces touch karne layak, storage jo disappear ho jata hai.',
    label: '05 — Kitchen'
  },
  {
    id: 'reveal',
    progress: 0.70,
    endProgress: 0.85,
    title: 'Reveal',
    subtitle: 'Full picture',
    description: 'Upar se dekho. Har room kaise connect hota hai, light kaise plan me travel karti hai.',
    label: '06 — Reveal'
  },
  {
    id: 'yours',
    progress: 0.85,
    endProgress: 1.0,
    title: 'Yours',
    subtitle: 'Make it real',
    description: 'Yeh ab sirf model nahi hai. Yeh aapke future home ki shuruaat hai. Book a visit aur khud walk through karo.',
    label: '07 — Yours'
  }
]

export function getChapterAtProgress(p: number): Chapter {
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (p >= chapters[i].progress) return chapters[i]
  }
  return chapters[0]
}
