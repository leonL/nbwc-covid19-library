<template>
    <li class="resource">
        <h6 v-if="paywall" class="paywall">{{ $t('paywall').toUpperCase() }}</h6>
        <h2 class="rTitle">
            <a :href="links[this.getPrimaryLanguageId()]" 
                v-html="getTitleMarked()"
                target="_blank"></a>
        </h2>
        <h5 v-html="getAccreditationHtml()" class="accreditation"></h5>
        <h5 v-if="language.id === 'both'" class="translation-available">
             <a :href="links[`${otherLocale()}`]" target="_blank">
                {{ translationAvailableText() }}
            </a>
        </h5>
        <span v-if="notes[$i18n.locale].length > 0" v-html="$md.render(notes[$i18n.locale])" class="notes"></span>
        <span v-if="paywall" v-html="$md.render(paywallHelpText)" class="notes pw"></span>
        <div class="tags">
            <div class="geo-scopes pills">
                <h5 class="label">{{ $t('geoScope') }}:</h5>
                <h6 v-for="(gs, index) in geographicScopes" :key="gs">
                    <span v-if="index > 0"> / </span>
                    {{ gs }} 
                </h6>
            </div>
            <div class="content-types pills">
                <h5 class="label">{{ $t('contentTypes') }}:</h5>
                <h6 v-for="(ct) in contentTypes" :key="ct">
                    {{ ct }} 
                </h6>
            </div>
            <div class="issues pills">
                <h5 class="label">{{ $t('issues') }}:</h5>
                <h6 v-for="(issue) in issues" :key="issue">
                    {{ issue }} 
                </h6>
            </div>
        </div>
    </li>
</template>

<script>
export default {
    name: 'Resource',
    props: {
        titles: {
            type: Object,
            required: true
        },
        links: {
            type: Object,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        organization: {
            type: String,
            required: true
        },
        publication: {
            type: String,
            required: true
        },
        notes: {
            type: Object,
            required: true
        },
        contentTypes: {
            type: Array,
            required: false
        },
        geographicScopes: {
            type: Array,
            required: true
        },
        language: {
            type: Object,
            required: true
        },
        issues: {
            type: Array,
            required: true
        },
        paywall: {
            type: Boolean,
            required: true
        },
        paywallHelpText: {
            type: String,
            required: true
        },
        searchRegx: {
            type: RegExp,
            required: true
        },
        isTextSearching: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        otherLocale: function() {
            return (this.$i18n.locale === "en") ? "fr" : "en"
        },
        getPrimaryLanguageId: function() {
            return (this.language.id === "both") ? this.$i18n.locale : this.language.id
        },
        getTitle: function () {
            return this.titles[this.getPrimaryLanguageId()]
        },
        translationAvailableText: function () {
            return (this.$i18n.locale === 'en') ? this.$t('frAvailable') : this.$t('enAvailable')
        },
        getTitleMarked: function () {
            return (this.isTextSearching) ? this.wrapMatchedWithMarkTag(this.getTitle()) : this.getTitle()   
        },
        getAuthorMarked: function() {
            return (this.isTextSearching) ? this.wrapMatchedWithMarkTag(this.author) : this.author   
        },
        getOrganizationMarked: function() {
            return (this.isTextSearching) ? this.wrapMatchedWithMarkTag(this.organization) : this.organization   
        },
        getPublicationMarked: function() {
            return (this.isTextSearching) ? this.wrapMatchedWithMarkTag(this.publication) : this.publication   
        },
        wrapMatchedWithMarkTag: function(text, search = this.searchRegx) {
            const ot = "<mark>", ct = "</mark>"
            let textMarked = text, counter = 0, markTagsOffset = (ot + ct).length
            const textWithoutDiacritics = this.$removeDiacritics(text)
            
            textWithoutDiacritics.replace(search, (match, offset) => {
                let totalOffset = offset + markTagsOffset * counter
                textMarked = textMarked.substr(0, totalOffset) + ot + 
                    textMarked.substr(totalOffset, match.length) + ct + 
                    textMarked.substr(totalOffset + match.length, textMarked.length -1)
                counter++
                return match
            })
            
            return textMarked
        },
        getAccreditationHtml: function() {
            const possibleAccreditations = [this.getAuthorMarked(), this.getOrganizationMarked(), this.getPublicationMarked()],
            bulletHtml = " <span>&#8226;</span> "
            let actualAccreditations = [],
            html = ""

            possibleAccreditations.forEach(pa => {
                if(pa) actualAccreditations.push(pa)
                return false
            })

            actualAccreditations.forEach((aa, index) => {
                if (index > 0) html += bulletHtml
                html += aa 
            })

            return html
        }
    }
}
</script>

<style scoped>

li.resource {
    list-style: none;
    border-bottom: 0.9px #979797 solid;
    margin-top: 25px;
    padding-bottom: 28px;
}

li.resource h5 {
    font-size: 18px;
}

.rTitle {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 5px;
    max-width: 85%;
}

.notes {
    font-size: 16px;
    color: #767676;
}

.tags {
    margin-top: 18px;
}

.pills {
    position: relative;
    left: -5px;
    margin-bottom: 5px;
}

.pills .label {
    display: inline;
    margin-right: 20px;
    color: #767676;
}

.pills h6 {
    font-size: 16px;
    font-weight: 600;
    border-radius: 24.4px;
    background-color: #e8f8ff;
    padding: 0 10px;
    text-align: center;
    display: inline;
    margin-right: 10px;
    line-height: 25px;
    color: #000000;
    display: inline-block;
}

.paywall {
    position: absolute;
    right: 0;
    font-weight: bold;
    background-color: #fed8b1;
    padding: 5px;
    color: black;
    font-size: 14px;
}

@media screen and (max-width: 767px) {
    .pills .label {
        margin-right: 0px;
        margin-left: 8px;
    }

    .rTitle {
        font-size: 25px;
    }
}

</style>