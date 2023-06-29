let updateTimer = undefined;

function LoadNews() {
    $("#content").html("");
    $("#content").load("./components/newsPosts.html");
    $.ajax({
        url: 'https://api.hnpwa.com/v0/news/1.json',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            data = data.sort((a, b) => b.time - a.time);
            $.get('./components/card.html', (cardText) => {
                data.forEach(post => {
                    console.log(post.id);
                    card = jQuery(cardText);
                    card.find('#title').text(post.title);
                    card.find('#rating').text('Points: ' + post.points);
                    card.find('#date').text('Was posted: ' + post.time_ago);
                    card.find('#author').text('By: ' + post.user);
                    card.find('a').attr('href', `#${post.id}`);
                    $("main").append(card);
                });
            })

        },
        error: (error) => {
            console.log(error);
        }
    })
    return true;
}

function LoadOneNews() {
    const news_id = window.location.hash.replace('#', '');
    $("#content").html("");
    const post = $("#content").load("./components/newsPost.html");
    $.ajax({
        url: `https://api.hnpwa.com/v0/item/${news_id}.json`,
        method: 'GET',
        cache: false,
        dataType: 'json',
        success: (data) => {

            console.log(data);
            post.find('#title').text(data.title);
            post.find('#rating').text('Points: ' + data.points);
            post.find('#date').text('Was posted: ' + data.time_ago);
            post.find('#author').text('By: ' + data.user);
            post.find('#url').text(data.url);
            post.find('#url').attr('href', data.url); 
            post.find('#number_comm').text('Number of comm: ' + data.comments_count);
            $.get('./components/comment.html', (cardText) => {
                const doc = new DOMParser();
                data.comments.forEach(el => {
                    post.find('#comments').first().append(CreateCommentCard(cardText, doc, el, false));
                })
            });
        },
        error: (error) => {
            console.log(error);
        }
    })
    return true;
}

function CreateCommentCard(cardText, doc, element, recursive) {
    console.log('try to add comments')
    const card = jQuery(cardText);
    card.find('#user').text(element.user);
    card.find('#time_comm').text(element.time_ago);
    card.find('#comment_text').text(
        doc.parseFromString(element.content, "text/html").documentElement.textContent);
    if (element.level > 0 || element.comments_count === 0){
        card.find('#show_button').attr('hidden', true);
    }
    else{
        card.find('#show_button').on('click', () => { 
            element.comments.forEach(el => {
                card.find('#comments').first().append(CreateCommentCard(cardText, doc, el, true));
            })
        })
    }
    if (recursive){
        element.comments.forEach(el => {
            card.find('#comments').first().append(CreateCommentCard(cardText, doc, el, true));
        })
    }
    return card
}



function changePage() {
    const hash = window.location.hash.replace('#', '');
    clearInterval(updateTimer);
    if (hash === "") {
        LoadNews();
        $('#refresh_button').on('click', LoadNews);
        $('#refresh_button').off('click', LoadOneNews);
        updateTimer = setInterval(LoadNews, 60000);
    }
    else if (parseInt(hash)) {
        LoadOneNews(hash);
        $('#refresh_button').on('click', LoadOneNews);
        $('#refresh_button').off('click', LoadNews);
        updateTimer = setInterval(LoadOneNews, 60000);
    }
    return true;
}

$(document).ready(() => {
    $(window).on("hashchange", changePage);
    changePage();
})
