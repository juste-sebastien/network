// Defining all variables
const allPosts = document.querySelector('#link-all-posts');
const submitPost = document.querySelector('#new-post-submit');
const postContent = document.querySelector('#new-post-content');
const body = document.querySelector('.body');
const h1 = document.querySelector('#page-title');


// Add EventListener on some elements
document.addEventListener('DOMContentLoaded', function() {
    
    allPosts.addEventListener('click', () => add_title('All Posts'));
    submitPost.addEventListener('click', send_post);

    // By default
    add_title('All Posts');
    load_posts();
});


function add_title(title) {
    h1.textContent = title;
}


function send_post(event) {
    event.preventDefault()

    // POST new post to API route
    fetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
          // Get content of new post
          content: postContent.value,
      })
    })
    .then(function() {
      postContent.value = '';
      load_posts();
    })
    // Catch the error if one occurs
    .catch(error => {
      console.log('Error:', error);
    });
}

function load_posts() {
  
  fetch('/posts/all_posts')
  .then(response => response.json())
  .then(posts => {
    posts.forEach(post => {
      let postDiv = document.createElement('div');

      let image = document.createElement('img');
      image.src = post.user_profile_img;
      postDiv.appendChild(image);

      let subDiv1 = document.createElement('div');
      let title = document.createElement('h5');
      title.textContent = post.username;
      title.style.cursor = 'pointer';
      title.addEventListener('click', function() {
        load_profile(post.username);
      })
      subDiv1.appendChild(title);
      let content = document.createElement('p');
      content.textContent = post.content;
      subDiv1.appendChild(content);
      postDiv.appendChild(subDiv1);

      let subDiv2 = document.createElement('div');
      let time = document.createElement('p');
      time.textContent = post.timestamp;
      subDiv2.appendChild(time);
      
      let likeZone = document.createElement('p');
      let heart = document.createElement('span');
      heart.style.cursor = 'pointer';
      heart.textContent = '♡';
      heart.addEventListener('click', function() {
        heart.textContent = '❤';
      })
      likeZone.appendChild(heart);
      let counter = document.createElement('span');
      counter.textContent = post.like;
      likeZone.appendChild(counter);

      subDiv2.appendChild(likeZone);
      postDiv.appendChild(subDiv2);
      body.appendChild(postDiv);
    })
  })
  // Catch potential error
  .catch(error => {
    console.log('Error: ', error);
  });
}


function load_profile(name) {
  body.innerHTML = "";
  let title = name.charAt(0).toUpperCase() + name.slice(1);
  add_title(`${title}'s Profile`);
  body.appendChild(h1);

  let profile = document.createElement('div');

  fetch(`profile/${name}`)
  .then(response => response.json())
  .then(user => {
    let image = document.createElement('img');
    image.src = user.img_profile;
    profile.appendChild(image);
    
    let username = document.createElement('p');
    username.textContent = user.username;
    profile.appendChild(username);

    let statPanel = document.createElement('div');
    let posts = document.createElement('div');
    posts.textContent = 'Total posts: ' + int(user.total_posts)
    statPanel.appendChild(posts);

    let date = document.createElement('div');
    date.textContent = 'Since: ' + user.date_joined;
    statPanel.appendChild(date);

    let followers = document.createElement('div');
    if (user.is_authenticated && user.request_user != user.username) {
      let button = document.createElement('button');
      button.value = user.statement ? 'Unfollow' : 'Follow';
      followers.textContent = 'Total followers: ' + Number(user.total_followers);
      followers.appendChild(button);
    } else {
      followers.textContent = 'Total followers: ' + Number(user.total_followers);
    }
    statPanel.appendChild(followers);

    profile.appendChild(statPanel);
    body.appendChild(profile);
    load_posts();
  })
  .catch(error => {
    console.log('Error: ', error);
  });

}