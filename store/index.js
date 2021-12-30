export const state = () => ({
  data: {
    resources: []
  }
})

export const actions = {
  async nuxtServerInit ({ state }, { req }) {
    this.$http.setToken(process.env.NBWC_AIRTABLE_API_KEY, 'Bearer')
    const httpAirtableNbwcBase = this.$http.create({ 
        prefixUrl: 'https://api.airtable.com/v0/app393cel1ZJ5Wi13',
        searchParams: [['view', 'ALL RECORDS']]
    })

    let offsetToken = '', allResourcesFetched = false
    while (allResourcesFetched === false) {
      let fetchedResourcesJson = await httpAirtableNbwcBase.$get('RESOURCES', 
        {searchParams: [
          ['view', 'POST'], 
          ['offset', offsetToken],
          ['sort[0][field]', 'RECORD_CREATED_DATE'],
          ['sort[0][direction]', 'desc']
        ]}
      ),
      fetchedResources = fetchedResourcesJson.records.map(record => record.fields),
      validFetchedResources = fetchedResources.filter(r => {
        return (r['LANGUAGE ID'] && (r['TITLE EN'] && ['LINK EN']) || (r['TITLE FR'] && ['LINK FR'])) ? true : false
      })

      state.data['resources'] = [...state.data['resources'], ...validFetchedResources]
      fetchedResourcesJson['offset'] ? (offsetToken = fetchedResourcesJson['offset']) : (allResourcesFetched = true)
    }

    const allGeographicScopes = await httpAirtableNbwcBase.$get('GEOGRAPHIC%20SCOPES')
    state.data['allGeographicScopes'] = allGeographicScopes.records.map(record => record.fields) 

    const allContentTypes = await httpAirtableNbwcBase.$get('CONTENT%20TYPES')
    state.data['allContentTypes'] = allContentTypes.records.map(record => record.fields) 

    const allIssues = await httpAirtableNbwcBase.$get('ISSUES')
    state.data['allIssues'] = allIssues.records.map(record => record.fields) 

    const allLanguages = await httpAirtableNbwcBase.$get('LANGUAGES')
    state.data['allLanguages'] = allLanguages.records.map(record => record.fields)

    const text = await httpAirtableNbwcBase.$get('TEXT')
    state.data['text'] = text.records.map(record => record.fields)
  }
}
