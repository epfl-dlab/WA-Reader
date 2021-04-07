var currentFile = {}

function show_error_message(error_message) {
    error_div.html(error_message);
    error_div.show();
    error_div.fadeTo(5000, 500).slideUp(500);
}

function submitForm(event) {
    event.stopPropagation();
    event.preventDefault();
    if (typeof files != 'undefined') {
        uploadFiles(event);
    } else {
        show_error_message('Please upload a file to proceed.');
    }
}

function prepareUpload(event) {
    files = event.target.files;
}

function download() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentFile));
    var dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "chat.json");
    dlAnchorElem.click();
}

function setFile(json) {
    currentFile = json;
}

function uploadFiles(event) {
    var data = new FormData(),
        submit_button = $('#submit_button')
    file_input = submit_button.parent('form').children('input[name="file"]');
    emoji_annotated = $('#emoji_highlight_field').val();
    console.log(emoji_annotated);

    $.each(files, function(key, value) {
        data.append(key, value);
    });

    $.ajax({
        url: '/parse-file',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,

        success: function(response) {
            if (response.success) {
                intro_panels.hide();
                back_nav.show();
                setFile({ 'chat': response.chat, 'users': response.users })
                download_link.show();

                console.log("Chat Block count:" + response.chat.length);
                console.log("Users count:" + response.users.length);
                var last_user_index = -1;
                for (var chat_index in response.chat) {
                    var chat_div_id = "chatBox" + chat_index,
                        chat_user_index = response.chat[chat_index].i,
                        chat_html = '<div class="aloo" id="' + chat_div_id + '"><div class="user"></div><div class="text"></div><div class="time"></div></div>';

                    chat_div.append(chat_html);
                    if (chat_user_index == 1)
                        $("#" + chat_div_id).addClass("alternate-user");

                    if (last_user_index != chat_user_index) {
                        //$("div.user", "#" + chat_div_id).text(response.users[chat_user_index]);
                        $("#" + chat_div_id).addClass("new-user-block");
                    }

                    $("div.time", "#" + chat_div_id).text(response.chat[chat_index].t);
                    last_user_index = chat_user_index;

                    if (chat_index == response.chat.length-1 && emoji_annotated != "") {
                        var text = response.chat[chat_index].p.replace(emoji_annotated, '<span class="to-annotate">'+emoji_annotated+'</span>');

                        $("div.text", "#" + chat_div_id).append(text);
                    }
                    else {
                        $("div.text", "#" + chat_div_id).text(response.chat[chat_index].p);
                    }
                }
            } else {
                show_error_message(response.error_message);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            error_message = 'Some technical glitch! Please retry after reloading the page!';
            show_error_message(error_message);
        },
        beforeSend: function() {
            submit_button.val('Processing...');
            submit_button.attr('disabled', '');

            file_input.attr('disabled', '');
        },
        complete: function() {
            submit_button.val('Get Conversation');
            submit_button.removeAttr('disabled');

            file_input.removeAttr('disabled');
            $('#chat').minEmoji();
        }
    });
}


function restoreForm(event) {
    event.preventDefault();
    chat_div.empty();
    users_div.empty();
    back_nav.hide();
    download_link.hide()
    intro_panels.show();
    form_file_field[0].value = "";
}


$(document).ready(function() {
    $('form').on('submit', submitForm);
    download_link.children('a').on('click', download);
    $('input[type=file]').on('change', prepareUpload);
    $('.nav-back').click(restoreForm);
})


var files,
    intro_panels = $('.intro-panels'),
    conversation_div = $('#whatsapp-conversation'),
    chat_div = conversation_div.find('#chat'),
    users_div = conversation_div.find('#users_list'),
    form_file_field = $('#form_file_field'),
    error_div = $('#error_message_box'),
    back_nav = $('li.nav-back'),
    download_link = $('li.download-link');