import Vue from 'vue'
import App from './App'


Vue.config.productionTip = false

Vue.component('file-uploader', require('./components/FileUploader.vue'));
Vue.component('progress-bar', require('./components/ProgressBar.vue'));

new Vue({
  el: '#app',
    components: { App },
    template: '<App/>'

})
