<template>
  <div>
    <div class='b'>
      <h2 class="page-title">
        {{ $t('homeTitle') }} 
      </h2>
      <h3 class="subtitle" v-html="$md.render(subtitleTexts[$i18n.locale])" ></h3>

      <div class="filter-controls">
        <RadioButtonFilter 
          :label="$t('language')"
          :options="allLanguages.map(type => { return {text: type[`${upperCaseLocale}`], value: type.ID}})"
          :defaultSelectedOptionId="checkedLanguageId"
          v-on:selectedOptionsChanged="updateFilters('language', $event)"
        />

        <CheckboxFilter 
          :label="$t('geoScopesFilter')"
          :options="allGeographicScopes.map(scope => { return {text: scope[`${upperCaseLocale}`], value: scope.ID}})"
          :defaultSelectedOptionIds="checkedScopeIds"
          v-on:selectedOptionsChanged="updateFilters('scopes', $event)"
        />

        <CheckboxFilter 
          :label="$t('contentTypesFilter')"
          :options="allContentTypes.map(type => { return {text: type[`${upperCaseLocale}`], value: type.ID}})"
          :defaultSelectedOptionIds="checkedContentTypeIds"
          v-on:selectedOptionsChanged="updateFilters('content types', $event)"
        />

        <CheckboxFilter 
          :label="$t('issuesFilter')"
          :options="allIssues.map(type => { return {text: type[`${upperCaseLocale}`], value: type.ID}})"
          :defaultSelectedOptionIds="checkedIssueIds"
          v-on:selectedOptionsChanged="updateFilters('issues', $event)"
        />

        <span v-on:click="clearFilters" class="clear-filters">{{ $t('clearFilters') }}</span>

        <b-form-input v-model="searchInputText" :placeholder="$t('searchPlaceholder')" debounce="500" 
          class="search" :aria-label="$t('searchPlaceholder')"></b-form-input>
      </div>
  
      <div class='list-details'>
        <client-only>
          <span v-if="totalResourcesCount > resourcesPerPage" class="resource-count">
            {{ currentPageIndexRange[0] + 1 }} 
            &#8211; {{ currentPageIndexRange[0] + pageResorcesCount }}
            {{ $t('of') }} {{ totalResourcesCount }} {{ $t('results') }}
          </span>
          <span v-else-if="totalResourcesCount === 0" class="resource-count zero">
            {{ $t('noResult') }}
          </span>
          <span v-else class="resource-count one-pager">
            {{ totalResourcesCount }} {{ $t('singlePageResults') }}
          </span>
        </client-only>

        <span class="sort-by">
          <b-dropdown right variant="link">
            <template #button-content>
              {{ currentSortOrderDescription }}
            </template>
            <b-dropdown-item v-for="option in sortOrderOptions" :key="option.id" 
              v-on:click="updateSortOrderId(option.id)" href="#">{{ option[$i18n.locale] }}</b-dropdown-item>
          </b-dropdown>
        </span>
      </div>


      <ul id="resources-list" class="resources">
        <Resource
          v-for="(resource, index) in pageResources()"
          :index="index"
          :key="resource.id"
          :language="{id: resource['LANGUAGE ID'][0].toLowerCase(), label: resource[`LANGUAGE ${upperCaseLocale}`][0]}" 
          :titles="{en: resource['TITLE EN'], fr: resource['TITLE FR']}"
          :links="{en: resource['LINK EN'], fr: resource['LINK FR']}"
          :author="getAuthor(resource)"
          :organization="getOrganization(resource)"
          :publication="getPublication(resource)"
          :contentTypes="resource[`CONTENT TYPES ${upperCaseLocale}`]" 
          :geographicScopes="resource[`GEOGRAPHIC SCOPE ${upperCaseLocale}`]" 
          :issues="resource[`ISSUES ${upperCaseLocale}`]"
          :paywall="getPaywall(resource)"
          :paywallHelpText="getPaywallText()"
          :searchRegx="getSearchRegx()"
          :isTextSearching="isTextSearching()"
          :notes="{en: getNotes(resource, 'en'), fr: getNotes(resource, 'fr')}"
        />
      </ul>
    </div>
    <div v-if="totalResourcesCount > resourcesPerPage" class="pagination-controls">
      <client-only>
        <b-pagination
          v-model="currentPage"
          :total-rows="totalResourcesCount"
          :per-page="resourcesPerPage"
          :hide-goto-end-buttons="true"
          :hide-ellipsis="true"
          :pills="true"
          align="center"
          aria-controls="resources-list"
        ></b-pagination>
      </client-only>
    </div>
  </div>
</template>

<script>
import Resource from '@/components/Resource'
import CheckboxFilter from '@/components/FilterControls/CheckboxFilter.vue'
import RadioButtonFilter from '@/components/FilterControls/RadioButtonFilter.vue'

export default {
  data () {
    const data = this.$store.state.data
    return {
      allLanguages: data.allLanguages,
      checkedLanguageId: "BOTH",
      allGeographicScopes: data.allGeographicScopes,
      checkedScopeIds: [],
      allContentTypes: data.allContentTypes,
      checkedContentTypeIds: [],
      allIssues: data.allIssues,
      checkedIssueIds: [],
      resources: data.resources,
      searchInputText: "",
      upperCaseLocale: this.$i18n.locale.toUpperCase(),
      paywallTexts: { en: data.text[0]['HELP:PAYWALL'], fr: data.text[1]['HELP:PAYWALL'] },
      subtitleTexts: { en: data.text[0]['HOME:SUBTITLE'], fr: data.text[1]['HOME:SUBTITLE'] },
      currentPage: 1,
      resourcesPerPage: 10,
      sortOrderOptions: [
        {id: 0, byField: 'dateAdded', direction: 'desc', en: "date posted (new to old)", fr: "date postée (nouveau à vieux)"},
        {id: 1, byField: 'dateAdded', direction: 'asc', en: "date posted (old to new)", fr: "date postée (ancien au nouveau)"}
        // {id: 2, byField: 'datePublished', direction: 'desc', en: "date published (new to old)", fr: "date publiée (nouveau à vieux)"},
        // {id: 3, byField: 'datePublished', direction: 'asc', en: "date published (old to new)", fr: "date publiée (ancien au nouveau)"}
      ],
      activeSortOrderId: 0
    }
  },
  methods: {
    filterResources() {
      let filteredResources = [...this.resources]

      if (this.checkedLanguageId !== "BOTH") {
        filteredResources = filteredResources.filter(r => {
          const rLangId = r['LANGUAGE ID'][0]
          return rLangId === "BOTH" || rLangId === this.checkedLanguageId 
        })
      }

      if (this.checkedScopeIds.length) {
        filteredResources = filteredResources.filter(r => {
          const rGeoScopeId = r['GEOGRAPHIC SCOPE ID'] ? r['GEOGRAPHIC SCOPE ID'][0] : "";
          return this.checkedScopeIds.includes(rGeoScopeId)
        }) 
      }

      if (this.checkedContentTypeIds.length) {
        filteredResources = filteredResources.filter(r => {
          let contentTypeIds = [];
          if (r['CONTENT TYPE IDS']) {
            contentTypeIds = r['CONTENT TYPE IDS'].some(id => {
              return this.checkedContentTypeIds.includes(id)
            })
          }
          return contentTypeIds;
        })
      }

      if (this.checkedIssueIds.length) {
        filteredResources = filteredResources.filter(r => {
          let issueIds = [];
          if (r['ISSUE IDS']) {
            issueIds = r['ISSUE IDS'].some(id => {
              return this.checkedIssueIds.includes(id)
            })
          }
          return issueIds;
        })
      }

      if(this.isTextSearching()) {
        let searchRegx = this.getSearchRegx()

        filteredResources = filteredResources.filter(r => {
          let titleLanguage = r['LANGUAGE ID'][0]
          if (titleLanguage === 'BOTH') titleLanguage = this.upperCaseLocale 

          let titleWithoutDiacritics = this.$removeDiacritics(this.getTitle(r, titleLanguage)), 
          authorWithoutDiacritics = this.$removeDiacritics(this.getAuthor(r)),
          organizationWithoutDiacritics = this.$removeDiacritics(this.getOrganization(r)),
          publicationWithoutDiacritics = this.$removeDiacritics(this.getPublication(r)),
          keyWords = `${titleWithoutDiacritics} ${authorWithoutDiacritics} ${organizationWithoutDiacritics} ${publicationWithoutDiacritics}`

          return searchRegx.test(keyWords)
        })
      }  

      filteredResources = this.orderBySortField(filteredResources, this.sortOrderOptions[this.activeSortOrderId]);

      return filteredResources
    },
    orderBySortField(resources, sortOrder) {
      let orderedResources = resources.sort((aResource, bResource) => {
        let aDate, bDate,
          comparisonResult = sortOrder.direction === 'asc' ? -1 : 1;
        
        if (sortOrder.byField === "dateAdded") {
          aDate = new Date(aResource.RECORD_CREATED_DATE),
            bDate = new Date(bResource.RECORD_CREATED_DATE);
        } else {
          aDate = new Date(aResource.publicationYear, aResource.publicationMonth || 0, aResource.publicationDay || 1),
            bDate = new Date(bResource.publicationYear, bResource.publicationMonth || 0, bResource.publicationDay || 1);
        }

        if (aDate < bDate) {
          return comparisonResult;
        } else if (aDate > bDate) {
          return comparisonResult * -1;
        } else {
          return 0
        }

      });
      return orderedResources;
    },
    pageResources() {
      return this.filterResources().slice(...this.currentPageIndexRange)
    },
    getSearchRegx() {
      return new RegExp(this.$removeDiacritics(this.searchInputText.trim()), 'gi')
    },
    getTitle(resource, locale = this.upperCaseLocale) {
      let title = '',
      propertyName = `TITLE ${locale}`

      if (resource.hasOwnProperty(propertyName)) {
        title = resource[propertyName]
      }
      return title
    },
    getOrganization(resource, locale = this.upperCaseLocale) {
      let organization = '',
      propertyName = `ORGANIZATION ${locale}` 

      if (resource.hasOwnProperty(propertyName)) {
        organization = resource[propertyName][0]
      }
      return organization
    },
    getPublication(resource, locale = this.upperCaseLocale) {
      let publication = '',
      propertyName = `PUBLICATION ${locale}` 

      if (resource.hasOwnProperty(propertyName)) {
        publication = resource[propertyName][0]
      }
      return publication
    },
    getAuthor(resource) {
      return resource['AUTHOR'] || ""
    },
    getPaywall(resource) {
      return resource['PAYWALL'] || false
    },
    getPaywallText() {
      return this.paywallTexts[this.$i18n.locale]
    },
    getNotes(resource, lang) {
      const upperCaseLang = lang.toUpperCase()
      return resource[`NOTES ${upperCaseLang}`] || "" 
    },
    isTextSearching() {
      return this.searchInputText.trim() ? true : false
    },
    updateFilters(filterType, newfilterValue) {
      switch (filterType) {
        case 'language':
          this.checkedLanguageId = newfilterValue
          break;
        case 'scopes':
          this.checkedScopeIds = newfilterValue
          break;
        case 'content types':
          this.checkedContentTypeIds = newfilterValue
          break;
        case 'issues':
          this.checkedIssueIds = newfilterValue
          break;
        default:
          console.log('unknown filter type')
      }
      this.currentPage = 1;
      return true;
    },
    clearFilters() {
      this.checkedLanguageId = "BOTH"
      this.checkedScopeIds = []
      this.checkedContentTypeIds = []
      this.checkedIssueIds = []
      return true
    },
    updateSortOrderId(id) {
      this.activeSortOrderId = id;
    }
  },
  computed: {
    currentPageIndexRange() {
      let rangeEnd = this.resourcesPerPage * this.currentPage,
        rangeStart = rangeEnd - this.resourcesPerPage;
      return [rangeStart, rangeEnd];
    },
    totalResourcesCount() {
      return this.filterResources().length;
    },
    pageResorcesCount() {
      return this.pageResources().length;
    },
    currentLocale() {
      return this.$i18n.locale;
    },
    currentSortOrderDescription() {
      let activeSortOrder = this.sortOrderOptions[this.activeSortOrderId];
      return activeSortOrder[this.currentLocale];
    }
  },
  components: {
    Resource,
    CheckboxFilter,
    RadioButtonFilter
  }
}
</script>

<style>
.subtitle {
  font-size: 24px;
  color: #767676;
  margin-bottom: 65px;
}

input.search {
  margin-top: 0.5rem;
  max-width: 500px;
}

.filter-controls {
  margin-bottom: 15px;
}

.clear-filters {
  margin-left: 10px;
  text-decoration: underline;
  color: #000000;
}

.clear-filters:hover {
  cursor: pointer;
}

.resource-count {
  font-size: 15px;
  font-weight: 600;
}

.resources {
  padding: 0;
  position: relative;
}

ul.resources li:first-child {
  margin-top: 10px;
}

mark {
  padding: 0px;
}

.page-title {
  font-size: 48px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 15px;
}

.list-details {
  position: relative;
  /* border: 1px green dotted; */
}

.sort-by {
  /* border: 1px solid black; */
  position: absolute;
  right: 0;
}

.sort-by .dropdown .btn {
  font-size: 16px;
  padding: 0;
  border: 0;
  position: relative;
  bottom: 2px;
  color: black;
  font-weight: bold;
}

@media screen and (max-width: 767px) {
  .page-title {
    font-size: 25px;
  }

  .subtitle {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .filter-controls .b-dropdown {
    margin-bottom: 10px;
    margin-right: 5px;
  }

  .clear-filters {
    margin-left: 0;
    display: block;
  }

  .sort-by .dropdown .btn {
    font-size: 14px;
  }
}

@media screen and (max-width: 375px) {
  .sort-by .dropdown .btn {
    font-size: 12px;
  }
}
</style>
