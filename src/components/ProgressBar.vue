<template>
    <div class="progress">
        <div class="progress-bar progress-bar-striped" :class="progressBarClass" role="progressbar" :style="{width: getProgress}">
                     <span v-if="progress < 100 && showProgressText">
                        {{getProgress}}
                     </span>
            <span v-if="showProgressText">{{progressBarText}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "progress-bar",
        props: {
            progress: {
                default: 0,
                type: Number
            },
            showProgressText: {
                default: true,
                type: Boolean
            },
            progressBarText: {
                default: 'Complete',
                type: String
            },
            progressBarClass: {
                default: 'progress-bar-success',
                type: String
            }
        },
        computed: {
            getProgress() {
                return Math.round(this.progress) + "%";
            }
        },
        watch: {
            progress(progress) {
                this.currentProgress = progress;
            }
        },
        data() {
            return {
                currentProgress: 0,
            }
        }
    }
</script>

<style scoped>

</style>