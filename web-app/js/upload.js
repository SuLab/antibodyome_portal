$(document).ready(function () {
    var uploader = new qq.s3.FineUploader({
        element: $('#manual-fine-uploader')[0],

        request: {
            endpoint: "abome-test.s3.amazonaws.com",
            accessKey: "AKIAIMPLN6YTZVD5Q3TA"
        },

        signature: {
            endpoint: "/upload/sign-policy"
        },

        retry: {
            showButton: true
        },

        autoUpload: false,
        
        text: {
            uploadButton: '<a href="#" class="btn btn-default btn-success"> <span class="glyphicon glyphicon-plus"></span> Select Files</a>'
        },

        chunking: {
            enabled: true,
            partSize: 100*1024*1024
        },
        
        resume: {
            enabled: true
        },

        validation: {
            itemLimit: 5,
            sizeLimit: 2*1024*1024*1024
        },

    });

    $('#triggerUpload').click(function(){
        uploader.uploadStoredFiles();
    });


});
