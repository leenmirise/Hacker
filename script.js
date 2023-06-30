let updateTimer = undefined;

function loadNews() {
    $("#content").load("./components/newsPosts.html");
    $.ajax({
        url: 'https://api.hnpwa.com/v0/news/1.json',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            data = data.sort((a, b) => b.time - a.time);
            $.get('./components/card.html', (cardText) => {
                data.forEach(post => {
                    card = $(cardText);
                    card.find('.card-title').text(post.title);
                    card.find('.card-text').text('Points: ' + post.points);
                    card.find('.date').text('Was posted: ' + post.time_ago);
                    card.find('.author').text('By: ' + post.user);
                    card.find('a').attr('href', `#${post.id}`);
                    $("main").append(card);
                });
            })
        },
        error: (error) => {
            $("#content").html("<p>Возникла непредвиденная ошибка </p>");
        }
    })
}

function loadNewsItem() {
    const news_id = window.location.hash.replace('#', '');
    const post = $("#content").load("./components/newsPost.html");
    $.ajax({
        url: `https://api.hnpwa.com/v0/item/${news_id}.json`,
        method: 'GET',
        cache: false,
        dataType: 'json',
        success: (data) => {
            post.find('.card-title').text(data.title);
            post.find('.raiting').text('Points: ' + data.points);
            post.find('.date').text('Was posted: ' + data.time_ago);
            post.find('.author').text('By: ' + data.user);
            post.find('.url').text(data.url).attr('href', data.url); 
            post.find('.number_comm').text('Number of comm: ' + data.comments_count);
            $.get('./components/comment.html', (cardText) => {
                data.comments.forEach(el => {
                    post.find('.comments').first().append(createCommentCard(cardText, el, false));
                })
            });
        },
        error: (error) => {
            $("#content").html("<p>Возникла непредвиденная ошибка </p>");
        }
    })
}

function createCommentCard(cardText, element, recursive) {
    const card = jQuery(cardText);
    card.find('.user').text(element.user);
    card.find('.time_comm').text(element.time_ago);
    card.find('.comment_text').html(element.content);
    if (element.level > 0 || element.comments_count === 0){
        card.find('.show_button').attr('hidden', true);
    }
    else{
        card.find('.show_button').on('click', () => { 
            element.comments.forEach(el => {
                card.find('.comments').first().append(createCommentCard(cardText, el, true));
            })
            card.find('.show_button').attr('hidden', true);
        })
    }
    if (recursive){
        element.comments.forEach(el => {
            card.find('.comments').first().append(createCommentCard(cardText, el, true));
        })
    }
    return card;
}



function changePage() {
    const hash = window.location.hash.replace('#', ''); 
    clearInterval(updateTimer);
    if (hash === "") {
        loadNews();
        $('#refresh_button').on('click', loadNews);
        $('#refresh_button').off('click', loadNewsItem);
        updateTimer = setInterval(loadNews, 60000);
    }
    else if (parseInt(hash)) {
        loadNewsItem(hash); 
        $('#refresh_button').on('click', loadNewsItem);
        $('#refresh_button').off('click', loadNews);
        updateTimer = setInterval(loadNewsItem, 60000);
    }
}

$(document).ready(() => {
    $(window).on("hashchange", changePage);
    changePage();
})
