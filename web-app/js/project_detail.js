$.urlParam = function(name) {
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    return results[1] || 0;
}

$(document).ready(function() {
    var url = window.location.toString();
    var str = "";
    var str_value = "";
    var abp_id = $.urlParam('abp_id');
    renderProjectDetail(abp_id);

    $('#analyze').click(function() {
        // var id = $('#project-form').attr('data');
        var self = $(this);
        $.ajax({
            url:"/upload/project-analysis/"+abp_id+'/',
            type:'POST',
            dataType:'json',
            success: function(data, status)
            {
                    $('#notification-modal').modal('show');
                    self.text("Waiting for analyzing...");
                    self.addClass('disabled');
                    $('#notification-modal #cancel_modal').click(function(event) {
                        /* Act on the event */
                        $('#notification-modal').modal('hide');
                    });
                }
            });
        });
});

function renderProjectDetail(abp_id) {
    $.ajax({
        url : "/upload/project/" + abp_id + '/',
        type : 'GET',
        success : function(res) {
            console.log("success again");
            var analyze = $("#analyze");
            switch (res.status) {
                case 0:
                    analyze.text("start analyze");
                    break;
                case 1:
                    analyze.text("waiting...");
                    analyze.addClass('disabled');
                    break;
                case 2:
                    analyze.text("analyzing...");
                    analyze.addClass('disabled');
                    break;
                case 3:
                    analyze.text("analyzed");
                    analyze.addClass('disabled');
                    break;
                case 4:
                    analyze.text("analyze failed");
                    analyze.addClass('disabled');
            }
            if ((res.user == res.owner) && (res.status == 0)) {
                $("#edit-project").show();
                $('#edit-project').bind('click', function() {
                    window.location.href = 'project_edit.html?abp_id=' + abp_id;
                });
            }

            $('#notification').attr('href', 'project_detail.html?abp_id=' + abp_id);
            // $('#project-title').text(res.title);
            // $('#title').text("title: "+res.title);
            $('#title').append(res.title);
            if ( typeof (res.metadata) == 'string') {
                meta = JSON.parse(res.metadata);
            } else {
                meta = res.metadata;
            }
            var p_name = (res.permission == 0 ? 'public' : 'private');
            $('#permission').append(p_name);
            $('#organism').append(res.organism);
            $('#platform').append(meta['platform']);
            $('#keywords').append(meta['keywords']);
            $('#summary').append(res.summary);
            $('#owner').append(res.owner_name);
            var html2 = $("#sample-list-tmpl").tmpl({
                'samples' : res.samples
            });
            $('#samples').html(html2);
            $('.disabled').attr('disabled', 'disabled');
            // console.log(res.samples)
            $('.sample-detail #view-report').click(function() {
                var sid = $(this).closest('.sample-detail').attr('id');
                window.location.href = '/web-app/profile.html?abp_id=' + abp_id + "&abs_id=" + sid;
            });

            $('.sample-detail').each(function() {
                if ($(this).attr('data') != 3) {
                    $(this).find('#view-report').addClass('disabled');
                }
            });
        },
        error : function(res) {
            console.log(res);
            $('#projectid-error-modal').modal('show');
            /*
             self.text("Waiting for analyzing...");
             self.addClass('disabled');*/

            $('#projectid-error-modal #cancel_modal').click(function(event) {
                /* Act on the event */
                console.log("Click event");
                $('#projectid-error-modal').modal('hide');
            });
        }
    });
}
