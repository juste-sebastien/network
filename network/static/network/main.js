// Defining all variables
const allPosts = document.querySelector('#link-all-posts');
const submitPost = document.querySelector('#new-post-submit');
const postContent = document.querySelector('#new-post-content');
var heartButton = document.querySelector('[id|=heart-icon]');
console.log(heartButton);


// Add EventListener on some elements
document.addEventListener('DOMContentLoaded', function() {
    
    allPosts.addEventListener('click', () => add_title('All Posts'));
    submitPost.addEventListener('click', send_post);
    heartButton.addEventListener('click', like);


    // By default
    add_title('All Posts');
});


function add_title(title) {
    const h1 = document.querySelector('#page-title');
    
    h1.innerHTML = title;
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
      postDiv.appendChild(image);

      let subDiv1 = document.createElement('div');
      let title = document.createElement('h5');
      title.textContent = post.user;
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
      heart.style.color = 'ligthgrey';
      heart.innerHTML = '&#10084;';
      heart.addEventListener('click', function() {
        heart.style.color = 'red';
      })
      likeZone.textContent = `${heart} ${post.like}`;
      subDiv2.appendChild(likeZone);
      postDiv.appendChild(subDiv2);
    })
  })
  // Catch potential error
  .catch(error => {
    console.log('Error: ', error);
  });
}

function like() {
  console.log('ok');
}