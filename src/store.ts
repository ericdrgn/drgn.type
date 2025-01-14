import { get, writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { loadFont } from './font'
import { loadTheme } from './theme'
import { cacheCssFileAndFonts } from './lib/cache'

export const cleanLocalstorage = () => {
  localStorage.removeItem('1kfile')
  localStorage.removeItem('themeList')
}

export const fixBwithA = <T>(a: T, b: T): T => {
  for (const key of Object.keys(a !== null ? a : {})) {
    if (key in b === false) b[key] = a[key]
    if (typeof a[key] === 'object') fixBwithA(a[key], b[key])
  }
  return b
}

const loadSettingsFormLocalStorage = (): Writable<Settings> => {
  cleanLocalstorage()
  const res = localStorage.getItem('settings')
  if (res !== null) {
    let settings: Settings = JSON.parse(res)

    // check if settings are up to date
    settings = fixBwithA(template, settings)
    return writable(settings)
  } else {
    cacheCssFileAndFonts(template.cosmetics.family)
    return writable(template)
  }
}

export type Modes = 'timed' | 'countdown' | 'countup'

export type Theme = {
  opened: boolean
  name: string
}

export type TextGenerationSettings = {
  set: 'custom' | 'preset' | 'api'
  preSet: string // funny pun
  customTxT: string
  filters: {
    blacklist: string[]
    whitelist: string[]
    casing: 'default' | 'lowercase' | 'uppercase' | 'random' | 'wordBeginning'
  }
}

export type Settings = {
  opened: boolean
  modeName: Modes
  showToolTips: boolean
  words: string
  mode: {
    time: number
    words?: number
  }
  gen: TextGenerationSettings
  keybindings: {
    leader: {
      key: string
      pressed: boolean
    }
    reset: string
    toggleSettings: string
    toggleTheme: string
    randomizeSettings: string
  }
  cosmetics: {
    family: string
    theme: Theme
    textBox: {
      mode: 'classic' | 'speed'
      fontSize: string
      spaceWidth: string
      width: string
      lines: string
      letterSpacing: string
      lineHeight: string
      caret: {
        duration: string
        width: string
        rounded: boolean
        colored: boolean
      }
      infobar: {
        liveWpm: boolean
        liveLpm: boolean
        liveTime: boolean
        liveAccuracy: boolean
      }
    }
    background: {
      bgImg: string
      opacity: string
    }
  }
}

export const template: Settings = {
  opened: false,
  modeName: 'countdown',
  words: '250',
  gen: {
    set: 'preset',
    preSet: 'top 1k',
    customTxT: '',
    filters: {
      blacklist: [],
      whitelist: [],
      casing: 'default',
    },
  },
  showToolTips: true,
  mode: { time: 60, words: 30 },
  keybindings: {
    leader: {
      key: 'Tab',
      pressed: false,
    },
    reset: 'r',
    toggleSettings: 's',
    toggleTheme: 't',
    randomizeSettings: 'q',
  },
  cosmetics: {
    textBox: {
      mode: 'classic',
      width: '65%',
      lines: '3',
      letterSpacing: '0.1rem',
      lineHeight: '4rem',
      caret: { duration: '150', width: '0.2rem', rounded: true, colored: true },
      infobar: {
        liveWpm: false,
        liveLpm: false,
        liveTime: true,
        liveAccuracy: false,
      },
      spaceWidth: '1.5rem',
      fontSize: '2.6rem',
    },
    background: {
      bgImg: '',
      opacity: '1',
    },
    theme: { opened: false, name: 'bliss' },
    family: 'Be Vietnam Pro',
  },
}

export const refreshCosmetics = () => {
  const s = get(settings)
  loadFont(s.cosmetics.family)
  loadTheme(s.cosmetics.theme.name)
}

export const settings: Writable<Settings> = loadSettingsFormLocalStorage()

let wait: number = 0
settings.subscribe((s) => {
  if (Date.now() - wait > 1000) {
    localStorage.setItem('settings', JSON.stringify(s))
    wait = Date.now()
  }
})

export type RunState = {
  ended: boolean
  running: boolean
  accuracy: number
  correctLetterCount: number
  correctWordCount: number
  progress: number
  timeString: string
  liveWPM: number
  aggWPM: number
  trueWPM: number
  liveSPM: number
  aggSPM: number
  trueSPM: number
  timePassed: number
  overTime: {
    wpm: number
    lpm: number
  }[]
}

// contains all information regarding an active run
export const runState: Writable<RunState> = writable({
  ended: false,
  running: false,
  accuracy: 0,
  correctLetterCount: 0,
  correctWordCount: 0,
  progress: 0,
  timeString: '0:00',
  liveWPM: 0,
  aggWPM: 0,
  trueWPM: 0,
  liveSPM: 0,
  aggSPM: 0,
  trueSPM: 0,
  timePassed: 0,
  overTime: [],
})

export type Letters = {
	active: boolean
	correct: boolean
	letter: string
}[]

export type Word = {
	wpm: number
	spm: number
	tstart: number
	tend: number
	duration: number
	letters: Letters 
}

export type TextArr = Word[]
// Stores all info about the letters (letters, colors, errors etc.)
export const textArray: Writable<TextArr> = writable([])
