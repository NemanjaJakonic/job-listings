$(document).ready(function () {

    $('.modal').modal();
    $('select').formSelect();
    $('.sidenav').sidenav();
    setTimeout(function () {
        $('.error').fadeOut('fast');
    }, 7000); // <-- time in milliseconds

    setTimeout(function () {
        $('.success').fadeOut('fast');
    }, 7000); // <-- time in milliseconds

    $('.delete').submit( function(e) {
        e.preventDefault();
        
        let instance = M.Modal.getInstance($("#modal"));
        let job_name = $(this).parent().find('.job-name').html()
        $('#delete').html("Are you sure you want to delete "+job_name+"?")
        instance.open() 

        $("#confirm").click(function()
            {
                if(this.id=='confirm'){
                    $('.delete').unbind('submit').submit()
                }
            });     
    });

    let date = new Date();
    $('#date').html(date.getFullYear())

    let filterData = []


    $('.technology').click(function () {
        let jobs = $('.job-card');
        let customType = $(this).html();
        if ($('.filter > div:contains(' + customType + ')').length == 0) {
            $(".filter").append(
                "<div><div class='technology'>" + $(this).html() + "</div><span class='close'><i class='material-icons'>close</i></span></div>"
            );
        }
        $('.clear').show()
        if (filterData.indexOf(customType) == -1) {
            filterData.push(customType)
        }

        function Filter() {
            jobs.hide().filter(function () {
                const result = $(this).data('filter')
                let array = result.split(',')
                const test = filterData.every(val => array.includes(val))
                return test == true;
            }).show()
        }
        Filter()
        $('.close').click(function () {
            const index = filterData.indexOf($(this).prev('div').html());
            if (index > -1) {
                filterData.splice(index, 1);
            }
            $(this).parent().remove()
            $(this).remove()
            if (filterData.length == 0) {
                $('.clear').hide()
            }
            Filter()
        })
        $('.clear').click(function () {
            filterData = []
            $('.filter>div').remove()
            $(this).hide()
            Filter()
        })
    })
})