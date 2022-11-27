import Vue from 'vue'
import VueI18n from 'vue-i18n'
// import { createI18n } from 'vue-i18n'
// import axios from 'axios'
// import messages from './lang/en-uk.js'
import messages from '../../src/i18n/lang/en-uk.js'
// import camelCase from 'lodash/camelCase'

Vue.use(VueI18n)

export const availableLanguages = ['en-uk', 'en-us', 'pl-pl']

export const i18n = new VueI18n({
  locale: 'en-uk', // set locale
  fallbackLocale: 'en-uk',
  dateTimeFormats: {
    'en-uk': messages.formatters.datetime
  },
  messages: {
    'en-uk': messages.translations
  }, // set locale messages
  numberFormats: {
    'en-uk': messages.numberFormats
  }
})

const loadedLanguages = ['en-uk'] // our default language that is preloaded

function localeDecode (lang) {
  switch(lang.toLowerCase()) {
  case 'pl':
    lang = 'pl-pl'
    break;
  }
  if (availableLanguages.indexOf(lang.toLowerCase()) >= 0) {
    return lang.toLowerCase()
  }
  return 'en-uk'
}

function setI18nLanguage (lang) {
  // i18n.global.locale = localeDecode(lang).toLowerCase()
  // axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

export function loadLanguageAsync (lang) {
  const key = localeDecode(lang)
  if (i18n.locale !== key) {
    if (!loadedLanguages.includes(key)) {
      return import(/* webpackChunkName: "lang-[request]" */
        `../../src/i18n/lang/${key}.js`).then(msgs => {
        i18n.locale = key
        i18n.setLocaleMessage(key, msgs.default.translations)
        i18n.setDateTimeFormat(key, msgs.default.formatters.datetime)
        i18n.setNumberFormat(key, msgs.default.numberFormats)
        loadedLanguages.push(key)
        return setI18nLanguage(lang)
      })
    }
    return Promise.resolve(setI18nLanguage(lang))
  } else {
    i18n.mergeNumberFormat(key)
  }
  return Promise.resolve(lang)
}
