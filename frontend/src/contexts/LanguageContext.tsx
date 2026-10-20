import React, { createContext, useContext, useState } from 'react'
import { translate, LANGUAGE_META, type LangCode, type TranslationKey } from '../i18n/translations'

interface LanguageContextType {
  lang: LangCode
  setLang: (lang: LangCode) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const VALID_LANGS: LangCode[] = ['en', 'hi', 'gu', 'mr', 'ta', 'te', 'bn', 'pa']
  const [lang, setLangState] = useState<LangCode>(() => {
    const saved = localStorage.getItem('flora_ai_lang') as LangCode
    const resolved = saved && VALID_LANGS.includes(saved) ? saved : 'en'
    // Sync html[lang] immediately so it's correct on initial paint
    document.documentElement.lang = LANGUAGE_META[resolved]?.bcp47 ?? 'en-US'
    return resolved
  })

  const setLang = (newLang: LangCode) => {
    if (!VALID_LANGS.includes(newLang)) return
    setLangState(newLang)
    localStorage.setItem('flora_ai_lang', newLang)
    document.documentElement.lang = LANGUAGE_META[newLang]?.bcp47 ?? newLang
    window.dispatchEvent(new Event('flora_language_changed'))
  }

  const t = (key: TranslationKey): string => {
    return translate(lang, key)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLang must be used within a LanguageProvider')
  }
  return context
}
