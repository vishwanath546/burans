// Multiple images preview in browser
const imagesPreview = function(input, placeToInsertImagePreview) {

    if (input.files) {
        const filesAmount = input.files.length;

        for (let i = 0; i < filesAmount; i++) {
            const reader = new FileReader();
            reader.onload = function(event) {
                $($.parseHTML('<div>'))
                    .attr('style',`background-image: url("${event.target.result}")`)
                    .attr('data-image',`${event.target.result}`)
                    .attr('href',`${event.target.result}`)
                    .attr('data-title',`image_${i}`)
                    .attr("class","gallery-item")
                    .appendTo(placeToInsertImagePreview);
            }
            reader.readAsDataURL(input.files[i]);
        }
    }

};
// $.uploadPreview({
//     input_field: "#image-upload",   // Default: .image-upload
//     preview_box: "#image-preview",  // Default: .image-preview
//     label_field: "#image-label",    // Default: .image-label
//     label_default: "Shop Image",   // Default: Choose File
//     label_selected: "Shop Image",  // Default: Change File
//     no_label: true,                // Default: false
//     success_callback: null          // Default: null
// });

var dropzone = new Dropzone("#mydropzone", {
    url: "#",
    addRemoveLinks:true,
    init: function() {
        this.on("addedfile", file => {
            console.log(file);
        });
    }
});

var minSteps = 6,
    maxSteps = 60,
    timeBetweenSteps = 100,
    bytesPerStep = 100000;

dropzone.uploadFiles = function(files) {
    var self = this;

    for (var i = 0; i < files.length; i++) {

        var file = files[i];
        let totalSteps = Math.round(Math.min(maxSteps, Math.max(minSteps, file.size / bytesPerStep)));

        for (var step = 0; step < totalSteps; step++) {
            var duration = timeBetweenSteps * (step + 1);
            setTimeout(function(file, totalSteps, step) {
                return function() {
                    file.upload = {
                        progress: 100 * (step + 1) / totalSteps,
                        total: file.size,
                        bytesSent: (step + 1) * file.size / totalSteps
                    };

                    self.emit('uploadprogress', file, file.upload.progress, file.upload.bytesSent);
                    if (file.upload.progress == 100) {
                        file.status = Dropzone.SUCCESS;
                        self.emit("success", file, 'success', null);
                        self.emit("complete", file);
                        self.processQueue();
                    }
                };
            }(file, totalSteps, step), duration);
        }
    }
}
