import { generateOnePost, generateUserProfile } from './generators.js';
import { getCookie } from './utils.js';

// Defining all variables
const allPosts = document.querySelector('#link-all-posts');
const linkFollow = document.querySelector('#link-follow');
const submitPost = document.querySelector('#new-post-submit');
const postContent = document.querySelector('#new-post-content');
const body = document.querySelector('.body');
const h1 = document.querySelector('#page-title');
const newPost = document.querySelector('#new-post');
const profile = document.querySelector('#profile-container');
const postsContainer = document.querySelector('#posts-container');
const nextPageButton = document.querySelector('#navigate-page-next-button');
const previousPageButton = document.querySelector('#navigate-page-previous-button');
const navPageNumber = document.querySelector('#navigate-page-number');

let pageNumber = 1;
const postsPerPage = 10;


// Add EventListener on some elements
document.addEventListener('DOMContentLoaded', function() {
    
    allPosts.addEventListener('click', () => loadPage('All Posts', ''));
    linkFollow.addEventListener('click', () => loadPage('Followings'))
    submitPost.addEventListener('click', sendPost);
    nextPageButton.addEventListener('click', () => getPostsPage(h1.textContent, 'next'));
    previousPageButton.addEventListener('click', () => getPostsPage(h1.textContent, 'previous'));

    // By default
    loadPage('All Posts', '');
});


function sendPost(event) {
    event.preventDefault()

    // POST new post to API route
    fetch('/posts/submit', {
      method: 'POST',
      body: JSON.stringify({
          // Get content of new post
          content: postContent.value,
      }),
      credentials: 'same-origin',
      headers: {
        "X-CSRFToken": getCookie("csrftoken")
      }
    })
    .then(function() {
      postContent.value = '';
      loadPage('All Posts', '');
    })
    // Catch the error if one occurs
    .catch(error => {
      console.log('Error:', error);
    });
}


export function loadPage(title, name) {
  if (title === 'All Posts') {
    h1.textContent = title;
    profile.style.display = 'none';
    loadPosts(title, name);
  } else if (title === 'profile') {
    newPost.style.display = 'none';
    profile.style.display = 'block';
    let nameUpper = name.charAt(0).toUpperCase() + name.slice(1)
    h1.textContent = `${nameUpper}'s ${title}`;
    loadProfile(title, name);
  } else if (title === 'Followings') {
    h1.textContent = title;
    newPost.style.display = 'none';
    profile.style.display = 'none';
    loadFollows();
  }
}


function loadFollows() {
  postsContainer.innerHTML = "";

  // Compose url for GET request
  let url = `/posts?page=${pageNumber}&perPage=${postsPerPage}`;

  url = url.concat(`&feed=true`)

  fetch(url)
  .then(response => response.json())
  .then(response => {
    response.posts.forEach(post => {
      postsContainer.appendChild(generateOnePost(post));
    })
    updatePagination(response);
  })
  // Catch potential error
  .catch(error => {
    console.log('Error: ', error);
  });
}


function loadPosts(title, username = "") {
  postsContainer.innerHTML = "";

  // Compose url for GET request
  let url = `/posts?page=${pageNumber}&perPage=${postsPerPage}`;

  if (title === 'profile') {
    url = url.concat(`&user=${username}`);
  }

  fetch(url)
  .then(response => response.json())
  .then(response => {
    response.posts.forEach(post => {
      postsContainer.appendChild(generateOnePost(post));
    })
    updatePagination(response);
  })
  // Catch potential error
  .catch(error => {
    console.log('Error: ', error);
  });
}


export function loadProfile(title, name) {
  fetch(`profile/${name}`)
  .then(response => response.json())
  .then(user => {
      generateUserProfile(user);
      loadPosts(title, user.username);
  })
  .catch(error => {
    console.log('Error: ', error);
  });

}

export function followUnfollow(user) {
  fetch(`follow/${user.username}`, {
    method: 'PUT',
    body: JSON.stringify({
        follow: !user.is_followed
    }),
    credentials: 'same-origin',
    headers: {
        "X-CSRFToken": getCookie("csrftoken")
    }
  })
  .then(response => response.json())
  .then(user => {
    console.log('in followUnfollow', user);
    generateUserProfile(user);
  })
  .catch(error => {
    console.log('Error: ', error);
  });
}

function updatePagination(data) {
  nextPageButton.style.display = 
    data["next_page"] ? "block" : "none";

  previousPageButton.style.display =
    data["previous_page"] ? "block" : "none";

  navPageNumber.innerHTML = `
    Page ${data["page"]} of ${data["page_count"]}
  `;
}


function getPostsPage(title, action) {
  if (action === 'next') {
    pageNumber--;
    loadPage(title, pageNumber, postsPerPage);
  } else {
    pageNumber++;
    loadPage(title, pageNumber, postsPerPage);
  }
}