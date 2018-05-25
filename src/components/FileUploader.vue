<template>
    <div id="file-drag-drop">
        <form ref="fileform">
            <input type="file" multiple ref="fileinput" v-on:change="handleFilesUploadFromInput()">
            <p class="drop-files">Drop file or click this to upload</p>
            <p class="info-text">Maximum file size is 10 MB. <br> Allowed file types are CSV, PNG, JPG, JPEG and PDF</p>
        </form>
        <div v-for="(file, key) in files" class="file-listing">
            <progress-bar :progress="file.progress" :progress-bar-text="file.progressBarText" :progress-bar-class="file.progressBarClass"></progress-bar>
            {{file.file.name}}
        </div>
        <div class="text-right">
            <button type="button" class="btn btn-info" v-if="showCloseButton" v-on:click="reset()" data-dismiss="modal">RESET</button>
        </div>
    </div>
</template>

<script>
    import axios from 'axios'
    import progressBar from './ProgressBar'
    export default {
        components: {
            progressBar
        },
        data(){
            return {
                dragAndDropCapable: false,
                files: [],
                showCloseButton: false,
                allowedFileTypes: ['application/pdf', 'image/png', 'image/jpeg'],
                successClass: 'progress-bar-success',
                errorClass: 'progress-bar-danger'
            }
        },
        mounted(){
            // Determine if drag and drop functionality is capable in the browser
            this.dragAndDropCapable = this.determineDragAndDropCapable();

            if( this.dragAndDropCapable ){
                ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((evt) => {
                    this.$refs.fileform.addEventListener(evt, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }, false);
                });
                // Get files from drag & drop
                this.$refs.fileform.addEventListener('drop', (e) => {
                    for( let i = 0; i < e.dataTransfer.files.length; i++ ){
                        const data = {
                            file: e.dataTransfer.files[i],
                            progress: 0,
                            progressBarText: '',
                            progressBarClass: this.successClass
                        }
                        // Push data to files array
                        this.files.push(data);
                    }
                    // Submit files immediately
                    this.submitFiles();
                });

            }
        },
        methods: {
            determineDragAndDropCapable(){
                // Create a test element to see if required events are present for drag and drop.
                var div = document.createElement('div');

                return ( ( 'draggable' in div )
                    || ( 'ondragstart' in div && 'ondrop' in div ) )
                    && 'FormData' in window
                    && 'FileReader' in window;
            },
            submitFiles(){
                let formData = new FormData();
                // Loop through the files array
                this.files.forEach((data) => {
                    let validation = this.fileValidator(data.file);
                    // If validation returns true and file has not been processed already
                    if(validation.status && data.progress == 0){
                        formData.append('files[]', data.file);
                        // Post file to backend
                        axios.post('file-upload', formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                },
                                onUploadProgress: (progressEvent) => {
                                    data.progress = (progressEvent.loaded / progressEvent.total) * 100;
                                }
                            },
                        ).then((response) => {
                                data.progressBarText = 'Completed!'
                        }, (error) => {
                            this.showCloseButton = false;
                        });
                    } else if(!validation.status) {
                        //If validation returns false, write error to progress bar and change class
                        data.progress = 100;
                        data.progressBarText = validation.progressBarText
                        data.progressBarClass = validation.progressBarClass
                    }
                })
                this.showCloseButton = true;
            },
            handleFilesUploadFromInput(){
                //Handle files from explorer
                let uploadedFiles = this.$refs.fileinput.files;
                for( let i = 0; i < uploadedFiles.length; i++ ){
                    const data = {
                        file: uploadedFiles[i],
                        progress: 0,
                        progressBarText: '',
                        progressBarClass: this.successClass}
                    this.files.push(data);
                }
                this.submitFiles();
            },
            fileValidator(file){
                // Here all the validation rules
                if(!!this.allowedFileTypes.indexOf(file.type))
                    return {'status': false, 'progressBarText': 'File type is not allowed', 'progressBarClass': this.errorClass}

                if(file.size > (1024 * 10240)) //10MB
                    return {'status': false, 'progressBarText': 'Maximum file size is 10 MB', 'progressBarClass': this.errorClass}

                return {'status': true}
            },
            reset(){
                // Reset all data
                this.files = [];
                this.showCloseButton = false;
            }
        },
    }
</script>
<style scoped>
    form {
        display: block;
        min-height: 150px;
        text-align: center;
        border-radius: 4px;
        border: 2px dashed rgb(204, 204, 204);
        background-color: #F8F8F8;
    }

    .info-text {
        text-align: center;
        font-size: 13px;
        padding: 0;
    }

    .drop-files {
        text-align: center;
        padding: 40px 0 0 0;
    }

    form input {
        position: absolute;
        margin: 0;
        padding: 0;
        height: 150px;
        width: 940px;
        outline: none;
        opacity: 0;
    }

    div.file-listing {
        width: 350px;
        margin: auto;
        padding: 10px 0 10px 0;
    }

    progress {
        width: 940px;
        height: 20px;
        display: block;
    }
</style>
