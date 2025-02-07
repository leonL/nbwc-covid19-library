<template>
    <div>
      <div v-html="$md.render(aboutLibrary[$i18n.locale])" class="about library"></div>
      <div class='double-pane'>
        <div v-html="$md.render(aboutNBWC[$i18n.locale])" class="about-nbwc"></div>
        <div v-html="$md.render(aboutOpenCall[$i18n.locale])" class="about-open-call"></div>
      </div>
      <div class="logos">
        <a :href="$t('nbwcURL')" target="_blank">
          <img src="~/assets/NBWC_logo_icon.png" class="logo"
            :alt="$t('altTextlogo')">
        </a>
        <a :href="$t('facebookURL')" target="_blank">
          <img src="~/assets/fb_logo.png" class="logo"
            alt="Facebook logo">
        </a>
      </div>
    </div>
</template>

<script>
export default {
  data () {
    const text = this.$store.state.data.text,
      enText = text[0], frText = text[1]
    return {
      aboutLibrary: { en: enText['ABOUT:LIBRARY'], fr: frText['ABOUT:LIBRARY'] },
      aboutNBWC: { en: enText['ABOUT:NBWC'], fr: frText['ABOUT:NBWC'] },
      aboutOpenCall: { en: enText['ABOUT:OPEN CALL'], fr: frText['ABOUT:OPEN CALL'] }
    }
  },
  nuxtI18n: {
    paths: {
      en: '/about',
      fr: '/a-propos'
    }
  } 
}
</script>

<style scoped>

.double-pane {
  display: flex;
  align-items: flex-start;
  margin: 50px 0 5px 0;
}

.about-nbwc {
  margin-right: 25px;  
}

.about-open-call {
  margin-left: 25px;
}

.logos {
  margin-bottom: 30px;
}

.logo {
  width: 65px;
  margin-right: 15px;
}

@media screen and (max-width: 767px) {
  .double-pane {
    display: block;
    margin: 10px 0 20px 0;
  }

  .about-open-call {
    margin-left: 0;
  }
}
</style>
