import { generate_one_post, generate_user_profile } from './generators.js';
import { get_cookie } from './utils.js';

// Defining all variables
const allPosts = document.querySelector('#link-all-posts');
const submitPost = document.querySelector('#new-post-submit');
const postContent = document.querySelector('#new-post-content');
const body = document.querySelector('.body');
const h1 = document.querySelector('#page-title');
const newPost = document.querySelector('#new-post');
const profile = document.querySelector('#profile-container');
const postsContainer = document.querySelector('#posts-container');


// Add EventListener on some elements
document.addEventListener('DOMContentLoaded', function() {
    
    allPosts.addEventListener('click', () => load_page('All Posts', ''));
    submitPost.addEventListener('click', send_post);

    // By default
    load_page('All Posts', '');
});


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
      load_page('All Posts', '');
    })
    // Catch the error if one occurs
    .catch(error => {
      console.log('Error:', error);
    });
}


export function load_page(title, name) {
  if (title === 'All Posts') {
    h1.textContent = title;
    profile.style.display = 'none';
    load_posts(name);
  } else if (title === 'profile') {
    newPost.style.display = 'none';
    profile.style.display = 'block';
    let nameUpper = name.charAt(0).toUpperCase() + name.slice(1)
    h1.textContent = `${nameUpper}'s ${title}`;
    load_profile(name);
  }
}

function load_posts(username = "") {
  postsContainer.innerHTML = "";
  if (username === "") {
    fetch('/posts/all_posts')
    .then(response => response.json())
    .then(posts => {
      posts.forEach(post => {
        postsContainer.appendChild(generate_one_post(post));
      })
    })
    // Catch potential error
    .catch(error => {
      console.log('Error: ', error);
    });
  } else {
    fetch(`/posts/all_posts/${username}`)
    .then(response => response.json())
    .then(posts => {
      posts.forEach(post => {
        postsContainer.appendChild(generate_one_post(post))
      })
    })
    // Catch potential error
    .catch(error => {
      console.log('Error: ', error);
    });
  }
}


export function load_profile(name) {
  fetch(`profile/${name}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(user => {
      generate_user_profile(user);
      load_posts(user.username);
    });
  })
  .catch(error => {
    console.log('Error: ', error);
  });

}

export function follow_unfollow(user) {
  const following = user.statement;
  fetch(`follow/${user.username}`, {
    method: 'PUT',
    body: JSON.stringify({
        follow: !following
    }),
    credentials: 'same-origin',
    headers: {
        "X-CSRFToken": get_cookie("csrftoken")
    }
  })
  
}