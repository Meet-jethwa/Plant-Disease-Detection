import React, { createContext, useContext, useState } from 'react'
import { translate, type LangCode, type TranslationKey } from '../i18n/translations'

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
    return saved && VALID_LANGS.includes(saved) ? saved : 'en'
  })

  const setLang = (newLang: LangCode) => {
    setLangState(newLang)
    localStorage.setItem('flora_ai_lang', newLang)
    
    if (newLang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + document.domain
    } else {
      document.cookie = `googtrans=/en/${newLang}; path=/;`
      document.cookie = `googtrans=/en/${newLang}; path=/; domain=.` + document.domain
    }
    
    // Slight delay to allow cookie to be written
    setTimeout(() => {
      window.location.reload()
    }, 50)
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
