
export default {
  target: 'static',
  /*
  ** Headers of the page
  */
  head: {
    title: 'NBWC COVID19 Resource Library',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/helpers.js'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/dotenv'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    '@nuxt/http',
    '@nuxtjs/i18n',
    '@nuxtjs/markdownit'
  ],
  bootstrapVue: {
    componentPlugins: [
      'DropdownPlugin',
      'FormCheckboxPlugin',
      'FormInputPlugin',
      'FormRadioPlugin',
      'CollapsePlugin',
      'PaginationPlugin'
    ],
    components: ['BIconList']
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages: {
        en: {
          home: 'Home',
          homeTitle: 'COVID-19 library',
          frAvailable: 'Also available in French',
          language: 'Language',
          geoScopesFilter: 'Geographic Scopes',
          geoScope: 'Geographic scope',
          contentTypesFilter: 'Types of content',
          contentTypes: 'Type(s) of content',
          issuesFilter: 'Issues',
          issues: 'Issue(s)',
          searchPlaceholder: 'Search by title, author, organization, publication',
          about: 'About',
          aboutTitle: 'About this library',
          results: 'results',
          singlePageResults: 'result(s)',
          noResult: 'No results found',
          clearFilters: 'Clear Filters',
          paywall: 'Paywall',
          nbwcURL: 'https://www.nbwomenscouncil.ca/',
          facebookURL: 'https://www.facebook.com/NBWomensCouncil/',
          twitterURL: 'https://twitter.com/nbwomenscouncil',
          altTextlogo: "New Brunswick Women's Council logo",
          of: 'of'
        },
        fr: {
          home: 'Accueil',
          homeTitle: 'Bibliothèque sur la COVID-19',
          enAvailable: 'Disponible aussi en anglais',
          language: 'Langue',
          geoScopesFilter: 'Portées géographiques',
          geoScope: 'Portée géographique',
          contentTypesFilter: 'Types de contenu',
          contentTypes: 'Type(s) de contenu',
          issuesFilter: 'Enjeux',
          issues: 'Enjeu(x)',
          searchPlaceholder: 'Recherche par titres, auteurs-es, organisations, publication',
          about: 'À propos',
          aboutTitle: 'À propos de cette bibliothèque',
          results: 'résultats',          
          singlePageResults: 'résultat(s)',          
          noResult: 'Aucun résultat trouvé',
          clearFilters: 'Effacer les filtres',
          paywall: 'Contenu payant',
          nbwcURL: 'https://www.nbwomenscouncil.ca/content/vnbw-vfnb/fr.html',
          facebookURL: 'https://www.facebook.com/ConseilfemmesNB/?ref=br_rs',
          twitterURL: 'https://twitter.com/conseilfemmesnb',
          altTextlogo: "Logo du Conseil des femmes du Nouveau-Brunswick",
          of: 'de'
        }
      }
    }
  },
  markdownit: {
    injected: true
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    },
    extractCSS: true
  },
  router: {
    middleware: 'redirect-heroku-url'
  }
}
