//  Methods used by components
const showPreviousPreview = () => {
    const imgUploader = document.getElementById('upload-image');
    app.imgPreviewIndex--;
    generatePreview(imgUploader.files);
}

const showNextPreview = () => {
    const imgUploader = document.getElementById('upload-image');
    app.imgPreviewIndex++;
    generatePreview(imgUploader.files);
}

Vue.component('current-chatroom-overlay', {
    template: `
    <component 
        v-bind:is="$root.currentOverlay" 
        class='overlay'>            
    </component>
    `
}) 

Vue.component('overlay-upload-image', {
    template: `
    <div>
        <component 
            v-bind:is="$root.imgPreviewMode">
        </component>
        <span class='preview-prompt'> {{ $root.imgPreviewIndexMax + 1}} Files selected: {{ $root.allSelectedFiles }}</span>
    </div>
    `
})
    Vue.component('image-preview-full', {
        template: `
        <span class='img-preview-console'>
            <div class='img-preview-previous'
                v-if="$root.imgPreviewIndex > 0"
                v-on:click="showPreviousPreview">
                <i class="fas fa-angle-left"></i>
            </div>
            <div class='img-preview-previous disabled'
                v-if="$root.imgPreviewIndex <= 0">
                <i class="fas fa-angle-left"></i>
            </div>

            <div class='img-preview-wrapper'>
            <img v-bind:src='$root.imgPreviewSrc'>
            </div>
            
            <div class='img-preview-next'
                v-if="$root.imgPreviewIndex < $root.imgPreviewIndexMax"
                v-on:click="showNextPreview">
                <i class="fas fa-angle-right"></i>
            </div>
            <div class='img-preview-next disabled'
                v-if="$root.imgPreviewIndex >= $root.imgPreviewIndexMax">
                <i class="fas fa-angle-right"></i>
            </div>
        </span>
        `,
        methods: {
            showPreviousPreview,
            showNextPreview
        }
    })
    Vue.component('image-preview-icon', {
        template: `
        <span>
            <i class="far fa-images"></i>
        </span>`
    })

Vue.component('overlay-upload-file', { 
    template: `
    <div>
        <i class="fas fa-paperclip"></i>
        Files selected: {{ $root.allSelectedFiles }} 
    </div>
    `
})

Vue.component('overlay-view-image-attachments', {
    template: `
    <div>
        <span class='img-preview-console'>
            <div class='img-preview-previous'
                v-if="attachmentIndex > 0"
                v-on:click="attachmentIndex--">
                <i class="fas fa-angle-left"></i>
            </div>
            <div class='img-preview-previous disabled'
                v-else>
                <i class="fas fa-angle-left"></i>
            </div>

            <div class='img-preview-wrapper'>
            <img 
                v-bind:src="$root.loadedAttachments[attachmentIndex]['attached_file']">
            </div>
            
            <div class='img-preview-next'
                v-if="attachmentIndex < $root.loadedAttachments.length - 1"
                v-on:click="attachmentIndex++">
                <i class="fas fa-angle-right"></i>
            </div>
            <div class='img-preview-next disabled'
                v-else>
                <i class="fas fa-angle-right"></i>
            </div>
        </span>
    </div>
    `,
    data() {
        return {
            attachmentIndex: 0
        }
    }
})

Vue.component('overlay-none', {
    template: `
    <div class='hidden'></div>
    `
}) 
